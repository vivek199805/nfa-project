import { z } from "zod";
import dayjs from "dayjs";

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

const bookSchema = z.object({
  book_title_original: z.string().trim().min(1, "book_title_original is required"),
  book_title_english: z.string().trim().min(1, "book_title_english is required"),
  english_translation_book: z.string().trim().min(1, "english_translation_book is required"),

  // language_id: z
  //   .array(z.object({ label: z.string(), value: z.string() }))
  //   .min(1, "Please select at least one language")
  //   .transform((val) => val.map((item) => item.value)),

  language_id: z.preprocess((val) => {
    if (typeof val === "string") {
      return val.split(",").map((v) => v.trim());
    }

    if (Array.isArray(val)) {
      return val.flatMap((v) =>
        typeof v === "string" && v.includes(",")
          ? v.split(",").map((i) => i.trim())
          : [v]
      );
    }

    return [];
  }, z.array(z.string())),

  author_name: z.string().trim().min(1, "author_name is required"),
  page_count: z.string().trim().min(1, "page_count is required"),

  date_of_publication: z.any().refine((val) => val && dayjs(val).isValid(), {
    message: "Valid date is required",
  }),
  book_price: z
    .string()
    .trim()
    .min(1, "book_price is required")
    .refine((val) => !isNaN(val) && Number(val) > 0, {
      message: "book_price must be a number greater than 0",
    }),
});

// Validation function
const validateStore = (payload, files) => {
  let schema = bookSchema;

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
  let schema = bookSchema;
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
  // return {
  //     isValid: parsed.success,
  //     errors: parsed.success
  //         ? {}
  //         : Object.fromEntries(
  //             Object.entries(parsed.error.flatten().fieldErrors).filter(
  //                 ([_, messages]) => messages?.length
  //             )
  //         ),
  // };
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
