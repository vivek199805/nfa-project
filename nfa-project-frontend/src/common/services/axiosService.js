
import axios from "axios";

// Create the Axios instance
const api = axios.create({
  baseURL: "http://119.82.68.149/NFA/api/", // API base URL
  // withCredentials: true, // If need to send cookies
});

// List of routes that do not require token
const excludedRoutes = ["login", "/register"];

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Check if the request URL ends with an excluded route
    const isExcluded = excludedRoutes.some((route) =>
      config.url.endsWith(route)
    );

    if (!isExcluded) {
      const token = localStorage.getItem("auth_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
