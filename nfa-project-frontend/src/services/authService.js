import { http } from "./apiClient";
import { apiConfig } from "./apiEndpoints";

export const authService = {
  login: (payload) => http.post(apiConfig.auth.login, payload),
  register: (payload) => http.post(apiConfig.auth.register, payload),
  verifyEmail: (payload) => http.post(apiConfig.auth.verifyEmail, payload),
  forgotPassword: (payload) => http.post(apiConfig.auth.forgotPassword, payload),
  verifyOtp: (payload) => http.post(apiConfig.auth.verifyOtp, payload),
  resendOtp: (payload) => http.post(apiConfig.auth.resendOtp, payload),
  resetPassword: (payload) => http.post(apiConfig.auth.resetPassword, payload),
  changePassword: (payload) => http.post(apiConfig.auth.changePassword, payload),
};
