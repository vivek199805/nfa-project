import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "sonner";
import AuthPage from "./pages/auth/auth";
import AppLayout from "./component/layouts/layout";
import LoginPage from "./pages/auth/login";
import { QueryClientProvider } from "@tanstack/react-query";
import SignupPage from "./pages/auth/signUp";
import ForgotPasswordPage from "./pages/auth/forgot-password";
import DashboardPage from "./pages/dashboard";
import FeatureFilmPage from "./pages/feature-film";
import NonFeatureFilmPage from "./pages/non-feature-film";
import { store } from "./store/store";
import { Provider } from "react-redux";
import ChangePasswordPage from "./pages/auth/change-password";
import ResetPasswordPage from "./pages/auth/reset-password";
import NotFoundPage from "./pages/not-found-page";
import ErrorPage from "./pages/error-page";

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <AppLayout />,
       errorElement: <ErrorPage />,
      children: [
        {
          path: "/",
          element: <AuthPage />,
          children: [
            {
              path: "/",
              element: <LoginPage />,
            },
            {
              path: "signup",
              element: <SignupPage />,
            },
            {
              path: "forgot-password",
              element: <ForgotPasswordPage />,
            },
            {
              path: "change-password",
              element: <ChangePasswordPage />,
            },
            {
              path: "reset-password",
              element: <ResetPasswordPage />,
            },
          ],
        },
        {
          path: "dashboard",
          element: <DashboardPage />,
        },
        {
          path: "feature",
          element: <FeatureFilmPage />,
        },
        {
          path: "feature/:id",
          element: <FeatureFilmPage />,
        },
        {
          path: "non-feature",
          element: <NonFeatureFilmPage />,
        },
        {
          path: "non-feature/:id",
          element: <NonFeatureFilmPage />,
        },

      ],
    },
      { path: "*", element: <NotFoundPage /> },
  ]);

  return (
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <Toaster
          position="top-right"
          richColors
          closeButton
          duration={3000}
          expand={true}
        />
        <RouterProvider router={router} />
      </Provider>
    </QueryClientProvider>
  );
}

export default App;
