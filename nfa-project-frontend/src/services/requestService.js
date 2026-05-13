import { http } from "./apiClient";
import { toError } from "./errorService";

const normalizeError = (error) => {
  return toError(error, "Something went wrong!");
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
