import { QueryClient } from "@tanstack/react-query";

const isProd = import.meta.env.PROD;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 30,
      retry: (failureCount, error) => {
        const status = error?.response?.status;
        if (status && status >= 400 && status < 500 && status !== 429) {
          return false;
        }
        return failureCount < 2;
      },
      refetchOnWindowFocus: !isProd,
      refetchOnReconnect: true,
      refetchInterval: false,
    },
    mutations: {
      retry: 0,
    },
  },
});

export const queryKeys = {
  auth: {
    currentUser: ["auth", "currentUser"],
  },
  dashboard: {
    entries: ["dashboard", "entries"],
  },
  entry: {
    byId: (endpoint, id) => ["entry", endpoint, String(id ?? "")],
  },
  common: {
    languages: ["common", "languages"],
  },
};
