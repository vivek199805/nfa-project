import { z } from "zod";
import { isNumeric, isRecordId, parseZodResult } from "./validationCommon.js";

const linkedEntrySchema = z.object({
  best_book_cinema_id: z
    .union([z.string(), z.number()])
    .optional()
    .refine((val) => {
      if (val === undefined || val === null || val === "") return true;
      if (typeof val === "number") return true;
      if (typeof val === "string") {
        return isNumeric(val) || isRecordId(val);
      }
      return false;
    }, {
      message: "best_book_cinema_id must be a number or valid MongoDB ObjectId.",
    }),
  best_film_critic_id: z
    .union([z.string(), z.number()])
    .optional()
    .refine((val) => {
      if (val === undefined || val === null || val === "") return true;
      if (typeof val === "number") return true;
      if (typeof val === "string") {
        return isNumeric(val) || isRecordId(val);
      }
      return false;
    }, {
      message: "best_film_critic_id must be a number or valid MongoDB ObjectId.",
    }),
});

const appendLinkedEntryRequirement = (result, payload) => {
  if (
    !result.success &&
    (payload.best_book_cinema_id || payload.best_film_critic_id)
  ) {
    return result;
  }

  if (!payload.best_book_cinema_id && !payload.best_film_critic_id) {
    return {
      success: false,
      error: {
        issues: [
          {
            path: ["best_book_cinema_id"],
            message: "Either best_book_cinema_id or best_film_critic_id is required.",
          },
        ],
      },
    };
  }

  return result;
};

const IDSchema = z.object({
  id: z.union([z.string(), z.number()]).refine((val) => {
    if (typeof val === "number") return true;
    if (typeof val === "string") {
      return isNumeric(val) || isRecordId(val);
    }
    return false;
  }, {
    message: "book id is required and must be a number or string representing a number.",
  }),
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
  editor_citizenship: z.string().trim().min(1, "editor_citizenship is required"),
});

// Validation function
const validateStore = (payload) => {
  let schema = editorSchema;

  schema = schema.merge(linkedEntrySchema);
  const result = appendLinkedEntryRequirement(schema.safeParse(payload), payload);

  return parseZodResult(result);
};

const validateUpdate = (payload) => {
  let schema = editorSchema;
  schema = schema.merge(linkedEntrySchema).merge(IDSchema);

  const result = appendLinkedEntryRequirement(schema.safeParse(payload), payload);
  return parseZodResult(result);
};

const validateList = (payload) => {
  const schema = linkedEntrySchema;
  const result = appendLinkedEntryRequirement(schema.safeParse(payload), payload);
  return parseZodResult(result);
};

export default {
  validateStore,
  validateList,
  validateUpdate
};
