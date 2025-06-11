export const countWords = (text) => {
  return text?.trim().split(/\s+/).filter(Boolean).length || 0;
};