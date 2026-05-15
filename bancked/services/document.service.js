import path from "path";
import { deleteDocumentById, findDocument, findDocumentById } from "../repositories/document.repository.js";
import { featureFormExistsByContributor, findFeatureFormByIdForUser } from "../repositories/featureForm.repository.js";
import { findBestBookByIdForUser } from "../repositories/bestBook.repository.js";
import { findBestFilmCriticByIdForUser } from "../repositories/bestFilmCritic.repository.js";
import {
  documentTypeMap,
  formType,
  websiteType,
} from "./common.js";
import { deleteStoredFileByPath, findStoredFilePath } from "./documentStorage.js";

const websiteFolderByValue = Object.entries(websiteType).reduce((folders, [key, value]) => {
  folders[value] = key;
  return folders;
}, {});

function findStoredFile(documentRecord) {
  const websiteFolder = websiteFolderByValue[documentRecord.website_type];
  return findStoredFilePath(documentRecord, websiteFolder);
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

export const deleteDocumentAndFileByFilter = async (where) => {
  const documentRecord = await findDocument(where);
  if (!documentRecord) return null;

  await deleteDocumentById(documentRecord.id);

  try {
    const filePath = findStoredFile(documentRecord);
    await deleteStoredFileByPath(filePath);
  } catch (error) {
    console.error(`Failed to remove stored document ${documentRecord.id}: ${error.message}`);
  }

  return documentRecord;
};
