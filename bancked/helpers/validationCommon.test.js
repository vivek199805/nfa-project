import assert from "node:assert/strict";
import test from "node:test";
import { formatZodErrors, isNumeric, isObjectId, parseZodResult } from "./validationCommon.js";

test("isNumeric preserves existing numeric-string behavior", () => {
  assert.equal(isNumeric("12"), true);
  assert.equal(isNumeric(12), true);
  assert.equal(isNumeric("12abc"), false);
});

test("isObjectId accepts MongoDB ObjectId strings only", () => {
  assert.equal(isObjectId("507f1f77bcf86cd799439011"), true);
  assert.equal(isObjectId("not-an-object-id"), false);
});

test("formatZodErrors keeps first-level field error shape", () => {
  const errors = formatZodErrors([
    { path: ["email"], message: "Invalid email address" },
    { path: ["password"], message: "Password is required" },
  ]);

  assert.deepEqual(errors, {
    email: "Invalid email address",
    password: "Password is required",
  });
});

test("parseZodResult preserves helper validation response shape", () => {
  assert.deepEqual(parseZodResult({ success: true }), {
    isValid: true,
    errors: {},
  });

  assert.deepEqual(
    parseZodResult({
      success: false,
      error: {
        issues: [{ path: ["id"], message: "Invalid input" }],
      },
    }),
    {
      isValid: false,
      errors: { id: "Invalid input" },
    }
  );
});
