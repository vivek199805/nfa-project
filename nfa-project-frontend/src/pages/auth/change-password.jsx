import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  showErrorToast,
  showSuccessToast,
} from "../../common/services/toastService";
import "../../styles/change-password.css"; // custom CSS (see below)
import { Link } from "react-router-dom";
import { PasswordField } from "../../component/passwordInput";
import { useTransition } from "react";
import { postRequest } from "../../common/services/requestService";

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
  const [isPending, startTransition] = useTransition();
  const {
    control,
    handleSubmit,
    // register,
    formState: {
      // errors,
      isSubmitting,
    },
    reset,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (data) => {
    startTransition(() => {
      (async () => {
        const payload = {
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        };

        try {
          const res = await postRequest("user/change-password", payload);

          if (res?.statusCode === 200) {
            showSuccessToast(res.message || "Password updated successfully");
            reset();
          } else {
            showErrorToast(res?.message || "Something went wrong");
          }
        } catch (error) {
          showErrorToast(error.message || "Failed to update password");
        }
      })();
    });
  };

  return (
    <>
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
          <h3 className="mb-4 text-center">Change Password</h3>

          <form onSubmit={handleSubmit(onSubmit)}>
            {/* ✅ Current Password */}
            <div className="mb-3">
              <label className="form-label">Current Password</label>
              <PasswordField
                control={control}
                name="currentPassword"
                placeholder="Enter Current password"
                showValidationBox={true}
                username={"user122"} // Replace with actual user ID if needed
              />
            </div>

            {/* ✅ New Password with custom password field */}
            <div className="mb-3">
              <label className="form-label">New Password</label>
              <PasswordField
                control={control}
                name="newPassword"
                placeholder="Enter new password"
                showValidationBox={true}
                username={"user123"} // Replace with actual user ID if needed
              />
            </div>

            {/* ✅ Confirm Password */}
            <div className="mb-3">
              <label className="form-label">Confirm Password</label>
              <PasswordField
                control={control}
                name="confirmPassword"
                placeholder="Enter confirm password"
                showValidationBox={true}
                username={"user1234"} // Replace with actual user ID if needed
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={isSubmitting}
            >
              {isSubmitting || isPending ? "Updating..." : "Change Password"}
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
