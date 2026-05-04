import { Document } from "../../models/mongodbModels/document.js";
import { FeatureForm } from "../../models/mongodbModels/featureForm.js";
import Common, { documentTypeMap } from "../../services/common.js";
import NfaFilmHelper from "../../helpers/nfaFilmHelper.js";
import { sendValidationError } from "./responseHelper.js";

const getUserId = (req) => req.user?._id || req.user?.id;

const featureValidationSteps = new Set([
  Common.stepsFeature().GENERAL,
  Common.stepsFeature().CENSOR,
  Common.stepsFeature().COMPANY_REGISTRATION,
  Common.stepsFeature().OTHER,
  Common.stepsFeature().RETURN_ADDRESS,
  Common.stepsFeature().DECLARATION,
]);

const nonFeatureValidationSteps = new Set([
  Common.stepsNonFeature().GENERAL,
  Common.stepsNonFeature().CENSOR,
  Common.stepsNonFeature().COMPANY_REGISTRATION,
  Common.stepsNonFeature().OTHER,
  Common.stepsNonFeature().RETURN_ADDRESS,
  Common.stepsNonFeature().DECLARATION,
]);

const shouldValidateFilmStep = (step, filmType) => {
  const stepNumber = Number(step);

  if (filmType === "feature") {
    return featureValidationSteps.has(stepNumber);
  }

  if (filmType === "non-feature") {
    return nonFeatureValidationSteps.has(stepNumber);
  }

  return false;
};

const buildFeatureStepHandlers = () => ({
  [Common.stepsFeature().GENERAL]: handleGeneralStep,
  [Common.stepsFeature().CENSOR]: handleCensorStep,
  [Common.stepsFeature().COMPANY_REGISTRATION]: handleCompanyRegistrationStep,
  [Common.stepsFeature().PRODUCER]: handleProducerStep,
  [Common.stepsFeature().DIRECTOR]: handleDirectorStep,
  [Common.stepsFeature().ACTORS]: handleActorsStep,
  [Common.stepsFeature().SONGS]: handleSongsStep,
  [Common.stepsFeature().AUDIOGRAPHER]: handleAudiographerStep,
  [Common.stepsFeature().OTHER]: handleOtherStep,
  [Common.stepsFeature().RETURN_ADDRESS]: handleReturnAddressStep,
  [Common.stepsFeature().DECLARATION]: handleDeclarationStep,
});

const buildNonFeatureStepHandlers = () => ({
  [Common.stepsNonFeature().GENERAL]: handleGeneralStep,
  [Common.stepsNonFeature().CENSOR]: handleCensorStep,
  [Common.stepsNonFeature().COMPANY_REGISTRATION]: handleCompanyRegistrationStep,
  [Common.stepsNonFeature().PRODUCER]: handleProducerStep,
  [Common.stepsNonFeature().DIRECTOR]: handleDirectorStep,
  [Common.stepsNonFeature().OTHER]: handleOtherStep,
  [Common.stepsNonFeature().RETURN_ADDRESS]: handleReturnAddressStep,
  [Common.stepsNonFeature().DECLARATION]: handleDeclarationStep,
});

const getStepHandlers = (filmType) => {
  if (filmType === "feature") return buildFeatureStepHandlers();
  if (filmType === "non-feature") return buildNonFeatureStepHandlers();
  return {};
};

// Create Feature Submission
const createFeatureSubmission = async (req, res) => {
  const { isValid, errors } = NfaFilmHelper.validateStepInput(req.body, req.files);
  if (!isValid) {
    return sendValidationError(res, errors);
  }

  try {
    const user = req.user.toObject();
    const client_id = user._id || user.id;
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
      active_step: 1,
      film_type: "feature",
      client_id,
    });
    await filmData.save();
    const finalData = filmData.toObject(); // Convert Mongoose document to plain JS object
    finalData.id = finalData._id;
    delete finalData._id;

    res
      .status(200)
      .json({ message: "Submit successful", statusCode: 200, data: finalData });
  } catch (error) {
    res.status(500).json({ message: error.message, statusCode: 500 });
  }
};

// Create Non-Feature Submission
const createNonFeatureSubmission = async (req, res) => {
  const { isValid, errors } = NfaFilmHelper.validateStepInput(req.body, req.files);
  if (!isValid) {
    return sendValidationError(res, errors);
  }

  try {
    const user = req.user.toObject();
    const client_id = user._id || user.id;
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
      active_step: 1,
      film_type: "non-feature",
      client_id,
    });
    await filmData.save();
    const finalData = filmData.toObject(); // Convert Mongoose document to plain JS object
    finalData.id = finalData._id;
    delete finalData._id;
    res
      .status(200)
      .json({ message: "Submit successful", statusCode: 200, data: finalData });
  } catch (error) {
    res.status(500).json({ message: error.message, statusCode: 500 });
  }
};

// Get all Feature & non-feature List
const getFilmEntryList = async (req, res) => {
  try {
    const filmEntryData = await FeatureForm.find({
      client_id: getUserId(req),
    }).populate(
      "producers directors songs actors audiographer documents"
    );

    const formattedData = filmEntryData.map((item) => {
      const obj = item.toObject();
      obj.id = obj._id;
      delete obj._id;
      return obj;
    });

    // Separate feature and non-feature films
    const featureFilmData = formattedData.filter(
      (item) => item.film_type !== "non-feature"
    );
    const nonFeatureFilmData = formattedData.filter(
      (item) => item.film_type === "non-feature"
    );

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
    res.status(500).json({ message: error.message, statusCode: 500 });
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
    const featureForm = await FeatureForm.findOne({
      _id: id,
      client_id: getUserId(req),
    }).populate([
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

    const relatedDocuments = await Document.find({
      context_id: featureForm._id,
    });
    const featureData = featureForm.toObject();
    featureData.documents = relatedDocuments || [];
    const documentUrlByType = new Map(
      relatedDocuments.map((documentRecord) => [
        documentRecord.document_type,
        `/api/documents/${documentRecord._id}/download`,
      ])
    );
    if (featureData.censor_certificate_file)
      featureData.censor_certificate_file = documentUrlByType.get(documentTypeMap.CENSOR_CERTIFICATE_FILE);
    if (featureData.company_reg_doc)
      featureData.company_reg_doc = documentUrlByType.get(documentTypeMap.COMPANY_REG_DOC);
    if (featureData.original_work_copy)
      featureData.original_work_copy = documentUrlByType.get(documentTypeMap.ORIGINAL_WORK_COPY);
    res.status(200).json({
      message: "Fetch successfully",
      statusCode: 200,
      data: featureData,
    });
  } catch (error) {
    res.status(500).json({ message: error.message, statusCode: 500 });
  }
};

const updateFeatureNonfeatureById = async (req, res) => {
  try {
    const requiredFields = ["id", "film_type"];
    const missingFields = requiredFields.filter((field) => !req.body[field]);

    if (missingFields.length > 0) {
      return res.status(200).json({
        statusCode: 203,
        message: `${missingFields.join(" and ")} ${
          missingFields.length > 1 ? "are" : "is"
        } required`,
      });
    }
    const payload = {
      ...req.body,
      files: req.files,
    };
    const step = String(req.body.step ?? "");

    if (shouldValidateFilmStep(step, req.body.film_type)) {
      const { isValid, errors } = NfaFilmHelper.validateStepInput(req.body, req.files);
      if (!isValid) {
        return sendValidationError(res, errors);
      }
    }

    const { id: _id, film_type } = req.body;
    // Find the document by ID
    const existingEntry = await FeatureForm.findOne({
      _id,
      client_id: getUserId(req),
    });
    if (!existingEntry) {
      return res
        .status(200)
        .json({ statusCode: 203, message: "Feature submission not found" });
    }
    const stepHandler = getStepHandlers(film_type);

    if (stepHandler[+req.body.step]) {
      const result = await stepHandler[+req.body.step](existingEntry, payload);
      if (result?.status === false) {
        return res.status(422).json({
          statusCode: 422,
          message: result.message || "Step processing failed",
        });
      }
      // Update the document with request body
      Object.assign(result, payload);

      // Save updated document
      const updated = await result.save();

      res.status(200).json({
        statusCode: 200,
        message: "Feature submission updated successfully",
        data: updated,
      });
      return;
    }

    return res.status(200).json({
      statusCode: 203,
      message: "Invalid step provided",
    });
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      message: "Error updating feature submission",
      error: error.message,
    });
  }
};

// Get all Non-Feature Submissions
const getNonFeatureSubmissions = async (req, res) => {
  try {
    const submissions = await FeatureForm.find({
      film_type: "non-feature",
      client_id: getUserId(req),
    }).populate(
      "producers directors songs actors audiographer documents"
    );
    res.status(200).json({
      message: "Fetch successfully",
      statusCode: 200,
      data: submissions,
    });
  } catch (error) {
    res.status(500).json({ message: error.message, statusCode: 500 });
  }
};

const handleGeneralStep = async (data, payload) => {
  if (payload?.film_type === "feature") {
    if (!data.active_step || data.active_step < Common.stepsFeature().GENERAL) {
      data.active_step = Common.stepsFeature().GENERAL;
    }
  } else if (payload?.film_type === "non-feature") {
    if (
      !data.active_step ||
      data.active_step < Common.stepsNonFeature().GENERAL
    ) {
      data.active_step = Common.stepsNonFeature().GENERAL;
    }
  }

  return data;
};

const handleCensorStep = async (data, payload) => {
  const lastId = payload.id;

  if (payload.film_type === "feature") {
    if (!data.active_step || data.active_step < Common.stepsFeature().CENSOR) {
      data.active_step = Common.stepsFeature().CENSOR;
    }
  } else if (payload.film_type === "non-feature") {
    if (
      !data.active_step ||
      data.active_step < Common.stepsNonFeature().CENSOR
    ) {
      data.active_step = Common.stepsNonFeature().CENSOR;
    }
  }

  if (payload.files && Array.isArray(payload.files)) {
    const censorFile = payload.files.find(
      (file) => file.fieldname === "censor_certificate_file"
    );
    if (censorFile) {
      const fileUpload = await Common.imageUpload({
        id: lastId,
        image_key: "censor_certificate_file",
        websiteType: "NFA",
        formType:
          payload.film_type === "non-feature" ? "NON_FEATURE" : "FEATURE",
        image: censorFile,
      });

      if (!fileUpload.status) {
        return { status: false, message: "Image not uploaded.!!" };
      }

      data.censor_certificate_file = fileUpload?.data?.file ?? null;
    } else {
      data.censor_certificate_file = null;
    }
  } else {
    data.censor_certificate_file = null;
  }
  return data;
};

const handleCompanyRegistrationStep = async (data, payload) => {
  const lastId = payload.id;

  if (payload.film_type === "feature") {
    if (
      !data.active_step ||
      data.active_step < Common.stepsFeature().COMPANY_REGISTRATION
    ) {
      data.active_step = Common.stepsFeature().COMPANY_REGISTRATION;
    }
  } else if (payload.film_type === "non-feature") {
    if (
      !data.active_step ||
      data.active_step < Common.stepsNonFeature().COMPANY_REGISTRATION
    ) {
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
        formType:
          payload.film_type === "non-feature" ? "NON_FEATURE" : "FEATURE",
        image: censorFile,
      });

      if (!fileUpload.status) {
        return { status: false, message: "Image not uploaded.!!" };
      }
      data.company_reg_doc = fileUpload?.data?.file ?? null;
    } else {
      data.company_reg_doc = null;
    }
  } else {
    data.company_reg_doc = null;
  }

  return data;
};

const handleProducerStep = async (data, payload) => {
  if (payload.film_type === "feature") {
    if (
      !data.active_step ||
      data.active_step < Common.stepsFeature().PRODUCER
    ) {
      data.active_step = Common.stepsFeature().PRODUCER;
    }
  } else if (payload.film_type === "non-feature") {
    if (
      !data.active_step ||
      data.active_step < Common.stepsNonFeature().PRODUCER
    ) {
      data.active_step = Common.stepsNonFeature().PRODUCER;
    }
  }

  return data;
};

const handleDirectorStep = async (data, payload) => {
  if (payload.film_type === "feature") {
    if (
      !data.active_step ||
      data.active_step < Common.stepsFeature().DIRECTOR
    ) {
      data.active_step = Common.stepsFeature().DIRECTOR;
    }
  } else if (payload.film_type === "non-feature") {
    if (
      !data.active_step ||
      data.active_step < Common.stepsNonFeature().DIRECTOR
    ) {
      data.active_step = Common.stepsNonFeature().DIRECTOR;
    }
  }
  return data;
};

const handleActorsStep = async (data, _payload) => {
  if (!data.active_step || data.active_step < Common.stepsFeature().ACTORS) {
    data.active_step = Common.stepsFeature().ACTORS;
  }
  return data;
};

const handleSongsStep = async (data, _payload) => {
  if (!data.active_step || data.active_step < Common.stepsFeature().SONGS) {
    data.active_step = Common.stepsFeature().SONGS;
  }
  return data;
};

const handleAudiographerStep = async (data, _payload) => {
  if (
    !data.active_step ||
    data.active_step < Common.stepsFeature().AUDIOGRAPHER
  ) {
    data.active_step = Common.stepsFeature().AUDIOGRAPHER;
  }
  return data;
};

const handleOtherStep = async (data, payload) => {
  const lastId = payload.id;

  if (payload.film_type === "feature") {
    if (!data.active_step || data.active_step < Common.stepsFeature().OTHER) {
      data.active_step = Common.stepsFeature().OTHER;
    }
  } else if (payload.film_type === "non-feature") {
    if (
      !data.active_step ||
      data.active_step < Common.stepsNonFeature().OTHER
    ) {
      data.active_step = Common.stepsNonFeature().OTHER;
    }
  }

  if (payload.files && Array.isArray(payload.files)) {
    const originalFile = payload.files.find(
      (file) => file.fieldname === "original_work_copy"
    );
    if (originalFile) {
      const fileUpload = await Common.imageUpload({
        id: lastId,
        image_key: "original_work_copy",
        websiteType: "NFA",
        formType:
          payload.film_type === "non-feature" ? "NON_FEATURE" : "FEATURE",
        image: originalFile,
      });

      if (!fileUpload.status) {
        return { status: false, message: "Image not uploaded.!!" };
      }

      data.original_work_copy = fileUpload?.data?.file ?? null;
    } else {
      data.original_work_copy = null;
    }
  } else {
    data.original_work_copy = null;
  }

  return data;
};

const handleReturnAddressStep = async (data, payload) => {
  if (payload.film_type === "feature") {
    if (
      !data.active_step ||
      data.active_step < Common.stepsFeature().RETURN_ADDRESS
    ) {
      data.active_step = Common.stepsFeature().RETURN_ADDRESS;
    }
  } else if (payload.film_type === "non-feature") {
    if (
      !data.active_step ||
      data.active_step < Common.stepsNonFeature().RETURN_ADDRESS
    ) {
      data.active_step = Common.stepsNonFeature().RETURN_ADDRESS;
    }
  }
  return data;
};

const handleDeclarationStep = async (data, payload) => {
  if (payload.film_type === "feature") {
    if (
      !data.active_step ||
      data.active_step < Common.stepsFeature().DECLARATION
    ) {
      data.active_step = Common.stepsFeature().DECLARATION;
    }
  } else if (payload.film_type === "non-feature") {
    if (
      !data.active_step ||
      data.active_step < Common.stepsNonFeature().DECLARATION
    ) {
      data.active_step = Common.stepsNonFeature().DECLARATION;
    }
  }

  return data;
};

const finalSubmit = async (req, res) => {
  const { isValid, errors } = NfaFilmHelper.finalSubmitStep(req.body);
  if (!isValid) {
    return sendValidationError(res, errors);
  }

  try {
    const payload = {
      ...req.body,
      user: req.user,
    };

    const nfaFeature = await FeatureForm.findOne({
      _id: payload.id,
      client_id: payload.user.id || payload.user._id,
    });

    if (!nfaFeature) {
      return res.status(200).json({
        message: "You do not have any entries.!!",
        statusCode: 203,
      });
    }

    if (nfaFeature.payment_status != 2) {
      return res.status(200).json({
        message: "Your payment is not completed.!!",
        statusCode: 203,
      });
    }

    return res.status(200).json({
      message: "You have successfully submitted your form.!!",
      statusCode: 200,
    });
  } catch (error) {
    return res.status(500).json({
      status: "exception",
      message: error.message || "Internal Server Error",
    });
  }
};

export default {
  createFeatureSubmission,
  createNonFeatureSubmission,
  getFilmEntryList,
  updateFeatureNonfeatureById,
  getFilmDetailsById,
  getNonFeatureSubmissions,
  finalSubmit,
};
