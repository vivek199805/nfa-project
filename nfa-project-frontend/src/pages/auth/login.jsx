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
import { postRequest } from "../../common/services/requestService";

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
  // useEffect(() =>{
  //   localStorage.clear();
  // }, [])

  const loginForm = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
    mode: "onTouched", // Shows error when field is touched and left empty
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = loginForm;

  const onSubmit = (data) => {
    console.log("Login data", data);
    let payload = {
      email: data.username,
      password: data.password,
    };
    loginMutation.mutate(payload);
  };

  const handleVerifyEmail = async () => {
    const currentValues = getValues();
    const credentials = {
      email: currentValues?.username,
      password: "",
    };
    const res = await postRequest("user/verify-email", credentials);
    if (res?.statusCode == 200) {
      setIsVerify(true);
      showSuccessToast(res?.message);
    } else {
      showErrorToast(res?.message);
    }
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

          {/* Username Field */}
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
                onBlur: (e) => handleVerifyEmail(e.target.value),
              })}
            />
            {errors.username && (
              <div className="invalid-feedback auth-error">
                {errors.username.message}
              </div>
            )}
          </div>
          {/* {!isVerify && (
            <div className="d-flex align-item-center justify-content-end">
              <button type="button" className="btn btn-primary w-10 mb-2"
                onClick={handleVerifyEmail}
              >
                Verify Email
              </button>
            </div>
          )} */}

          {/* Password Field */}
          {/* <div className="input-group mb-3">
            <span className="input-group-text">
              <i className="bi bi-unlock"></i>
            </span>
            <input
              type="password"
              className={`form-control ${errors.password ? "is-invalid" : ""}`}
              placeholder="*******"
              {...register("password")}
            />
            {errors.password && (
              <div className="invalid-feedback">{errors.password.message}</div>
            )}
          </div> */}

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
            disabled={!isVerify}
          >
            Login
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
