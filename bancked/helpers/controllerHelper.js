import { sendJsonResponse } from "./responseHelper.js";

export const getUserId = (reqOrUser) => reqOrUser?.user?._id || reqOrUser?.user?.id || reqOrUser?._id || reqOrUser?.id;

export const sendServiceResponse = (res, result, httpStatus = 200) => {
  if (result?.cookie) {
    res.cookie(result.cookie.name, result.cookie.value, result.cookie.options);
    delete result.cookie;
  }

  const { httpStatus: resultHttpStatus, ...body } = result || {};

  return sendJsonResponse(res, resultHttpStatus || httpStatus, {
    ...body,
    statusCode: result?.statusCode,
  });
};

export const missingFieldResponse = (fields) => ({
  statusCode: 203,
  message: `${fields.join(" and ")} ${fields.length > 1 ? "are" : "is"} required`,
});
