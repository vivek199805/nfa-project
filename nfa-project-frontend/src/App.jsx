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

/**
 * Configures the application's routing using React Router's createBrowserRouter.
 * This router defines nested routes for authentication, dashboard, and various film-related pages.
 * 
 * Key routes include:
 * - Root path "/" renders AppLayout with nested auth pages (login, signup, etc.) as defaults.
 * - "/dashboard" for the main dashboard.
 * - "/feature" with index route for listing features, dynamic ":id" for specific features, and "view/:id" for submissions.
 * - "/non-feature" for non-feature films with index and ":id" routes.
 * - "/best-book" and "/film-critic" with similar structures including index, ":id", and "view/:id".
 * - "*" catches all unmatched paths with NotFoundPage.
 * 
 * The `index: true` property in child routes specifies the default component to render when the parent's path is matched exactly,
 * without any additional path segments. For example, in "/feature", the index route renders FeatureFilmPage as the default view,
 * while "/feature/:id" renders it with a specific ID, and "/feature/view/:id" shows the submission view.
 * This allows for a clean separation of list views (index) and detail views (with params).
 */
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
          { index: true, element: <LoginPage /> },
          { path: "signup", element: <SignupPage /> },
          { path: "forgot-password", element: <ForgotPasswordPage /> },
          { path: "change-password", element: <ChangePasswordPage /> },
          { path: "reset-password", element: <ResetPasswordPage /> },
        ],
      },
      { path: "dashboard", element: <DashboardPage /> },
      {
        path: "feature",
        children: [
          { index: true, element: <FeatureFilmPage /> },
          { path: ":id", element: <FeatureFilmPage /> },
          { path: "view/:id", element: <FilmSubmissionView /> },
        ],
      },
      {
        path: "non-feature",
        children: [
          { index: true, element: <NonFeatureFilmPage /> },
          { path: ":id", element: <NonFeatureFilmPage /> },
        ],
      },
      {
        path: "best-book",
        children: [
          { index: true, element: <BestBookPage /> },
          { path: ":id", element: <BestBookPage /> },
          { path: "view/:id", element: <FilmSubmissionView /> },
        ],
      },
      {
        path: "film-critic",
        children: [
          { index: true, element: <BestFilmCriticPage /> },
          { path: ":id", element: <BestFilmCriticPage /> },
          { path: "view/:id", element: <FilmSubmissionView /> },
        ],
      },
    ],
  },
  { path: "*", element: <NotFoundPage /> },
]);

export function App() {
  return (
    <>
      <Loader />
      <RouterProvider router={router} />
    </>
  );
}

export default App;


