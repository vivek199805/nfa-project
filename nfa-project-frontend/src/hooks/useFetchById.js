import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getRequestById } from "../common/services/requestService";

export function useFetchById(endpoint, id, options = {}) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: [endpoint, id],
    queryFn: () => getRequestById(endpoint, id),
    enabled: !!id, // Only run query if id exists
    refetchOnMount: true,
    staleTime: options.staleTime ?? 0,  // consider fresh for 1 minute
    refetchInterval: options.refetchInterval ?? false,  // auto-refresh every 5 seconds
    retry: options.retry ?? 1,   // retry on failure up to 1 times
    initialData: () => {
      return queryClient.getQueryData([endpoint, id]);
    },
    ...options, // allow user to override if needed
  });
}