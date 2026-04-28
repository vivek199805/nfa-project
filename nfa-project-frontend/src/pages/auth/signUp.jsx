import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useAuth } from "../../hooks/use-auth";
import { PasswordField } from "../../component/passwordInput";
import { Link } from "react-router-dom";

const registerSchema = z
  .object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email address"),
    phone: z
      .string()
      .regex(
        /^[6-9]\d{9}$/,
        "Phone number must be 10 digits and start with 6, 7, 8, or 9",
      ),
    address: z.string().min(1, "Address is required"),
    pinCode: z
      .string()
      .regex(
        /^[1-9][0-9]{5}$/,
        "Pincode must be a 6-digit number and not start with 0",
      ),
    aadharNumber: z
      .string()
      .regex(/^[0-9]{12}$/, "Aadhar number must be a 12-digit numeric value"),
    password: z
      .string()
      .min(8, "Must be at least 8 characters")
      .max(16, "Must be at most 16 characters")
      .refine((val) => /[A-Z]/.test(val), {
        message: "Must contain at least 1 uppercase letter",
      })
      .refine((val) => /[a-z]/.test(val), {
        message: "Must contain at least 1 lowercase letter",
      })
      .refine((val) => /[0-9]/.test(val), {
        message: "Must contain at least 1 number",
      })
      .refine((val) => /[!@#$%^&*(),.?":{}|<>]/.test(val), {
        message: "Must contain at least 1 special character",
      }),
    confirmPassword: z
      .string()
      .min(8, "Confirm password must be at least 8 characters"),
    category: z.string().min(1, "Category is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

const fields = [
  { label: "First Name", name: "firstName", autoComplete: "given-name" },
  { label: "Last Name", name: "lastName", autoComplete: "family-name" },
  { label: "Email", name: "email", type: "email", autoComplete: "email" },
  { label: "Phone", name: "phone", type: "tel", autoComplete: "tel" },
  { label: "Address", name: "address", autoComplete: "street-address" },
  { label: "Pin Code", name: "pinCode", autoComplete: "postal-code" },
  { label: "Aadhar Number", name: "aadharNumber" },
];

const SignupPage = () => {
  const { registerMutation } = useAuth();

  const registerForm = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      pinCode: "",
      aadharNumber: "",
      category: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onTouched",
  });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = registerForm;

  const emailValue = watch("email");

  const onSubmit = (data) => {
    registerMutation.mutate(data);
  };

  return (
    <div className="form-container auth-form-container auth-pane-left signup-form-container p-4 p-md-5">
      <div className="auth-form-inner mx-auto">
        <div className="top-logo top-logo-auth d-flex align-items-center gap-3 mb-4">
          <a href="#">
            <img src="/images/nfa-logo.png" alt="NFA" />
          </a>
          <a href="#">
            <img src="/images/mib.png" alt="MIB" />
          </a>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="w-100 signup-form auth-form"
        >
          <div className="auth-heading mb-4">
            <h2 className="mb-1">Create Account</h2>
            <p className="mb-0">Fill in your details to register.</p>
          </div>

          {fields.map((field) => (
            <div className="mb-3" key={field.name}>
              <label className="form-label auth-label" htmlFor={field.name}>
                {field.label}
              </label>
              <input
                id={field.name}
                type={field.type || "text"}
                placeholder={field.label}
                autoComplete={field.autoComplete || "off"}
                className={`form-control auth-input ${
                  errors[field.name] ? "is-invalid" : ""
                }`}
                aria-invalid={Boolean(errors[field.name])}
                {...register(field.name)}
              />
              {errors[field.name] && (
                <div className="invalid-feedback auth-error">
                  {errors[field.name].message}
                </div>
              )}
            </div>
          ))}

          <div className="mb-3">
            <label className="form-label auth-label" htmlFor="category">
              Category
            </label>
            <select
              id="category"
              className={`form-select auth-input ${
                errors.category ? "is-invalid" : ""
              }`}
              aria-invalid={Boolean(errors.category)}
              {...register("category")}
            >
              <option value="">Select Category</option>
              <option value="1">Producer/Production Company</option>
              <option value="2">Publisher</option>
            </select>
            {errors.category && (
              <div className="invalid-feedback auth-error">
                {errors.category.message}
              </div>
            )}
          </div>

          <div className="mb-3">
            <label className="form-label auth-label" htmlFor="password">
              Password
            </label>
            <PasswordField
              control={registerForm.control}
              name="password"
              username={emailValue}
              showValidationBox={true}
              validationMode="modal"
            />
          </div>

          <div className="mb-4">
            <label className="form-label auth-label" htmlFor="confirmPassword">
              Confirm Password
            </label>
            <PasswordField
              control={registerForm.control}
              name="confirmPassword"
              placeholder="Enter Confirm Password"
              username={emailValue}
              showValidationBox={false}
            />
          </div>

          <button
            type="submit"
            className="btn btn-common-form auth-submit-btn w-100"
          >
            Register
          </button>

          <div className="link text-center mt-2">
            <p>
              Already have an account?{" "}
              <Link to="/" className="signup-link">
                Login
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignupPage;
