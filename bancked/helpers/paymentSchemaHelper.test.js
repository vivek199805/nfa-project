import test from "node:test";
import assert from "node:assert/strict";
import {
  validatePaymentConfirmationData,
  validatePaymentData,
} from "./paymentSchemaHelper.js";

test("validatePaymentData accepts numeric string IDs and allowed form types", () => {
  const result = validatePaymentData({
    id: "12345",
    form_type: "FEATURE",
  });

  assert.equal(result.isValid, true);
  assert.deepEqual(result.errors, {});
  assert.equal(result.data.id, "12345");
});

test("validatePaymentData accepts Mongo ObjectId IDs", () => {
  const result = validatePaymentData({
    id: "507f1f77bcf86cd799439011",
    form_type: "BEST_FILM_CRITIC",
  });

  assert.equal(result.isValid, true);
});

test("validatePaymentData rejects unknown form types", () => {
  const result = validatePaymentData({
    id: "12345",
    form_type: "UNKNOWN",
  });

  assert.equal(result.isValid, false);
  assert.equal(
    result.errors.form_type,
    "Form type must be one of: FEATURE, NON_FEATURE, BEST_BOOK, BEST_FILM_CRITIC.",
  );
});

test("validatePaymentData accepts optional amount and three-letter currency", () => {
  const result = validatePaymentData({
    id: "12345",
    form_type: "BEST_BOOK",
    amount: 2500,
    currency: "INR",
  });

  assert.equal(result.isValid, true);
  assert.equal(result.data.amount, 2500);
  assert.equal(result.data.currency, "INR");
});

test("validatePaymentData rejects invalid currency length", () => {
  const result = validatePaymentData({
    id: "12345",
    form_type: "BEST_BOOK",
    currency: "RUPEES",
  });

  assert.equal(result.isValid, false);
  assert.equal(result.errors.currency, "String must contain at most 3 character(s)");
});

test("validatePaymentConfirmationData requires Razorpay identifiers", () => {
  const result = validatePaymentConfirmationData({
    razorpay_order_id: "",
    razorpay_payment_id: "pay_123",
    razorpay_signature: "signature",
  });

  assert.equal(result.isValid, false);
  assert.equal(result.errors.razorpay_order_id, "razorpay_order_id is required");
});
