import { Outlet } from "react-router-dom";
import { AuthProvider } from "../../hooks/use-auth";
import NavigateSetter from "../NavigateSetter";

const AppLayout = () => {
  return (
       <AuthProvider>
         <NavigateSetter />
        <div className="formBG">
            <Outlet />
        </div>
       </AuthProvider> 


  );
};

export default AppLayout;