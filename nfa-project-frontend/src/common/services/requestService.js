// Previous implementation retained for compatibility:
// import api from "./axiosService";
// export const getRequest = async (url, config = {}) => { ... }
// export const getRequestById = async (url, id, config = {}) => { ... }
// export const postRequest = async (url, data = {}, config = {}) => { ... }
// export const updateFormById = async (url, id, payload, config = {}) => { ... }

import { http } from "../../services/apiClient";

const normalizeError = (error) => {
  if (error instanceof Error) {
    return error;
  }
  const message =
    error?.response?.data?.message ||
    error?.response?.statusText ||
    error?.message ||
    "Something went wrong!";
  return new Error(message);
};

export const getRequest = async (url, config = {}) => {
  try {
    return await http.get(url, config);
  } catch (error) {
    throw normalizeError(error);
  }
};

export const getRequestById = async (url, id, config = {}) => {
  try {
    return await http.get(`${url}/${id}`, config);
  } catch (error) {
    throw normalizeError(error);
  }
};

export const postRequest = async (url, data = {}, config = {}) => {
  try {
    return await http.post(url, data, config);
  } catch (error) {
    throw normalizeError(error);
  }
};

export const updateFormById = async (url, id, payload, config = {}) => {
  try {
    return await http.put(`${url}/${id}`, payload, config);
  } catch (error) {
    throw normalizeError(error);
  }
};
