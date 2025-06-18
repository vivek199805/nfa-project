
import axios from "axios";
import { showErrorToast } from "./toastService";
import { navigateTo } from "../navigate";
import { store } from "../../store/store";
import { hideLoader, showLoader } from "../../store/loaderSlice";

// Create the Axios instance
const api = axios.create({
  baseURL: "http://localhost:5000/api/", // API base URL
  // withCredentials: true, // If need to send cookies
});

// List of routes that do not require token
const excludedRoutes = ["login", "/register"];

// Request interceptor for token
api.interceptors.request.use(
  (config) => {
    // Check if the request URL ends with an excluded route
    const isExcluded = excludedRoutes.some((route) =>
      config.url.endsWith(route)
    );

    if (!isExcluded) {
          store.dispatch(showLoader());
      const tokenData = JSON.parse(localStorage.getItem("userData"));      
      if (tokenData) {
        config.headers.Authorization = `Bearer ${tokenData?.token}`;
      }
    }

    return config;
  },
    (error) => {
    store.dispatch(hideLoader());
    return Promise.reject(error);
  }
);

// ❗️Response interceptor to handle 401
api.interceptors.response.use(
   (response) => {
    store.dispatch(hideLoader());
    return response;
  },
  (error) => {
       store.dispatch(hideLoader());
    if (error.response?.status === 401) {
      // Clear user data
      localStorage.removeItem("userData");
      localStorage.clear();
      navigateTo("/");
      showErrorToast("Session expired. Please login again.");
      // window.location.href = "/";
    }

    return Promise.reject(error);
  }
);

export default api;
