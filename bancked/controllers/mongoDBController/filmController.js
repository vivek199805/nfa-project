import { Document } from "../../models/mongodbModels/document.js";
import { FeatureForm } from "../../models/mongodbModels/featureForm.js";
import Common from "../../services/common.js"

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
      color_bw,
      aspect_ratio,
      running_time,
      format,
      director_debut,
      sound_system,
      film_synopsis,
      step,
    } = req.body;

    const filmData = new FeatureForm({
      film_title_roman,
      film_title_devnagri,
      film_title_english,
      language_id,
      english_subtitle,
      color_bw,
      aspect_ratio,
      running_time,
      format,
      director_debut,
      sound_system,
      film_synopsis,
      step,
      active_step: "1",
      film_type: 'feature'
    });
    await filmData.save();
    const finalData = filmData.toObject(); // Convert Mongoose document to plain JS object
    finalData.id = finalData._id;
    delete finalData._id;

    res.status(200).json({ message: "Submit successful", statusCode: 200, data: finalData });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Create Non-Feature Submission
const createNonFeatureSubmission = async (req, res) => {
  try {
    const {
      film_title_roman,
      film_title_devnagri,
      film_title_english,
      language_id,
      english_subtitle,
      color_bw,
      aspect_ratio,
      running_time,
      format,
      director_debut,
      sound_system,
      film_synopsis,
      step,
    } = req.body;

    const filmData = new FeatureForm({
      film_title_roman,
      film_title_devnagri,
      film_title_english,
      language_id,
      english_subtitle,
      color_bw,
      aspect_ratio,
      running_time,
      format,
      director_debut,
      sound_system,
      film_synopsis,
      step,
      active_step: "1",
      film_type: 'non-feature'
    });
    await filmData.save();
    const finalData = filmData.toObject(); // Convert Mongoose document to plain JS object
    finalData.id = finalData._id;
    delete finalData._id;
    res.status(200).json({ message: "Submit successful", statusCode: 200, data: finalData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all Feature & non-feature List
const getFilmEntryList = async (req, res) => {
  try {
    const filmEntryData = await FeatureForm.find().populate(
      "producers directors songs actors audiographer documents"
    );

    const formattedData = filmEntryData.map((item) => {
      const obj = item.toObject();
      obj.id = obj._id;
      delete obj._id;
      return obj;
    });

    // Separate feature and non-feature films
    const featureFilmData = formattedData.filter(item => item.film_type !== 'non-feature');
    const nonFeatureFilmData = formattedData.filter(item => item.film_type === 'non-feature');

    const finalData = {
      feature: featureFilmData,
      "non-feature": nonFeatureFilmData,
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
// Get  Feature & non-feature List by id
const getFilmDetailsById = async (req, res) => {
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


const updateFeatureNonfeatureById = async (req, res) => {
  try {
    const payload = {
      ...req.body,
      files: req.files,
    };

    const { id: _id, } = req.body;
    // Find the document by ID
    const existingEntry = await FeatureForm.findById(_id);
    if (!existingEntry) {
      return res.status(200).json({ statusCode: 203, message: "Feature submission not found" });
    }
    let stepHandler = {};
    if (req.body.film_type === 'feature') {
      stepHandler = {
        [Common.stepsFeature().GENERAL]: async (existingEntry, payload) => await handleGeneralStep(existingEntry, payload),
        [Common.stepsFeature().CENSOR]: async (existingEntry, payload) => await handleCensorStep(existingEntry, payload),
        [Common.stepsFeature().COMPANY_REGISTRATION]: async (data, payload) => await handleCompanyRegistrationStep(data, payload),
        [Common.stepsFeature().PRODUCER]: async (existingEntry, payload) => await handleProducerStep(existingEntry, payload),
        [Common.stepsFeature().DIRECTOR]: async (existingEntry, payload) => await handleDirectorStep(existingEntry, payload),
        [Common.stepsFeature().ACTORS]: async (existingEntry, payload) => await handleActorsStep(existingEntry, payload),
        [Common.stepsFeature().SONGS]: async (existingEntry, payload) => await handleSongsStep(existingEntry, payload),
        [Common.stepsFeature().AUDIOGRAPHER]: async (existingEntry, payload) => await handleAudiographerStep(existingEntry, payload),
        [Common.stepsFeature().OTHER]: async (existingEntry, payload) => await handleOtherStep(existingEntry, payload),
        [Common.stepsFeature().RETURN_ADDRESS]: async (existingEntry, payload) => await handleReturnAddressStep(existingEntry, payload),
        [Common.stepsFeature().DECLARATION]: async (existingEntry, payload) => await handleDeclarationStep(existingEntry, payload),
      };
    } else if (req.body.film_type === 'non-feature') {
      stepHandler = {
        [Common.stepsNonFeature().GENERAL]: async (existingEntry, payload) => await handleGeneralStep(existingEntry, payload),
        [Common.stepsNonFeature().CENSOR]: async (existingEntry, payload) => await handleCensorStep(existingEntry, payload),
        [Common.stepsNonFeature().COMPANY_REGISTRATION]: async (data, payload) => await handleCompanyRegistrationStep(data, payload),
        [Common.stepsNonFeature().PRODUCER]: async (existingEntry, payload) => await handleProducerStep(existingEntry, payload),
        [Common.stepsNonFeature().DIRECTOR]: async (existingEntry, payload) => await handleDirectorStep(existingEntry, payload),
        [Common.stepsNonFeature().OTHER]: async (existingEntry, payload) => await handleOtherStep(existingEntry, payload),
        [Common.stepsNonFeature().RETURN_ADDRESS]: async (existingEntry, payload) => await handleReturnAddressStep(existingEntry, payload),
        [Common.stepsNonFeature().DECLARATION]: async (existingEntry, payload) => await handleDeclarationStep(existingEntry, payload),
      };
    }

    if (stepHandler[+req.body.step]) {
      const result = await stepHandler[+req.body.step](existingEntry, payload);
      // Update the document with request body
      Object.assign(result, payload);

      // Save updated document
      const updated = await result.save();

      res.status(200).json({
        statusCode: 200,
        message: "Feature submission updated successfully",
        data: updated,
      });
    }

  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      message: "Error updating feature submission",
      error: error.message,
    });
  }
};

// for producer Api

const getAllProducersByFeatureId = async (req, res) => {
  const { id, film_type } = req.body;

  try {
    const producersData  = await FeatureForm.findById(id, "producers");

    if (!producersData) {
      return res.status(200).json({ message: "Records not found", statusCode: 201 });
    }
    console.log("producersData", producersData);
    

    // 2. Attach matching documents to each producer manually
    const allProducerWithDocs = await Promise.all(
      producersData?.producers.map(async (producer) => {
        const documents = await Document.findOne({
          context_id: producer._id, // assuming context_id links a document to a producer
          form_type:  film_type === 'feature' ? 1 : 2,
          website_type: 5,
          document_type: 4,
        });

        return {
          ...producer.toObject(),
          documents, // attach documents manually
        };
      })
    );

console.log("allProducerWithDocs", allProducerWithDocs);


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
    // Handle file upload if files are provided
    if (payload.files && Array.isArray(payload.files)) {
      const producerDoc = payload.files.find((file) => file.fieldname === "producer_self_attested_doc");

      if (producerDoc) {
        const fileUpload = await Common.imageUpload({
          id: updatedData[0].id,
          image_key: "producer_self_attested_doc",
          websiteType: "NFA",
          formType: payload.film_type === "non-feature" ? "NON_FEATURE" : "FEATURE",
          image: producerDoc,
        });

        if (!fileUpload.status) {
          return res.status(500).json({ message: "failed to upload producer document", statusCode: 500, });
        }
      }
    }


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
  const { nfa_feature_id: _id, id: directorId } = req.body; // Producer data from client
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
  const { nfa_feature_id: _id, actorId } = req.body; // Producer data from client
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
    const feature = await FeatureForm.findById({ _id: nfa_feature_id });

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
  const { nfa_feature_id: _id, audiographerId } = req.body; // audiographer data from client
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
    const feature = await FeatureForm.findById({ _id: nfa_feature_id });

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


const finalSubmit = async (req, res) => {
  try {
    const { id: _id } = req.body;
    // Find the document by ID
    const existingEntry = await FeatureForm.findById(_id);

    if (!existingEntry) {
      return res.status(404).json({ statusCode: 404, message: "Feature submission not found" });
    }

    // Update the document with request body
    Object.assign(existingEntry, req.body);

    // Save updated document
    const updated = await existingEntry.save();

    res.status(200).json({
      statusCode: 200,
      message: "Payment submitted successfully",
      data: updated,
    });
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      message: "Error payment submission",
      error: error.message,
    });
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

const handleGeneralStep = async (data, payload) => {
  const lastId = payload.id;
  console.log("handleGeneralStep", data);
  console.log("handleGeneralStep payload", payload);

  if (payload?.film_type === "feature") {
    if (!data.active_step || data.active_step < Common.stepsFeature().GENERAL) {
      data.active_step = Common.stepsFeature().GENERAL;
    }
  } else if (payload?.film_type === "non-feature") {
    if (!data.active_step || data.active_step < Common.stepsNonFeature().GENERAL) {
      data.active_step = Common.stepsNonFeature().GENERAL;
    }
  }


  // update = await checkForm.update(data);
  // return {
  //   status: "success",
  //   message: "Records updated successfully.!!",
  //   data: update,
  // };
  return data;


  // data.active_step = payload.step;
  // create = await NfaFeature.create(data);

  // return {
  //   status: "created",
  //   data: { message: "Created successfully.!!", record: create },
  // };
}

const handleCensorStep = async (data, payload) => {
  const lastId = payload.id;

  if (payload.film_type === "feature") {
    if (!data.active_step || data.active_step < Common.stepsFeature().CENSOR) {
      data.active_step = Common.stepsFeature().CENSOR;
    }
  } else if (payload.film_type === "non-feature") {
    if (!data.active_step || data.active_step < Common.stepsNonFeature().CENSOR) {
      data.active_step = Common.stepsNonFeature().CENSOR;
    }
  }

  if (payload.files && Array.isArray(payload.files)) {
    const censorFile = payload.files.find((file) => file.fieldname === "censor_certificate_file");
    if (censorFile) {
      const fileUpload = await Common.imageUpload({
        id: lastId,
        image_key: "censor_certificate_file",
        websiteType: "NFA",
        formType: payload.film_type === "non-feature" ? "NON_FEATURE" : "FEATURE",
        image: censorFile,
      });

      if (!fileUpload.status) {
        return response("exception", { message: "Image not uploaded.!!" });
      }

      data.censor_certificate_file = censorFile.originalname ?? null;
    } else {
      data.censor_certificate_file = null;
    }
  } else {
    data.censor_certificate_file = null;
  }
  return data;

}

const handleCompanyRegistrationStep = async (data, payload) => {
  const lastId = payload.id;

  if (payload.film_type === "feature") {
    if (!data.active_step || data.active_step < Common.stepsFeature().COMPANY_REGISTRATION) {
      data.active_step = Common.stepsFeature().COMPANY_REGISTRATION;
    }
  } else if (payload.film_type === "non-feature") {
    if (!data.active_step || data.active_step < Common.stepsNonFeature().COMPANY_REGISTRATION) {
      data.active_step = Common.stepsNonFeature().COMPANY_REGISTRATION;
    }
  }

  if (payload.files && Array.isArray(payload.files)) {
    const censorFile = payload.files.find(
      (file) => file.fieldname === "company_reg_doc"
    );
    if (censorFile) {
      const fileUpload = await Common.imageUpload({
        id: lastId,
        image_key: "company_reg_doc",
        websiteType: "NFA",
        formType: payload.film_type === "non-feature" ? "NON_FEATURE" : "FEATURE",
        image: censorFile,
      });

      if (!fileUpload.status) {
        return response("exception", { message: "Image not uploaded.!!" });
      }
      data.company_reg_doc = censorFile.originalname ?? null;
    } else {
      data.company_reg_doc = null;
    }
  } else {
    data.company_reg_doc = null;
  }

  // update = await checkForm.update(data);
  // return {
  //   status: "success",
  //   message: "Records updated successfully.!!",
  //   data: update,
  // };
  return data;
}

const handleProducerStep = async (data, payload,) => {
  const lastId = payload.id;

  if (payload.film_type === "feature") {
    if (!data.active_step || data.active_step < Common.stepsFeature().PRODUCER) {
      data.active_step = Common.stepsFeature().PRODUCER;
    }
  } else if (payload.film_type === "non-feature") {
    if (!data.active_step || data.active_step < Common.stepsNonFeature().PRODUCER) {
      data.active_step = Common.stepsNonFeature().PRODUCER;
    }
  }

  return data;
}

const handleDirectorStep = async (data, payload) => {
  const lastId = payload.last_id;
  if (payload.film_type === "feature") {
    if (!data.active_step || data.active_step < Common.stepsFeature().DIRECTOR) {
      data.active_step = Common.stepsFeature().DIRECTOR;
    }
  } else if (payload.film_type === "non-feature") {
    if (!data.active_step || data.active_step < Common.stepsNonFeature().DIRECTOR) {
      data.active_step = Common.stepsNonFeature().DIRECTOR;
    }
  }
  return data;
}

const handleActorsStep = async (data, payload) => {
  const lastId = payload.last_id;

  if (
    !data.active_step ||
    data.active_step < Common.stepsFeature().ACTORS
  ) {
    data.active_step = Common.stepsFeature().ACTORS;
  }
  return data;
}

const handleSongsStep = async (data, payload) => {
  const lastId = payload.last_id;

  if (
    !data.active_step ||
    data.active_step < Common.stepsFeature().SONGS
  ) {
    data.active_step = Common.stepsFeature().SONGS;
  }
  return data;
}

const handleAudiographerStep = async (data, payload) => {
  const lastId = payload.last_id;

  if (
    !data.active_step ||
    data.active_step < Common.stepsFeature().AUDIOGRAPHER
  ) {
    data.active_step = Common.stepsFeature().AUDIOGRAPHER;
  }
  return data;
}

const handleOtherStep = async (data, payload) => {
  const lastId = payload.id;

  if (payload.film_type === "feature") {
    if (!data.active_step || data.active_step < Common.stepsFeature().OTHER) {
      data.active_step = Common.stepsFeature().OTHER;
    }
  } else if (payload.film_type === "non-feature") {
    if (!data.active_step || data.active_step < Common.stepsNonFeature().OTHER) {
      data.active_step = Common.stepsNonFeature().OTHER;
    }
  }

  return data;
}

const handleReturnAddressStep = async (data, payload) => {
  const lastId = payload.id;

  if (payload.film_type === "feature") {
    if (!data.active_step || data.active_step < Common.stepsFeature().RETURN_ADDRESS) {
      data.active_step = Common.stepsFeature().RETURN_ADDRESS;
    }
  } else if (payload.film_type === "non-feature") {
    if (!data.active_step || data.active_step < Common.stepsNonFeature().RETURN_ADDRESS) {
      data.active_step = Common.stepsNonFeature().RETURN_ADDRESS;
    }
  }
  return data;
}

const handleDeclarationStep = async (data, payload) => {
  const lastId = payload.id;
  console.log("handleReturnAddressStep", data);
  console.log("handleReturnAddressStep payload", payload);
  if (payload.film_type === "feature") {
    if (!data.active_step || data.active_step < Common.stepsFeature().DECLARATION) {
      data.active_step = Common.stepsFeature().DECLARATION;
    }
  } else if (payload.film_type === "non-feature") {
    if (!data.active_step || data.active_step < Common.stepsNonFeature().DECLARATION) {
      data.active_step = Common.stepsNonFeature().DECLARATION;
    }
  }

  return data;
}



export default {
  createFeatureSubmission,
  createNonFeatureSubmission,
  getFilmEntryList,
  updateFeatureNonfeatureById,
  getFilmDetailsById,
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
  finalSubmit
};
