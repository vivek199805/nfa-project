import crypto from "crypto";
import Razorpay from "razorpay";
import BestBookCinema from "../models/mongodbModels/BestBookCinema.js";
import BestFilmCritic from "../models/mongodbModels/BestFilmCritic.js";
import Payment from "../models/mongodbModels/Payment.js";
import { FeatureForm } from "../models/mongodbModels/featureForm.js";
import { formType } from "./common.js";

const RAZORPAY_GATEWAY = "RAZORPAY";
const DEFAULT_CURRENCY = "INR";

const getRazorpayKeyId = () => process.env.RAZORPAY_KEY_ID;
const getRazorpaySecret = () => process.env.RAZORPAY_KEY_SECRET;

const normalizeAmount = (amount) => {
  if (amount === undefined || amount === null || amount === "") return null;
  return String(amount);
};

const toPaiseAmount = (amount) => {
  const normalized = normalizeAmount(amount);
  if (!normalized) return null;

  const parsedAmount = Number(normalized);
  if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) return null;

  return Math.round(parsedAmount * 100);
};

const getConfiguredAmount = (formTypeKey) => {
  const perFormEnv = {
    FEATURE: process.env.RAZORPAY_FEATURE_AMOUNT,
    NON_FEATURE: process.env.RAZORPAY_NON_FEATURE_AMOUNT,
    BEST_BOOK: process.env.RAZORPAY_BEST_BOOK_AMOUNT,
    BEST_FILM_CRITIC: process.env.RAZORPAY_BEST_FILM_CRITIC_AMOUNT,
  };

  return normalizeAmount(perFormEnv[formTypeKey] || process.env.RAZORPAY_DEFAULT_AMOUNT);
};

const getRazorpayClient = () => {
  const keyId = getRazorpayKeyId();
  const keySecret = getRazorpaySecret();

  if (!keyId || !keySecret) return null;

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
};

const buildReceipt = (formTypeKey, contextId) =>
  `${formTypeKey}-${String(contextId).slice(-12)}-${Date.now()}`
    .replace(/[^a-zA-Z0-9-_]/g, "")
    .slice(0, 40);

const buildRazorpaySignature = ({ razorpay_order_id, razorpay_payment_id }) =>
  crypto
    .createHmac("sha256", getRazorpaySecret())
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

const verifyRazorpaySignature = (payload) => {
  const expectedSignature = buildRazorpaySignature(payload);
  const receivedSignature = String(payload.razorpay_signature || "");

  if (!/^[0-9a-fA-F]+$/.test(receivedSignature)) return false;

  const expectedBuffer = Buffer.from(expectedSignature, "hex");
  const receivedBuffer = Buffer.from(receivedSignature, "hex");

  if (expectedBuffer.length !== receivedBuffer.length) return false;

  return crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
};

async function findApplication(payload, userId) {
  const formTypeValue = formType[payload.form_type];
  let Model = null;

  if (formTypeValue === formType.FEATURE || formTypeValue === formType.NON_FEATURE) {
    Model = FeatureForm;
  } else if (formTypeValue === formType.BEST_BOOK) {
    Model = BestBookCinema;
  } else if (formTypeValue === formType.BEST_FILM_CRITIC) {
    Model = BestFilmCritic;
  }

  if (!Model) return { formTypeValue, applicationData: null };

  const applicationData = await Model.findOne({ _id: payload.id, client_id: userId });
  return { formTypeValue, applicationData };
}

async function findApplicationForPayment(payment) {
  let Model = null;

  if (payment.form_type === formType.FEATURE || payment.form_type === formType.NON_FEATURE) {
    Model = FeatureForm;
  } else if (payment.form_type === formType.BEST_BOOK) {
    Model = BestBookCinema;
  } else if (payment.form_type === formType.BEST_FILM_CRITIC) {
    Model = BestFilmCritic;
  }

  if (!Model) return null;

  return Model.findOne({
    _id: payment.context_id,
    client_id: payment.client_id,
  });
}

export const createOrderService = async ({ payload, userId }) => {
  const razorpay = getRazorpayClient();
  if (!razorpay || !getRazorpayKeyId()) {
    return {
      httpStatus: 500,
      statusCode: 500,
      message: "Razorpay is not configured on the server",
    };
  }

  const { formTypeValue, applicationData } = await findApplication(payload, userId);

  if (!formTypeValue) {
    return {
      statusCode: 422,
      httpStatus: 422,
      message: "Validation failed",
      errors: { form_type: "Invalid form type" },
    };
  }

  if (!applicationData) {
    return {
      statusCode: 203,
      status: false,
      message: "You are not authorized to pay for this application. Please contact support.",
    };
  }

  if (String(applicationData.payment_status) === "2") {
    return {
      statusCode: 200,
      status: true,
      message: "Payment has already been completed for this application",
    };
  }

  const amountInRupees = getConfiguredAmount(payload.form_type) || normalizeAmount(payload.amount);
  const amountInPaise = toPaiseAmount(amountInRupees);

  if (!amountInPaise) {
    return {
      httpStatus: 500,
      statusCode: 500,
      message: "Payment amount is not configured for this form",
    };
  }

  const receipt = buildReceipt(payload.form_type, applicationData._id);
  const currency = payload.currency || DEFAULT_CURRENCY;

  const paymentRecord = await Payment.create({
    client_id: applicationData.client_id,
    website_type: 5,
    form_type: formTypeValue,
    context_id: applicationData._id,
    amount: normalizeAmount(amountInRupees),
    currency,
    gateway: RAZORPAY_GATEWAY,
    receipt,
    request_payload: JSON.stringify({
      id: payload.id,
      form_type: payload.form_type,
      amount: normalizeAmount(amountInRupees),
      currency,
    }),
    status: 1,
  });

  let razorpayOrder;
  try {
    razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency,
      receipt,
      notes: {
        payment_record_id: String(paymentRecord._id),
        context_id: String(applicationData._id),
        form_type: payload.form_type,
        client_id: String(applicationData.client_id),
      },
    });
  } catch (error) {
    paymentRecord.status = 3;
    paymentRecord.error_status = "ORDER_CREATION_FAILED";
    paymentRecord.transaction_error_desc = error.message || "Razorpay order creation failed";
    await paymentRecord.save();
    throw error;
  }

  paymentRecord.gateway_order_id = razorpayOrder.id;
  paymentRecord.response_payload = JSON.stringify(razorpayOrder);
  await paymentRecord.save();

  applicationData.payment_status = 1;
  applicationData.amount = normalizeAmount(amountInRupees);
  applicationData.receipt = receipt;
  applicationData.payment_response = {
    gateway: RAZORPAY_GATEWAY,
    order_id: razorpayOrder.id,
    initiated_at: new Date(),
  };
  await applicationData.save();

  return {
    message: "Razorpay order created successfully",
    status: true,
    statusCode: 200,
    data: {
      key: getRazorpayKeyId(),
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      order_id: razorpayOrder.id,
      payment_id: paymentRecord._id,
      receipt,
    },
  };
};

export const verifyPaymentService = async (payload) => {
  if (!getRazorpaySecret()) {
    return {
      httpStatus: 500,
      statusCode: 500,
      message: "Razorpay secret is not configured on the server",
    };
  }

  const razorpay = getRazorpayClient();
  if (!razorpay) {
    return {
      httpStatus: 500,
      statusCode: 500,
      message: "Razorpay is not configured on the server",
    };
  }

  if (!verifyRazorpaySignature(payload)) {
    return {
      httpStatus: 403,
      statusCode: 403,
      message: "Invalid Razorpay payment signature",
    };
  }

  const payment = await Payment.findOne({
    gateway_order_id: payload.razorpay_order_id,
    gateway: RAZORPAY_GATEWAY,
  });

  if (!payment) {
    return {
      statusCode: 203,
      message: "Payment record not found for the provided order",
    };
  }

  const applicationData = await findApplicationForPayment(payment);
  if (!applicationData) {
    return {
      statusCode: 203,
      message: "Application record not found for payment",
    };
  }

  if (payment.status === 2 && String(applicationData.payment_status) === "2") {
    return {
      message: "Payment already verified",
      statusCode: 200,
      data: payment,
    };
  }

  const [razorpayPayment, razorpayOrder] = await Promise.all([
    razorpay.payments.fetch(payload.razorpay_payment_id),
    razorpay.orders.fetch(payload.razorpay_order_id),
  ]);

  if (!razorpayPayment) {
    return {
      httpStatus: 422,
      statusCode: 422,
      message: "Razorpay payment details could not be fetched",
    };
  }

  if (razorpayPayment.order_id !== payload.razorpay_order_id) {
    payment.status = 3;
    payment.error_status = "ORDER_MISMATCH";
    payment.transaction_error_desc = "Razorpay payment order does not match the initiated order";
    await payment.save();

    return {
      httpStatus: 422,
      statusCode: 422,
      message: "Razorpay order mismatch",
    };
  }

  const storedAmountInPaise = toPaiseAmount(payment.amount?.toString());
  if (storedAmountInPaise && Number(razorpayPayment.amount) !== Number(storedAmountInPaise)) {
    payment.status = 3;
    payment.error_status = "AMOUNT_MISMATCH";
    payment.transaction_error_desc = "Razorpay payment amount does not match the initiated amount";
    await payment.save();

    return {
      httpStatus: 422,
      statusCode: 422,
      message: "Payment amount mismatch",
    };
  }

  if ((razorpayPayment.status || "").toLowerCase() !== "captured") {
    payment.status = 3;
    payment.error_status = "PAYMENT_NOT_CAPTURED";
    payment.transaction_error_desc = "Razorpay payment was not captured successfully";
    payment.response_payload = JSON.stringify(razorpayPayment);
    await payment.save();

    return {
      httpStatus: 422,
      statusCode: 422,
      message: "Payment was not captured successfully",
    };
  }

  payment.status = 2;
  payment.auth_status = "SUCCESS";
  payment.gateway_payment_id = payload.razorpay_payment_id;
  payment.gateway_signature = payload.razorpay_signature;
  payment.bank_ref_no =
    razorpayPayment.acquirer_data?.bank_transaction_id ||
    razorpayPayment.acquirer_data?.rrn ||
    payload.razorpay_payment_id;
  payment.payment_method_type = razorpayPayment.method || payment.payment_method_type;
  payment.currency = razorpayPayment.currency || payment.currency;
  payment.payment_date = new Date();
  payment.response_payload = JSON.stringify({
    payment: razorpayPayment,
    order: razorpayOrder,
  });
  await payment.save();

  applicationData.payment_status = 2;
  applicationData.payment_date = new Date();
  applicationData.amount = payment.amount?.toString?.() || payment.amount;
  applicationData.reference_number = payload.razorpay_payment_id;
  applicationData.receipt = payment.receipt || razorpayOrder?.receipt || applicationData.receipt;
  applicationData.payment_response = {
    gateway: RAZORPAY_GATEWAY,
    order_id: payload.razorpay_order_id,
    payment_id: payload.razorpay_payment_id,
    signature_verified: true,
    verified_at: new Date(),
  };
  await applicationData.save();

  return {
    message: "Payment verified and application updated successfully",
    statusCode: 200,
    data: payment,
  };
};
