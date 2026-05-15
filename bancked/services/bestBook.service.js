import { createBestBook, findBestBookByIdForUser, updateBestBookByIdForUser } from "../repositories/bestBook.repository.js";
import { findBooks } from "../repositories/book.repository.js";
import { findDocument, findDocuments } from "../repositories/document.repository.js";
import { findEditors } from "../repositories/editor.repository.js";
import { toPublicId } from "../repositories/prisma.mapper.js";
import Common from "./common.js";

const syncDocumentRef = (data, documentId) => {
  if (!documentId) return;
  if (!Array.isArray(data.documents)) data.documents = [];

  const exists = data.documents.some((id) => String(id) === String(documentId));
  if (!exists) data.documents.push(documentId);
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

const normalizeBestBookUpdateData = (updateData) => {
  const normalized = {
    ...updateData,
    step: toOptionalNumber(updateData.step),
    active_step: toOptionalNumber(updateData.active_step),
    status: toOptionalNumber(updateData.status),
    author_nationality_indian: toOptionalNumber(updateData.author_nationality_indian),
    payment_date: toOptionalDate(updateData.payment_date),
    documents: normalizeDocumentIds(updateData.documents),
  };

  ["declaration_one", "declaration_two", "declaration_three", "declaration_four"].forEach((field) => {
    if (field in updateData) normalized[field] = toBoolean(updateData[field]);
  });

  return normalized;
};

export const shouldValidateBestBookStep = (step) =>
  step === String(Common.stepsBestBook().AUTHOR) ||
  step === String(Common.stepsBestBook().DECLARATION);

export const createBestBookService = async ({ payload, userId }) => {
  const bestBookData = await createBestBook({
    author_name: payload.author_name,
    author_contact: payload.author_contact,
    author_nationality_indian: Number(payload.author_nationality_indian || 0),
    author_address: payload.author_address,
    author_profile: payload.author_profile,
    step: Number(payload.step || 1),
    active_step: 1,
    client_id: String(userId),
  });

  return {
    message: "Submit successful",
    statusCode: 200,
    data: toPublicId(bestBookData),
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
        userId: payload.userId,
        image_key: "author_aadhaar_card",
        websiteType: "NFA",
        formType: "BEST_BOOK",
        image: authorAadhaar,
      });

      if (!fileUpload.status) return fileUpload;

      data.author_aadhaar_card = fileUpload?.data?.file ?? null;
      syncDocumentRef(data, fileUpload?.data?.id);
    }
  }

  return data;
};

const stripBestBookUploadFields = (payload) => {
  const sanitizedPayload = { ...payload };
  delete sanitizedPayload.author_aadhaar_card;
  return sanitizedPayload;
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

  const existingEntry = await findBestBookByIdForUser(payload.id, userId);

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
    ...stripBestBookUploadFields(payload),
    documents: data.documents,
    active_step: data.active_step,
  };
  const updated = await updateBestBookByIdForUser(payload.id, userId, normalizeBestBookUpdateData(updateData));

  return {
    statusCode: 200,
    message: "Feature submission updated successfully",
    data: updated,
  };
};

export const getBestBookByIdService = async ({ id, userId }) => {
  const bestBookCinema = await findBestBookByIdForUser(id, userId);
  if (!bestBookCinema) {
    return {
      status: "exception",
      message: "Something went wrong!!",
      statusCode: 203,
    };
  }

  const documents = await findDocuments({
    id: { in: bestBookCinema.documents || [] },
    form_type: 3,
    website_type: 5,
    document_type: 7,
  });
  const authorDocument = await findDocument({
    context_id: bestBookCinema.id,
    form_type: 3,
    website_type: 5,
    document_type: 7,
  });
  const editors = await findEditors({ best_book_cinema_id: bestBookCinema.id });
  const book = await findBooks({ best_book_cinemas_id: bestBookCinema.id });

  return {
    status: "success",
    message: "Success.!!",
    statusCode: 200,
    data: {
      ...bestBookCinema,
      _id: bestBookCinema.id,
      author_aadhaar_card: authorDocument
        ? `/api/documents/${authorDocument.id}/download`
        : bestBookCinema.author_aadhaar_card,
      documents,
      editors,
      book,
    },
  };
};

export const finalSubmitBestBookService = async ({ id, userId }) => {
  const bestBook = await findBestBookByIdForUser(id, userId);

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
