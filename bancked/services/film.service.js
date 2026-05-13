import { findDocuments } from "../repositories/document.repository.js";
import {
  createFeatureForm,
  featureInclude,
  findFeatureFormByIdForUser,
  findFeatureFormsByUser,
  findNonFeatureFormsByUser,
  mapFeatureForResponse,
  updateFeatureFormByIdForUser,
} from "../repositories/featureForm.repository.js";
import { toPublicId } from "../repositories/prisma.mapper.js";
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

export const shouldValidateFilmStep = (step, filmType) => {
  const stepNumber = Number(step);
  if (filmType === "feature") return featureValidationSteps.has(stepNumber);
  if (filmType === "non-feature") return nonFeatureValidationSteps.has(stepNumber);
  return false;
};

const normalizeLanguageIds = (languageIds) => {
  if (typeof languageIds === "string") {
    return languageIds.split(",").map((item) => item.trim()).filter(Boolean);
  }
  if (Array.isArray(languageIds)) return languageIds;
  return [];
};

export const createFilmSubmissionService = async ({ payload, userId, filmType }) => {
  const filmData = await createFeatureForm({
    film_title_roman: payload.film_title_roman,
    film_title_devnagri: payload.film_title_devnagri,
    film_title_english: payload.film_title_english,
    language_id: normalizeLanguageIds(payload.language_id),
    english_subtitle: payload.english_subtitle,
    color_bw: payload.color_bw,
    aspect_ratio: payload.aspect_ratio,
    running_time: payload.running_time,
    format: payload.format,
    director_debut: payload.director_debut,
    sound_system: payload.sound_system,
    film_synopsis: payload.film_synopsis,
    step: Number(payload.step || 1),
    active_step: 1,
    film_type: filmType,
    client_id: String(userId),
  });

  return {
    message: "Submit successful",
    statusCode: 200,
    data: toPublicId(filmData),
  };
};

export const getFilmEntryListService = async (userId) => {
  const filmEntryData = await findFeatureFormsByUser(userId, featureInclude);
  const formattedData = filmEntryData.map((item) => toPublicId(mapFeatureForResponse(item)));
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

  const featureForm = await findFeatureFormByIdForUser(id, userId, featureInclude);

  if (!featureForm) {
    return {
      statusCode: 203,
      message: "Film submission not found",
    };
  }

  const relatedDocuments = await findDocuments({ context_id: featureForm.id });
  const featureData = mapFeatureForResponse(featureForm);
  featureData.documents = relatedDocuments || [];

  const documentUrlByType = new Map(
    relatedDocuments.map((documentRecord) => [
      documentRecord.document_type,
      `/api/documents/${documentRecord.id}/download`,
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

  if (!fileUpload.status) return { status: false, message: "Image not uploaded.!!" };

  data[fieldName] = fileUpload?.data?.file ?? null;
  return data;
};

const buildStepData = async (existing, payload) => {
  const data = { ...existing };

  if (payload.film_type === "non-feature") {
    switch (+payload.step) {
      case Common.stepsNonFeature().GENERAL:
        bumpActiveStep(data, payload, Common.stepsFeature().GENERAL, Common.stepsNonFeature().GENERAL);
        return data;
      case Common.stepsNonFeature().CENSOR:
        bumpActiveStep(data, payload, Common.stepsFeature().CENSOR, Common.stepsNonFeature().CENSOR);
        return uploadStepFile({ data, payload, fieldName: "censor_certificate_file" });
      case Common.stepsNonFeature().COMPANY_REGISTRATION:
        bumpActiveStep(
          data,
          payload,
          Common.stepsFeature().COMPANY_REGISTRATION,
          Common.stepsNonFeature().COMPANY_REGISTRATION
        );
        return uploadStepFile({ data, payload, fieldName: "company_reg_doc" });
      case Common.stepsNonFeature().PRODUCER:
        bumpActiveStep(data, payload, Common.stepsFeature().PRODUCER, Common.stepsNonFeature().PRODUCER);
        return data;
      case Common.stepsNonFeature().DIRECTOR:
        bumpActiveStep(data, payload, Common.stepsFeature().DIRECTOR, Common.stepsNonFeature().DIRECTOR);
        return data;
      case Common.stepsNonFeature().OTHER:
        bumpActiveStep(data, payload, Common.stepsFeature().OTHER, Common.stepsNonFeature().OTHER);
        return uploadStepFile({ data, payload, fieldName: "original_work_copy" });
      case Common.stepsNonFeature().RETURN_ADDRESS:
        bumpActiveStep(data, payload, Common.stepsFeature().RETURN_ADDRESS, Common.stepsNonFeature().RETURN_ADDRESS);
        return data;
      case Common.stepsNonFeature().DECLARATION:
        bumpActiveStep(data, payload, Common.stepsFeature().DECLARATION, Common.stepsNonFeature().DECLARATION);
        return data;
      default:
        return null;
    }
  }

  switch (+payload.step) {
    case Common.stepsFeature().GENERAL:
      bumpActiveStep(data, payload, Common.stepsFeature().GENERAL, Common.stepsNonFeature().GENERAL);
      break;
    case Common.stepsFeature().CENSOR:
      bumpActiveStep(data, payload, Common.stepsFeature().CENSOR, Common.stepsNonFeature().CENSOR);
      return uploadStepFile({ data, payload, fieldName: "censor_certificate_file" });
    case Common.stepsFeature().COMPANY_REGISTRATION:
      bumpActiveStep(
        data,
        payload,
        Common.stepsFeature().COMPANY_REGISTRATION,
        Common.stepsNonFeature().COMPANY_REGISTRATION
      );
      return uploadStepFile({ data, payload, fieldName: "company_reg_doc" });
    case Common.stepsFeature().PRODUCER:
      bumpActiveStep(data, payload, Common.stepsFeature().PRODUCER, Common.stepsNonFeature().PRODUCER);
      break;
    case Common.stepsFeature().DIRECTOR:
      bumpActiveStep(data, payload, Common.stepsFeature().DIRECTOR, Common.stepsNonFeature().DIRECTOR);
      break;
    case Common.stepsFeature().ACTORS:
      if (payload.film_type !== "feature") return null;
      if (!data.active_step || data.active_step < Common.stepsFeature().ACTORS) data.active_step = Common.stepsFeature().ACTORS;
      break;
    case Common.stepsFeature().SONGS:
      if (payload.film_type !== "feature") return null;
      if (!data.active_step || data.active_step < Common.stepsFeature().SONGS) data.active_step = Common.stepsFeature().SONGS;
      break;
    case Common.stepsFeature().AUDIOGRAPHER:
      if (payload.film_type !== "feature") return null;
      if (!data.active_step || data.active_step < Common.stepsFeature().AUDIOGRAPHER) data.active_step = Common.stepsFeature().AUDIOGRAPHER;
      break;
    case Common.stepsFeature().OTHER:
      bumpActiveStep(data, payload, Common.stepsFeature().OTHER, Common.stepsNonFeature().OTHER);
      return uploadStepFile({ data, payload, fieldName: "original_work_copy" });
    case Common.stepsFeature().RETURN_ADDRESS:
      bumpActiveStep(data, payload, Common.stepsFeature().RETURN_ADDRESS, Common.stepsNonFeature().RETURN_ADDRESS);
      break;
    case Common.stepsFeature().DECLARATION:
      bumpActiveStep(data, payload, Common.stepsFeature().DECLARATION, Common.stepsNonFeature().DECLARATION);
      break;
    default:
      return null;
  }

  return data;
};

export const updateFilmSubmissionService = async ({ payload, files, userId }) => {
  const existingEntry = await findFeatureFormByIdForUser(payload.id, userId);
  if (!existingEntry) {
    return {
      statusCode: 203,
      message: "Feature submission not found",
    };
  }

  const data = await buildStepData(existingEntry, { ...payload, files });
  if (!data) {
    return {
      statusCode: 203,
      message: "Invalid step provided",
    };
  }

  if (data?.status === false) {
    return {
      statusCode: 422,
      httpStatus: 422,
      message: data.message || "Step processing failed",
    };
  }

  const { id, files: _files, producers, directors, actors, songs, audiographer, _id, createdAt, updatedAt, ...updateData } = {
    ...data,
    ...payload,
  };

  const updated = await updateFeatureFormByIdForUser(payload.id, userId, updateData);

  return {
    statusCode: 200,
    message: "Feature submission updated successfully",
    data: updated,
  };
};

export const getNonFeatureSubmissionsService = async (userId) => {
  const submissions = await findNonFeatureFormsByUser(userId, featureInclude);
  return {
    message: "Fetch successfully",
    statusCode: 200,
    data: submissions.map(mapFeatureForResponse),
  };
};

export const finalSubmitFilmService = async ({ id, userId }) => {
  const nfaFeature = await findFeatureFormByIdForUser(id, userId);

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
