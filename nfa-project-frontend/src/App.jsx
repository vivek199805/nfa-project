import React, { Suspense, lazy } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import AppLayout from "./features/components/layout/AppLayout";
import Loader from "./features/components/shared/Loader";

/**
 * lazy() enables code splitting by dynamically importing components only when needed.
 * This reduces the initial bundle size and improves app performance by loading
 * route components on-demand. Each component is wrapped with Suspense and Loader
 * to show a loading state during the import.
 */
const AuthPage = lazy(() => import("./pages/auth/auth"));
const LoginPage = lazy(() => import("./pages/auth/login"));
const SignupPage = lazy(() => import("./pages/auth/signUp"));
const ForgotPasswordPage = lazy(() => import("./pages/auth/forgot-password"));
const DashboardPage = lazy(() => import("./pages/dashboard"));
const FeatureFilmPage = lazy(() => import("./pages/feature-film"));
const NonFeatureFilmPage = lazy(() => import("./pages/non-feature-film"));
const ChangePasswordPage = lazy(() => import("./pages/auth/change-password"));
const ResetPasswordPage = lazy(() => import("./pages/auth/reset-password"));
const NotFoundPage = lazy(() => import("./pages/not-found-page"));
const ErrorPage = lazy(() => import("./pages/error-page"));
const FilmSubmissionView = lazy(() => import("./component/feature-component/FilmSubmissionView"));
const BestBookPage = lazy(() => import("./pages/best-book"));
const BestFilmCriticPage = lazy(() => import("./pages/best-filmCritic"));

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
      {/**
       * Suspense is a React component that allows you to handle asynchronous operations gracefully.
       * It wraps components that may suspend (i.e., lazy-loaded components) and displays a fallback UI
       * (in this case, <Loader />) while those components are being loaded.
       * When all suspended components finish loading, Suspense automatically renders the actual components.
       * This improves UX by showing a loading indicator instead of a blank screen during code splitting.
       */}
      <Suspense fallback={<Loader />}>
        <RouterProvider router={router} />
      </Suspense>
    </>
  );
}

export default App;
