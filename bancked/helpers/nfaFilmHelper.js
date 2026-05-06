import { z } from "zod";
import dayjs from "dayjs";
import Common from "../services/common.js";
import { isNumeric, isObjectId, parseZodResult } from "./validationCommon.js";

const toStringArray = (val) => {
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
};

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

const lastIdSchema = z.object({
  id: z.union([z.string(), z.number()]).refine((val) => {
    if (typeof val === "number") return true;
    if (typeof val === "string") {
      return isNumeric(val) || isObjectId(val);
    }
    return false;
  }, {
    message: "ID must be a number or a valid MongoDB ObjectId.",
  }),
});

const baseStepSchema = z.object({
  step: z.string().refine((val) => !isNaN(val), {
    message: "Step is required and must be a number.",
  }),
  film_type: z.enum(["feature", "non-feature"], {
    required_error: "film_type is required.",
    invalid_type_error: "film_type must be feature or non-feature.",
  }),
});

const generalSchema = z.object({
  film_title_roman: z.string().trim().min(1, "film_title_roman is required"),
  film_title_devnagri: z.string().trim().min(1, "film_title_devnagri is required"),
  film_title_english: z.string().trim().min(1, "film_title_english is required"),
  language_id: z.preprocess(
    toStringArray,
    z.array(z.string()).min(1, "Please select at least one language")
  ),
  english_subtitle: z.union([z.literal("0"), z.literal("1"), z.literal(0), z.literal(1)]),
  color_bw: z.union([z.literal("0"), z.literal("1"), z.literal(0), z.literal(1)]),
  aspect_ratio: z.string().trim().min(1, "aspect_ratio is required"),
  running_time: z.string().trim().min(1, "running_time is required"),
  format: z.union([z.literal("1"), z.literal("2"), z.literal("3"), z.literal(1), z.literal(2), z.literal(3)]),
  director_debut: z.union([z.literal("0"), z.literal("1"), z.literal(0), z.literal(1)]),
  sound_system: z.union([
    z.literal("1"),
    z.literal("2"),
    z.literal("3"),
    z.literal("4"),
    z.literal(1),
    z.literal(2),
    z.literal(3),
    z.literal(4),
  ]),
  film_synopsis: z
    .string()
    .trim()
    .min(1, "film_synopsis is required")
    .refine((val) => {
      const wordCount = val.trim().split(/\s+/).filter(Boolean).length;
      return wordCount >= 10 && wordCount <= 200;
    }, {
      message: "film_synopsis must be between 10 and 200 words",
    }),
});

const censorSchema = lastIdSchema.extend({
  censor_certificate_nom: z.string().trim().min(1, "censor_certificate_nom is required"),
  censor_certificate_date: z.any().refine((val) => val && dayjs(val).isValid(), {
    message: "Valid censor_certificate_date is required",
  }),
  censor_certificate_file: z.string().trim().optional(),
});

const companySchema = lastIdSchema.extend({
  company_reg_details: z.string().trim().min(1, "company_reg_details is required"),
  company_reg_doc: z.string().trim().optional(),
});

const featureOtherSchema = lastIdSchema.extend({
  original_screenplay_name: z.string().trim().min(1, "original_screenplay_name is required"),
  adapted_screenplay_name: z.string().trim().min(1, "adapted_screenplay_name is required"),
  story_writer_name: z.string().trim().min(1, "story_writer_name is required"),
  work_under_public_domain: z.union([z.literal("0"), z.literal("1"), z.literal(0), z.literal(1)]),
  original_work_copy: z.string().trim().optional(),
  dialogue: z.string().optional(),
  cinemetographer: z.string().optional(),
  editor: z.string().optional(),
  costume_designer: z.string().optional(),
  animator: z.string().optional(),
  vfx_supervisor: z.string().optional(),
  stunt_choreographer: z.string().optional(),
  music_director: z.string().optional(),
  special_effect_creator: z.string().optional(),
  shot_digital_video_format: z.union([z.literal("0"), z.literal("1"), z.literal(0), z.literal(1)]).optional(),
  production_designer: z.string().optional(),
  make_up_director: z.string().optional(),
  choreographer: z.string().optional(),
});

const nonFeatureOtherSchema = lastIdSchema.extend({
  cinemetographer: z.string().optional(),
  editor: z.string().optional(),
  non_audiographer: z.string().optional(),
  music_director: z.string().optional(),
  shot_digital_video_format: z.union([z.literal("0"), z.literal("1"), z.literal(0), z.literal(1), z.literal("false"), z.literal("true"), z.literal(false), z.literal(true)]).optional(),
  production_designer: z.string().optional(),
  choreographer: z.string().optional(),
  voice_over_artist: z.string().optional(),
  sound_recordist: z.string().optional(),
});

const returnSchema = lastIdSchema.extend({
  return_name: z.string().trim().min(1, "return_name is required"),
  return_mobile: z
    .string()
    .trim()
    .min(10, "return_mobile must be at least 10 digits")
    .max(15, "return_mobile is too long")
    .regex(/^\+?[0-9]{10,15}$/, "Invalid return_mobile"),
  return_email: z.string().trim().email("Invalid return_email"),
  return_website: z.string().optional(),
  return_address: z.string().trim().min(1, "return_address is required"),
  return_pincode: z
    .string()
    .trim()
    .length(6, "return_pincode must be exactly 6 digits")
    .regex(/^[0-9]{6}$/, "return_pincode must be numeric"),
});

const declarationSchema = lastIdSchema.extend({
  declaration_one: toRequiredTrue,
  declaration_two: toRequiredTrue,
  declaration_three: toRequiredTrue,
  declaration_four: toRequiredTrue,
  declaration_five: toRequiredTrue,
  declaration_six: toRequiredTrue,
  declaration_seven: toRequiredTrue,
  declaration_eight: toRequiredTrue,
  declaration_nine: toRequiredTrue,
  declaration_ten: toRequiredTrue,
  declaration_eleven: toRequiredTrue,
  declaration_twelve: toRequiredTrue,
});

const requireFileOrExistingValue = (payload, files, fieldName, label) => {
  const uploadedFile = files?.find((file) => file.fieldname === fieldName);
  if (uploadedFile) return null;

  if (typeof payload[fieldName] === "string" && payload[fieldName].trim()) {
    return null;
  }

  return {
    isValid: false,
    errors: {
      [fieldName]: `${label} is required.`,
    },
  };
};

const stepValidationRules = [
  {
    matches: (step) =>
      step === String(Common.stepsFeature().GENERAL) ||
      step === String(Common.stepsNonFeature().GENERAL),
    schema: generalSchema,
  },
  {
    matches: (step) =>
      step === String(Common.stepsFeature().CENSOR) ||
      step === String(Common.stepsNonFeature().CENSOR),
    schema: censorSchema,
    fileField: "censor_certificate_file",
    fileLabel: "censor_certificate_file",
  },
  {
    matches: (step) =>
      step === String(Common.stepsFeature().COMPANY_REGISTRATION) ||
      step === String(Common.stepsNonFeature().COMPANY_REGISTRATION),
    schema: companySchema,
    fileField: "company_reg_doc",
    fileLabel: "company_reg_doc",
  },
  {
    matches: (step, payload) =>
      step === String(Common.stepsFeature().OTHER) &&
      payload.film_type === "feature",
    schema: featureOtherSchema,
    fileField: "original_work_copy",
    fileLabel: "original_work_copy",
  },
  {
    matches: (step, payload) =>
      step === String(Common.stepsNonFeature().OTHER) &&
      payload.film_type === "non-feature",
    schema: nonFeatureOtherSchema,
  },
  {
    matches: (step) =>
      step === String(Common.stepsFeature().RETURN_ADDRESS) ||
      step === String(Common.stepsNonFeature().RETURN_ADDRESS),
    schema: returnSchema,
  },
  {
    matches: (step) =>
      step === String(Common.stepsFeature().DECLARATION) ||
      step === String(Common.stepsNonFeature().DECLARATION),
    schema: declarationSchema,
  },
];

const findStepValidationRule = (step, payload) =>
  stepValidationRules.find((rule) => rule.matches(step, payload));

const validateStepInput = (payload, files = []) => {
  const step = String(payload.step ?? "");
  const validationRule = findStepValidationRule(step, payload);

  if (!validationRule) {
    return {
      isValid: false,
      errors: {
        step: "Invalid step provided.",
      },
    };
  }

  const fileRequirementError = validationRule.fileField
    ? requireFileOrExistingValue(
      payload,
      files,
      validationRule.fileField,
      validationRule.fileLabel
    )
    : null;

  if (fileRequirementError) {
    return fileRequirementError;
  }

  const schema = baseStepSchema.merge(validationRule.schema);
  const result = schema.safeParse(payload);
  return parseZodResult(result);
};

const finalSubmitStep = (payload) => {
  const schema = lastIdSchema;
  const result = schema.safeParse(payload);

  return parseZodResult(result);
};

export default {
  validateStepInput,
  finalSubmitStep,
};
