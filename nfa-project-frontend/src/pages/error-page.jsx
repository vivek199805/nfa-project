
import { useRouteError, isRouteErrorResponse } from "react-router-dom";

const ErrorPage = () => {
  const error = useRouteError();

  let title = "Unexpected Error";
  let message = "Something went wrong.";

  if (isRouteErrorResponse(error)) {
    title = `${error.status} - ${error.statusText}`;
    message = error.data?.message || error.data || message;
  }

  return (
    <div className="container text-center mt-5">
      <h1 className="display-3 text-danger">{title}</h1>
      <p className="lead">{message}</p>
      <a href="/" className="btn btn-primary mt-4">
        Go to Login
      </a>
    </div>
  );
};

export default ErrorPage;
