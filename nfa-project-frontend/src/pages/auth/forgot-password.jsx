import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import CustomOtp from "../../features/components/shared/CustomOtp";
import { useState } from "react";
import {
  showErrorToast,
  showSuccessToast,
} from "../../services/toastService";
import { useMutation } from "@tanstack/react-query";
import { authService } from "../../services/authService";

const forgotSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

const ForgotPasswordPage = () => {
  const [showOtp, setShowOtp] = useState(false);
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm({
    resolver: zodResolver(forgotSchema),
    mode: "onTouched",
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: authService.forgotPassword,
    onSuccess: (res) => {
      if (res.statusCode == 200) {
        setShowOtp(true);
        showSuccessToast(res.message);
      } else {
        showErrorToast(res.message);
      }
    },
    onError: (error) => showErrorToast(error.message),
  });

  const verifyOtpMutation = useMutation({
    mutationFn: authService.verifyOtp,
    onSuccess: (res) => {
      if (res?.statusCode == 200) {
        showSuccessToast(res?.message);
        setShowOtp(false);
        navigate("/reset-password", { state: { email: getValues().email } });
      } else {
        showErrorToast(res?.message);
      }
    },
    onError: (error) => showErrorToast(error.message),
  });

  const resendOtpMutation = useMutation({
    mutationFn: authService.resendOtp,
    onSuccess: (res) => {
      if (res.statusCode == 200) {
        showSuccessToast(res.message);
      } else {
        showErrorToast(res.message);
      }
    },
    onError: (error) => showErrorToast(error.message),
  });

  const onSubmit = (data) => {
    forgotPasswordMutation.mutate(data);
  };

  const handleOtpSubmit = async (otp) => {
    verifyOtpMutation.mutate({
      email: getValues().email,
      otp,
    });
  };

  const handleResend = () => {
    resendOtpMutation.mutate(getValues());
  };

  return (
    <div className="form-container auth-form-container auth-pane-left p-4 p-md-5">
      <div className="auth-form-inner mx-auto">
        <div className="top-logo top-logo-auth d-flex align-items-center gap-3 mb-4">
          <div>
            <img src="/images/nfa-logo.png" alt="NFA" />
          </div>
          <div>
            <img src="/images/mib.png" alt="MIB" />
          </div>
        </div>

        {!showOtp && (
          <form onSubmit={handleSubmit(onSubmit)} className="w-100 auth-form">
            <div className="auth-heading mb-4">
              <h2 className="mb-1">Forgot Password</h2>
              <p className="mb-0">
                Enter your registered email to receive OTP.
              </p>
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
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? "email-error" : undefined}
                  {...register("email")}
                />
              </div>
              {errors.email && (
                <div id="email-error" className="invalid-feedback auth-error">
                  {errors.email.message}
                </div>
              )}
            </div>
            <button
              type="submit"
              className="btn btn-common-form auth-submit-btn w-100"
              disabled={forgotPasswordMutation.isPending}
            >
              {forgotPasswordMutation.isPending ? "Sending..." : "Send OTP"}
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
              submitBtnName={
                verifyOtpMutation.isPending ? "Verifying..." : "Verify OTP"
              }
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
