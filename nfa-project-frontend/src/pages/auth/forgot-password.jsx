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
    // reset,
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
      showSuccessToast(res?.message);
      // reset({
      //   email: "",
      // });
      setShowOtp(false);
      navigate("/reset-password", { state: { email: getValues().email } });
    } else {
      showErrorToast(res?.message);
    }
  };

  const handleResend = () => {
    startTransition(async () => {
      // Simulate an async API call (use your actual API here)
      const res = await postRequest("user/resend-otp", getValues());
      if (res.statusCode == 200) {
        showSuccessToast(res.message);
      } else {
        showErrorToast(res.message);
      }
    });
  };

  return (
    <div className="form-container auth-form-container auth-pane-left p-4 p-md-5">
      <div className="auth-form-inner mx-auto">
        <div className="top-logo top-logo-auth d-flex align-items-center gap-3 mb-4">
          <a href="#">
            <img src="/images/nfa-logo.png" alt="NFA" />
          </a>
          <a href="#">
            <img src="/images/mib.png" alt="MIB" />
          </a>
        </div>

        {!showOtp && (
          <form onSubmit={handleSubmit(onSubmit)} className="w-100 auth-form">
            <div className="auth-heading mb-4">
              <h2 className="mb-1">Forgot Password</h2>
              <p className="mb-0">Enter your registered email to receive OTP.</p>
            </div>

            <div className="mb-3">
              <label className="form-label auth-label" htmlFor="email">
                Email
              </label>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-envelope"></i>
                </span>
                <input
                  id="email"
                  type="email"
                  className={`form-control auth-input ${
                    errors.email ? "is-invalid" : ""
                  }`}
                  placeholder="Enter your email"
                  {...register("email")}
                />
              </div>
              {errors.email && (
                <div className="invalid-feedback auth-error">
                  {errors.email.message}
                </div>
              )}
            </div>
            <button
              type="submit"
              className="btn btn-common-form auth-submit-btn w-100"
            >
              Send OTP
            </button>
          </form>
        )}

        {showOtp && (
          <div className="w-100 auth-form">
            <div className="auth-heading mb-3">
              <h2 className="mb-1">Verify OTP</h2>
              <p className="mb-0">
                Please enter the OTP sent to your registered email address.
              </p>
            </div>
            <CustomOtp
              otpBoxNormal={false}
              otpLength={4}
              showCloseIcon={false}
              submitBtnName="Verify OTP"
              submitBtnClass="btn btn-common-form auth-submit-btn w-100"
              onSubmit={handleOtpSubmit}
              onResend={handleResend}
            />
          </div>
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
