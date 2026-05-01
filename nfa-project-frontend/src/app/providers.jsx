import { Provider } from "react-redux";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { queryClient } from "../lib/queryClient";
import { store } from "./store";
import { attachApiInterceptors } from "../services/apiClient";

attachApiInterceptors(store);

export function AppProviders({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <Toaster
          position="top-right"
          richColors
          closeButton
          duration={3000}
          expand
        />
        {children}
      </Provider>
    </QueryClientProvider>
  );
}
