import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { entryService } from "../../services/entryService";
import { queryKeys } from "../../lib/queryClient";

export function useEntryByIdQuery(endpoint, id, options = {}) {
  return useQuery({
    queryKey: queryKeys.entry.byId(endpoint, id),
    queryFn: () => entryService.getById({ endpoint, id }),
    enabled: Boolean(endpoint) && Boolean(id),
    staleTime: 1000 * 60,
    ...options,
  });
}

export function useUpdateEntryMutation({ invalidate = [], ...options } = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: entryService.updateByType,
    onSuccess: (data, variables, context) => {
      invalidate.forEach((queryKey) => {
        queryClient.invalidateQueries({ queryKey });
      });
      options.onSuccess?.(data, variables, context);
    },
    ...options,
  });
}
