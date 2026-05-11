import BestBookCinema from "../models/mongodbModels/BestBookCinema.js";
import Book from "../models/mongodbModels/book.js";
import { Document } from "../models/mongodbModels/document.js";
import Editor from "../models/mongodbModels/editor.js";
import Common from "./common.js";

const syncDocumentRef = (data, documentId) => {
  if (!documentId) return;
  if (!Array.isArray(data.documents)) data.documents = [];

  const exists = data.documents.some((id) => String(id) === String(documentId));
  if (!exists) data.documents.push(documentId);
};

export const shouldValidateBestBookStep = (step) =>
  step === String(Common.stepsBestBook().AUTHOR) ||
  step === String(Common.stepsBestBook().DECLARATION);

export const createBestBookService = async ({ payload, userId }) => {
  const {
    author_name,
    author_contact,
    author_nationality_indian,
    author_address,
    author_profile,
    step,
  } = payload;

  const bestBookData = new BestBookCinema({
    author_name,
    author_contact,
    author_nationality_indian,
    author_address,
    author_profile,
    step,
    active_step: 1,
    client_id: userId,
  });

  await bestBookData.save();
  const finalData = bestBookData.toObject();
  finalData.id = finalData._id;
  delete finalData._id;

  return {
    message: "Submit successful",
    statusCode: 200,
    data: finalData,
  };
};

const handleAuthorStep = async (data, payload) => {
  if (!payload.id) return data;

  if (!data.active_step || data.active_step < Common.stepsBestBook().AUTHOR) {
    data.active_step = Common.stepsBestBook().AUTHOR;
  }

  if (Array.isArray(payload.files)) {
    const authorAadhaar = payload.files.find((file) => file.fieldname === "author_aadhaar_card");

    if (authorAadhaar) {
      const fileUpload = await Common.imageUpload({
        id: payload.id,
        image_key: "author_aadhaar_card",
        websiteType: "NFA",
        formType: "BEST_BOOK",
        image: authorAadhaar,
      });

      if (!fileUpload.status) return fileUpload;

      data.author_aadhaar_card = fileUpload?.data?.file ?? null;
      syncDocumentRef(data, fileUpload?.data?._id);
    }
  }

  return data;
};

const handleBookStep = async (data, payload) => {
  if (payload.id && (!data.active_step || data.active_step < Common.stepsBestBook().BEST_BOOK_ON_CINEMA)) {
    data.active_step = Common.stepsBestBook().BEST_BOOK_ON_CINEMA;
  }

  return data;
};

const handlePublisherStep = async (data, payload) => {
  if (payload.id && (!data.active_step || data.active_step < Common.stepsBestBook().PUBLISHER_EDITOR)) {
    data.active_step = Common.stepsBestBook().PUBLISHER_EDITOR;
  }

  return data;
};

const handleDeclarationStep = async (data) => {
  if (!data.active_step || data.active_step < Common.stepsBestBook().DECLARATION) {
    data.active_step = Common.stepsBestBook().DECLARATION;
  }

  return data;
};

const stepHandler = {
  [Common.stepsBestBook().AUTHOR]: handleAuthorStep,
  [Common.stepsBestBook().BEST_BOOK_ON_CINEMA]: handleBookStep,
  [Common.stepsBestBook().PUBLISHER_EDITOR]: handlePublisherStep,
  [Common.stepsBestBook().DECLARATION]: handleDeclarationStep,
};

export const updateBestBookService = async ({ payload, files, userId }) => {
  const existingEntry = await BestBookCinema.findOne({ _id: payload.id, client_id: userId });

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

export const getBestBookByIdService = async ({ id, userId }) => {
  const bestBookCinema = await BestBookCinema.findOne({
    _id: id,
    client_id: userId,
  }).populate({
    path: "documents",
    match: {
      form_type: 3,
      website_type: 5,
      document_type: 7,
    },
    model: Document,
  });

  if (!bestBookCinema) {
    return {
      status: "exception",
      message: "Something went wrong!!",
      statusCode: 203,
    };
  }

  const editors = await Editor.find({ best_book_cinema_id: bestBookCinema._id });
  const book = await Book.find({ best_book_cinemas_id: bestBookCinema._id });

  return {
    status: "success",
    message: "Success.!!",
    statusCode: 200,
    data: {
      ...bestBookCinema.toObject(),
      editors,
      book,
    },
  };
};

export const finalSubmitBestBookService = async ({ id, userId }) => {
  const bestBook = await BestBookCinema.findOne({ _id: id, client_id: userId });

  if (!bestBook) {
    return {
      message: "You do not have any entries.!!",
      statusCode: 203,
    };
  }

  if (bestBook.payment_status != 2) {
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
