import { CheckCircle, XCircle } from "lucide-react";
import { useRef, useState } from "react";
import { Controller } from "react-hook-form";

const PasswordInput = ({ register, error, placeholder = "Password", name }) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePassword = () => setShowPassword((prev) => !prev);

  return (
    <div className="input-group mb-3">
      <span className="input-group-text">
        <i className="bi bi-unlock"></i>
      </span>
      <input
        type={showPassword ? "text" : "password"}
        className={`form-control ${error ? "is-invalid" : ""}`}
        placeholder={placeholder}
        {...register(name)}
      />
      <span
        className="input-group-text"
        onClick={togglePassword}
        style={{ cursor: "pointer" }}
      >
        <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
      </span>
      {error && <div className="invalid-feedback">{error.message}</div>}
    </div>
  );
};

export default PasswordInput;

const PasswordRequirement = ({ valid, text }) => (
  <span className={`d-block ${valid ? "text-success" : "text-danger"}`}>
    {/* <i className={`me-1 far ${valid ? "fa-check-circle" : "fa-times-circle"}`}/> */}
    {valid ? (<CheckCircle className="text-success me-2" size={18} />) : 
    (<XCircle className="text-danger me-2" size={18} />)}
    {text}
  </span>
);

export const PasswordField = ({
  control,
  name,
  placeholder = "Enter password",
  showValidationBox = false,
    username = "",
}) => {
  const [showErrorBox, setShowErrorBox] = useState(false);
  const hideTimeout = useRef(null);
  const [showPassword, setShowPassword] = useState(false);
  const togglePassword = () => setShowPassword((prev) => !prev);
  // const wrapperRef = useRef(null);

  // Hide box on click outside
  // useEffect(() => {
  //   function handleClickOutside(event) {
  //     if (
  //       wrapperRef.current &&
  //       !wrapperRef.current.contains(event.target)
  //     ) {
  //       setShowErrorBox(false);
  //     }
  //   }
  //   document.addEventListener("mousedown", handleClickOutside);
  //   return () => {
  //     document.removeEventListener("mousedown", handleClickOutside);
  //   };
  // }, []);
  return (
    <div className="position-relative d-flex align-items-start">
      <Controller
        control={control}
        name={name}
        render={({ field, fieldState }) => {
          // const validations = validatePassword(getValue(field));
           const password = field.value || "";
          return (
            <>
              <div className="input-group mb-3">
                <span className="input-group-text">
                  <i className="bi bi-unlock"></i>
                </span>
                <input
                  {...field}
                  type={showPassword ? "text" : "password"}
                  placeholder={placeholder}
                  className={`form-control ${fieldState.error ? "is-invalid" : ""}`}
                  onFocus={(e) => {
                    clearTimeout(hideTimeout.current);
                    if (showValidationBox) setShowErrorBox(true);
                    field.onFocus?.(e);
                  }}
                  onBlur={() => {
                    field.onBlur?.();
                    hideTimeout.current = setTimeout(() => {
                      setShowErrorBox(false);
                    }, 200);
                  }}
                />
                <span
                  className="input-group-text"
                  onClick={togglePassword}
                  style={{ cursor: "pointer" }}
                >
                  <i
                    className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}
                  ></i>
                </span>
                {fieldState.error && (
                  <div className="invalid-feedback">
                    {fieldState.error.message}
                  </div>
                )}
              </div>

              {showValidationBox && showErrorBox && (
                <div
                  className="mt-3 showValBoxList"
                  style={{ whiteSpace: "pre-line" }}
                >
                  <PasswordRequirement
                    valid={password?.length >= 8}
                    text="Must be at least 8 characters!"
                  />
                  <PasswordRequirement
                    valid={password?.length <= 16}
                    text="Must be between 8 to 16 characters!"
                  />
                  <PasswordRequirement
                    valid={/[0-9]/.test(password)}
                    text="Must contain at least 1 number!"
                  />
                  <PasswordRequirement
                    valid={/[A-Z]/.test(password)}
                    text="Must contain at least 1 uppercase letter!"
                  />
                  <PasswordRequirement
                    valid={/[a-z]/.test(password)}
                    text="Must contain at least 1 lowercase letter!"
                  />
                  <PasswordRequirement
                    valid={/[!@#$%^&*(),.?":{}|<>]/.test(password)}
                    text="Must contain at least 1 special character!"
                  />
                  <PasswordRequirement
                    valid={
                      !["john", "doe"].some((n) =>
                        password?.toLowerCase().includes(n)
                      )
                    }
                    text="Should not contain part of your name!"
                  />
                  <PasswordRequirement
                    valid={password !== username}
                    text="Must not be same as User ID!"
                  />
                  <PasswordRequirement
                    valid={
                      !["pass123", "welcome1", "abc@123"].includes(password)
                    }
                    text="New password cannot match your previous 3 passwords!"
                  />
                </div>
              )}
            </>
          );
        }}
      />
    </div>
  );
};
