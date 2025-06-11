
import api from "./axiosService";

export const getRequest = async (url, config = {}) => {
  try {
    const response = await api.get(url, config);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const getRequestById = async (url, id, config = {}) => {
  try {
    const response = await api.get(`${url}/${id}`, config);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};


export const postRequest = async (url, data = {}, config = {}) => {
  try {
    const response = await api.post(url, data, config);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const updateFormById = async (url, id, payload, config = {}) => {
  const res = await api.put(`${url}/${id}`, payload, config);
  return res.data;
};

const handleError = (error) => {
  if (error.response) {
    // Server responded with a status
    console.error("API error:", error.response.data.message || error.response.statusText);
    throw new Error(error.response.data.message || "API request failed");
  } else if (error.request) {
    // No response received
    console.error("No response from API:", error.request);
    throw new Error("No response from API");
  } else {
    // Other errors
    console.error("Request error:", error.message);
    throw new Error(error.message);
  }
};
