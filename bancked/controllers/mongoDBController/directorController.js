import { Document } from "../../models/mongodbModels/document.js";
import { FeatureForm } from "../../models/mongodbModels/featureForm.js";
import Common from "../../services/common.js"
import { validateContributorPayload } from "../../helpers/contributorSchemaHelper.js";
import { errorResponse, sendJsonResponse, sendValidationError } from "../../helpers/responseHelper.js";

const getUserId = (req) => req.user?._id || req.user?.id;

const getAllDirectorsByFeatureId = async (req, res) => {
  const { isValid, errors } = validateContributorPayload(req.body, {
    requiredIds: ["id"],
  });
  if (!isValid) return sendValidationError(res, errors);

  const { id, film_type } = req.body;

  try {
    const feature = await FeatureForm.findOne({
      _id: id,
      client_id: getUserId(req),
    }, "directors");

    if (!feature) {
      return sendJsonResponse(res, 200, { message: "Records not found", statusCode: 203 });
    }
    // 2. Attach matching documents to each director manually
    const allDirectorWithDocs = await Promise.all(
      feature.directors.map(async (director) => {
        const documents = await Document.findOne({
          context_id: director._id, // assuming context_id links a document to a director
          form_type: film_type === 'feature' ? 1 : 2,
          website_type: 5,
          document_type: 5,
        });

        return {
          ...director.toObject(),
          documents, // attach documents manually
        };
      })
    );
    allDirectorWithDocs.forEach((director) => {
      if (director?.documents?.file) {
        director.documents.file = `/api/documents/${director.documents._id}/download`;
      }
      if (director?.director_self_attested_doc) {
        director.director_self_attested_doc = director.documents?._id
          ? `/api/documents/${director.documents._id}/download`
          : null;
      }
    });

    return sendJsonResponse(res, 200, {
      message: "Data fetched successfully",
      data: allDirectorWithDocs,
      statusCode: 200,
    });
  } catch (error) {
    return errorResponse(res, error);
  }
};

const addDirectorToFeature = async (req, res) => {
  const { isValid, errors } = validateContributorPayload(req.body, {
    requiredIds: ["nfa_feature_id"],
    optionalIds: ["id"],
  });
  if (!isValid) return sendValidationError(res, errors);

  const { nfa_feature_id: _id, id: directorId } = req.body; // Director data from client
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
    let updatedDirector;
    if (directorId) {
      // Update existing director
      const existingDirector = feature.directors.id(directorId);
      if (!existingDirector) {
        return sendJsonResponse(res, 200, { message: "director not found", statusCode: 203 });
      }

      Object.entries(req.body).forEach(([key, value]) => {
        if (key !== 'id' && key !== 'nfa_feature_id') {
          existingDirector[key] = value;
        }
      });
      updatedDirector = existingDirector;

    } else {
      // Add new director
      const newDirector = feature.directors.create(req.body);
      feature.directors.push(newDirector);
      updatedDirector = newDirector;
    }

    // 4. Handle file upload (only if files are present)
    if (payload.files && Array.isArray(payload.files)) {
      const directorDocs = payload.files.find((file) => file.fieldname === "director_self_attested_doc");

      if (directorDocs) {
        const fileUpload = await Common.imageUpload({
          id: updatedDirector._id,
          image_key: "director_self_attested_doc",
          websiteType: "NFA",
          formType: payload.film_type === "non-feature" ? "NON_FEATURE" : "FEATURE",
          image: directorDocs,
        });

        if (!fileUpload.status) {
          return sendJsonResponse(res, 500, { message: "failed to upload director document", statusCode: 500, });
        }

        // Add uploaded file to director.documents
        updatedDirector.documents.push(fileUpload.data);

        // Also store file name directly for UI usage if needed
        updatedDirector.director_self_attested_doc = fileUpload?.data?.file;
      }
    }
    // Save the updated document
    await feature.save();
    const updatedData = feature.directors.map((item) => {
      const obj = item.toObject();
      obj.id = obj._id;
      delete obj._id;
      return obj;
    });

    return sendJsonResponse(res, 200, {
      message: directorId ? "Director updated successfully" : "Director added successfully",
      data: updatedData,
      statusCode: 200,
    });
  } catch (error) {
    return errorResponse(res, error);
  }
};
const deleteDirectorById = async (req, res) => {
  const { isValid, errors } = validateContributorPayload(req.body, {
    requiredIds: ["nfa_feature_id", "directorId"],
  });
  if (!isValid) return sendValidationError(res, errors);

  const { nfa_feature_id: _id, directorId } = req.body;

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

    // Find the director by ID and remove it
    const director = feature.directors.id(directorId);
    if (!director) {
      return sendJsonResponse(res, 200, {
        message: 'Director not found',
        statusCode: 203,
      });
    }

    feature.directors.pull(directorId); // Remove from embedded array

    await feature.save(); // Save the updated document

    return sendJsonResponse(res, 200, {
      message: 'director deleted successfully',
      statusCode: 200,
      // data: feature.producers, // optionally return updated list
    });

  } catch (error) {
    return errorResponse(res, error);
  }
};

export default {
  getAllDirectorsByFeatureId,
  addDirectorToFeature,
  deleteDirectorById,
};
