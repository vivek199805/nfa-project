import { createContext, use, useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
// import { getQueryFn, queryClient } from "../lib/queryClient";
import { showErrorToast, showSuccessToast } from "../common/services/toastService";
import { postRequest } from "../common/services/requestService";
import { useNavigate } from "react-router-dom";
// import { queryClient } from "../lib/queryClient";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  // const getCurrentUser = async () => {
  //   const response = await getRequest('user/current'); // replace with your actual API
  //   return response.data;
  // };
    useEffect(() => {
    localStorage.setItem('user', JSON.stringify(user));
  }, [user]);

  // const {
  //   data: userData,
  //   error,
  //   isLoading,
  // } = useQuery({
  //   queryKey: ["user/currentUser"],
  //   queryFn: getCurrentUser,
  //   enabled: !!parsedUser,  // Only run if not in localStorage
  //   initialData: parsedUser,
  //   staleTime: 5 * 60 * 1000,       // Optional: cache for 5 minutes
  // });

  const loginMutation = useMutation({
    mutationFn: async (credentials) => {
      const res = await postRequest("user/login", credentials);
      return res;
    },
    onSuccess: (res) => {
      const userData = res.data;
      localStorage.setItem("userData", JSON.stringify(userData));
      // queryClient.setQueryData(["user/currentUser"], res);
      setUser(res)
      navigate('/dashboard')
      showSuccessToast(`Welcome, ${res.message}!`);
    },
    onError: (error) => {
      showErrorToast(error.message || "Login failed");
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (credentials) => {
      const res = await postRequest("user/register", credentials);
      return res;
    },
    onSuccess: (res) => {
      showSuccessToast(`Welcome, ${res.message}!`);
      navigate('/')
    },
    onError: (error) => {
      showErrorToast(error.message || "Registration failed");
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      sessionStorage.clear();
      localStorage.clear();
      navigate('/');
    },
    onSuccess: () => {
      // queryClient.setQueryData(["user/currentUser"], null);
      showSuccessToast("You have been successfully logged out.");
    },
    onError: (error) => {
      showErrorToast(error.message || "Logout failed");
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user?.data,
        // isLoading,
        // error,
        loginMutation,
        logoutMutation,
        registerMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = use(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
