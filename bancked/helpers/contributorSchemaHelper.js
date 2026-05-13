import { z } from "zod";
import { isNumeric, isRecordId, parseZodResult } from "./validationCommon.js";

// Creates a Zod schema for validating required ID fields.
// Accepts numbers or strings that are either numeric or valid MongoDB ObjectIds.
// Trims strings and ensures they are not empty.
const idValue = (fieldName) =>
  z.union([z.string(), z.number()]).refine((val) => {
    if (typeof val === "number") return true;
    if (typeof val === "string") {
      const trimmed = val.trim();
      return Boolean(trimmed) && (isNumeric(trimmed) || isRecordId(trimmed));
    }
    return false;
  }, {
    message: `${fieldName} must be a number or valid MongoDB ObjectId.`,
  });

const optionalIdValue = (fieldName) =>
  z.union([z.string(), z.number(), z.null(), z.undefined()]).refine((val) => {
    if (val === undefined || val === null || val === "") return true;
    if (typeof val === "number") return true;
    if (typeof val === "string") {
      const trimmed = val.trim();
      return Boolean(trimmed) && (isNumeric(trimmed) || isRecordId(trimmed));
    }
    return false;
  }, {
    message: `${fieldName} must be a number or valid MongoDB ObjectId.`,
  });

export const validateContributorPayload = (
  payload,
  { requiredIds = [], optionalIds = [] } = {}
) => {
  const shape = {};

  for (const fieldName of requiredIds) {
    shape[fieldName] = idValue(fieldName);
  }

  for (const fieldName of optionalIds) {
    shape[fieldName] = optionalIdValue(fieldName);
  }

  // Build a Zod object schema from the collected field validators,
  // allow extra fields to pass through, and validate the incoming payload.
  const result = z.object(shape).passthrough().safeParse(payload);

  return parseZodResult(result);
};

export default {
  validateContributorPayload,
};
