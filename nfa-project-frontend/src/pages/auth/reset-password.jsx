import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import {
  showErrorToast,
  showSuccessToast,
} from "../../services/toastService";
import { PasswordField } from "../../features/components/shared/PasswordInput";
import { useMutation } from "@tanstack/react-query";
import { authService } from "../../services/authService";

const passwordSchema = z
  .object({
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { email } = location.state || {};

  const {
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(passwordSchema),
  });

  const resetPasswordMutation = useMutation({
    mutationFn: authService.resetPassword,
    onSuccess: (res) => {
      if (res?.statusCode === 200) {
        showSuccessToast(res.message || "Password reset successfully");
        reset();
        navigate("/");
      } else {
        showErrorToast(res.message || "Reset failed");
      }
    },
    onError: (error) => showErrorToast(error.message || "Something went wrong"),
  });

  useEffect(() => {
    if (!email) {
      showErrorToast("Please verify your email before resetting password");
      navigate("/forgot-password", { replace: true });
    }
  }, [email, navigate]);

  const username = email || "";

  const onSubmit = (formData) => {
    if (!email) {
      return;
    }

    resetPasswordMutation.mutate({
      email,
      password: formData.newPassword,
    });
  };

  return (
    <>
      <div className="form-container p-5">
        <div className="col-md-8 mx-auto">
          <div className="top-logo d-flex justify-content-between mb-3">
            <div>
              <img src="/images/nfa-logo.png" alt="NFA" />
            </div>
            <div>
              <img src="/images/mib.png" alt="MIB" />
            </div>
          </div>
          <h3 className="text-center mb-4">Reset Your Password</h3>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-3">
              <label className="form-label" htmlFor="newPassword">
                New Password
              </label>
              <PasswordField
                control={control}
                id="newPassword"
                name="newPassword"
                placeholder="Enter new password"
                showValidationBox={true}
                username={username}
              />
            </div>

            <div className="mb-3">
              <label className="form-label" htmlFor="confirmPassword">
                Confirm Password
              </label>
              <PasswordField
                control={control}
                id="confirmPassword"
                name="confirmPassword"
                placeholder="Confirm password"
                showValidationBox={false}
                username={username}
                describedBy={
                  errors.confirmPassword ? "confirmPassword-error" : undefined
                }
              />
              {errors.confirmPassword && (
                <div
                  id="confirmPassword-error"
                  className="text-danger small mt-1"
                >
                  {errors.confirmPassword.message}
                </div>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={isSubmitting || resetPasswordMutation.isPending}
            >
              {isSubmitting || resetPasswordMutation.isPending
                ? "Resetting..."
                : "Reset Password"}
            </button>
          </form>

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
    </>
  );
};

export default ResetPasswordPage;
