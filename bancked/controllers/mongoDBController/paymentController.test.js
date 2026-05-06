import test from "node:test";
import assert from "node:assert/strict";
import { createOrder, verifyPayment } from "./paymentController.js";

const originalEnv = {
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
};

function restoreEnv() {
  for (const [key, value] of Object.entries(originalEnv)) {
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }
}

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

test.afterEach(() => {
  restoreEnv();
});

test("createOrder returns validation errors before Razorpay configuration checks", async () => {
  delete process.env.RAZORPAY_KEY_ID;
  delete process.env.RAZORPAY_KEY_SECRET;
  const res = createResponse();

  await createOrder(
    {
      body: {
        id: "not-a-valid-id",
        form_type: "FEATURE",
      },
      user: { _id: "user-1" },
    },
    res,
  );

  assert.equal(res.statusCode, 422);
  assert.equal(res.body.message, "Validation failed");
  assert.equal(res.body.statusCode, 422);
  assert.equal(
    res.body.errors.id,
    "Last ID must be a number or a valid MongoDB ObjectId.",
  );
});

test("createOrder preserves missing Razorpay configuration response", async () => {
  delete process.env.RAZORPAY_KEY_ID;
  delete process.env.RAZORPAY_KEY_SECRET;
  const res = createResponse();

  await createOrder(
    {
      body: {
        id: "507f1f77bcf86cd799439011",
        form_type: "FEATURE",
      },
      user: { _id: "user-1" },
    },
    res,
  );

  assert.equal(res.statusCode, 500);
  assert.deepEqual(res.body, {
    message: "Razorpay is not configured on the server",
    statusCode: 500,
  });
});

test("verifyPayment returns validation errors before secret checks", async () => {
  delete process.env.RAZORPAY_KEY_ID;
  delete process.env.RAZORPAY_KEY_SECRET;
  const res = createResponse();

  await verifyPayment(
    {
      body: {
        razorpay_order_id: "",
        razorpay_payment_id: "pay_123",
        razorpay_signature: "sig",
      },
    },
    res,
  );

  assert.equal(res.statusCode, 422);
  assert.equal(res.body.message, "Validation failed");
  assert.equal(res.body.statusCode, 422);
  assert.equal(res.body.errors.razorpay_order_id, "razorpay_order_id is required");
});

test("verifyPayment preserves missing Razorpay secret response", async () => {
  process.env.RAZORPAY_KEY_ID = "rzp_test_key";
  delete process.env.RAZORPAY_KEY_SECRET;
  const res = createResponse();

  await verifyPayment(
    {
      body: {
        razorpay_order_id: "order_123",
        razorpay_payment_id: "pay_123",
        razorpay_signature: "abcdef",
      },
    },
    res,
  );

  assert.equal(res.statusCode, 500);
  assert.deepEqual(res.body, {
    message: "Razorpay secret is not configured on the server",
    statusCode: 500,
  });
});

test("verifyPayment rejects invalid signatures before payment lookup", async () => {
  process.env.RAZORPAY_KEY_ID = "rzp_test_key";
  process.env.RAZORPAY_KEY_SECRET = "secret";
  const res = createResponse();

  await verifyPayment(
    {
      body: {
        razorpay_order_id: "order_123",
        razorpay_payment_id: "pay_123",
        razorpay_signature: "abcdef",
      },
    },
    res,
  );

  assert.equal(res.statusCode, 403);
  assert.deepEqual(res.body, {
    message: "Invalid Razorpay payment signature",
    statusCode: 403,
  });
});
