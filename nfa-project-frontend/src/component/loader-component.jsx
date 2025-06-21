import { useSelector } from "react-redux";
import "../styles/loader.css"; // optional for styling

const Loader = () => {
  const loading = useSelector((state) => state.loader);

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
