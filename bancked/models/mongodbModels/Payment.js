import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    client_id: {
      type: String,
      required: true,
    },
    website_type: {
      type: Number,
      default: null,
    },
    form_type: {
      type: Number,
      default: null,
    },
    context_id: {
      type: String,
      default: null,
    },
    request_payload: {
      type: String,
      default: null,
    },
    response_payload: {
      type: String,
      default: null,
    },
    amount: {
      type: mongoose.Types.Decimal128,
      default: null,
    },
    gateway: {
      type: String,
      default: null,
    },
    gateway_order_id: {
      type: String,
      default: null,
    },
    gateway_payment_id: {
      type: String,
      default: null,
    },
    gateway_signature: {
      type: String,
      default: null,
    },
    receipt: {
      type: String,
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
      type: String,
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
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
    collection: "payments",
  }
);

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;
