import { http } from "./apiClient";

export const authService = {
  login: (payload) => http.post("user/login", payload),
  register: (payload) => http.post("user/register", payload),
  verifyEmail: (payload) => http.post("user/verify-email", payload),
  forgotPassword: (payload) => http.post("user/forgot-password", payload),
  verifyOtp: (payload) => http.post("user/verify-otp", payload),
  resendOtp: (payload) => http.post("user/resend-otp", payload),
  resetPassword: (payload) => http.post("user/reset-password", payload),
  changePassword: (payload) => http.post("user/change-password", payload),
};
