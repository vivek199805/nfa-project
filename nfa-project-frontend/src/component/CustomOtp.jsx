import React, { useEffect, useRef, useState } from "react"; // Add your custom styles here

const CustomOtp = ({
  otpBoxNormal = false,
  otpLength = 6,
  isSubmitBtn = true,
  submitBtnName = "Submit OTP",
  submitBtnClass = "btn btn-danger",
  showCloseIcon = true,
  isResendOTP = true,
  resendOTPCounter = 30,
  title,
  message,
  showMesgOtpSendToMobile,
  onlyMessage = false,
  placeholder = "OTP *",
  onSubmit,
  onResend,
  onClose,
}) => {
  const inputRefs = useRef([]);
  const [otp, setOtp] = useState(Array(otpLength).fill(""));
  const [singleOtp, setSingleOtp] = useState("");
  const [countdown, setCountdown] = useState(resendOTPCounter);

  useEffect(() => {
    if (!otpBoxNormal) {
      inputRefs.current[0]?.focus();
    }
    if (isResendOTP) startTimer();
  }, []);

  const startTimer = () => {
    setCountdown(resendOTPCounter);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleOtpChange = (val, idx) => {
    if (!/^\d?$/.test(val)) return;

    const updated = [...otp];
    updated[idx] = val;
    setOtp(updated);

    if (val && idx < otpLength - 1) {
      inputRefs.current[idx + 1]?.focus();
    }
  };

  const handleSingleOtpChange = (e) => {
    const val = e.target.value;
    if (/^\d*$/.test(val) && val.length <= otpLength) {
      setSingleOtp(val);
    }
  };

  const submitOtp = () => {
    const finalOtp = otpBoxNormal ? singleOtp : otp.join("");
    if (
      (otpBoxNormal && singleOtp.length === otpLength) ||
      (!otpBoxNormal && otp.every((d) => d !== ""))
    ) {
      onSubmit?.(finalOtp);
    }
  };

  const resendOtp = () => {
    if (otpBoxNormal) {
      setSingleOtp("");
    } else {
      setOtp(Array(otpLength).fill(""));
    }

    inputRefs.current[0]?.focus();
    startTimer();
    onResend?.();
  };

  return (
    <div className="otp-wrapper text-center p-3">
      {showCloseIcon && (
        <button className="closeMdl" onClick={onClose}>
          &times;
        </button>
      )}

      {showMesgOtpSendToMobile && !(title || message) && (
        <span
          dangerouslySetInnerHTML={{ __html: showMesgOtpSendToMobile }}
        ></span>
      )}

      {!showMesgOtpSendToMobile && (title || message) && (
        <>
          {title && (
            <p
              className="p-title text-left"
              dangerouslySetInnerHTML={{ __html: title }}
            ></p>
          )}
          {message && (
            <p
              className="text-left mesg"
              dangerouslySetInnerHTML={{ __html: message }}
            ></p>
          )}
        </>
      )}

      {/* OTP Input */}
      <div className="d-flex justify-content-center mt-4">
        {!otpBoxNormal ? (
          otp.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => (inputRefs.current[idx] = el)}
              type="text"
              maxLength="1"
              className="digit mx-2 text-center"
              style={{ backgroundColor: "white" }}
              value={digit}
              onChange={(e) => handleOtpChange(e.target.value, idx)}
            />
          ))
        ) : (
          <input
            type="text"
            className="form-control singleInput text-center"
            maxLength={otpLength}
            value={singleOtp}
            onChange={handleSingleOtpChange}
            onKeyUp={(e) => e.key === "Enter" && submitOtp()}
            placeholder={placeholder}
          />
        )}
      </div>

      {isResendOTP && (
        <div className="d-flex justify-content-end mt-2">
          {countdown ? (
            <span className="expire">Resend again in {countdown} second</span>
          ) : (
            <a href="#" className="expire" onClick={resendOtp}>
              Resend OTP
            </a>
          )}
        </div>
      )}

      {onlyMessage && countdown && (
        <div className="d-flex justify-content-center mt-2">
          <span className="expire">OTP will expire in {countdown} second</span>
        </div>
      )}

      {isSubmitBtn && (
        <div className="submitbtn mt-3">
          <button
            type="button"
            id="verifyOtpBtn"
            className={submitBtnClass}
            disabled={
              otpBoxNormal
                ? singleOtp.length !== otpLength
                : otp.some((d) => d === "")
            }
            onClick={submitOtp}
          >
            {submitBtnName}
          </button>
        </div>
      )}
    </div>
  );
};

export default CustomOtp;
