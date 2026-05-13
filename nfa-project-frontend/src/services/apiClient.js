import axios from "axios";
import { showErrorToast } from "./toastService";
import { clearCredentials } from "../features/auth/authSlice";
import { setGlobalLoader } from "../features/ui/uiSlice";
import { navigateTo } from "../common/navigate";
import { isPublicApiEndpoint } from "./apiEndpoints";
import { getErrorMessage } from "./errorService";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

let reduxStore;
let requestInterceptorId;
let responseInterceptorId;

export function attachApiInterceptors(store) {
  reduxStore = store;

  if (requestInterceptorId !== undefined) {
    apiClient.interceptors.request.eject(requestInterceptorId);
  }

  if (responseInterceptorId !== undefined) {
    apiClient.interceptors.response.eject(responseInterceptorId);
  }

  requestInterceptorId = apiClient.interceptors.request.use(
    (config) => {
      const isExcluded = isPublicApiEndpoint(config.url);

      if (!isExcluded) {
        reduxStore?.dispatch(setGlobalLoader(true));
      }

      const tokenFromRedux = reduxStore?.getState()?.auth?.token;
      const tokenFromStorage = JSON.parse(localStorage.getItem("userData") || "null")?.token;
      const token = tokenFromRedux || tokenFromStorage;

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    },
    (error) => {
      reduxStore?.dispatch(setGlobalLoader(false));
      return Promise.reject(error);
    },
  );

  responseInterceptorId = apiClient.interceptors.response.use((response) => {
    reduxStore?.dispatch(setGlobalLoader(false));
    return response;
  },
    (error) => {
      reduxStore?.dispatch(setGlobalLoader(false));
      const errorMessage = !error.response
        ? "No response from API"
        : getErrorMessage(error, "Server Error");
      const apiError = new Error(errorMessage);
      apiError.toastShown = true;

      if (error.response?.status === 401) {
        localStorage.clear();
        reduxStore?.dispatch(clearCredentials());
        navigateTo("/");
        apiError.message = "Session expired. Please login again.";
        showErrorToast(apiError.message, { id: "api-error" });
        return Promise.reject(apiError);
      }

      if (error.response?.status === 422) {
        const errors = error.response?.data?.errors;
        if (errors && typeof errors === "object") {
          showErrorToast(errorMessage, { id: "api-error" });
          return Promise.reject(apiError);
        }
      }

      showErrorToast(errorMessage, { id: "api-error" });

      return Promise.reject(apiError);
    },
  );
}

export const http = {
  get: async (url, config = {}) => {
    const { data } = await apiClient.get(url, config);
    return data;
  },
  post: async (url, body = {}, config = {}) => {
    const { data } = await apiClient.post(url, body, config);
    return data;
  },
  put: async (url, body = {}, config = {}) => {
    const { data } = await apiClient.put(url, body, config);
    return data;
  },
  patch: async (url, body = {}, config = {}) => {
    const { data } = await apiClient.patch(url, body, config);
    return data;
  },
  delete: async (url, config = {}) => {
    const { data } = await apiClient.delete(url, config);
    return data;
  },
};
