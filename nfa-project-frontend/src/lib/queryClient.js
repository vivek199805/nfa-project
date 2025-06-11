import { QueryClient } from "@tanstack/react-query";
import api from "../common/services/axiosService";

export function getQueryFn({ on401 = "throw" } = {}) {
  return async ({ queryKey }) => {
    try {
      const res = await api.get(queryKey[0]);
      return res.data;
    } catch (err) {
      if (err.response?.status === 401 && on401 === "returnNull") {
        return null;
      }
      throw err;
    }
  };
}



export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
      refetchIntervalInBackground: false,
    },
    mutations: {
      retry: false,
    },
  },
});