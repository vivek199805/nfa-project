// Previous implementation retained in git history; this file now uses enterprise service/query architecture.
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useAuth } from "../../hooks/use-auth";
import PasswordInput from "../../component/passwordInput";
import { Link } from "react-router-dom";
import { useState } from "react";
import {
  showErrorToast,
  showSuccessToast,
} from "../../common/services/toastService";
import { useMutation } from "@tanstack/react-query";
import { authService } from "../../services/authService";

const loginSchema = z.object({
  username: z
    .string({ required_error: "Username is required" })
    .min(3, "Username must be at least 3 characters"),
  password: z
    .string({ required_error: "Password is required" })
    .min(6, "Password must be at least 6 characters"),
});

const LoginPage = () => {
  const { loginMutation } = useAuth();
  const [isVerify, setIsVerify] = useState(false);

  const verifyEmailMutation = useMutation({
    mutationFn: authService.verifyEmail,
    onSuccess: (res) => {
      if (res?.statusCode == 200) {
        setIsVerify(true);
        showSuccessToast(res?.message);
      } else {
        showErrorToast(res?.message || "Email verification failed");
      }
    },
    onError: (error) => {
      showErrorToast(error?.message || "Email verification failed");
    },
  });

  const loginForm = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
    mode: "onTouched",
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = loginForm;

  const onSubmit = (data) => {
    const payload = {
      email: data.username,
      password: data.password,
    };
    loginMutation.mutate(payload);
  };

  const handleVerifyEmail = () => {
    const currentValues = getValues();
    verifyEmailMutation.mutate({
      email: currentValues?.username,
      password: "",
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

        <div className="loginfo">
          <i
            className="bi bi-info-circle"
            data-bs-toggle="offcanvas"
            href="#offcanvasExample"
            role="button"
          ></i>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="w-100 auth-form">
          <div className="auth-heading mb-4">
            <h2 className="mb-1">Welcome Back</h2>
            <p className="mb-0">Sign in to continue.</p>
          </div>

          <div className="mb-3">
            <label className="form-label auth-label" htmlFor="username">
              Email / Username
            </label>
            <input
              id="username"
              type="text"
              className={`form-control auth-input ${
                errors.username ? "is-invalid" : ""
              }`}
              placeholder="Username"
              {...register("username", {
                onBlur: () => handleVerifyEmail(),
              })}
            />
            {errors.username && (
              <div className="invalid-feedback auth-error">
                {errors.username.message}
              </div>
            )}
          </div>

          <div className="mb-2">
            <label className="form-label auth-label" htmlFor="password">
              Password
            </label>
            <PasswordInput
              name="password"
              register={register}
              error={errors.password}
              placeholder="*******"
            />
          </div>

          <div className="form-group text-end mb-3">
            <Link to="/forgot-password">Forgot Password?</Link>
          </div>

          <button
            type="submit"
            className="btn btn-common-form auth-submit-btn w-100"
            disabled={!isVerify || loginMutation.isPending}
          >
            {loginMutation.isPending ? "Logging in..." : "Login"}
          </button>

          <div className="link text-center mt-2">
            <p>
              Don't have an account?{" "}
              <Link to="/signup" className="signup-link">
                Sign up
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
