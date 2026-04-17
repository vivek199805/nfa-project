// Previous implementation retained for reference.
/*
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "sonner";
import { QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "react-redux";
...
return (
  <QueryClientProvider client={queryClient}>
    <Provider store={store}>
      <Toaster ... />
      <Loader />
      <RouterProvider router={router} />
    </Provider>
  </QueryClientProvider>
);
*/

import { createBrowserRouter, RouterProvider } from "react-router-dom";
import AuthPage from "./pages/auth/auth";
import AppLayout from "./component/layouts/layout";
import LoginPage from "./pages/auth/login";
import SignupPage from "./pages/auth/signUp";
import ForgotPasswordPage from "./pages/auth/forgot-password";
import DashboardPage from "./pages/dashboard";
import FeatureFilmPage from "./pages/feature-film";
import NonFeatureFilmPage from "./pages/non-feature-film";
import ChangePasswordPage from "./pages/auth/change-password";
import ResetPasswordPage from "./pages/auth/reset-password";
import NotFoundPage from "./pages/not-found-page";
import ErrorPage from "./pages/error-page";
import Loader from "./component/loader-component";
import FilmSubmissionView from "./component/feature-component/FilmSubmissionView";
import BestBookPage from "./pages/best-book";
import BestFilmCriticPage from "./pages/best-filmCritic";

export function App() {
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
            { path: "/", element: <LoginPage /> },
            { path: "signup", element: <SignupPage /> },
            { path: "forgot-password", element: <ForgotPasswordPage /> },
            { path: "change-password", element: <ChangePasswordPage /> },
            { path: "reset-password", element: <ResetPasswordPage /> },
          ],
        },
        { path: "dashboard", element: <DashboardPage /> },
        { path: "feature", element: <FeatureFilmPage /> },
        { path: "feature/:id", element: <FeatureFilmPage /> },
        { path: "non-feature", element: <NonFeatureFilmPage /> },
        { path: "non-feature/:id", element: <NonFeatureFilmPage /> },
        {
          path: "feature",
          children: [
            { path: "", element: <FeatureFilmPage /> },
            { path: ":id", element: <FeatureFilmPage /> },
            { path: "view/:id", element: <FilmSubmissionView /> },
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
            { path: "", element: <BestBookPage /> },
            { path: ":id", element: <BestBookPage /> },
            { path: "view/:id", element: <FilmSubmissionView /> },
          ],
        },
        {
          path: "film-critic",
          children: [
            { path: "", element: <BestFilmCriticPage /> },
            { path: ":id", element: <BestFilmCriticPage /> },
            { path: "view/:id", element: <FilmSubmissionView /> },
          ],
        },
      ],
    },
    { path: "*", element: <NotFoundPage /> },
  ]);

  return (
    <>
      <Loader />
      <RouterProvider router={router} />
    </>
  );
}

export default App;


