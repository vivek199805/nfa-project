import { useNavigate, useParams } from "react-router-dom";
import { postRequest } from "../../services/requestService";
import { showErrorToast, showSuccessToast, } from "../../services/toastService";
import { startRazorpayPayment } from "../../services/paymentService";
import { useAuth } from "../../hooks/use-auth";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../lib/queryClient";
import { useFetchById } from "../../hooks/useFetchById";
import { useState } from "react";
import {
  filmFinalSubmitEndpoint,
  getFilmEntryByEndpoint,
  getFilmPaymentDescription,
  getFilmPaymentFormType,
  getFilmPreviousSection,
} from "../../common/film-workflow";

const PaymentSection = ({ setActiveSection, filmType }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isPaying, setIsPaying] = useState(false);
  const endpoint = getFilmEntryByEndpoint(filmType);
  const { data: entryData } = useFetchById(endpoint, id);

  const onPayment = async () => {
    if (String(entryData?.data?.payment_status) === "2" || isPaying) {
      return;
    }

    try {
      setIsPaying(true);
      const result = await startRazorpayPayment({
        entryId: id,
        formType: getFilmPaymentFormType(filmType),
        customer: {
          name: user?.name,
          email: user?.email,
          contact: user?.phone,
        },
        description: getFilmPaymentDescription(filmType),
      });

      showSuccessToast(result?.verificationResponse?.message || "Payment completed successfully",);
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.entry.byId(endpoint, id),
        }),
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.entries }),
      ]);
    } catch (error) {
      showErrorToast(error.message || "Payment could not be completed");
    } finally {
      setIsPaying(false);
    }
  };

  const onSubmit = async () => {
    const formData = new FormData();
    formData.append("id", id);
    const response = await postRequest(filmFinalSubmitEndpoint, formData);
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
          disabled={isPaying || String(entryData?.data?.payment_status) === "2"}
        >
          {String(entryData?.data?.payment_status) === "2"
            ? "Payment Completed"
            : isPaying
              ? "Processing Payment..."
              : "Pay with Build Desk"}
        </button>
      </div>
      <div className="d-flex justify-content-between">
        <button
          type="button"
          className="btn btn-primary"
          onClick={() =>
            setActiveSection(getFilmPreviousSection(filmType, "payment"))
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
