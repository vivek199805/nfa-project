import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { findDocumentById } from "../repositories/document.repository.js";
import { featureFormExistsByContributor, findFeatureFormByIdForUser } from "../repositories/featureForm.repository.js";
import { findBestBookByIdForUser } from "../repositories/bestBook.repository.js";
import { findBestFilmCriticByIdForUser } from "../repositories/bestFilmCritic.repository.js";
import {
  documentTypeMap,
  formType,
  getDocumentStorageRoot,
  websiteType,
} from "./common.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const legacyDocumentRoot = path.resolve(__dirname, "../public/documents");

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
  if (!documentRecord.context_id) return false;

  if (
    (documentRecord.form_type === formType.FEATURE ||
      documentRecord.form_type === formType.NON_FEATURE) &&
    documentRecord.document_type === documentTypeMap.PRODUCER_SELF_ATTESTED_DOC
  ) {
    return featureFormExistsByContributor({
      contributorType: "producers",
      contributorId: documentRecord.context_id,
      userId,
    });
  }

  if (
    (documentRecord.form_type === formType.FEATURE ||
      documentRecord.form_type === formType.NON_FEATURE) &&
    documentRecord.document_type === documentTypeMap.DIRECTOR_SELF_ATTESTED_DOC
  ) {
    return featureFormExistsByContributor({
      contributorType: "directors",
      contributorId: documentRecord.context_id,
      userId,
    });
  }

  if (documentRecord.form_type === formType.FEATURE || documentRecord.form_type === formType.NON_FEATURE) {
    return Boolean(await findFeatureFormByIdForUser(documentRecord.context_id, userId));
  }

  if (documentRecord.form_type === formType.BEST_BOOK) {
    return Boolean(await findBestBookByIdForUser(documentRecord.context_id, userId));
  }

  if (documentRecord.form_type === formType.BEST_FILM_CRITIC) {
    return Boolean(await findBestFilmCriticByIdForUser(documentRecord.context_id, userId));
  }

  return false;
}

export const getDocumentDownloadService = async ({ id, userId }) => {
  const documentRecord = await findDocumentById(id);

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
