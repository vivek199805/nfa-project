import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import CustomOtp from "../../component/CustomOtp";
import { useState, useTransition } from "react";
import {
  showErrorToast,
  showSuccessToast,
} from "../../common/services/toastService";
import { postRequest } from "../../common/services/requestService";

// Zod schema for email validation
const forgotSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

const ForgotPasswordPage = () => {
  const [, startTransition] = useTransition();
  const [showOtp, setShowOtp] = useState(false);
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
    reset,
  } = useForm({
    resolver: zodResolver(forgotSchema),
    mode: "onTouched",
  });

  const onSubmit = (data) => {
    startTransition(async () => {
      // Simulate an async API call (use your actual API here)
      const res = await postRequest("user/forgot-password", data);
      if (res.statusCode == 200) {
        setShowOtp(true);
        showSuccessToast(res.message);
      } else {
        showErrorToast(res.message);
      }
    });
  };

  const handleOtpSubmit = async (otp) => {
    const credentials = {
      email: getValues().email,
      otp,
    };

    const res = await postRequest("user/verify-otp", credentials);
    if (res?.statusCode == 200) {
      showSuccessToast(res.message);
      reset({
        email: "",
      });
      setShowOtp(false);
      // Redirect to the next step (e.g., password reset)
      navigate("/reset-password");
    } else {
      showErrorToast(res.message);
    }
  };

  const handleResend = () => {
    startTransition(async () => {
      // Simulate an async API call (use your actual API here)
      const res = await postRequest("user/reset-password", getValues());
      if (res.statusCode == 200) {
        showSuccessToast(res.message);
      } else {
        showErrorToast(res.message);
      }
    });
  };

  return (
    <div className="form-container p-5">
      <div className="col-md-8 mx-auto">
        <div className="top-logo d-flex justify-content-between mb-3">
          <a href="#">
            <img src="/images/nfa-logo.png" alt="NFA" />
          </a>
          <a href="#">
            <img src="/images/mib.png" alt="MIB" />
          </a>
        </div>

        {!showOtp && (
          <form onSubmit={handleSubmit(onSubmit)} className="w-100 mt-5">
            <h2 className="mb-4">Forgot Password</h2>

            <div className="input-group mb-3">
              <span className="input-group-text">
                <i className="bi bi-envelope"></i>
              </span>
              <input
                type="email"
                className={`form-control ${errors.email ? "is-invalid" : ""}`}
                placeholder="Enter your email"
                {...register("email")}
              />
              {errors.email && (
                <div className="invalid-feedback">{errors.email.message}</div>
              )}
            </div>
            <button type="submit" className="btn btn-common-form w-100">
              Send OTP
            </button>
          </form>
        )}

        {showOtp && (
          <CustomOtp
            otpBoxNormal={false}
            otpLength={4}
            title="Enter Verification Code"
            submitBtnName="Verify OTP"
            submitBtnClass="btn btn-common-form w-100"
            message="Please enter the OTP sent to your register Email address."
            onSubmit={handleOtpSubmit}
            onResend={handleResend}
          />
        )}

        <div className="link text-center mt-2">
          <p>
            Already have an account?{" "}
            <Link to="/" className="signup-link">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
