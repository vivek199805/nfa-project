import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import BestBookCinema from "../models/mongodbModels/BestBookCinema.js";
import BestFilmCritic from "../models/mongodbModels/BestFilmCritic.js";
import { Document } from "../models/mongodbModels/document.js";
import { FeatureForm } from "../models/mongodbModels/featureForm.js";
import {
  documentTypeMap,
  formType,
  getDocumentStorageRoot,
  websiteType,
} from "./common.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const legacyDocumentRoot = path.resolve(__dirname, "../public/documents");

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

  if (storagePath && fs.existsSync(storagePath)) return storagePath;

  const legacyPath = resolveInside(
    legacyDocumentRoot,
    websiteFolder,
    path.basename(documentRecord.file)
  );

  if (legacyPath && fs.existsSync(legacyPath)) return legacyPath;
  return null;
}

async function userOwnsDocument(userId, documentRecord) {
  const Model = modelByFormType.get(documentRecord.form_type);
  if (!Model || !documentRecord.context_id) return false;

  if (
    (documentRecord.form_type === formType.FEATURE ||
      documentRecord.form_type === formType.NON_FEATURE) &&
    documentRecord.document_type === documentTypeMap.PRODUCER_SELF_ATTESTED_DOC
  ) {
    const owner = await FeatureForm.exists({
      "producers._id": documentRecord.context_id,
      client_id: userId,
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
      client_id: userId,
    });

    return Boolean(owner);
  }

  const owner = await Model.exists({
    _id: documentRecord.context_id,
    client_id: userId,
  });

  return Boolean(owner);
}

export const getDocumentDownloadService = async ({ id, userId }) => {
  const documentRecord = await Document.findById(id);

  if (!documentRecord) {
    return { message: "Document not found", statusCode: 203 };
  }

  const isOwner = await userOwnsDocument(String(userId || ""), documentRecord);
  if (!isOwner) {
    return {
      message: "You are not authorized to access this document",
      statusCode: 403,
      httpStatus: 403,
    };
  }

  const filePath = findStoredFile(documentRecord);
  if (!filePath) {
    return { message: "Document file not found", statusCode: 203 };
  }

  return {
    statusCode: 200,
    filePath,
    fileName: documentRecord.name || path.basename(filePath),
  };
};
