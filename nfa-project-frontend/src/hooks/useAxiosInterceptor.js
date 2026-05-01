import { useEffect } from "react";
import { apiClient } from "../services/apiClient";
import { useAuth } from "./use-auth";

const useAxiosInterceptor = () => {
  const { logoutMutation } = useAuth();

  useEffect(() => {
    const interceptor = apiClient.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          logoutMutation.mutate();
        }
        return Promise.reject(error);
      },
    );

    return () => {
      apiClient.interceptors.response.eject(interceptor);
    };
  }, [logoutMutation]);
};

export default useAxiosInterceptor;

