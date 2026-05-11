import ClientSchemaHelper from "../../helpers/clientSchemaHelper.js";
import {
  errorResponse,
  sendJsonResponse,
  sendValidationError,
} from "../../helpers/responseHelper.js";

import {
  registerUserService,
  loginUserService,
  verifyEmailService,
  forgotPasswordService,
  verifyOtpService,
  resendOtpService,
  resetPasswordService,
  changePasswordService,
  getUserDetailsService,
  deleteUserService,
  forgotPasswordWithTokenService,
  resetPasswordWithTokenService,
} from "../../services/auth.service.js";

const sendServiceResponse = (res, result) => {
  if (result.cookie) {
    res.cookie(result.cookie.name, result.cookie.value, result.cookie.options);
    delete result.cookie;
  }

  const httpCode = result.statusCode === 401 ? 401 : 200;

  return sendJsonResponse(res, httpCode, {
    ...result,
    statusCode: result.statusCode,
  });
};

const registerUser = async (req, res) => {
  const { isValid, errors } = ClientSchemaHelper.validateRegisterData(req.body);
  if (!isValid) return sendValidationError(res, errors);

  try {
    const result = await registerUserService(req.body);
    return sendServiceResponse(res, result);
  } catch (error) {
    return errorResponse(res, error);
  }
};

const loginUser = async (req, res) => {
  const { isValid, errors } = ClientSchemaHelper.ValidateLoginSchemaData(req.body);
  if (!isValid) return sendValidationError(res, errors);

  try {
    const result = await loginUserService(req.body);
    return sendServiceResponse(res, result);
  } catch (error) {
    return errorResponse(res, error);
  }
};

export const verifyEmail = async (req, res) => {
  const { isValid, errors } = ClientSchemaHelper.validateEmailSchemaData(req.body);
  if (!isValid) return sendValidationError(res, errors);

  try {
    const result = await verifyEmailService(req.body);    
    return sendServiceResponse(res, result);
  } catch (error) {
    return errorResponse(res, error);
  }
};

const forgotPassword = async (req, res) => {
  try {
    const result = await forgotPasswordService(req.body);
    return sendServiceResponse(res, result);
  } catch (error) {
    return errorResponse(res, error);
  }
};

const verifyOtp = async (req, res) => {
  try {
    const result = await verifyOtpService(req.body);
    return sendServiceResponse(res, result);
  } catch (error) {
    return errorResponse(res, error);
  }
};

const resendOtp = async (req, res) => {
  try {
    const result = await resendOtpService(req.body);
    return sendServiceResponse(res, result);
  } catch (error) {
    return errorResponse(res, error);
  }
};

export const resetPassword = async (req, res) => {
  const { isValid, errors } = ClientSchemaHelper.ValidateResetPassword(req.body);
  if (!isValid) return sendValidationError(res, errors);

  try {
    const result = await resetPasswordService(req.body);
    return sendServiceResponse(res, result);
  } catch (error) {
    return errorResponse(res, error);
  }
};

export const changePassword = async (req, res) => {
  const { isValid, errors } =
    ClientSchemaHelper.ValidateChangePasswordSchemaData(req.body);

  if (!isValid) return sendValidationError(res, errors);

  try {
    const result = await changePasswordService({
      userId: req.user?._id || req.user?.id,
      currentPassword: req.body.currentPassword,
      password: req.body.password,
    });

    return sendServiceResponse(res, result);
  } catch (error) {
    return errorResponse(res, error);
  }
};

const getUserDetails = async (req, res) => {
  try {
    const result = await getUserDetailsService(req.user._id);
    return sendServiceResponse(res, result);
  } catch (error) {
    return errorResponse(res, error);
  }
};

const deleteUser = async (req, res) => {
  try {
    const result = await deleteUserService(req.user._id);
    return sendServiceResponse(res, result);
  } catch (error) {
    return errorResponse(res, error);
  }
};

const forgotPasswordWithToken = async (req, res) => {
  try {
    const result = await forgotPasswordWithTokenService(req.body);
    return sendServiceResponse(res, result);
  } catch (error) {
    return errorResponse(res, error);
  }
};

const resetPasswordWithToken = async (req, res) => {
  try {
    const result = await resetPasswordWithTokenService(req.body);
    return sendServiceResponse(res, result);
  } catch (error) {
    return errorResponse(res, error);
  }
};

const logoutUser = async (req, res) => {
  return sendJsonResponse(res, 200, {
    message: "Logout successful",
    statusCode: 200,
  });
};

const logoutAllUser = async (req, res) => {
  return sendJsonResponse(res, 200, {
    message: "Logout successful on all devices",
    statusCode: 200,
  });
};

export default {
  registerUser,
  loginUser,
  verifyEmail,
  logoutUser,
  logoutAllUser,
  verifyOtp,
  changePassword,
  forgotPassword,
  resetPassword,
  deleteUser,
  getUserDetails,
  forgotPasswordWithToken,
  resetPasswordWithToken,
  resendOtp,
};