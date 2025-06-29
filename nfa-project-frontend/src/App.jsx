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
import Loader from "./component/loader-component";
import FilmSubmissionView from "./component/feature-component/FilmSubmissionView";
import BestBookPage from "./pages/best-book";
import BestFilmCriticPage from "./pages/best-filmCritic";

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

        {
          path: "feature",
          children: [
            { path: "", element: <FeatureFilmPage /> }, // /feature
            { path: ":id", element: <FeatureFilmPage /> }, // /feature/9
            { path: "view/:id", element: <FilmSubmissionView /> }, // /feature/view/9
          ],
        },

        {
          path: "non-feature",
          children: [
            { path: "", element: <NonFeatureFilmPage /> },
            { path: ":id", element: <NonFeatureFilmPage /> },
          ],
        },

        {
          path: "best-book",
          children: [
            { path: "", element: <BestBookPage /> }, // /feature
            { path: ":id", element: <BestBookPage /> }, // /feature/9
            { path: "view/:id", element: <FilmSubmissionView /> }, // /feature/view/9
          ],
        },
        {
          path: "film-critic",
          children: [
            { path: "", element: <BestFilmCriticPage /> }, // /feature
            { path: ":id", element: <BestFilmCriticPage /> }, // /feature/9
            { path: "view/:id", element: <FilmSubmissionView /> }, // /feature/view/9
          ],
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
        <Loader />
        <RouterProvider router={router} />
      </Provider>
    </QueryClientProvider>
  );
}

export default App;
