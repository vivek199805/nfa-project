import { FeatureForm } from "../../models/mongodbModels/featureForm.js";

// Create Feature Submission
const createFeatureSubmission = async (req, res) => {
  try {
    console.log(req.body);
    const {
      film_title_roman,
      film_title_devnagri,
      film_title_english,
      language_id,
      english_subtitle,
      colorFormat,
      aspectRatio,
      runningTime,
      format,
      director_debut,
      sound_system,
      film_synopsis,
      step,
    } = req.body;

    const submission = await new FeatureForm({
      film_title_roman,
      film_title_devnagri,
      film_title_english,
      language_id,
      english_subtitle,
      colorFormat,
      aspectRatio,
      runningTime,
      format,
      director_debut,
      sound_system,
      film_synopsis,
      step: +step,
      active_step: "1",
    });
    await submission.save();
    const finalData = {
      id: submission?._id,
      ...submission,
    };

    res
      .status(200)
      .json({ message: "Submit successful", statusCode: 200, data: finalData });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Create Non-Feature Submission
const createNonFeatureSubmission = async (req, res) => {
  try {
    const submission = await FeatureForm.create(req.body);
    res.status(201).json(submission);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all Feature Submissions
const getFeatureSubmissions = async (req, res) => {
  try {
    const submissions = await FeatureForm.find().populate(
      "producers directors songs actors audiographer documents"
    );

    const formattedSubmissions = submissions.map((item) => {
      const obj = item.toObject(); // Convert Mongoose document to plain JS object
      obj.id = obj._id;
      delete obj._id; // optional: remove _id if not needed
      return obj;
    });

    const finalData = {
      feature: formattedSubmissions,
      "non-feature": [],
    };
    res.status(200).json({
      message: "Fetch successfully",
      statusCode: 200,
      data: finalData,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateFeatureSubmissionById = async (req, res) => {
  try {
    const { id: _id, step: newStep } = req.body;
    // Find the document by ID
    const existingEntry = await FeatureForm.findById(_id);

    if (!existingEntry) {
      return res
        .status(404)
        .json({ statusCode: 404, message: "Feature submission not found" });
    }

    // If new step is different, increment step
    if (newStep && newStep != existingEntry.step) {
      const numericStep = parseInt(existingEntry.step, 10) || 0;
      existingEntry.step = (numericStep + 1).toString(); // store as string if model defines it so
      existingEntry.active_step = (parseInt(existingEntry.active_step, 10) + 1).toString();
    }

    // Update the document with request body
    Object.assign(existingEntry, req.body);

    // Save updated document
    const updated = await existingEntry.save();

    res.status(200).json({
      statusCode: 200,
      message: "Feature submission updated successfully",
      data: updated,
    });
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      message: "Error updating feature submission",
      error: error.message,
    });
  }
};

const getAllProducersByFeatureId = async (req, res) => {
  const { id } = req.body;

  try {
    const feature = await FeatureForm.findById(id, "producers");
    console.log(feature);

    if (!feature) {
      return res
        .status(200)
        .json({ message: "Records not found", statusCode: 201 });
    }

    res
      .status(200)
      .json({
        message: "data fetch successfully",
        data: feature.producers,
        statusCode: 200,
      });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to fetch producers", message: error.message });
  }
};

const addProducerToFeature = async (req, res) => {
  const { nfa_feature_id:_id, id:producerId } = req.body; // Producer data from client

  console.log("producerData", req.body);
 console.log("producerData", producerId);
  try {
    // Find the feature form by ID
    const feature = await FeatureForm.findById(_id);
    if (!feature) {
      return res.status(200).json({ message: "Feature form not found", statusCode: 201 });
    }
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

    } else {
      // ✅ Add new producer
      feature.producers.push(req.body);
    }

    // Save the updated document
    await feature.save();
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
    res
      .status(500)
      .json({ error: "Failed to add producer", message: error.message });
  }
};

const deleteProducerById = async (req, res) => {
  const { nfa_feature_id:_id, producerId } = req.body;

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

// for director Api
const getAllDirectorsByFeatureId = async (req, res) => {
  const { id } = req.body;

  try {
    const feature = await FeatureForm.findById(id, "directors");
    console.log(feature);

    if (!feature) {
      return res.status(200).json({ message: "Records not found", statusCode: 201 });
    }

    res.status(200).json({
        message: "data fetch successfully",
        data: feature.directors,
        statusCode: 200,
      });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch Directors", message: error.message });
  }
};

const addDirectorToFeature = async (req, res) => {
  const { nfa_feature_id:_id, id:directorId } = req.body; // Producer data from client
  try {
    // Find the feature form by ID
    const feature = await FeatureForm.findById(_id);
    if (!feature) {
      return res.status(200).json({ message: "Feature form not found", statusCode: 201 });
    }
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

    } else {
      // ✅ Add new producer
      feature.directors.push(req.body);
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
    res
      .status(500)
      .json({ error: "Failed to add producer", message: error.message });
  }
};
const deleteDirectorById = async (req, res) => {
  const { nfa_feature_id:_id, directorId } = req.body;

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



// for Actor Api
const getAllActorsByFeatureId = async (req, res) => {
  const { id } = req.body;

  try {
    const feature = await FeatureForm.findById(id, "actors");
    console.log(feature);

    if (!feature) {
      return res.status(200).json({ message: "Records not found", statusCode: 201 });
    }

    res.status(200).json({
        message: "data fetch successfully",
        data: feature.actors,
        statusCode: 200,
      });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch Directors", message: error.message });
  }
};

const addActorToFeature = async (req, res) => {
  const { nfa_feature_id:_id, actorId } = req.body; // Producer data from client
  try {
    // Find the feature form by ID
    const feature = await FeatureForm.findById(_id);
    if (!feature) {
      return res.status(200).json({ message: "Feature form not found", statusCode: 201 });
    }
    if (actorId) {
      // ✅ Update existing producer
      const existingActor = feature.actors.id(actorId);
      if (!existingActor) {
        return res.status(200).json({ message: "actor not found", statusCode: 201 });
      }

      Object.entries(req.body).forEach(([key, value]) => {
        if (key !== 'id' && key !== 'nfa_feature_id') {
          existingActor[key] = value;
        }
      });

    } else {
      // ✅ Add new producer
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
    res.status(500).json({ error: "Failed to add producer", message: error.message });
  }
};

const deleteActorById = async (req, res) => {
  const { nfa_feature_id, actorId } = req.body;

  try {
    const feature = await FeatureForm.findById({_id:nfa_feature_id});

    if (!feature) {
      return res.status(200).json({
        message: 'Feature form not found',
        statusCode: 203,
      });
    }

    // Find the producer by ID and remove it
    const actor = feature.actors.id(actorId);
    if (!actor) {
      return res.status(200).json({
        message: 'actor not found',
        statusCode: 203,
      });
    }

    actor.remove(); // Remove from embedded array

    await feature.save(); // Save the updated document

    return res.status(200).json({
      message: 'actor deleted successfully',
      statusCode: 200,
    });

  } catch (error) {
    return res.status(500).json({
      message: 'Error deleting producer',
      error: error.message,
      statusCode: 500,
    });
  }
};

// for Songs Api
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
  const { nfa_feature_id:_id, songId } = req.body; // Song data from client
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
    const feature = await FeatureForm.findById({_id:nfa_feature_id});

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

// for Audiographer Api
const getAllAudiographerByFeatureId = async (req, res) => {
  const { id } = req.body;

  try {
    const feature = await FeatureForm.findById(id, "audiographer");
    console.log(feature);

    if (!feature) {
      return res.status(200).json({ message: "Records not found", statusCode: 201 });
    }

    res.status(200).json({
        message: "data fetch successfully",
        data: feature.audiographer,
        statusCode: 200,
      });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch audiographer", message: error.message });
  }
};

const addAudiographerToFeature = async (req, res) => {
  const { nfa_feature_id:_id, audiographerId } = req.body; // audiographer data from client
  try {
    // Find the feature form by ID
    const feature = await FeatureForm.findById(_id);
    if (!feature) {
      return res.status(200).json({ message: "Feature form not found", statusCode: 201 });
    }
    if (audiographerId) {
      // ✅ Update existing audiographer
      const existingAudiographer = feature.audiographer.id(audiographerId);
      if (!existingAudiographer) {
        return res.status(200).json({ message: "audiographer not found", statusCode: 201 });
      }

      Object.entries(req.body).forEach(([key, value]) => {
        if (key !== 'id' && key !== 'nfa_feature_id') {
          existingAudiographer[key] = value;
        }
      });

    } else {
      // ✅ Add new Song
      feature.audiographer.push(req.body);
    }

    // Save the updated document
    await feature.save();
    const updatedData = feature.audiographer.map((item) => {
      const obj = item.toObject();
      obj.id = obj._id;
      delete obj._id;
      return obj;
    });

    res.status(200).json({
      message: audiographerId ? "audiographer updated successfully" : "audiographer added successfully",
      data: updatedData,
      statusCode: 200,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to add audiographer", message: error.message });
  }
};

const deleteAudiographerById = async (req, res) => {
  const { nfa_feature_id, audiographerId } = req.body;

  try {
    const feature = await FeatureForm.findById({_id:nfa_feature_id});

    if (!feature) {
      return res.status(200).json({
        message: 'Feature form not found',
        statusCode: 203,
      });
    }

    // Find the audiographer by ID and remove it
    const audiographer = feature.audiographer.id(audiographerId);
    if (!audiographer) {
      return res.status(200).json({
        message: 'audiographer not found',
        statusCode: 203,
      });
    }

    audiographer.remove(); // Remove from embedded array

    await feature.save(); // Save the updated document

    return res.status(200).json({
      message: 'audiographer deleted successfully',
      statusCode: 200,
    });

  } catch (error) {
    return res.status(500).json({
      message: 'Error deleting audiographer',
      error: error.message,
      statusCode: 500,
    });
  }
};

const getFeatureSubmissionById = async (req, res) => {
  try {
    const { id } = req.params;
    // Find the document by ID
    const existingEntry = await FeatureForm.findById(id).populate(
      "producers directors songs actors audiographer documents"
    );

    if (!existingEntry) {
      return res
        .status(404)
        .json({ statusCode: 404, message: "Feature submission not found" });
    }
    res.status(200).json({
      message: "Fetch successfully",
      statusCode: 200,
      data: existingEntry,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all Non-Feature Submissions
const getNonFeatureSubmissions = async (req, res) => {
  try {
    const submissions = await FeatureForm.find().populate(
      "producers directors songs actors audiographer documents"
    );
    res.status(200).json(submissions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export default {
  createFeatureSubmission,
  createNonFeatureSubmission,
  getFeatureSubmissions,
  updateFeatureSubmissionById,
  getFeatureSubmissionById,
  getAllProducersByFeatureId,
  addProducerToFeature,
  deleteProducerById,
  getAllDirectorsByFeatureId,
  addDirectorToFeature,
  deleteDirectorById,
  getAllActorsByFeatureId,
  addActorToFeature,
  deleteActorById,
  getAllSongByFeatureId,
  addSongToFeature,
  deleteSongById,
  getAllAudiographerByFeatureId,
  addAudiographerToFeature,
  deleteAudiographerById,
  getNonFeatureSubmissions,
};
