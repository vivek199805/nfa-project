import { all } from "axios";
import { Document } from "../../models/mongodbModels/document.js";
import { FeatureForm } from "../../models/mongodbModels/featureForm.js";
import Common from "../../services/common.js"


const getAllProducersByFeatureId = async (req, res) => {
  const { id, film_type } = req.body;

  try {
    const producersData = await FeatureForm.findById(id, "producers");

    if (!producersData) {
      return res.status(200).json({ message: "Records not found", statusCode: 201 });
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
      producer.documents.file = `documents/NFA/${producer.documents.file}`;
      }
      if (producer?.producer_self_attested_doc) {
      producer.producer_self_attested_doc = `documents/NFA/${producer.producer_self_attested_doc}`;
      }
    });

    res.status(200).json({
      message: "data fetch successfully",
      data: allProducerWithDocs,
      statusCode: 200,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch producers", message: error.message });
  }
};

const addProducerToFeature = async (req, res) => {
  const { nfa_feature_id: _id, id: producerId } = req.body; // Producer data from client
  try {
    const payload = {
      ...req.body,
      files: req.files,
    };
    // Find the feature form by ID
    const feature = await FeatureForm.findById(_id);
    if (!feature) {
      return res.status(200).json({ message: "Feature form not found", statusCode: 201 });
    }
    let updatedProducer;
    // 2. Update existing producer
    if (producerId) {
      // ✅ Update existing producer
      const existingProducer = feature.producers.id(producerId);
      if (!existingProducer) {
        return res.status(200).json({ message: "Producer not found", statusCode: 201 });
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
          return res.status(500).json({ message: "failed to upload producer document", statusCode: 500, });
        }

        // // ✅ Add uploaded file to producer.documents
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

    res.status(200).json({
      message: producerId ? "Producer updated successfully" : "Producer added successfully",
      data: updatedData,
      statusCode: 200,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to add producer", message: error.message });
  }
};

const deleteProducerById = async (req, res) => {
  const { nfa_feature_id: _id, producerId } = req.body;

  try {
    const feature = await FeatureForm.findById(_id);

    if (!feature) {
      return res.status(200).json({
        message: 'Feature form not found',
        statusCode: 203,
      });
    }

    // Find the producer by ID and remove it
    const producer = feature.producers.id(producerId);
    if (!producer) {
      return res.status(200).json({
        message: 'Producer not found',
        statusCode: 203,
      });
    }

    producer.remove(); // Remove from embedded array

    await feature.save(); // Save the updated document

    return res.status(200).json({
      message: 'Producer deleted successfully',
      statusCode: 200,
      // data: feature.producers, // optionally return updated list
    });

  } catch (error) {
    return res.status(500).json({
      message: 'Error deleting producer',
      error: error.message,
      statusCode: 500,
    });
  }
};

export default {

  getAllProducersByFeatureId,
  addProducerToFeature,
  deleteProducerById,
};
