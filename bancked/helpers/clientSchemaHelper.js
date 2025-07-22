// clientSchema.js
import { z } from "zod";

// Regex patterns
const mobileRegex = /^[6-9]\d{9}$/;
const pincodeRegex = /^[1-9][0-9]{5}$/;
const aadharRegex = /^[2-9]{1}[0-9]{11}$/;

// Reusable usertype schema (with coercion)
const usertypeSchema = z.coerce
  .number({
    required_error: "User type is required.",
    invalid_type_error: "User type must be a number.",
  })
  .refine((val) => val === 1 || val === 2, {
    message: "User type must be either 1 or 2.",
  });

// Register Schema
export const registerSchema = z.object({
    firstName: z
      .string({ required_error: "First name is required." })
      .min(1, "First name is required."),
    lastName: z
      .string({ required_error: "Last name is required." })
      .min(1, "Last name is required."),
    email: z
      .string({ required_error: "Email is required." })
      .email("Enter a valid email address."),
    phone: z
      .string({ required_error: "Mobile is required." })
      .regex(mobileRegex, "Enter a valid 10-digit mobile number."),
    address: z
      .string({ required_error: "Address is required." })
      .min(1, "Address is required."),
    pinCode: z
      .string({ required_error: "Pincode is required." })
      .regex(pincodeRegex, "Enter a valid 6-digit pincode."),
    aadharNumber: z
      .string({ required_error: "Aadhaar number is required." })
      .regex(aadharRegex, "Enter a valid 12-digit Aadhaar number."),
    password: z
      .string({ required_error: "Password is required." })
      .min(6, "Password must be at least 6 characters long."),
    confirmPassword: z.string({
      required_error: "Password confirmation is required.",
    }),
    category: usertypeSchema,
    // captcha: z
    //   .string({ required_error: "Captcha is required." })
    //   .min(1, "Captcha is required."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });

// Email-only validation
export const validateEmailSchema = z.object({
  email: z
    .string({ required_error: "Email is required." })
    .email("Enter a valid email address."),
});

// OTP Verification Schema
export const verifyOtpSchema = z.object({
  email: z
    .string({ required_error: "Email is required." })
    .email("Enter a valid email address."),
  otp: z.coerce
    .number({
      required_error: "OTP is required.",
      invalid_type_error: "OTP must be a number.",
    })
    .min(100000, "OTP must be a 6-digit number."),
});

// Change Password Schema
export const changePasswordSchema = z
  .object({
    email: z
      .string({ required_error: "Email is required." })
      .email("Enter a valid email address."),
    password: z
      .string({ required_error: "Password is required." })
      .min(6, "Password must be at least 6 characters long."),
    password_confirmation: z.string({
      required_error: "Password confirmation is required.",
    }),
  })
  .refine((data) => data.password === data.password_confirmation, {
    path: ["password_confirmation"],
    message: "Passwords do not match.",
  });

// Login Schema
export const loginSchema = z.object({
  email: z
    .string({ required_error: "Email is required." })
    .email("Enter a valid email address."),
  password: z
    .string({ required_error: "Password is required." })
    .min(6, "Password must be at least 6 characters long."),
//   captcha: z
//     .string({ required_error: "Captcha is required." })
//     .min(1, "Captcha is required."),
});

const validateRegisterData = (payload) => {
  const result = registerSchema.safeParse(payload);

  return {
    isValid: result.success,
    errors: result.success
      ? {}
      : result.error.issues.reduce(
          (acc, issue) => ({ ...acc, [issue.path[0]]: issue.message }),
          {}
        ),
  };
};

const validateEmailSchemaData = (payload) => {
  const result = validateEmailSchema.safeParse(payload);

  return {
    isValid: result.success,
    errors: result.success
      ? {}
      : result.error.issues.reduce(
          (acc, issue) => ({ ...acc, [issue.path[0]]: issue.message }),
          {}
        ),
  };
};

const validateOtpSchemaData = (payload) => {
  const result = verifyOtpSchema.safeParse(payload);

  return {
    isValid: result.success,
    errors: result.success
      ? {}
      : result.error.issues.reduce(
          (acc, issue) => ({ ...acc, [issue.path[0]]: issue.message }),
          {}
        ),
  };
};

const ValidateChangePasswordSchemaData = (payload) => {
  const result = changePasswordSchema.safeParse(payload);

  return {
    isValid: result.success,
    errors: result.success
      ? {}
      : result.error.issues.reduce(
          (acc, issue) => ({ ...acc, [issue.path[0]]: issue.message }),
          {}
        ),
  };
};

const ValidateLoginSchemaData = (payload) => {    
  const result = loginSchema.safeParse(payload);

  return {
    isValid: result.success,
    errors: result.success
      ? {}
      : result.error.issues.reduce(
          (acc, issue) => ({ ...acc, [issue.path[0]]: issue.message }),
          {}
        ),
  };
};

export default {
  validateRegisterData,
  validateEmailSchemaData,
  ValidateChangePasswordSchemaData,
  validateOtpSchemaData,
  ValidateLoginSchemaData,
};
