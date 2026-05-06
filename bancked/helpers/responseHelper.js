
export const sendJsonResponse = (res, httpStatus, body) => res.status(httpStatus).json(body);

export const sendBodyResponse = (res, httpStatus, body) => res.status(httpStatus).send(body);

export const successResponse = (res, data, message = "Success", statusCode = 200) => {
  const body = {
    message,
    data,
    statusCode,
  };

  return sendJsonResponse(res, statusCode, body);
};

export const errorResponse = (res, error, message, statusCode = 500) => {

  const responseMessage = message || (statusCode === 500 ? "Internal Server Error" : error?.message);

  return sendJsonResponse(res, statusCode, {
    message: responseMessage,
    statusCode,
    ...(process.env.NODE_ENV === "development" && { error: error?.message }),
  });
};

export const sendValidationError = (res, errors) =>
  sendJsonResponse(res, 422, {
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
  sendJsonResponse(res, httpStatus, {
    message,
    ...extra,
    statusCode,
  });
