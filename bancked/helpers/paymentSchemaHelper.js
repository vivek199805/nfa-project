import { z } from "zod";

// Allowed form types
const ALLOWED_FORMS = [
  "FEATURE",
  "NON_FEATURE",
  "BEST_BOOK",
  "BEST_FILM_CRITIC",
];

// Function to check if value is a valid ObjectId
const isMongoObjectId = (val) => /^[0-9a-fA-F]{24}$/.test(val);

// Function to check if value is a numeric string
const isNumericString = (val) => /^\d+$/.test(val);

// Zod schema
const paymentSchema = z.object({
  id: z
    .string()
    .trim()
    .refine((val) => isNumericString(val) || isMongoObjectId(val), {
      message: "Last ID must be a number or a valid MongoDB ObjectId.",
    }),
  form_type: z.enum(ALLOWED_FORMS, {
    errorMap: () => ({
      message:
        "Form type must be one of: FEATURE, NON_FEATURE, BEST_BOOK, BEST_FILM_CRITIC.",
    }),
  }),
});

// Validation function
export const validatePaymentData = (data) => {
  const result = paymentSchema.safeParse(data);

  //   if (result.success) {
  //     return {
  //       isValid: true,
  //       errors: {},
  //       data: result.data,
  //     };
  //   } else {
  //     const errors = {};
  //     for (const issue of result.error.issues) {
  //       errors[issue.path[0]] = issue.message;
  //     }
  //     return {
  //       isValid: false,
  //       errors,
  //     };
  //   }

//     const errors = result.error.issues.reduce((acc, issue) => {
//     acc[issue.path[0]] = issue.message;
//     return acc;
//   }, {});

  return {
    isValid: result.success,
    errors: result.success
      ? {}
      : result.error.issues.reduce((acc, issue) => ({ ...acc, [issue.path[0]]: issue.message }), {}),
  };

};
