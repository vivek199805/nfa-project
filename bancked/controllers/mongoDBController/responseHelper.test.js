import test from "node:test";
import assert from "node:assert/strict";
import { sendStatusMessage, sendValidationError } from "./responseHelper.js";

function createResponse() {
  return {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
}

test("sendValidationError preserves the existing validation response shape", () => {
  const res = createResponse();

  sendValidationError(res, { email: "Enter a valid email address." });

  assert.equal(res.statusCode, 422);
  assert.deepEqual(res.body, {
    message: "Validation failed",
    errors: { email: "Enter a valid email address." },
    statusCode: 422,
  });
});

test("sendStatusMessage preserves message and body-level statusCode responses", () => {
  const res = createResponse();

  sendStatusMessage(res, 500, "Server error", 500);

  assert.equal(res.statusCode, 500);
  assert.deepEqual(res.body, {
    message: "Server error",
    statusCode: 500,
  });
});

test("sendStatusMessage supports existing extra response fields", () => {
  const res = createResponse();

  sendStatusMessage(res, 200, "Done", 200, { status: true });

  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, {
    message: "Done",
    status: true,
    statusCode: 200,
  });
});
