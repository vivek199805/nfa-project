import crypto from "crypto";
import Razorpay from "razorpay";
import { findBestBookByIdForUser, updateBestBookByIdForUser } from "../repositories/bestBook.repository.js";
import { findBestFilmCriticByIdForUser, updateBestFilmCriticByIdForUser } from "../repositories/bestFilmCritic.repository.js";
import { findFeatureFormByIdForUser, updateFeatureFormByIdForUser } from "../repositories/featureForm.repository.js";
import { createPayment, findPaymentByGatewayOrder, updatePaymentById } from "../repositories/payment.repository.js";
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

const compactRazorpayOrder = (order) => ({
  id: order?.id,
  entity: order?.entity,
  amount: order?.amount,
  amount_paid: order?.amount_paid,
  amount_due: order?.amount_due,
  currency: order?.currency,
  receipt: order?.receipt,
  status: order?.status,
  attempts: order?.attempts,
  created_at: order?.created_at,
});

const compactRazorpayPayment = (payment) => ({
  id: payment?.id,
  entity: payment?.entity,
  amount: payment?.amount,
  currency: payment?.currency,
  status: payment?.status,
  order_id: payment?.order_id,
  invoice_id: payment?.invoice_id,
  international: payment?.international,
  method: payment?.method,
  amount_refunded: payment?.amount_refunded,
  refund_status: payment?.refund_status,
  captured: payment?.captured,
  description: payment?.description,
  card_id: payment?.card_id,
  bank: payment?.bank,
  wallet: payment?.wallet,
  vpa: payment?.vpa,
  email: payment?.email,
  contact: payment?.contact,
  fee: payment?.fee,
  tax: payment?.tax,
  error_code: payment?.error_code,
  error_description: payment?.error_description,
  error_source: payment?.error_source,
  error_step: payment?.error_step,
  error_reason: payment?.error_reason,
  acquirer_data: payment?.acquirer_data,
  created_at: payment?.created_at,
});

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
  let applicationData = null;

  if (formTypeValue === formType.FEATURE || formTypeValue === formType.NON_FEATURE) {
    applicationData = await findFeatureFormByIdForUser(payload.id, userId);
  } else if (formTypeValue === formType.BEST_BOOK) {
    applicationData = await findBestBookByIdForUser(payload.id, userId);
  } else if (formTypeValue === formType.BEST_FILM_CRITIC) {
    applicationData = await findBestFilmCriticByIdForUser(payload.id, userId);
  }

  return { formTypeValue, applicationData };
}

async function findApplicationForPayment(payment) {
  if (payment.form_type === formType.FEATURE || payment.form_type === formType.NON_FEATURE) {
    return findFeatureFormByIdForUser(payment.context_id, payment.client_id);
  }
  if (payment.form_type === formType.BEST_BOOK) {
    return findBestBookByIdForUser(payment.context_id, payment.client_id);
  }
  if (payment.form_type === formType.BEST_FILM_CRITIC) {
    return findBestFilmCriticByIdForUser(payment.context_id, payment.client_id);
  }

  return null;
}

const updateApplicationForPayment = (applicationData, payment, data) => {
  if (payment.form_type === formType.FEATURE || payment.form_type === formType.NON_FEATURE) {
    return updateFeatureFormByIdForUser(applicationData.id, applicationData.client_id, data);
  }
  if (payment.form_type === formType.BEST_BOOK) {
    return updateBestBookByIdForUser(applicationData.id, applicationData.client_id, data);
  }
  if (payment.form_type === formType.BEST_FILM_CRITIC) {
    return updateBestFilmCriticByIdForUser(applicationData.id, applicationData.client_id, data);
  }
  return null;
};

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

  const receipt = buildReceipt(payload.form_type, applicationData.id);
  const currency = payload.currency || DEFAULT_CURRENCY;

  const paymentRecord = await createPayment({
    client_id: applicationData.client_id,
    website_type: 5,
    form_type: formTypeValue,
    context_id: applicationData.id,
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
        payment_record_id: String(paymentRecord.id),
        context_id: String(applicationData.id),
        form_type: payload.form_type,
        client_id: String(applicationData.client_id),
      },
    });
  } catch (error) {
    await updatePaymentById(paymentRecord.id, {
      status: 3,
      error_status: "ORDER_CREATION_FAILED",
      transaction_error_desc: error.message || "Razorpay order creation failed",
    });
    throw error;
  }

  await updatePaymentById(paymentRecord.id, {
    gateway_order_id: razorpayOrder.id,
    response_payload: JSON.stringify(compactRazorpayOrder(razorpayOrder)),
  });

  await updateApplicationForPayment(applicationData, { form_type: formTypeValue }, {
    payment_status: "1",
    amount: normalizeAmount(amountInRupees),
    receipt,
    payment_response: {
      gateway: RAZORPAY_GATEWAY,
      order_id: razorpayOrder.id,
      initiated_at: new Date(),
    },
  });

  return {
    message: "Razorpay order created successfully",
    status: true,
    statusCode: 200,
    data: {
      key: getRazorpayKeyId(),
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      order_id: razorpayOrder.id,
      payment_id: paymentRecord.id,
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

  let payment = await findPaymentByGatewayOrder({
    gatewayOrderId: payload.razorpay_order_id,
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
    await updatePaymentById(payment.id, {
      status: 3,
      error_status: "ORDER_MISMATCH",
      transaction_error_desc: "Razorpay payment order does not match the initiated order",
    });

    return {
      httpStatus: 422,
      statusCode: 422,
      message: "Razorpay order mismatch",
    };
  }

  const storedAmountInPaise = toPaiseAmount(payment.amount?.toString());
  if (storedAmountInPaise && Number(razorpayPayment.amount) !== Number(storedAmountInPaise)) {
    await updatePaymentById(payment.id, {
      status: 3,
      error_status: "AMOUNT_MISMATCH",
      transaction_error_desc: "Razorpay payment amount does not match the initiated amount",
    });

    return {
      httpStatus: 422,
      statusCode: 422,
      message: "Payment amount mismatch",
    };
  }

  if ((razorpayPayment.status || "").toLowerCase() !== "captured") {
    await updatePaymentById(payment.id, {
      status: 3,
      error_status: "PAYMENT_NOT_CAPTURED",
      transaction_error_desc: "Razorpay payment was not captured successfully",
      response_payload: JSON.stringify(compactRazorpayPayment(razorpayPayment)),
    });

    return {
      httpStatus: 422,
      statusCode: 422,
      message: "Payment was not captured successfully",
    };
  }

  payment = await updatePaymentById(payment.id, {
    status: 2,
    auth_status: "SUCCESS",
    gateway_payment_id: payload.razorpay_payment_id,
    gateway_signature: payload.razorpay_signature,
    bank_ref_no:
      razorpayPayment.acquirer_data?.bank_transaction_id ||
      razorpayPayment.acquirer_data?.rrn ||
      payload.razorpay_payment_id,
    payment_method_type: razorpayPayment.method || payment.payment_method_type,
    currency: razorpayPayment.currency || payment.currency,
    payment_date: new Date(),
    response_payload: JSON.stringify({
      payment: compactRazorpayPayment(razorpayPayment),
      order: compactRazorpayOrder(razorpayOrder),
    }),
  });

  await updateApplicationForPayment(applicationData, payment, {
    payment_status: "2",
    payment_date: new Date(),
    amount: payment.amount?.toString?.() || payment.amount,
    reference_number: payload.razorpay_payment_id,
    receipt: payment.receipt || razorpayOrder?.receipt || applicationData.receipt,
    payment_response: {
      gateway: RAZORPAY_GATEWAY,
      order_id: payload.razorpay_order_id,
      payment_id: payload.razorpay_payment_id,
      signature_verified: true,
      verified_at: new Date(),
    },
  });

  return {
    message: "Payment verified and application updated successfully",
    statusCode: 200,
    data: payment,
  };
};
