export const sendValidationError = (res, errors) =>
  res.status(422).json({
    message: "Validation failed",
    errors,
    statusCode: 422,
  });

export const sendStatusMessage = (
  res,
  httpStatus,
  message,
  statusCode = httpStatus,
  extra = {},
) =>
  res.status(httpStatus).json({
    message,
    ...extra,
    statusCode,
  });
