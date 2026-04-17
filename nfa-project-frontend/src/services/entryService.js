import { http } from "./apiClient";

export const entryService = {
  getById: ({ endpoint, id }) => http.get(`${endpoint}/${id}`),
  updateByType: ({ endpoint, payload }) => http.post(endpoint, payload),
  getLanguages: () => http.get("get-languages"),
};
