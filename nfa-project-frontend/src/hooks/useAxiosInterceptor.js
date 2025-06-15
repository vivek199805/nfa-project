// hooks/useAxiosInterceptor.js
import { useEffect } from "react";
import api from "../common/services/axiosService";
import { useAuth } from "./use-auth";

const useAxiosInterceptor = () => {
const { logoutMutation } = useAuth(); 

  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {      
          logoutMutation()
        }
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.response.eject(interceptor);
    };
  }, [logoutMutation]);
};

export default useAxiosInterceptor;
