import { z } from "zod";
import { stepsBestBook } from "../services/common.js";

// Shared schema parts
const baseStepSchema = z.object({
  step: z.string().refine((val) => !isNaN(val), {
    message: "Step is required and must be a number.",
  }),
});

const lastIdSchema = z.object({
   id: z.string().refine((val) => val && !isNaN(val), {
    message: "Last ID is required and must be a number.",
  }),
});

// Step-specific schemas
const authorSchema = lastIdSchema.extend({
  author_name: z.string().min(1, "Author name is required."),
  author_contact: z
    .string()
    .min(1, "Author contact is required.")
    .refine((val) => /^[6-9]\d{9}$/.test(val), {
      message: "Contact number must be a valid 10-digit Indian number.",
    }),
  author_address: z.string().min(1, "Author address is required."),
  author_nationality_indian: z.union(
    [z.literal("0"), z.literal("1"), z.literal(0), z.literal(1)],
    {
      invalid_type_error: "Author nationality must be 0 or 1.",
    }
  ),
  author_profile: z.string().min(1, "Author profile is required."),
});

const declarationSchema = lastIdSchema.extend({
  declaration_one: z.union([z.literal("1"), z.literal(1)], {
    invalid_type_error: "Declaration one must be Yes (1).",
  }),
  declaration_two: z.union([z.literal("1"), z.literal(1)], {
    invalid_type_error: "Declaration two must be Yes (1).",
  }),
  declaration_three: z.union([z.literal("1"), z.literal(1)], {
    invalid_type_error: "Declaration three must be Yes (1).",
  }),
});

// Validation function
const validateStepInput = (payload, files) => {
  const step = payload.step;
  let schema = baseStepSchema;

  // Dynamic step-based schema
  if (step && step !== String(stepsBestBook().BEST_BOOK_ON_CINEMA)) {
    schema = schema.merge(lastIdSchema);
  }

  if (step === String(stepsBestBook().AUTHOR)) {
    schema = schema.merge(authorSchema);

    const authorAadhaar = files?.find(
      (file) => file.fieldname === "author_aadhaar_card"
    );

    if (
      authorAadhaar &&
      (typeof authorAadhaar !== "object" || !authorAadhaar.mimetype)
    ) {
      return {
        isValid: false,
        errors: {
          author_aadhaar_card: "Author Aadhaar card must be a valid file.",
        },
      };
    }
  } else if (step === String(stepsBestBook().DECLARATION)) {
    schema = schema.merge(declarationSchema);
  }

  const parsed = schema.safeParse(payload);
  return {
    isValid: parsed.success,
    errors: parsed.success
      ? {}
      : Object.fromEntries(
          Object.entries(parsed.error.flatten().fieldErrors).filter(
            ([_, messages]) => messages?.length
          )
        ),
  };
};

const finalSubmitStep = (payload) => {
  const schema = lastIdSchema;
  const parsed = schema.safeParse(payload);
  return {
    isValid: parsed.success,
    errors: parsed.success
      ? {}
      : Object.fromEntries(
          Object.entries(parsed.error.flatten().fieldErrors).filter(
            ([_, messages]) => messages?.length
          )
        ),
  };
};

export default {
  validateStepInput,
  finalSubmitStep,
};
