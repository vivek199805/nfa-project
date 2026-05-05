import test from "node:test";
import assert from "node:assert/strict";
import User from "../../models/mongodbModels/user.js";
import { changePassword, resetPassword, verifyEmail } from "./authController.js";

const originalUserFindOne = User.findOne;

test.afterEach(() => {
  User.findOne = originalUserFindOne;
});

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

test("changePassword rejects invalid payloads before reading authenticated user state", async () => {
  const res = createResponse();

  await changePassword(
    {
      body: {
        currentPassword: "secret1",
        password: "secret2",
        confirmPassword: "different",
      },
      user: { _id: "user-1" },
    },
    res,
  );

  assert.equal(res.statusCode, 422);
  assert.equal(res.body.message, "Validation failed");
  assert.equal(res.body.statusCode, 422);
  assert.equal(res.body.errors.confirmPassword, "Passwords do not match.");
});

test("changePassword preserves unauthorized response when no user id is present", async () => {
  const res = createResponse();

  await changePassword(
    {
      body: {
        currentPassword: "secret1",
        password: "secret2",
        confirmPassword: "secret2",
      },
      user: {},
    },
    res,
  );

  assert.equal(res.statusCode, 401);
  assert.deepEqual(res.body, {
    msg: "Unauthorized",
    status: false,
    statusCode: 401,
  });
});

test("resetPassword rejects invalid reset payloads before OTP lookup", async () => {
  const res = createResponse();

  await resetPassword(
    {
      body: {
        email: "not-an-email",
        password: "short",
      },
    },
    res,
  );

  assert.equal(res.statusCode, 422);
  assert.equal(res.body.message, "Validation failed");
  assert.equal(res.body.statusCode, 422);
  assert.equal(res.body.errors.email, "Enter a valid email address.");
  assert.equal(res.body.errors.password, "Password must be at least 6 characters long.");
});

test("verifyEmail returns the shared error response when user lookup fails", async () => {
  const res = createResponse();
  User.findOne = async () => {
    throw new Error("database unavailable");
  };

  await verifyEmail(
    {
      body: {
        email: "entrant@example.com",
      },
    },
    res,
  );

  assert.equal(res.statusCode, 500);
  assert.equal(res.body.message, "Internal Server Error");
  assert.equal(res.body.statusCode, 500);
});
