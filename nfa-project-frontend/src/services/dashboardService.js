import { http } from "./apiClient";
import { apiConfig } from "./apiEndpoints";

export const dashboardService = {
  getUserEntries: () => http.get(apiConfig.dashboard.entryList),
};
