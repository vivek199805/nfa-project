// models/Payment.js
import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    client_id: {
      type: String,
      required: true,
    },

    website_type: {
      type: Number, // TINYINT → Number
      default: null,
    },

    form_type: {
      type: Number, // TINYINT → Number
      default: null,
    },

    context_id: {
      type: String,
      default: null,
    },

    request_payload: {
      type: String, // TEXT → String
      default: null,
    },

    amount: {
      type: mongoose.Types.Decimal128,
      default: null,
    },

    payment_date: {
      type: Date,
      default: null,
    },

    bank_ref_no: {
      type: String,
      default: null,
    },

    payment_method_type: {
      type: String,
      default: null,
    },

    currency: {
      type: String,
      default: null,
    },

    bank_id: {
      type: Number,
      default: null,
    },

    bank_merchant_id: {
      type: Number,
      default: null,
    },

    item_code: {
      type: String,
      default: null,
    },

    security_type: {
      type: String,
      default: null,
    },

    security_id: {
      type: Number,
      default: null,
    },

    security_password: {
      type: String,
      default: null,
    },

    auth_status: {
      type: Number, // TINYINT → Number
      default: null,
    },

    settlement_type: {
      type: String,
      default: null,
    },

    error_status: {
      type: String,
      default: null,
    },

    transaction_error_desc: {
      type: String,
      default: null,
    },

    status: {
      type: Number, // TINYINT → Number
      default: null,
    },
  },
  {
    timestamps: true, // Mongoose auto-manages `createdAt` and `updatedAt`
    collection: "payments",
  }
);

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;
