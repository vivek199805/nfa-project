import { http } from "./apiClient";

export const dashboardService = {
  getUserEntries: () => http.get("/entry-list"),
};
