import { useNavigate, useParams } from "react-router-dom";
import { postRequest } from "../../common/services/requestService";
import { showErrorToast, showSuccessToast } from "../../common/services/toastService";

const PaymentSection = ({ setActiveSection, filmType }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const onPayment = async () => {
    // payment logic here
    const formData = new FormData();
    formData.append("form_type", filmType == "feature" ? "FEATURE" : "NON_FEATURE");
    formData.append("id", id);
    const response = await postRequest("generate-hash", formData);
    if (response?.statusCode == 200) {
      showSuccessToast(response?.message);
    }else{
      showErrorToast(response?.message);
    }
  };

  const onSubmit = async () => {
    const formData = new FormData();
    formData.append("id", id);
    const response = await postRequest("film/final-submit", formData);
    if (response.statusCode == 200) {
      showSuccessToast(response.message);
      navigate("/dashboard");
    }
  };
  return (
    <>
      <div className="col-12 text-center mt-3">
        <button
          type="button"
          className="btn btn-danger"
          onClick={() => onPayment()}
        >
          Pay with Build Desk
        </button>
      </div>
      <div className="d-flex justify-content-between">
        <button
          type="button"
          className="btn btn-primary"
          onClick={() =>
            filmType == "feature" ? setActiveSection(11) : setActiveSection(9)
          }
        >
          <i className="bi bi-arrow-left me-2"></i>
          Back to Prev
        </button>
        <button type="submit" className="btn btn-primary" onClick={onSubmit}>
          Finish <i className="bi bi-arrow-right ms-2"></i>
        </button>
      </div>
    </>
  );
};

export default PaymentSection;
