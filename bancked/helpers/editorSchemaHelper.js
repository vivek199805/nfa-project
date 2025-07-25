import { z } from "zod";

const isNumeric = (val) =>
  !isNaN(Number(val)) && Number(val).toString() === val.toString();

const isObjectId = (val) => /^[0-9a-fA-F]{24}$/.test(val);

const best_book_cinema_id = z.object({
  best_book_cinema_id: z.union([z.string(), z.number()]).refine((val) => {
    if (typeof val === "number") return true;
    if (typeof val === "string") {
      return isNumeric(val) || isObjectId(val);
    }
    return false;
  }, {
    message: "best_book_cinema_id is required and must be a number or string representing a number.",
  }),
});

const IDSchema = z.object({
  id: z.union([z.string(), z.number()]).refine((val) => {
    if (typeof val === "number") return true;
    if (typeof val === "string") {
      return isNumeric(val) || isObjectId(val);
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
  editor_citizenship: z.string().trim().min(1, "editor_citizenshipis required"),
});

// Validation function
const validateStore = (payload, files) => {
  let schema = editorSchema;

  schema.merge(best_book_cinema_id);
  const result = schema.safeParse(payload);

  return {
    isValid: result.success,
    errors: result.success
      ? {}
      : result.error.issues.reduce((acc, issue) => ({ ...acc, [issue.path[0]]: issue.message }), {}),
  };
};

const validateUpdate = (payload, files) => {
  let schema = editorSchema;
  schema = schema.merge(best_book_cinema_id).merge(IDSchema);

  const result = schema.safeParse(payload);  
  return {
    isValid: result.success,
    errors: result.success
      ? {}
      : result.error.issues.reduce((acc, issue) => ({ ...acc, [issue.path[0]]: issue.message }), {}),
  };
};

const validateList = (payload) => {
  const schema = best_book_cinema_id;
  const result = schema.safeParse(payload);
  return {
    isValid: result.success,
    errors: result.success
      ? {}
      : result.error.issues.reduce((acc, issue) => ({ ...acc, [issue.path[0]]: issue.message }), {}),
  };
};

export default {
  validateStore,
  validateList,
  validateUpdate
};
