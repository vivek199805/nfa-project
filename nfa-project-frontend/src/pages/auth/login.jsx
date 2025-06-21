import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useAuth } from "../../hooks/use-auth";
import PasswordInput from "../../component/passwordInput";
import { Link } from "react-router-dom";
import { useState } from "react";
import { showErrorToast, showSuccessToast } from "../../common/services/toastService";
import { postRequest } from "../../common/services/requestService";

// Schema with clear required field messages
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
    getValues 
  } = loginForm;

  const onSubmit = (data) => {
    console.log("Login data", data);
    loginMutation.mutate(data);
  };

  const handleVerifyEmail = async () => {
      const currentValues = getValues();
    console.log("Verify email", currentValues);
    const credentials = {
      email: currentValues?.username,
      password: ''
    }
    const res = await postRequest("user/verify-email", credentials);
    if (res.statusCode == 200) {
      setIsVerify(true);
      showSuccessToast(res.message);
    } else {
      showErrorToast(res.message)
    }

  }

  return (
    <div className="form-container p-5">
      <div className="col-md-10 mx-auto">
        <div className="top-logo d-flex justify-content-between mb-3">
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

        <form onSubmit={handleSubmit(onSubmit)} className="w-100 mt-5">
          <h2 className="mb-4">Sign in</h2>

          {/* Username Field */}
          <div className="input-group mb-3">
            <span className="input-group-text">
              <i className="bi bi-person"></i>
            </span>
            <input
              type="text"
              className={`form-control ${errors.username ? "is-invalid" : ""}`}
              placeholder="Username"
              {...register("username")}
            />
            {errors.username && (
              <div className="invalid-feedback">{errors.username.message}</div>
            )}
          </div>
          {!isVerify && (
            <div className="d-flex align-item-center justify-content-end">
              <button type="button" className="btn btn-primary w-10 mb-2"
                onClick={handleVerifyEmail}
              >
                Verify Email
              </button>
            </div>
          )}


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

          <PasswordInput
            name="password"
            register={register}
            error={errors.password}
            placeholder="*******"
          />

          <div className="form-group text-end mb-3">
            <Link to="/forgot-password">Forgot Password?</Link>

          </div>

          <button type="submit" className="btn btn-common-form w-100" disabled={!isVerify}>
            Login
          </button>

          <div className="link text-center mt-2">
            <p>
              Don't have an account?{" "}
              <Link to="/signup" className="signup-link">Sign up</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
