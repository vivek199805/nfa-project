
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/use-auth";

export default function Navbar() {
  const { logoutMutation } = useAuth();
  const navigate = useNavigate();

  return (
    <>
      <div className="form-container app-navbar">
        <div className="mx-auto app-navbar-inner">
          <div className="top-logo d-flex justify-content-between">
            <a href="#">
              <img src="/images/nfa-logo.png" alt="NFA Logo" />
            </a>
            <a href="#">
              <img src="/images/mib.png" alt="MIB Logo" />
            </a>
          </div>

          <div className="mt-2 d-flex justify-content-end app-navbar-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => navigate("/dashboard")}
            >
              DASHBOARD
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => logoutMutation.mutate()}
            >
              LOG OUT
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
