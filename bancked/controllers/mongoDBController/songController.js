import { FeatureForm } from "../../models/mongodbModels/featureForm.js";


const getAllSongByFeatureId = async (req, res) => {
  const { id } = req.body;

  try {
    const feature = await FeatureForm.findById(id, "songs");
    console.log(feature);

    if (!feature) {
      return res.status(200).json({ message: "Records not found", statusCode: 201 });
    }

    res.status(200).json({
      message: "data fetch successfully",
      data: feature.songs,
      statusCode: 200,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch Songs", message: error.message });
  }
};

const addSongToFeature = async (req, res) => {
  const { nfa_feature_id: _id, songId } = req.body; // Song data from client
  try {
    // Find the feature form by ID
    const feature = await FeatureForm.findById(_id);
    if (!feature) {
      return res.status(200).json({ message: "Feature form not found", statusCode: 201 });
    }
    if (songId) {
      // ✅ Update existing Song
      const existingSong = feature.songs.id(songId);
      if (!existingSong) {
        return res.status(200).json({ message: "Song not found", statusCode: 201 });
      }

      Object.entries(req.body).forEach(([key, value]) => {
        if (key !== 'id' && key !== 'nfa_feature_id') {
          existingSong[key] = value;
        }
      });

    } else {
      // ✅ Add new Song
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

    res.status(200).json({
      message: songId ? "song updated successfully" : "song added successfully",
      data: updatedData,
      statusCode: 200,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to add song", message: error.message });
  }
};

const deleteSongById = async (req, res) => {
  const { nfa_feature_id, songId } = req.body;

  try {
    const feature = await FeatureForm.findById({ _id: nfa_feature_id });

    if (!feature) {
      return res.status(200).json({
        message: 'Feature form not found',
        statusCode: 203,
      });
    }

    // Find the Song by ID and remove it
    const song = feature.songs.id(songId);
    if (!song) {
      return res.status(200).json({
        message: 'song not found',
        statusCode: 203,
      });
    }

    song.remove(); // Remove from embedded array

    await feature.save(); // Save the updated document

    return res.status(200).json({
      message: 'song deleted successfully',
      statusCode: 200,
    });

  } catch (error) {
    return res.status(500).json({
      message: 'Error deleting song',
      error: error.message,
      statusCode: 500,
    });
  }
};

export default {

  getAllSongByFeatureId,
  addSongToFeature,
  deleteSongById,
};
