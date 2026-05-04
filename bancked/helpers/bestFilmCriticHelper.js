import { z } from "zod";
import dayjs from "dayjs";
import { stepsBestFilmCritic } from "../services/common.js";
import { isObjectId, parseZodResult } from "./validationCommon.js";

const baseStepSchema = z.object({
  step: z.string().refine((val) => !isNaN(val), {
    message: "Step is required and must be a number.",
  }),
});

const lastIdSchema = z.object({
  id: z.string().refine((val) => val && (!isNaN(val) || isObjectId(val)), {
    message: "Last ID is required and must be a number or valid MongoDB ObjectId.",
  }),
});

const criticDetailsSchema = z.object({
  writer_name: z.string().trim().min(1, "writer_name is required"),
  article_title: z.string().trim().min(1, "article_title is required"),
  article_language_id: z.preprocess((val) => {
    if (typeof val === "string") {
      return val.split(",").map((item) => item.trim()).filter(Boolean);
    }

    if (Array.isArray(val)) {
      return val.flatMap((item) => {
        if (typeof item === "string") {
          return item.includes(",")
            ? item.split(",").map((value) => value.trim()).filter(Boolean)
            : [item];
        }

        if (item && typeof item === "object" && "value" in item) {
          return [item.value];
        }

        return [];
      });
    }

    return [];
  }, z.array(z.string()).min(1, "Please select at least one language")),
  publication_date: z.any().refine((val) => val && dayjs(val).isValid(), {
    message: "Valid publication date is required",
  }),
  publication_name: z.string().trim().min(1, "publication_name is required"),
  rni: z.union([z.literal("0"), z.literal("1"), z.literal(0), z.literal(1)], {
    invalid_type_error: "rni must be 0 or 1.",
  }),
});

const criticSchema = z.object({
  critic_name: z.string().trim().min(1, "critic_name is required"),
  critic_address: z.string().trim().min(1, "critic_address is required"),
  critic_contact: z
    .string()
    .trim()
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number is too long")
    .regex(/^\+?[0-9]{10,15}$/, "Invalid phone number"),
  critic_indian_nationality: z.union(
    [z.literal("0"), z.literal("1"), z.literal(0), z.literal(1)],
    {
      invalid_type_error: "critic_indian_nationality must be 0 or 1.",
    }
  ),
  critic_profile: z.string().trim().min(1, "critic_profile is required"),
});

const toRequiredTrue = z.preprocess(
  (val) => {
    if (val === "1" || val === "true" || val === 1 || val === true) return true;
    return val;
  },
  z.literal(true, {
    required_error: "This declaration is required.",
    invalid_type_error: "You must accept this declaration.",
  })
);

const declarationSchema = lastIdSchema.extend({
  declaration_one: toRequiredTrue,
  declaration_two: toRequiredTrue,
  declaration_three: toRequiredTrue,
  declaration_four: toRequiredTrue,
});

const validateStepInput = (payload, files) => {
  const step = payload.step;
  let schema = baseStepSchema;

  if (step === String(stepsBestFilmCritic().CRITIC_DETAILS)) {
    schema = schema.merge(criticDetailsSchema);
  }

  if (step === String(stepsBestFilmCritic().CRITIC)) {
    schema = schema.merge(criticSchema);

    const criticAadhaar = files?.find(
      (file) => file.fieldname === "critic_aadhaar_card"
    );

    if (criticAadhaar && (typeof criticAadhaar !== "object" || !criticAadhaar.mimetype)) {
      return {
        isValid: false,
        errors: {
          critic_aadhaar_card: "Critic Aadhaar card must be a valid file.",
        },
      };
    }
  } else if (step === String(stepsBestFilmCritic().DECLARATION)) {
    schema = schema.merge(declarationSchema);
  }

  const result = schema.safeParse(payload);

  return parseZodResult(result);
};

const finalSubmitStep = (payload) => {
  const result = lastIdSchema.safeParse(payload);

  return parseZodResult(result);
};

export default {
  validateStepInput,
  finalSubmitStep,
};
