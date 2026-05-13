export const getErrorMessage = (error, fallback = "Something went wrong") => {
  if (!error) return fallback;
  if (typeof error === "string") return error;

  const validationErrors = error?.response?.data?.errors || error?.errors;
  if (validationErrors && typeof validationErrors === "object") {
    const firstError = Object.values(validationErrors).flat().find(Boolean);
    if (firstError) return String(firstError);
  }

  const message =
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.data?.message ||
    error?.message;

  if (typeof message === "string" && message.trim()) return message;

  return fallback;
};

export const toError = (error, fallback = "Something went wrong") => {
  if (error instanceof Error) return error;
  return new Error(getErrorMessage(error, fallback));
};
