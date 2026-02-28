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
const authorSchema = z.object({
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

const editorSchema = z.object({
  editor_name: z.string().trim().min(1, "editor_name is required"),
  editor_email: z.string().trim().email("Invalid email address"),
  editor_landline: z
    .string()
    .trim()
    .min(10, "Landline number must be at least 10 digits")
    .max(15, "Landline number is too long")
    .regex(/^\+?[0-9]{10,15}$/, "Invalid Landline number"),

  editor_mobile: z
    .string()
    .trim()
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number is too long")
    .regex(/^\+?[0-9]{10,15}$/, "Invalid phone number"),

  editor_address: z.string().trim().min(1, "editor_address is required"),
  editor_citizenship: z.string().trim().min(1, "editor_citizenshipis required"),
});

const toRequiredTrue = z.preprocess(
  (val) => {
    if (val === "1" || val === "true" || val === 1) return true;
    return val;
  },
  z.literal(true, {
    required_error: "This declaration is required.",
    invalid_type_error: "You must accept this declaration (true).",
  })
);

const declarationSchema = lastIdSchema.extend({
  declaration_one: toRequiredTrue,
  declaration_two: toRequiredTrue,
  declaration_three: toRequiredTrue,
});

const bookSchema = z.object({
  book_title_original: z.string().trim().min(1, "book_title_original is required"),
  book_title_english: z.string().trim().min(1, "book_title_english is required"),
  english_translation_book: z.string().trim().min(1, "english_translation_book is required"),

  language_id: z
    .array(z.object({ label: z.string(), value: z.string() }))
    .min(1, "Please select at least one language")
    .transform((val) => val.map((item) => item.value)),

  author_name: z.string().trim().min(1, "author_name is required"),
  page_count: z.string().trim().min(1, "page_count is required"),

  date_of_publication: z.any().refine((val) => val && dayjs(val).isValid(), {
    message: "Valid date is required",
  }),

  book_price: z.string().trim().min(1, "book_price is required"),
});

// Validation function
const validateStepInput = (payload, files) => {
  const step = payload.step;
  let schema = baseStepSchema;

  // Dynamic step-based schema
  if (step && step != String(stepsBestBook().BEST_BOOK_ON_CINEMA)) {
    schema = schema.merge(bookSchema);
  }

  if (step && step != String(stepsBestBook().PUBLISHER_EDITOR)) {
    schema = schema.merge(editorSchema);
  }

  if (step == String(stepsBestBook().AUTHOR)) {
    schema = schema.merge(authorSchema);

    const authorAadhaar = files?.find(
      (file) => file.fieldname === "author_aadhaar_card"
    );

    if (authorAadhaar && (typeof authorAadhaar !== "object" || !authorAadhaar.mimetype)) {
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

  const result = schema.safeParse(payload);

  return {
    isValid: result.success,
    errors: result.success
      ? {}
      : result.error.issues.reduce((acc, issue) => ({ ...acc, [issue.path[0]]: issue.message }), {}),
  };
};

const finalSubmitStep = (payload) => {
  const schema = lastIdSchema;
  const result = schema.safeParse(payload);

  // return {
  //   isValid: parsed.success,
  //   errors: parsed.success
  //     ? {}
  //     : Object.fromEntries(
  //         Object.entries(parsed.error.flatten().fieldErrors).filter(
  //           ([_, messages]) => messages?.length
  //         )
  //       ),
  // };

  return {
    isValid: result.success,
    errors: result.success
      ? {}
      : result.error.issues.reduce((acc, issue) => ({ ...acc, [issue.path[0]]: issue.message }), {}),
  };
};

export default {
  validateStepInput,
  finalSubmitStep,
};
