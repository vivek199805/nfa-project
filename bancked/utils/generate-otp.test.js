import test from "node:test";
import assert from "node:assert/strict";
import generateOtp from "./generate-otp.js";

test("generateOtp returns a numeric OTP with the default length", () => {
  const otp = generateOtp();

  assert.match(otp, /^\d{6}$/);
});

test("generateOtp honors a valid custom length", () => {
  const otp = generateOtp(4);

  assert.match(otp, /^\d{4}$/);
});

test("generateOtp rejects lengths outside the supported range", () => {
  assert.throws(() => generateOtp(0), /OTP length must be between 1 and 10/);
  assert.throws(() => generateOtp(11), /OTP length must be between 1 and 10/);
});
