import { FeatureForm } from "../../models/mongodbModels/featureForm.js";
import { validateContributorPayload } from "../../helpers/contributorSchemaHelper.js";
import { errorResponse, sendJsonResponse, sendValidationError } from "../../helpers/responseHelper.js";

const getUserId = (req) => req.user?._id || req.user?.id;

const getAllSongByFeatureId = async (req, res) => {
  const { isValid, errors } = validateContributorPayload(req.body, {
    requiredIds: ["id"],
  });
  if (!isValid) return sendValidationError(res, errors);

  const { id } = req.body;

  try {
    const feature = await FeatureForm.findOne({
      _id: id,
      client_id: getUserId(req),
    }, "songs");

    if (!feature) {
      return sendJsonResponse(res, 200, { message: "Records not found", statusCode: 203 });
    }

    return sendJsonResponse(res, 200, {
      message: "Data fetched successfully",
      data: feature.songs,
      statusCode: 200,
    });
  } catch (error) {
    return errorResponse(res, error);
  }
};

const addSongToFeature = async (req, res) => {
  const { isValid, errors } = validateContributorPayload(req.body, {
    requiredIds: ["nfa_feature_id"],
    optionalIds: ["songId"],
  });
  if (!isValid) return sendValidationError(res, errors);

  const { nfa_feature_id: _id, songId } = req.body; // Song data from client
  try {
    // Find the feature form by ID
    const feature = await FeatureForm.findOne({
      _id,
      client_id: getUserId(req),
    });
    if (!feature) {
      return sendJsonResponse(res, 200, { message: "Feature form not found", statusCode: 203 });
    }
    if (songId) {
      // Update existing song
      const existingSong = feature.songs.id(songId);
      if (!existingSong) {
        return sendJsonResponse(res, 200, { message: "Song not found", statusCode: 203 });
      }

      Object.entries(req.body).forEach(([key, value]) => {
        if (key !== 'id' && key !== 'nfa_feature_id') {
          existingSong[key] = value;
        }
      });

    } else {
      // Add new song
      feature.songs.push(req.body);
    }

    // Save the updated document
    await feature.save();
    const updatedData = feature.songs.map((item) => {
      const obj = item.toObject();
      obj.id = obj._id;
      delete obj._id;
      return obj;
    });

    return sendJsonResponse(res, 200, {
      message: songId ? "song updated successfully" : "song added successfully",
      data: updatedData,
      statusCode: 200,
    });
  } catch (error) {
    return errorResponse(res, error);
  }
};

const deleteSongById = async (req, res) => {
  const { isValid, errors } = validateContributorPayload(req.body, {
    requiredIds: ["nfa_feature_id", "songId"],
  });
  if (!isValid) return sendValidationError(res, errors);

  const { nfa_feature_id, songId } = req.body;

  try {
    const feature = await FeatureForm.findOne({
      _id: nfa_feature_id,
      client_id: getUserId(req),
    });

    if (!feature) {
      return sendJsonResponse(res, 200, {
        message: 'Feature form not found',
        statusCode: 203,
      });
    }

    // Find the Song by ID and remove it
    const song = feature.songs.id(songId);
    if (!song) {
      return sendJsonResponse(res, 200, {
        message: 'song not found',
        statusCode: 203,
      });
    }

    feature.songs.pull(songId); // Remove from embedded array

    await feature.save(); // Save the updated document

    return sendJsonResponse(res, 200, {
      message: 'song deleted successfully',
      statusCode: 200,
    });

  } catch (error) {
    return errorResponse(res, error);
  }
};

export default {

  getAllSongByFeatureId,
  addSongToFeature,
  deleteSongById,
};
