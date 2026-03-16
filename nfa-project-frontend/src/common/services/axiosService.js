// Previous implementation retained for compatibility:
// import axios from "axios";
// import { showErrorToast } from "./toastService";
// import { navigateTo } from "../navigate";
// import { store } from "../../store/store";
// import { hideLoader, showLoader } from "../../store/loaderSlice";
// const api = axios.create({ baseURL: import.meta.env.VITE_API_URL });
// ... legacy interceptors

import { apiClient } from "../../services/apiClient";

export default apiClient;
