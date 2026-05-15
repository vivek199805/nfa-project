import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const legacyDocumentRoot = path.resolve(__dirname, "../public/documents");

export const getDocumentStorageRoot = () =>
  path.resolve(process.env.UPLOAD_ROOT || path.join(__dirname, "..", "storage/documents"));

export const resolveInside = (baseDirectory, ...segments) => {
  const resolvedBase = path.resolve(baseDirectory);
  const resolvedPath = path.resolve(resolvedBase, ...segments);

  if (resolvedPath !== resolvedBase && !resolvedPath.startsWith(resolvedBase + path.sep)) {
    return null;
  }

  return resolvedPath;
};

export const sanitizeStorageSegment = (value, fallback = "unknown") => {
  const sanitized = String(value ?? "")
    .trim()
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/^_+|_+$/g, "");

  return sanitized || fallback;
};

export const buildDocumentStorageSegments = ({
  userId,
  formTypeValue,
  contextId,
  documentType,
}) => [
  `user_${sanitizeStorageSegment(userId, "anonymous")}`,
  `form_${sanitizeStorageSegment(formTypeValue, "unknown")}`,
  `context_${sanitizeStorageSegment(contextId, "unknown")}`,
  `doc_${sanitizeStorageSegment(documentType, "unknown")}`,
];

export const buildRelativeDocumentPath = ({
  userId,
  formTypeValue,
  contextId,
  documentType,
  fileName,
}) =>
  path.posix.join(
    ...buildDocumentStorageSegments({
      userId,
      formTypeValue,
      contextId,
      documentType,
    }),
    fileName
  );

const normalizeStoredFileSegments = (filePath) =>
  String(filePath || "")
    .split(/[\\/]+/)
    .map((segment) => segment.trim())
    .filter(Boolean);

export const findStoredFilePath = (documentRecord, websiteFolder) => {
  if (!websiteFolder || !documentRecord?.file) return null;

  const fileSegments = normalizeStoredFileSegments(documentRecord.file);
  if (!fileSegments.length) return null;

  const storagePath = resolveInside(getDocumentStorageRoot(), websiteFolder, ...fileSegments);
  if (storagePath && fs.existsSync(storagePath)) return storagePath;

  const legacyPath = resolveInside(legacyDocumentRoot, websiteFolder, path.basename(documentRecord.file));
  if (legacyPath && fs.existsSync(legacyPath)) return legacyPath;

  return null;
};

export const deleteStoredFileByPath = async (filePath) => {
  if (!filePath) return;

  try {
    await fs.promises.unlink(filePath);
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }
};
