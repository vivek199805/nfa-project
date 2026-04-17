// Previous implementation retained in git history; this file now uses enterprise service/query architecture.
import { useSelector } from "react-redux";
import "../styles/loader.css";

const Loader = () => {
  const loading = useSelector((state) => state.ui?.globalLoader ?? state.loader?.visible ?? false);

  if (!loading) return null;

  return (
    <div className="custom-loader-overlay">
      <div className="spinner-border text-light" role="status" style={{ width: "4rem", height: "4rem" }}>
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );
};

export default Loader;

