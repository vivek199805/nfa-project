import { Document } from "../models/mongodbModels/document.js";
import { FeatureForm } from "../models/mongodbModels/featureForm.js";
import Common, { documentTypeMap } from "./common.js";

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

const toPublicObject = (item) => {
  const obj = item.toObject();
  obj.id = obj._id;
  delete obj._id;
  return obj;
};

export const shouldValidateFilmStep = (step, filmType) => {
  const stepNumber = Number(step);
  if (filmType === "feature") return featureValidationSteps.has(stepNumber);
  if (filmType === "non-feature") return nonFeatureValidationSteps.has(stepNumber);
  return false;
};

export const createFilmSubmissionService = async ({ payload, userId, filmType }) => {
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
  } = payload;

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
    film_type: filmType,
    client_id: userId,
  });

  await filmData.save();

  return {
    message: "Submit successful",
    statusCode: 200,
    data: toPublicObject(filmData),
  };
};

export const getFilmEntryListService = async (userId) => {
  const filmEntryData = await FeatureForm.find({ client_id: userId }).populate(
    "producers directors songs actors audiographer documents"
  );

  const formattedData = filmEntryData.map(toPublicObject);
  const featureFilmData = formattedData.filter((item) => item.film_type !== "non-feature");
  const nonFeatureFilmData = formattedData.filter((item) => item.film_type === "non-feature");

  return {
    message: "Fetch successfully",
    statusCode: 200,
    data: {
      feature: featureFilmData,
      "non-feature": nonFeatureFilmData,
    },
  };
};

export const getFilmDetailsByIdService = async ({ id, userId }) => {
  if (!id) {
    return {
      statusCode: 203,
      message: "Film ID is required",
    };
  }

  const featureForm = await FeatureForm.findOne({ _id: id, client_id: userId }).populate([
    "producers",
    "directors",
    "songs",
    "actors",
    "audiographer",
  ]);

  if (!featureForm) {
    return {
      statusCode: 203,
      message: "Film submission not found",
    };
  }

  const relatedDocuments = await Document.find({ context_id: featureForm._id });
  const featureData = featureForm.toObject();
  featureData.documents = relatedDocuments || [];

  const documentUrlByType = new Map(
    relatedDocuments.map((documentRecord) => [
      documentRecord.document_type,
      `/api/documents/${documentRecord._id}/download`,
    ])
  );

  if (featureData.censor_certificate_file) {
    featureData.censor_certificate_file = documentUrlByType.get(documentTypeMap.CENSOR_CERTIFICATE_FILE);
  }
  if (featureData.company_reg_doc) {
    featureData.company_reg_doc = documentUrlByType.get(documentTypeMap.COMPANY_REG_DOC);
  }
  if (featureData.original_work_copy) {
    featureData.original_work_copy = documentUrlByType.get(documentTypeMap.ORIGINAL_WORK_COPY);
  }

  return {
    message: "Fetch successfully",
    statusCode: 200,
    data: featureData,
  };
};

const bumpActiveStep = (data, payload, featureStep, nonFeatureStep) => {
  const targetStep = payload.film_type === "feature" ? featureStep : nonFeatureStep;
  if (!data.active_step || data.active_step < targetStep) {
    data.active_step = targetStep;
  }
};

const uploadStepFile = async ({ data, payload, fieldName }) => {
  if (!Array.isArray(payload.files)) {
    data[fieldName] = null;
    return data;
  }

  const uploadFile = payload.files.find((file) => file.fieldname === fieldName);
  if (!uploadFile) {
    data[fieldName] = null;
    return data;
  }

  const fileUpload = await Common.imageUpload({
    id: payload.id,
    image_key: fieldName,
    websiteType: "NFA",
    formType: payload.film_type === "non-feature" ? "NON_FEATURE" : "FEATURE",
    image: uploadFile,
  });

  if (!fileUpload.status) {
    return { status: false, message: "Image not uploaded.!!" };
  }

  data[fieldName] = fileUpload?.data?.file ?? null;
  return data;
};

const handleGeneralStep = async (data, payload) => {
  bumpActiveStep(data, payload, Common.stepsFeature().GENERAL, Common.stepsNonFeature().GENERAL);
  return data;
};

const handleCensorStep = async (data, payload) => {
  bumpActiveStep(data, payload, Common.stepsFeature().CENSOR, Common.stepsNonFeature().CENSOR);
  return uploadStepFile({ data, payload, fieldName: "censor_certificate_file" });
};

const handleCompanyRegistrationStep = async (data, payload) => {
  bumpActiveStep(
    data,
    payload,
    Common.stepsFeature().COMPANY_REGISTRATION,
    Common.stepsNonFeature().COMPANY_REGISTRATION
  );
  return uploadStepFile({ data, payload, fieldName: "company_reg_doc" });
};

const handleProducerStep = async (data, payload) => {
  bumpActiveStep(data, payload, Common.stepsFeature().PRODUCER, Common.stepsNonFeature().PRODUCER);
  return data;
};

const handleDirectorStep = async (data, payload) => {
  bumpActiveStep(data, payload, Common.stepsFeature().DIRECTOR, Common.stepsNonFeature().DIRECTOR);
  return data;
};

const handleActorsStep = async (data) => {
  if (!data.active_step || data.active_step < Common.stepsFeature().ACTORS) {
    data.active_step = Common.stepsFeature().ACTORS;
  }
  return data;
};

const handleSongsStep = async (data) => {
  if (!data.active_step || data.active_step < Common.stepsFeature().SONGS) {
    data.active_step = Common.stepsFeature().SONGS;
  }
  return data;
};

const handleAudiographerStep = async (data) => {
  if (!data.active_step || data.active_step < Common.stepsFeature().AUDIOGRAPHER) {
    data.active_step = Common.stepsFeature().AUDIOGRAPHER;
  }
  return data;
};

const handleOtherStep = async (data, payload) => {
  bumpActiveStep(data, payload, Common.stepsFeature().OTHER, Common.stepsNonFeature().OTHER);
  return uploadStepFile({ data, payload, fieldName: "original_work_copy" });
};

const handleReturnAddressStep = async (data, payload) => {
  bumpActiveStep(
    data,
    payload,
    Common.stepsFeature().RETURN_ADDRESS,
    Common.stepsNonFeature().RETURN_ADDRESS
  );
  return data;
};

const handleDeclarationStep = async (data, payload) => {
  bumpActiveStep(data, payload, Common.stepsFeature().DECLARATION, Common.stepsNonFeature().DECLARATION);
  return data;
};

const stepHandlers = {
  feature: {
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
  },
  "non-feature": {
    [Common.stepsNonFeature().GENERAL]: handleGeneralStep,
    [Common.stepsNonFeature().CENSOR]: handleCensorStep,
    [Common.stepsNonFeature().COMPANY_REGISTRATION]: handleCompanyRegistrationStep,
    [Common.stepsNonFeature().PRODUCER]: handleProducerStep,
    [Common.stepsNonFeature().DIRECTOR]: handleDirectorStep,
    [Common.stepsNonFeature().OTHER]: handleOtherStep,
    [Common.stepsNonFeature().RETURN_ADDRESS]: handleReturnAddressStep,
    [Common.stepsNonFeature().DECLARATION]: handleDeclarationStep,
  },
};

export const updateFilmSubmissionService = async ({ payload, files, userId }) => {
  const existingEntry = await FeatureForm.findOne({ _id: payload.id, client_id: userId });
  if (!existingEntry) {
    return {
      statusCode: 203,
      message: "Feature submission not found",
    };
  }

  const handler = stepHandlers[payload.film_type]?.[+payload.step];
  if (!handler) {
    return {
      statusCode: 203,
      message: "Invalid step provided",
    };
  }

  const data = await handler(existingEntry, { ...payload, files });
  if (data?.status === false) {
    return {
      statusCode: 422,
      httpStatus: 422,
      message: data.message || "Step processing failed",
    };
  }

  Object.assign(data, { ...payload, files });
  const updated = await data.save();

  return {
    statusCode: 200,
    message: "Feature submission updated successfully",
    data: updated,
  };
};

export const getNonFeatureSubmissionsService = async (userId) => {
  const submissions = await FeatureForm.find({
    film_type: "non-feature",
    client_id: userId,
  }).populate("producers directors songs actors audiographer documents");

  return {
    message: "Fetch successfully",
    statusCode: 200,
    data: submissions,
  };
};

export const finalSubmitFilmService = async ({ id, userId }) => {
  const nfaFeature = await FeatureForm.findOne({ _id: id, client_id: userId });

  if (!nfaFeature) {
    return {
      message: "You do not have any entries.!!",
      statusCode: 203,
    };
  }

  if (nfaFeature.payment_status != 2) {
    return {
      message: "Your payment is not completed.!!",
      statusCode: 203,
    };
  }

  return {
    message: "You have successfully submitted your form.!!",
    statusCode: 200,
  };
};
