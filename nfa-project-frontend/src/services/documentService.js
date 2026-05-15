import { apiClient } from "./apiClient";
import { toError } from "./errorService";

export const isProtectedDocumentPath = (filePath) =>
  typeof filePath === "string" && filePath.trim().startsWith("/api/documents/");

export const resolveDocumentUrl = (filePath) => {
  if (typeof filePath !== "string") return "";

  const trimmedPath = filePath.trim();
  if (!trimmedPath) return "";

  if (/^https?:\/\//i.test(trimmedPath)) return trimmedPath;
  if (trimmedPath.startsWith("/api/")) {
    return trimmedPath.replace(/^\/api\//, "");
  }

  const apiBaseUrl = (import.meta.env.VITE_API_URL || "").trim().replace(/\/+$/, "");
  const normalizedPath = trimmedPath.replace(/^\/+/, "");

  return apiBaseUrl ? `${apiBaseUrl}/${normalizedPath}` : `/${normalizedPath}`;
};

const openPreviewTab = () => {
  const previewTab = window.open("", "_blank");

  if (!previewTab) {
    throw new Error("Please allow pop-ups to preview uploaded files");
  }

  previewTab.opener = null;
  previewTab.document.title = "Opening preview...";

  return previewTab;
};

export const openUploadedDocument = async (filePath) => {
  const resolvedUrl = resolveDocumentUrl(filePath);
  if (!resolvedUrl) {
    throw new Error("Uploaded file is not available");
  }

  const previewTab = openPreviewTab();

  try {
    if (isProtectedDocumentPath(filePath)) {
      const response = await apiClient.get(resolvedUrl, {
        responseType: "blob",
      });

      const blobUrl = window.URL.createObjectURL(response.data);
      previewTab.location.replace(blobUrl);

      window.setTimeout(() => {
        window.URL.revokeObjectURL(blobUrl);
      }, 300_000);

      return;
    }

    previewTab.location.replace(resolvedUrl);
  } catch (error) {
    previewTab.close();
    throw toError(error, "Unable to open the uploaded file");
  }
};
