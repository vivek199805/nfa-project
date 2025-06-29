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
      client_id
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
      film_type: 'feature',
      client_id
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
    if (!id) {
      return res.status(200).json({
        statusCode: 203,
        message: "Film ID is required",
      });
    }
    // Step 1: Find FeatureForm by ID and populate nested arrays
    const featureForm = await FeatureForm.findById(id).populate([
      "producers",
      "directors",
      "songs",
      "actors",
      "audiographer",
    ]);

    if (!featureForm) {
      return res.status(200).json({
        statusCode: 203,
        message: "Film submission not found",
      });
    }

    // Step 2: Find related document(s) by context_id
    const relatedDocuments = await Document.find({
      context_id: featureForm._id,
    });
    // Convert Mongoose Document to plain object (optional but safer for mutation)
    const featureData = featureForm.toObject();
    // Add documents directly into the object
    featureData.documents = relatedDocuments || [];
        const fileBasePath = "documents/NFA/";
    if (featureData.censor_certificate_file) featureData.censor_certificate_file = `${fileBasePath}${featureData.censor_certificate_file}`;
    if (featureData.company_reg_doc) featureData.company_reg_doc = `${fileBasePath}${featureData.company_reg_doc}`;
    if (featureData.original_work_copy) featureData.original_work_copy = `${fileBasePath}${featureData.original_work_copy}`;
    // Step 3: Return the feature data with documents
    res.status(200).json({
      message: "Fetch successfully",
      statusCode: 200,
      data: featureData,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const updateFeatureNonfeatureById = async (req, res) => {
  try {
    const requiredFields = ["id", "film_type"];
    const missingFields = requiredFields.filter((field) => !req.body[field]);

    if (missingFields.length > 0) {
      return res.status(200).json({
        statusCode: 203,
        message: `${missingFields.join(" and ")} ${missingFields.length > 1 ? "are" : "is"} required`,
      });
    }
    const payload = {
      ...req.body,
      files: req.files,
    };


    const { id: _id, film_type } = req.body;
    // Find the document by ID
    const existingEntry = await FeatureForm.findById(_id);
    if (!existingEntry) {
      return res.status(200).json({ statusCode: 203, message: "Feature submission not found" });
    }
    let stepHandler = {};
    if (film_type === 'feature') {
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
    } else if (film_type === 'non-feature') {
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

      data.censor_certificate_file = fileUpload?.data?.file ?? null;
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
      data.company_reg_doc = fileUpload?.data?.file ?? null;
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

  if (payload.files && Array.isArray(payload.files)) {
    const originalFile = payload.files.find((file) => file.fieldname === "original_work_copy");
    if (originalFile) {
      const fileUpload = await Common.imageUpload({
        id: lastId,
        image_key: "original_work_copy",
        websiteType: "NFA",
        formType: payload.film_type === "non-feature" ? "NON_FEATURE" : "FEATURE",
        image: originalFile,
      });

      if (!fileUpload.status) {
        return response("exception", { message: "Image not uploaded.!!" });
      }

      data.original_work_copy = originalFile.originalname ?? null;
    } else {
      data.original_work_copy = null;
    }
  } else {
    data.original_work_copy = null;
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
  getNonFeatureSubmissions,
  finalSubmit
};
