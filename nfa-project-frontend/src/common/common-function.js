export const countWords = (text) => {
  return text?.trim().split(/\s+/).filter(Boolean).length || 0;
};

 export const formatDate = (isoDate) =>
  isoDate ? new Date(isoDate).toISOString().split("T")[0] : "";