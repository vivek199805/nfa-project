import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Document } from "../../models/mongodbModels/document.js";
import { FeatureForm } from "../../models/mongodbModels/featureForm.js";
import BestBookCinema from "../../models/mongodbModels/BestBookCinema.js";
import BestFilmCritic from "../../models/mongodbModels/BestFilmCritic.js";
import { errorResponse, sendJsonResponse } from "../../helpers/responseHelper.js";
import {
  documentTypeMap,
  formType,
  getDocumentStorageRoot,
  websiteType,
} from "../../services/common.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const legacyDocumentRoot = path.resolve(__dirname, "../../public/documents");

const modelByFormType = new Map([
  [formType.FEATURE, FeatureForm],
  [formType.NON_FEATURE, FeatureForm],
  [formType.BEST_BOOK, BestBookCinema],
  [formType.BEST_FILM_CRITIC, BestFilmCritic],
]);

const websiteFolderByValue = Object.entries(websiteType).reduce((folders, [key, value]) => {
  folders[value] = key;
  return folders;
}, {});

const getUserId = (req) => String(req.user?._id || req.user?.id || "");

function resolveInside(baseDirectory, ...segments) {
  const resolvedBase = path.resolve(baseDirectory);
  const resolvedPath = path.resolve(resolvedBase, ...segments);

  if (resolvedPath !== resolvedBase && !resolvedPath.startsWith(resolvedBase + path.sep)) {
    return null;
  }

  return resolvedPath;
}

function findStoredFile(documentRecord) {
  const websiteFolder = websiteFolderByValue[documentRecord.website_type];
  if (!websiteFolder || !documentRecord.file) return null;

  const storagePath = resolveInside(
    getDocumentStorageRoot(),
    websiteFolder,
    path.basename(documentRecord.file)
  );

  if (storagePath && fs.existsSync(storagePath)) {
    return storagePath;
  }

  const legacyPath = resolveInside(
    legacyDocumentRoot,
    websiteFolder,
    path.basename(documentRecord.file)
  );

  if (legacyPath && fs.existsSync(legacyPath)) {
    return legacyPath;
  }

  return null;
}

async function userOwnsDocument(req, documentRecord) {
  const Model = modelByFormType.get(documentRecord.form_type);
  if (!Model || !documentRecord.context_id) return false;

  if (
    (documentRecord.form_type === formType.FEATURE ||
      documentRecord.form_type === formType.NON_FEATURE) &&
    documentRecord.document_type === documentTypeMap.PRODUCER_SELF_ATTESTED_DOC
  ) {
    const owner = await FeatureForm.exists({
      "producers._id": documentRecord.context_id,
      client_id: getUserId(req),
    });

    return Boolean(owner);
  }

  if (
    (documentRecord.form_type === formType.FEATURE ||
      documentRecord.form_type === formType.NON_FEATURE) &&
    documentRecord.document_type === documentTypeMap.DIRECTOR_SELF_ATTESTED_DOC
  ) {
    const owner = await FeatureForm.exists({
      "directors._id": documentRecord.context_id,
      client_id: getUserId(req),
    });

    return Boolean(owner);
  }

  const owner = await Model.exists({
    _id: documentRecord.context_id,
    client_id: getUserId(req),
  });

  return Boolean(owner);
}

const downloadDocument = async (req, res) => {
  try {
    const documentRecord = await Document.findById(req.params.id);

    if (!documentRecord) {
      return sendJsonResponse(res, 200, {
        message: "Document not found",
        statusCode: 203,
      });
    }

    const isOwner = await userOwnsDocument(req, documentRecord);
    if (!isOwner) {
      return sendJsonResponse(res, 403, {
        message: "You are not authorized to access this document",
        statusCode: 403,
      });
    }

    const filePath = findStoredFile(documentRecord);
    if (!filePath) {
      return sendJsonResponse(res, 200, {
        message: "Document file not found",
        statusCode: 203,
      });
    }

    return res.download(filePath, documentRecord.name || path.basename(filePath));
  } catch (error) {
    return errorResponse(res, error);
  }
};

export default {
  downloadDocument,
};
