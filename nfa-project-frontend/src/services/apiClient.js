import axios from "axios";
import { showErrorToast } from "../common/services/toastService";
import { clearCredentials } from "../features/auth/authSlice";
import { setGlobalLoader } from "../features/ui/uiSlice";
import { navigateTo } from "../common/navigate";

const excludedRoutes = [
  "login",
  "register",
  "forgot-password",
  "reset-password",
  "verify-email",
];

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
      const isExcluded = excludedRoutes.some((route) =>
        config.url?.endsWith(route),
      );

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

  responseInterceptorId = apiClient.interceptors.response.use(
    (response) => {
      reduxStore?.dispatch(setGlobalLoader(false));
      return response;
    },
    (error) => {
      reduxStore?.dispatch(setGlobalLoader(false));

      if (error.response?.status === 401) {
        localStorage.clear();
        reduxStore?.dispatch(clearCredentials());
        navigateTo("/");
        showErrorToast("Session expired. Please login again.");
        return Promise.reject(error);
      }

      if (error.response?.status === 422) {
        const errors = error.response?.data?.errors;
        if (errors && typeof errors === "object") {
          Object.values(errors).forEach((value) => {
            if (Array.isArray(value)) {
              value.forEach((m) => showErrorToast(m));
              return;
            }
            showErrorToast(value);
          });
          return Promise.reject(error);
        }
      }

      if (!error.response) {
        showErrorToast("No response from API");
      } else {
        showErrorToast(
          error.response?.data?.message ||
            error.response?.statusText ||
            "Something went wrong.",
        );
      }

      return Promise.reject(error);
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
