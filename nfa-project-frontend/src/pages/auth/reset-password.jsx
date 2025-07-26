
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { postRequest } from "../../common/services/requestService";
import {
  showErrorToast,
  showSuccessToast,
} from "../../common/services/toastService";
import { PasswordField } from "../../component/passwordInput";
import { useTransition } from "react";

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
  const [isPending, startTransition] = useTransition();
  // const { token } = useParams();
  const navigate = useNavigate();
    const [searchParams] = useSearchParams();
  const token = searchParams.get("token"); // ✅ Get ?token=XYZ

  const {
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
    // watch,
  } = useForm({
    resolver: zodResolver(passwordSchema),
  });

  console.log("token", token);
  

  const username = "vivek"; // You can replace this with user info if available
  //   const newPassword = watch("newPassword");

  const onSubmit = (formData) => {
    startTransition(async () => {
      try {
        const payload = {
          // token,
          password: formData.newPassword,
        };

        const res = await postRequest("user/reset-password", payload);

        if (res?.statusCode === 200) {
          showSuccessToast(res.message || "Password reset successfully");
          reset();
          navigate("/");
        } else {
          showErrorToast(res.message || "Reset failed");
        }
      } catch (err) {
        showErrorToast(err.message || "Something went wrong");
      }
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
          <h3 className="text-center mb-4">Reset Your Password</h3>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-3">
              <label className="form-label">New Password</label>
              <PasswordField
                control={control}
                name="newPassword"
                placeholder="Enter new password"
                showValidationBox={true}
                username={username}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Confirm Password</label>
              <PasswordField
                control={control}
                name="confirmPassword"
                placeholder="Confirm password"
                showValidationBox={false}
                username={username}
              />
              {errors.confirmPassword && (
                <div className="text-danger small mt-1">
                  {errors.confirmPassword.message}
                </div>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={isSubmitting}
            >
              {isSubmitting || isPending ? "Resetting..." : "Reset Password"}
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
