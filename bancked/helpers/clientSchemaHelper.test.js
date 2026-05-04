import test from "node:test";
import assert from "node:assert/strict";
import ClientSchemaHelper from "./clientSchemaHelper.js";

const validRegisterPayload = {
  firstName: "Vivek",
  lastName: "Kumar",
  email: "vivek@example.com",
  phone: "9876543210",
  address: "New Delhi",
  pinCode: "110001",
  aadharNumber: "234567890123",
  password: "secret1",
  confirmPassword: "secret1",
  category: "1",
};

test("validateRegisterData accepts the existing valid register payload shape", () => {
  const result = ClientSchemaHelper.validateRegisterData(validRegisterPayload);

  assert.equal(result.isValid, true);
  assert.deepEqual(result.errors, {});
});

test("validateRegisterData reports mismatched password confirmation", () => {
  const result = ClientSchemaHelper.validateRegisterData({
    ...validRegisterPayload,
    confirmPassword: "different",
  });

  assert.equal(result.isValid, false);
  assert.equal(result.errors.confirmPassword, "Passwords do not match.");
});

test("ValidateLoginSchemaData rejects invalid email values", () => {
  const result = ClientSchemaHelper.ValidateLoginSchemaData({
    email: "not-an-email",
    password: "secret1",
  });

  assert.equal(result.isValid, false);
  assert.equal(result.errors.email, "Enter a valid email address.");
});

test("ValidateChangePasswordSchemaData rejects reusing the current password", () => {
  const result = ClientSchemaHelper.ValidateChangePasswordSchemaData({
    currentPassword: "secret1",
    password: "secret1",
    confirmPassword: "secret1",
  });

  assert.equal(result.isValid, false);
  assert.equal(
    result.errors.password,
    "New password must be different from current password.",
  );
});

test("validateOtpSchemaData coerces numeric OTP strings", () => {
  const result = ClientSchemaHelper.validateOtpSchemaData({
    email: "vivek@example.com",
    otp: "123456",
  });

  assert.equal(result.isValid, true);
  assert.deepEqual(result.errors, {});
});

test("validateOtpSchemaData rejects short OTP values", () => {
  const result = ClientSchemaHelper.validateOtpSchemaData({
    email: "vivek@example.com",
    otp: "12345",
  });

  assert.equal(result.isValid, false);
  assert.equal(result.errors.otp, "OTP must be a 6-digit number.");
});

test("ValidateResetPassword requires a valid email and minimum password length", () => {
  const result = ClientSchemaHelper.ValidateResetPassword({
    email: "bad-email",
    password: "short",
  });

  assert.equal(result.isValid, false);
  assert.equal(result.errors.email, "Enter a valid email address.");
  assert.equal(result.errors.password, "Password must be at least 6 characters long.");
});
