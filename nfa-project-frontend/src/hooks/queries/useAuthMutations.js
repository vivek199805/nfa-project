import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authService } from "../../services/authService";
import { queryKeys } from "../../lib/queryClient";

export function useLoginMutation(options = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: authService.login,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.entries });
      options.onSuccess?.(data, variables, context);
    },
    ...options,
  });
}

export function useRegisterMutation(options = {}) {
  return useMutation({
    mutationFn: authService.register,
    ...options,
  });
}
