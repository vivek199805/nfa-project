import { Outlet, useLocation } from "react-router-dom";
import { AuthProvider } from "../../hooks/use-auth";
import NavigateSetter from "../NavigateSetter";

const AppLayout = () => {
  const { pathname } = useLocation();

  const authRoutes = new Set([
    "/",
    "/signup",
    "/forgot-password",
    "/change-password",
    "/reset-password",
  ]);

  const isAuthRoute = authRoutes.has(pathname);

  return (
    <AuthProvider>
      <NavigateSetter />
      <div className={isAuthRoute ? "formBG" : "appBG"}>
        <div className={`layout-content ${isAuthRoute ? "auth-content" : "app-content"}`}>
          <Outlet />
        </div>
      </div>
    </AuthProvider>
  );
};

export default AppLayout;
