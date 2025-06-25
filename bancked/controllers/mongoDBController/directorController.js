import { Document } from "../../models/mongodbModels/document.js";
import { FeatureForm } from "../../models/mongodbModels/featureForm.js";
import Common from "../../services/common.js"


const getAllDirectorsByFeatureId = async (req, res) => {
  const { id, film_type } = req.body;

  try {
    const feature = await FeatureForm.findById(id, "directors");
    console.log(feature);

    if (!feature) {
      return res.status(200).json({ message: "Records not found", statusCode: 201 });
    }
    // 2. Attach matching documents to each director manually
    const allDirectorWithDocs = await Promise.all(
      feature.directors.map(async (director) => {
        const documents = await Document.findOne({
          context_id: director._id, // assuming context_id links a document to a director
          form_type: film_type === 'feature' ? 1 : 2,
          website_type: 5,
          document_type: 4,
        });

        return {
          ...director.toObject(),
          documents, // attach documents manually
        };
      })
    );

    res.status(200).json({
      message: "data fetch successfully",
      data: allDirectorWithDocs,
      statusCode: 200,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch Directors", message: error.message });
  }
};

const addDirectorToFeature = async (req, res) => {
  const { nfa_feature_id: _id, id: directorId } = req.body; // Producer data from client
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
    let updatedDirector;
    if (directorId) {
      // ✅ Update existing producer
      const existingDirector = feature.directors.id(directorId);
      if (!existingDirector) {
        return res.status(200).json({ message: "director not found", statusCode: 201 });
      }

      Object.entries(req.body).forEach(([key, value]) => {
        if (key !== 'id' && key !== 'nfa_feature_id') {
          existingDirector[key] = value;
        }
      });
      updatedDirector = existingDirector;

    } else {
      // ✅ Add new director
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
          return res.status(500).json({ message: "failed to upload director document", statusCode: 500, });
        }

        // // ✅ Add uploaded file to director.documents
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

    res.status(200).json({
      message: directorId ? "Director updated successfully" : "Director added successfully",
      data: updatedData,
      statusCode: 200,
    });
  } catch (error) {
    res.status(500).json({ message: error.message, statusCode: 500 });
  }
};
const deleteDirectorById = async (req, res) => {
  const { nfa_feature_id: _id, directorId } = req.body;

  try {
    const feature = await FeatureForm.findById(_id);

    if (!feature) {
      return res.status(200).json({
        message: 'Feature form not found',
        statusCode: 203,
      });
    }

    // Find the producer by ID and remove it
    const director = feature.directors.id(directorId);
    if (!director) {
      return res.status(200).json({
        message: 'Director not found',
        statusCode: 203,
      });
    }

    director.remove(); // Remove from embedded array

    await feature.save(); // Save the updated document

    return res.status(200).json({
      message: 'director deleted successfully',
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
  getAllDirectorsByFeatureId,
  addDirectorToFeature,
  deleteDirectorById,
};
