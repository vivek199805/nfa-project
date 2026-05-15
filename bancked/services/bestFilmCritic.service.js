import { createBestFilmCritic, findBestFilmCriticByIdForUser, updateBestFilmCriticByIdForUser } from "../repositories/bestFilmCritic.repository.js";
import { findDocument } from "../repositories/document.repository.js";
import { findEditors } from "../repositories/editor.repository.js";
import { toPublicId } from "../repositories/prisma.mapper.js";
import Common from "./common.js";

const syncDocumentRef = (data, documentId) => {
  if (!documentId) return;
  if (!Array.isArray(data.documents)) data.documents = [];

  const exists = data.documents.some((id) => String(id) === String(documentId));
  if (!exists) data.documents.push(documentId);
};

const normalizeLanguageIds = (languageIds) => {
  if (typeof languageIds === "string") {
    return languageIds.split(",").map((item) => item.trim()).filter(Boolean);
  }
  if (Array.isArray(languageIds)) return languageIds;
  return [];
};

const toOptionalNumber = (value) => {
  if (value === undefined) return undefined;
  if (value === null || value === "") return null;
  const numberValue = Number(value);
  return Number.isNaN(numberValue) ? undefined : numberValue;
};

const toOptionalDate = (value) => {
  if (value === undefined) return undefined;
  if (value === null || value === "") return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
};

const toBoolean = (value) => value === true || value === "true" || value === "1" || value === 1;

const objectIdPattern = /^[a-f\d]{24}$/i;

const normalizeDocumentIds = (documents) => {
  if (!Array.isArray(documents)) return [];

  return documents
    .map((document) => {
      if (typeof document === "string") return document;
      if (document && typeof document === "object") return document.id || document._id;
      return null;
    })
    .filter((documentId) => objectIdPattern.test(String(documentId)));
};

const normalizeBestFilmCriticUpdateData = (updateData) => {
  const normalized = {
    ...updateData,
    step: toOptionalNumber(updateData.step),
    active_step: toOptionalNumber(updateData.active_step),
    status: toOptionalNumber(updateData.status),
    rni: toOptionalNumber(updateData.rni),
    critic_indian_nationality: toOptionalNumber(updateData.critic_indian_nationality),
    publication_date: toOptionalDate(updateData.publication_date),
    payment_date: toOptionalDate(updateData.payment_date),
    article_language_id: normalizeLanguageIds(updateData.article_language_id),
    documents: normalizeDocumentIds(updateData.documents),
  };

  ["declaration_one", "declaration_two", "declaration_three", "declaration_four"].forEach((field) => {
    if (field in updateData) normalized[field] = toBoolean(updateData[field]);
  });

  return normalized;
};

export const shouldValidateBestFilmCriticStep = (step) =>
  step === String(Common.stepsBestFilmCritic().CRITIC_DETAILS) ||
  step === String(Common.stepsBestFilmCritic().CRITIC) ||
  step === String(Common.stepsBestFilmCritic().DECLARATION);

export const createBestFilmCriticService = async ({ payload, userId }) => {
  const filmData = await createBestFilmCritic({
    writer_name: payload.writer_name,
    article_title: payload.article_title,
    article_language_id: normalizeLanguageIds(payload.article_language_id),
    publication_date: payload.publication_date ? new Date(payload.publication_date) : null,
    publication_name: payload.publication_name,
    rni: payload.rni === undefined ? undefined : Number(payload.rni),
    step: Number(payload.step || 1),
    active_step: 1,
    client_id: String(userId),
  });

  return {
    message: "Submit successful",
    statusCode: 200,
    data: toPublicId(filmData),
  };
};

const handleCriticUploadStep = async (data, payload, stepNumber) => {
  if (!payload.id) return data;

  if (!data.active_step || data.active_step < stepNumber) {
    data.active_step = stepNumber;
  }

  if (!Array.isArray(payload.files)) return data;

  const criticAadhaar = payload.files.find((file) => file.fieldname === "critic_aadhaar_card");
  if (!criticAadhaar) return data;

  const fileUpload = await Common.imageUpload({
    id: payload.id,
    userId: payload.userId,
    image_key: "critic_aadhaar_card",
    websiteType: "NFA",
    formType: "BEST_FILM_CRITIC",
    image: criticAadhaar,
  });

  if (!fileUpload.status) {
    return { status: false, message: fileUpload.message || "Image not uploaded.!!" };
  }

  data.critic_aadhaar_card = fileUpload?.data?.file ?? null;
  syncDocumentRef(data, fileUpload?.data?.id);
  return data;
};

const stripBestFilmCriticUploadFields = (payload) => {
  const sanitizedPayload = { ...payload };
  delete sanitizedPayload.critic_aadhaar_card;
  return sanitizedPayload;
};

const handleBestFilmCriticStep = (data, payload) =>
  handleCriticUploadStep(data, payload, Common.stepsBestFilmCritic().CRITIC_DETAILS);

const handleCriticStep = (data, payload) =>
  handleCriticUploadStep(data, payload, Common.stepsBestFilmCritic().CRITIC);

const handlePublisherStep = async (data, payload) => {
  if (payload.id && (!data.active_step || data.active_step < Common.stepsBestFilmCritic().PUBLISHER)) {
    data.active_step = Common.stepsBestFilmCritic().PUBLISHER;
  }

  return data;
};

const handleDeclarationStep = async (data) => {
  if (!data.active_step || data.active_step < Common.stepsBestFilmCritic().DECLARATION) {
    data.active_step = Common.stepsBestFilmCritic().DECLARATION;
  }

  return data;
};

const stepHandler = {
  [Common.stepsBestFilmCritic().CRITIC_DETAILS]: handleBestFilmCriticStep,
  [Common.stepsBestFilmCritic().CRITIC]: handleCriticStep,
  [Common.stepsBestFilmCritic().PUBLISHER]: handlePublisherStep,
  [Common.stepsBestFilmCritic().DECLARATION]: handleDeclarationStep,
};

export const updateBestFilmCriticService = async ({ payload, files, userId }) => {
  const existingEntry = await findBestFilmCriticByIdForUser(payload.id, userId);

  if (!existingEntry) {
    return {
      statusCode: 203,
      message: "Please provide valid details to update.!!",
    };
  }

  const handler = stepHandler[+payload.step];
  if (!handler) {
    return {
      statusCode: 203,
      message: "Invalid step provided",
    };
  }

  const data = await handler({ ...existingEntry }, { ...payload, files, userId });

  if (data?.status === false) {
    return {
      statusCode: 422,
      httpStatus: 422,
      message: data.message || "Step processing failed",
    };
  }

  const { id, _id, files: _files, createdAt, updatedAt, ...updateData } = {
    ...data,
    ...stripBestFilmCriticUploadFields(payload),
    documents: data.documents,
    active_step: data.active_step,
  };

  const updated = await updateBestFilmCriticByIdForUser(
    payload.id,
    userId,
    normalizeBestFilmCriticUpdateData(updateData)
  );

  return {
    statusCode: 200,
    message: "Feature submission updated successfully",
    data: updated,
  };
};

export const finalSubmitBestFilmCriticService = async ({ id, userId }) => {
  const bestFilmCritic = await findBestFilmCriticByIdForUser(id, userId);

  if (!bestFilmCritic) {
    return {
      message: "You do not have any entries.!!",
      statusCode: 203,
    };
  }

  if (bestFilmCritic.payment_status != 2) {
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

export const getBestFilmCriticByIdService = async ({ id, userId }) => {
  const bestFilmCritic = await findBestFilmCriticByIdForUser(id, userId);
  if (!bestFilmCritic) {
    return {
      status: "exception",
      message: "Something went wrong!!",
      statusCode: 404,
      httpStatus: 404,
    };
  }

  // const documents = await findDocuments({
  //   id: { in: bestFilmCritic.documents || [] },
  //   form_type: 4,
  //   website_type: 5,
  //   document_type: 6,
  // });

  //  console.log("Best Film documents:", documents);

  const editors = await findEditors({ best_film_critic_id: bestFilmCritic.id });
  const criticDocument = await findDocument({
    context_id: bestFilmCritic.id,
    form_type: 4,
    website_type: 5,
    document_type: 6,
  });

  return {
    status: "success",
    message: "Success.!!",
    statusCode: 200,
    data: {
      ...bestFilmCritic,
      _id: bestFilmCritic.id,
      critic_aadhaar_card: criticDocument
        ? `/api/documents/${criticDocument.id}/download`
        : bestFilmCritic.critic_aadhaar_card,
      editors,
    },
  };
};
