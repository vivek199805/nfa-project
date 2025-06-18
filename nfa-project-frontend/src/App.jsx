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
import Loader from "./component/loader-component";
import FilmSubmissionView from "./component/feature-component/FilmSubmissionView";

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <AppLayout />,
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
          ],
        },
        {
          path: "dashboard",
          element: <DashboardPage />,
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
      ],
    },
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
