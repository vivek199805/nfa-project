import { useCallback, useEffect, useRef, useState } from "react";

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
  const timerRef = useRef(null);
  const [otp, setOtp] = useState(Array(otpLength).fill(""));
  const [singleOtp, setSingleOtp] = useState("");
  const [countdown, setCountdown] = useState(resendOTPCounter);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    stopTimer();
    setCountdown(resendOTPCounter);
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          stopTimer();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  }, [resendOTPCounter, stopTimer]);

  useEffect(() => {
    if (!otpBoxNormal) {
      inputRefs.current[0]?.focus();
    }
    if (isResendOTP) startTimer();
    return stopTimer;
  }, [isResendOTP, otpBoxNormal, startTimer, stopTimer]);

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
        <button
          type="button"
          className="closeMdl"
          onClick={onClose}
          aria-label="Close OTP dialog"
        >
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

      <div className="d-flex justify-content-center mt-4">
        {!otpBoxNormal ? (
          otp.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => (inputRefs.current[idx] = el)}
              type="text"
              inputMode="numeric"
              aria-label={`OTP digit ${idx + 1}`}
              maxLength="1"
              className="digit mx-2 text-center"
              style={{ backgroundColor: "white", color: "black" }}
              value={digit}
              onChange={(e) => handleOtpChange(e.target.value, idx)}
            />
          ))
        ) : (
          <input
            type="text"
            inputMode="numeric"
            className="form-control singleInput text-center"
            maxLength={otpLength}
            value={singleOtp}
            onChange={handleSingleOtpChange}
            onKeyUp={(e) => e.key === "Enter" && submitOtp()}
            placeholder={placeholder}
            aria-label={placeholder}
          />
        )}
      </div>

      {isResendOTP && (
        <div className="d-flex justify-content-end mt-2" aria-live="polite">
          {countdown ? (
            <span className="expire">Resend again in {countdown} second</span>
          ) : (
            <button
              type="button"
              className="expire border-0 bg-transparent p-0"
              onClick={resendOtp}
            >
              Resend OTP
            </button>
          )}
        </div>
      )}

      {onlyMessage && countdown && (
        <div className="d-flex justify-content-center mt-2" aria-live="polite">
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
