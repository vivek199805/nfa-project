import { Outlet } from "react-router-dom";
import { AuthProvider } from "../../hooks/use-auth";

const AppLayout = () => {
  return (
       <AuthProvider>
        <div className="formBG">
            <Outlet />
        </div>
       </AuthProvider> 


  );
};

export default AppLayout;