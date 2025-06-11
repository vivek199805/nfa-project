import { createContext, use, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
// import { getQueryFn, queryClient } from "../lib/queryClient";
import { showErrorToast, showSuccessToast } from "../common/services/toastService";
import { postRequest } from "../common/services/requestService";
import { useNavigate } from "react-router-dom";
import { queryClient } from "../lib/queryClient";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, ] = useState(() => {
  const storedUser = localStorage.getItem("user");
  return storedUser ? JSON.parse(storedUser) : null;
});
  const navigate = useNavigate();
//   const storedUser = localStorage.getItem("user");
// const parsedUser = storedUser ? JSON.parse(storedUser) : null;

// const {
//   data: userData,
//   error,
//   isLoading,
// } = useQuery({
//   queryKey: ["/api/user/currentUser"],
//   queryFn: '',
//   enabled: !parsedUser,  // Only run if not in localStorage
//   initialData: parsedUser,
// });

  const loginMutation = useMutation({
    mutationFn: async (credentials) => {
      let loginData = {
        "username": "",
        "captcha": "11111222",
        "password": credentials.password,
        "email": credentials.email
      }

      // const res = await postRequest("login", loginData);
      
        navigate('/dashboard') 
    },
    onSuccess: (user) => {
    // const userData = user.data;
    //   localStorage.setItem("user", JSON.stringify(userData));
      // queryClient.setQueryData(["/api/user"], user);
      navigate('/dashboard')
      // showSuccessToast(`Welcome back, ${user.firstName}!`);
    },
    onError: (error) => {
      showErrorToast(error.message || "Login failed");
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (credentials) => {
      // const res = await postRequest("/api/register", credentials);
    return credentials;
    },
    onSuccess: (user) => {
        console.log("user", user);
           localStorage.setItem("user", JSON.stringify(user));
      // queryClient.setQueryData(["/api/user"], user);
      // showSuccessToast(`Welcome, ${user.username}!`);
      navigate('/')
    },
    onError: (error) => {
      showErrorToast(error.message || "Registration failed");
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      console.log('jjjjjjjjjjj', user);
      
        sessionStorage.clear();
        localStorage.clear();
        navigate('/')
      
      // const res = await postRequest("/api/logout");
      // if (!res.ok) throw new Error("Logout failed");
    },
    onSuccess: () => {
      // queryClient.setQueryData(["/api/user"], null);
      showSuccessToast("You have been successfully logged out.");
    },
    onError: (error) => {
      showErrorToast(error.message || "Logout failed");
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
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
