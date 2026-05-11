import BestFilmCritic from "../models/mongodbModels/BestFilmCritic.js";
import { Document } from "../models/mongodbModels/document.js";
import Editor from "../models/mongodbModels/editor.js";
import Common from "./common.js";

const syncDocumentRef = (data, documentId) => {
  if (!documentId) return;
  if (!Array.isArray(data.documents)) data.documents = [];

  const exists = data.documents.some((id) => String(id) === String(documentId));
  if (!exists) data.documents.push(documentId);
};

export const shouldValidateBestFilmCriticStep = (step) =>
  step === String(Common.stepsBestFilmCritic().CRITIC_DETAILS) ||
  step === String(Common.stepsBestFilmCritic().CRITIC) ||
  step === String(Common.stepsBestFilmCritic().DECLARATION);

export const createBestFilmCriticService = async ({ payload, userId }) => {
  const {
    writer_name,
    article_title,
    article_language_id,
    publication_date,
    publication_name,
    rni,
    step,
  } = payload;

  const filmData = new BestFilmCritic({
    writer_name,
    article_title,
    article_language_id,
    publication_date,
    publication_name,
    rni,
    step,
    active_step: 1,
    client_id: userId,
  });

  await filmData.save();
  const finalData = filmData.toObject();
  finalData.id = finalData._id;
  delete finalData._id;

  return {
    message: "Submit successful",
    statusCode: 200,
    data: finalData,
  };
};

const handleCriticUploadStep = async (data, payload, stepNumber) => {
  if (!payload.id) return data;

  if (!data.active_step || data.active_step < stepNumber) {
    data.active_step = stepNumber;
  }

  if (!Array.isArray(payload.files)) {
    data.critic_aadhaar_card = null;
    return data;
  }

  const criticAadhaar = payload.files.find((file) => file.fieldname === "critic_aadhaar_card");
  if (!criticAadhaar) {
    data.critic_aadhaar_card = null;
    return data;
  }

  const fileUpload = await Common.imageUpload({
    id: payload.id,
    image_key: "critic_aadhaar_card",
    websiteType: "NFA",
    formType: "BEST_FILM_CRITIC",
    image: criticAadhaar,
  });

  if (!fileUpload.status) {
    return { status: false, message: fileUpload.message || "Image not uploaded.!!" };
  }

  data.critic_aadhaar_card = fileUpload?.data?.file ?? null;
  syncDocumentRef(data, fileUpload?.data?._id);
  return data;
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
  const existingEntry = await BestFilmCritic.findOne({ _id: payload.id, client_id: userId });

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

export const finalSubmitBestFilmCriticService = async ({ id, userId }) => {
  const bestFilmCritic = await BestFilmCritic.findOne({ _id: id, client_id: userId });

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
  const bestFilmCritic = await BestFilmCritic.findOne({
    _id: id,
    client_id: userId,
  }).populate({
    path: "documents",
    match: {
      form_type: 4,
      website_type: 5,
      document_type: 6,
    },
    model: Document,
  });

  if (!bestFilmCritic) {
    return {
      status: "exception",
      message: "Something went wrong!!",
      statusCode: 404,
      httpStatus: 404,
    };
  }

  const editors = await Editor.find({ best_film_critic_id: bestFilmCritic._id });

  return {
    status: "success",
    message: "Success.!!",
    statusCode: 200,
    data: {
      ...bestFilmCritic.toObject(),
      editors,
    },
  };
};
