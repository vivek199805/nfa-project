import { z } from "zod";
import { isRecordId, parseZodResultWithData } from "./validationCommon.js";

const ALLOWED_FORMS = [
  "FEATURE",
  "NON_FEATURE",
  "BEST_BOOK",
  "BEST_FILM_CRITIC",
];

const isNumericString = (val) => /^\d+$/.test(val);

const amountSchema = z.union([z.string().trim().min(1), z.number().positive()]);

const paymentSchema = z.object({
  id: z
    .string()
    .trim()
    .refine((val) => isNumericString(val) || isRecordId(val), {
      message: "Last ID must be a number or a valid MongoDB ObjectId.",
    }),
  form_type: z.enum(ALLOWED_FORMS, {
    errorMap: () => ({
      message:
        "Form type must be one of: FEATURE, NON_FEATURE, BEST_BOOK, BEST_FILM_CRITIC.",
    }),
  }),
  amount: amountSchema.optional(),
  currency: z.string().trim().min(3).max(3).optional(),
});

const paymentConfirmationSchema = z.object({
  razorpay_order_id: z.string().trim().min(1, "razorpay_order_id is required"),
  razorpay_payment_id: z
    .string()
    .trim()
    .min(1, "razorpay_payment_id is required"),
  razorpay_signature: z
    .string()
    .trim()
    .min(1, "razorpay_signature is required"),
});

const formatValidation = (result) => parseZodResultWithData(result);

export const validatePaymentData = (data) => formatValidation(paymentSchema.safeParse(data));

export const validatePaymentConfirmationData = (data) => formatValidation(paymentConfirmationSchema.safeParse(data));
