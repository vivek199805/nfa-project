import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useAuth } from "../../hooks/use-auth";
import PasswordInput, { PasswordField } from "../../component/passwordInput";
import { Link } from "react-router-dom";

// Schema with clear required field messages
const registerSchema = z
  .object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email address"),

    phone: z
      .string()
      .regex(
        /^[6-9]\d{9}$/,
        "Phone number must be 10 digits and start with 6, 7, 8, or 9"
      ),

    address: z.string().min(1, "Address is required"),

    pinCode: z
      .string()
      .regex(
        /^[1-9][0-9]{5}$/,
        "Pincode must be a 6-digit number and not start with 0"
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
      .min(6, "Confirm password must be at least 6 characters"),

    category: z.string().min(1, "Category is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

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
    formState: { errors },
  } = registerForm;

  const onSubmit = (data) => {
    console.log("Login data", data);
    registerMutation.mutate(data);
  };

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

        <form onSubmit={handleSubmit(onSubmit)} className="w-100 mt-5">
          <h2 className="mb-4">Sign Up</h2>

          {/* Form Fields */}
          {[
            { label: "First Name", name: "firstName" },
            { label: "Last Name", name: "lastName" },
            { label: "Email", name: "email", type: "email" },
            { label: "Phone", name: "phone" },
            { label: "Address", name: "address" },
            { label: "Pin Code", name: "pinCode" },
            { label: "Aadhar Number", name: "aadharNumber" },
          ].map((field) => (
            <div className="mb-3" key={field.name}>
              <input
                type={field.type || "text"}
                placeholder={field.label}
                className={`form-control ${
                  errors[field.name] ? "is-invalid" : ""
                }`}
                {...register(field.name)}
              />
              {errors[field.name] && (
                <div className="invalid-feedback">
                  {errors[field.name].message}
                </div>
              )}
            </div>
          ))}

          {/* Category Dropdown */}
          <div className="mb-3">
            <select
              className={`form-select ${errors.category ? "is-invalid" : ""}`}
              {...register("category")}
            >
              <option value="">Select Category</option>
              <option value="1">Producer/Production Company</option>
              <option value="2">Publisher</option>
            </select>
            {errors.category && (
              <div className="invalid-feedback">{errors.category.message}</div>
            )}
          </div>

          {/* Password */}
          {/* <div className="mb-3">
            <input
              type="password"
              placeholder="Password"
              className={`form-control ${errors.password ? "is-invalid" : ""}`}
              {...register("password")}
            />
            {errors.password && (
              <div className="invalid-feedback">{errors.password.message}</div>
            )}
          </div> */}

          {/* <PasswordInput
            name="password"
            register={register}
            error={errors.password}
            placeholder="Password"
          /> */}
          <PasswordField
          control={registerForm.control}
            name="password"
            username="johndoe" // to validate against
            showValidationBox={true}
          />

          {/* Confirm Password */}
          {/* <PasswordInput
            name="confirmPassword"
            register={register}
            error={errors.confirmPassword}
            placeholder="confirm Password"
          /> */}
          <PasswordField
            control={registerForm.control}
            name="confirmPassword"
             placeholder="Enter Confirm Password"
            username="johndoe" // to validate against
            showValidationBox={false}
          />

          {/* Submit */}
          <button type="submit" className="btn btn-common-form w-100">
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
