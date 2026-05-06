import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { showErrorToast, showSuccessToast, } from "../../services/toastService";
import "../../styles/change-password.css";
import { Link } from "react-router-dom";
import { PasswordField } from "../../features/components/shared/PasswordInput";
import { useMutation } from "@tanstack/react-query";
import { authService } from "../../services/authService";

const schema = z
  .object({
    currentPassword: z.string().min(6, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters")
      .max(16, "Must be at most 16 characters")
      .regex(/[A-Z]/, "Must contain uppercase")
      .regex(/[a-z]/, "Must contain lowercase")
      .regex(/[0-9]/, "Must contain number")
      .regex(/[!@#$%^&*(),.?":{}|<>]/, "Must contain special character"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export default function ChangePasswordPage() {
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: authService.changePassword,
    onSuccess: (res) => {
      if (res?.statusCode == 200) {
        showSuccessToast(res?.message || "Password updated successfully");
        reset();
      } else {
        showErrorToast(res?.message || "Something went wrong");
      }
    },
    onError: (error) =>
      showErrorToast(error.message || "Failed to update password"),
  });

  const onSubmit = (data) => {
    changePasswordMutation.mutate({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    });
  };

  return (
    <>
      <div className="form-container auth-form-container auth-pane-left p-4 p-md-5">
        <div className="auth-form-inner mx-auto">
          <div className="top-logo d-flex justify-content-between mb-3">
            <div>
              <img src="/images/nfa-logo.png" alt="NFA" />
            </div>
            <div>
              <img src="/images/mib.png" alt="MIB" />
            </div>
          </div>
          <h3 className="mb-4 text-center">Change Password</h3>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-3">
              <label className="form-label" htmlFor="currentPassword">
                Current Password
              </label>
              <PasswordField
                control={control}
                id="currentPassword"
                name="currentPassword"
                placeholder="Enter Current password"
                showValidationBox={true}
                username={"user122"}
              />
            </div>

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
                username={"user123"}
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
                placeholder="Enter confirm password"
                showValidationBox={true}
                username={"user1234"}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={isSubmitting || changePasswordMutation.isPending}
            >
              {isSubmitting || changePasswordMutation.isPending
                ? "Updating..."
                : "Change Password"}
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
}
