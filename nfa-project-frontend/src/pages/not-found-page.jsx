import { Link } from "react-router-dom";

const NotFoundPage = () => {
  return (
    <div className="form-container p-5" style={{height: "100vh", margin: "0"}}>
      <div className="text-center mt-5">
        <h1 className="display-4">404 - Page Not Found</h1>
        <p className="lead">
          Sorry, the page you are looking for doesn't exist.
        </p>
        <Link to="/" className="btn btn-primary">
          Go to Login
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
