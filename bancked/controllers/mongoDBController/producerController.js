import { Document } from "../../models/mongodbModels/document.js";
import { FeatureForm } from "../../models/mongodbModels/featureForm.js";
import Common from "../../services/common.js"
import { validateContributorPayload } from "../../helpers/contributorSchemaHelper.js";
import { errorResponse, sendJsonResponse, sendValidationError } from "../../helpers/responseHelper.js";

const getUserId = (req) => req.user?._id || req.user?.id;

const getAllProducersByFeatureId = async (req, res) => {
  const { isValid, errors } = validateContributorPayload(req.body, {
    requiredIds: ["id"],
  });
  if (!isValid) return sendValidationError(res, errors);

  const { id, film_type } = req.body;

  try {
    const producersData = await FeatureForm.findOne({
      _id: id,
      client_id: getUserId(req),
    }, "producers");

    if (!producersData) {
      return sendJsonResponse(res, 200, { message: "Records not found", statusCode: 203 });
    }
    // 2. Attach matching documents to each producer manually
    const allProducerWithDocs = await Promise.all(
      producersData?.producers.map(async (producer) => {
        const documents = await Document.findOne({
          context_id: producer._id, // assuming context_id links a document to a producer
          form_type: film_type === 'feature' ? 1 : 2,
          website_type: 5,
          document_type: 4,
        });

        return {
          ...producer.toObject(),
          documents, // attach documents manually
        };
      })
    );

    allProducerWithDocs.forEach((producer) => {
      if (producer?.documents?.file) {
        producer.documents.file = `/api/documents/${producer.documents._id}/download`;
      }
      if (producer?.producer_self_attested_doc) {
        producer.producer_self_attested_doc = producer.documents?._id
          ? `/api/documents/${producer.documents._id}/download`
          : null;
      }
    });

    return sendJsonResponse(res, 200, {
      message: "Data fetched successfully",
      data: allProducerWithDocs,
      statusCode: 200,
    });
  } catch (error) {
    return errorResponse(res, error);
  }
};

const addProducerToFeature = async (req, res) => {
  const { isValid, errors } = validateContributorPayload(req.body, {
    requiredIds: ["nfa_feature_id"],
    optionalIds: ["id"],
  });
  if (!isValid) return sendValidationError(res, errors);

  const { nfa_feature_id: _id, id: producerId } = req.body; // Producer data from client
  try {
    const payload = {
      ...req.body,
      files: req.files,
    };
    // Find the feature form by ID
    const feature = await FeatureForm.findOne({
      _id,
      client_id: getUserId(req),
    });
    if (!feature) {
      return sendJsonResponse(res, 200, { message: "Feature form not found", statusCode: 203 });
    }
    let updatedProducer;
    // 2. Update existing producer
    if (producerId) {
      // Update existing producer
      const existingProducer = feature.producers.id(producerId);
      if (!existingProducer) {
        return sendJsonResponse(res, 200, { message: "Producer not found", statusCode: 203 });
      }

      Object.entries(req.body).forEach(([key, value]) => {
        if (key !== 'id' && key !== 'nfa_feature_id') {
          existingProducer[key] = value;
        }
      });

      updatedProducer = existingProducer;

    } else {
      // 3. Add new producer
      const newProducer = feature.producers.create(req.body);
      feature.producers.push(newProducer);
      updatedProducer = newProducer;
    }

    // 4. Handle file upload (only if files are present)
    if (payload.files && Array.isArray(payload.files)) {
      const producerDoc = payload.files.find((file) => file.fieldname === "producer_self_attested_doc");

      if (producerDoc) {
        const fileUpload = await Common.imageUpload({
          id: updatedProducer._id,
          image_key: "producer_self_attested_doc",
          websiteType: "NFA",
          formType: payload.film_type === "non-feature" ? "NON_FEATURE" : "FEATURE",
          image: producerDoc,
        });

        if (!fileUpload.status) {
          return errorResponse(res, '', "failed to upload producer document");
        }

        // Add uploaded file to producer.documents
        updatedProducer.documents.push(fileUpload.data);

        // Also store file name directly for UI usage if needed
        updatedProducer.producer_self_attested_doc = fileUpload?.data?.file;
      }
    }

    // 5. Save the updated feature document
    await feature.save();
    // 6. Prepare response data
    const updatedData = feature.producers.map((item) => {
      const obj = item.toObject();
      obj.id = obj._id;
      delete obj._id;
      return obj;
    });

   return sendJsonResponse(res, 200, {
      message: producerId ? "Producer updated successfully" : "Producer added successfully",
      data: updatedData,
      statusCode: 200,
    });
  } catch (error) {
    return errorResponse(res, error);
  }
};

const deleteProducerById = async (req, res) => {
  const { isValid, errors } = validateContributorPayload(req.body, {
    requiredIds: ["nfa_feature_id", "producerId"],
  });
  if (!isValid) return sendValidationError(res, errors);

  const { nfa_feature_id: _id, producerId } = req.body;

  try {
    const feature = await FeatureForm.findOne({
      _id,
      client_id: getUserId(req),
    });

    if (!feature) {
      return sendJsonResponse(res, 200, {
        message: 'Feature form not found',
        statusCode: 203,
      });
    }

    // Find the producer by ID and remove it
    const producer = feature.producers.id(producerId);
    if (!producer) {
      return sendJsonResponse(res, 200, {
        message: 'Producer not found',
        statusCode: 203,
      });
    }

    feature.producers.pull(producerId); // Remove from embedded array

    await feature.save(); // Save the updated document

    return sendJsonResponse(res, 200, {
      message: 'Producer deleted successfully',
      statusCode: 200,
      // data: feature.producers, // optionally return updated list
    });

  } catch (error) {
    return errorResponse(res, error);
  }
};

export default {

  getAllProducersByFeatureId,
  addProducerToFeature,
  deleteProducerById,
};
