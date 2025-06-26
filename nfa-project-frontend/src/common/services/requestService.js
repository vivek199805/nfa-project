
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
      console.log("POST Request URL:", response);
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
    let message = "Something went wrong!";
  if (error.response) {
    // Server responded with a status
     message = error.response.data.message || error.response.statusText;
  } else if (error.request) {
    // No response received
    message = "No response from API";
  } else {
    // Other errors
    message = error.message;
    }
  return { error: true, message };

};
