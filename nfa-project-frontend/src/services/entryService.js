import { http } from "./apiClient";
import { apiConfig } from "./apiEndpoints";

export const entryService = {
  getById: ({ endpoint, id }) => http.get(`${endpoint}/${id}`),
  updateByType: ({ endpoint, payload }) => http.post(endpoint, payload),
  getLanguages: () => http.get(apiConfig.common.languages),
};
