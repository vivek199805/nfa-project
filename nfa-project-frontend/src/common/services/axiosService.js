
import axios from "axios";
import { showErrorToast } from "./toastService";
import { navigateTo } from "../navigate";

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
      const tokenData = JSON.parse(localStorage.getItem("userData"));      
      if (tokenData) {
        config.headers.Authorization = `Bearer ${tokenData?.token}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ❗️Response interceptor to handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Unauthorized - logging out user...", error);

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
