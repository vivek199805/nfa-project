import { FeatureForm } from "../../models/mongodbModels/featureForm.js";
import { validateContributorPayload } from "../../helpers/contributorSchemaHelper.js";
import { sendValidationError } from "./responseHelper.js";

const getUserId = (req) => req.user?._id || req.user?.id;

const getAllActorsByFeatureId = async (req, res) => {
  const { isValid, errors } = validateContributorPayload(req.body, {
    requiredIds: ["id"],
  });
  if (!isValid) return sendValidationError(res, errors);

  const { id } = req.body;

  try {
    const feature = await FeatureForm.findOne({
      _id: id,
      client_id: getUserId(req),
    }, "actors");

    if (!feature) {
      return res.status(200).json({ message: "Records not found", statusCode: 203 });
    }

    res.status(200).json({
      message: "Data fetched successfully",
      data: feature.actors,
      statusCode: 200,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch actors", message: error.message });
  }
};

const addActorToFeature = async (req, res) => {
  const { isValid, errors } = validateContributorPayload(req.body, {
    requiredIds: ["nfa_feature_id"],
    optionalIds: ["actorId"],
  });
  if (!isValid) return sendValidationError(res, errors);

  const { nfa_feature_id: _id, actorId } = req.body; // Actor data from client
  try {
    // Find the feature form by ID
    const feature = await FeatureForm.findOne({
      _id,
      client_id: getUserId(req),
    });
    if (!feature) {
      return res.status(200).json({ message: "Feature form not found", statusCode: 203 });
    }
    if (actorId) {
      // Update existing actor
      const existingActor = feature.actors.id(actorId);
      if (!existingActor) {
        return res.status(200).json({ message: "actor not found", statusCode: 203 });
      }

      Object.entries(req.body).forEach(([key, value]) => {
        if (key !== 'id' && key !== 'nfa_feature_id') {
          existingActor[key] = value;
        }
      });

    } else {
      // Add new actor
      feature.actors.push(req.body);
    }

    // Save the updated document
    await feature.save();
    const updatedData = feature.actors.map((item) => {
      const obj = item.toObject();
      obj.id = obj._id;
      delete obj._id;
      return obj;
    });

    res.status(200).json({
      message: actorId ? "actor updated successfully" : "actor added successfully",
      data: updatedData,
      statusCode: 200,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to add actor", message: error.message });
  }
};

const deleteActorById = async (req, res) => {
  const { isValid, errors } = validateContributorPayload(req.body, {
    requiredIds: ["nfa_feature_id", "actorId"],
  });
  if (!isValid) return sendValidationError(res, errors);

  const { nfa_feature_id, actorId } = req.body;

  try {
    const feature = await FeatureForm.findOne({
      _id: nfa_feature_id,
      client_id: getUserId(req),
    });

    if (!feature) {
      return res.status(200).json({
        message: 'Feature form not found',
        statusCode: 203,
      });
    }

    // Find the actor by ID and remove it
    const actor = feature.actors.id(actorId);
    if (!actor) {
      return res.status(200).json({
        message: 'actor not found',
        statusCode: 203,
      });
    }

    feature.actors.pull(actorId); // Remove from embedded array

    await feature.save(); // Save the updated document

    return res.status(200).json({
      message: 'actor deleted successfully',
      statusCode: 200,
    });

  } catch (error) {
    return res.status(500).json({
      message: 'Error deleting actor',
      error: error.message,
      statusCode: 500,
    });
  }
};

export default {

  getAllActorsByFeatureId,
  addActorToFeature,
  deleteActorById,
};
