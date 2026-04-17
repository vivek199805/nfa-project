/* eslint-disable react-refresh/only-export-components */
// Previous implementation retained for compatibility:
/*
import { createContext, use, useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { postRequest } from "../common/services/requestService";
...
*/

import { createContext, use, useEffect, useMemo } from "react";
import { useMutation } from "@tanstack/react-query";
import { showErrorToast, showSuccessToast } from "../common/services/toastService";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService";
import { useDispatch, useSelector } from "react-redux";
import { clearCredentials, setCredentials } from "../features/auth/authSlice";
import { authStorage } from "../features/auth/authStorage";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);

  useEffect(() => {
    if (authState?.token) {
      authStorage.set({ token: authState.token, data: authState.user, user: authState.user });
    }
  }, [authState]);

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (res) => {
      if (res?.statusCode !== 200) {
        showErrorToast(res?.message || "Login failed");
        return;
      }

      const userPayload = res.data;
      dispatch(setCredentials({ token: userPayload?.token, user: userPayload }));
      authStorage.set(userPayload);
      showSuccessToast(`Welcome, ${res.message}!`);
      navigate("/dashboard");
    },
    onError: (error) => {
      showErrorToast(error.message || "Login failed");
    },
  });

  const registerMutation = useMutation({
    mutationFn: authService.register,
    onSuccess: (res) => {
      showSuccessToast(`Welcome, ${res?.message || "User"}!`);
      navigate("/");
    },
    onError: (error) => {
      showErrorToast(error.message || "Registration failed");
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      sessionStorage.clear();
      localStorage.clear();
      authStorage.clear();
      dispatch(clearCredentials());
      navigate("/");
      return true;
    },
    onSuccess: () => {
      showSuccessToast("You have been successfully logged out.");
    },
    onError: (error) => {
      showErrorToast(error.message || "Logout failed");
    },
  });

  const value = useMemo(
    () => ({
      user: authState?.user,
      loginMutation,
      logoutMutation,
      registerMutation,
    }),
    [authState?.user, loginMutation, logoutMutation, registerMutation],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = use(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
