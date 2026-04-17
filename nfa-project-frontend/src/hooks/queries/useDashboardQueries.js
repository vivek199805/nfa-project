import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "../../services/dashboardService";
import { queryKeys } from "../../lib/queryClient";

export function useDashboardEntriesQuery(options = {}) {
  return useQuery({
    queryKey: queryKeys.dashboard.entries,
    queryFn: async () => {
      const response = await dashboardService.getUserEntries();
      return response?.data || response;
    },
    staleTime: 1000 * 30,
    ...options,
  });
}
