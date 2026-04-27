import crypto from "crypto";
import Razorpay from "razorpay";
import { FeatureForm } from "../../models/mongodbModels/featureForm.js";
import BestFilmCritic from "../../models/mongodbModels/BestFilmCritic.js";
import Payment from "../../models/mongodbModels/Payment.js";
import { formType } from "../../services/common.js";
import BestBookCinema from "../../models/mongodbModels/BestBookCinema.js";
import {
  validatePaymentConfirmationData,
  validatePaymentData,
} from "../../helpers/paymentSchemaHelper.js";

const RAZORPAY_GATEWAY = "RAZORPAY";
const DEFAULT_CURRENCY = "INR";

const getUserId = (user) => String(user?.id || user?._id || "");
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
  if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
    return null;
  }

  return Math.round(parsedAmount * 100);
};

const getConfiguredAmount = (formTypeKey) => {
  const perFormEnv = {
    FEATURE: process.env.RAZORPAY_FEATURE_AMOUNT,
    NON_FEATURE: process.env.RAZORPAY_NON_FEATURE_AMOUNT,
    BEST_BOOK: process.env.RAZORPAY_BEST_BOOK_AMOUNT,
    BEST_FILM_CRITIC: process.env.RAZORPAY_BEST_FILM_CRITIC_AMOUNT,
  };

  return normalizeAmount(
    perFormEnv[formTypeKey] || process.env.RAZORPAY_DEFAULT_AMOUNT
  );
};

const getRazorpayClient = () => {
  const keyId = getRazorpayKeyId();
  const keySecret = getRazorpaySecret();

  if (!keyId || !keySecret) {
    return null;
  }

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

  if (!Model) {
    return { formTypeValue, applicationData: null };
  }

  const applicationData = await Model.findOne({
    _id: payload.id,
    client_id: userId,
  });

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

const createOrder = async (req, res) => {
  const { isValid, errors, data } = validatePaymentData(req.body);
  if (!isValid) {
    return res.status(422).json({
      message: "Validation failed",
      errors,
      statusCode: 422,
    });
  }

  const razorpay = getRazorpayClient();
  if (!razorpay || !getRazorpayKeyId()) {
    return res.status(500).json({
      message: "Razorpay is not configured on the server",
      statusCode: 500,
    });
  }

  try {
    const payload = {
      ...data,
      user: req.user,
    };

    const { formTypeValue, applicationData } = await findApplication(
      payload,
      getUserId(payload.user)
    );

    if (!formTypeValue) {
      return res.status(422).json({
        message: "Validation failed",
        errors: { form_type: "Invalid form type" },
        statusCode: 422,
      });
    }

    if (!applicationData) {
      return res.status(200).json({
        message:
          "You are not authorized to pay for this application. Please contact support.",
        status: false,
        statusCode: 203,
      });
    }

    if (String(applicationData.payment_status) === "2") {
      return res.status(200).json({
        message: "Payment has already been completed for this application",
        status: true,
        statusCode: 200,
      });
    }

    const amountInRupees =
      getConfiguredAmount(payload.form_type) || normalizeAmount(payload.amount);
    const amountInPaise = toPaiseAmount(amountInRupees);

    if (!amountInPaise) {
      return res.status(500).json({
        message: "Payment amount is not configured for this form",
        statusCode: 500,
      });
    }

    const receipt = buildReceipt(payload.form_type, applicationData._id);

    const paymentRecord = await Payment.create({
      client_id: applicationData.client_id,
      website_type: 5,
      form_type: formTypeValue,
      context_id: applicationData._id,
      amount: normalizeAmount(amountInRupees),
      currency: payload.currency || DEFAULT_CURRENCY,
      gateway: RAZORPAY_GATEWAY,
      receipt,
      request_payload: JSON.stringify({
        id: payload.id,
        form_type: payload.form_type,
        amount: normalizeAmount(amountInRupees),
        currency: payload.currency || DEFAULT_CURRENCY,
      }),
      status: 1,
    });

    let razorpayOrder;
    try {
      razorpayOrder = await razorpay.orders.create({
        amount: amountInPaise,
        currency: payload.currency || DEFAULT_CURRENCY,
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
      paymentRecord.transaction_error_desc =
        error.message || "Razorpay order creation failed";
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

    return res.status(200).json({
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
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Unable to create Razorpay order",
      statusCode: 500,
    });
  }
};

const verifyPayment = async (req, res) => {
  const { isValid, errors, data } = validatePaymentConfirmationData(req.body);
  if (!isValid) {
    return res.status(422).json({
      message: "Validation failed",
      errors,
      statusCode: 422,
    });
  }

  if (!getRazorpaySecret()) {
    return res.status(500).json({
      message: "Razorpay secret is not configured on the server",
      statusCode: 500,
    });
  }

  const razorpay = getRazorpayClient();
  if (!razorpay) {
    return res.status(500).json({
      message: "Razorpay is not configured on the server",
      statusCode: 500,
    });
  }

  try {
    if (!verifyRazorpaySignature(data)) {
      return res.status(403).json({
        message: "Invalid Razorpay payment signature",
        statusCode: 403,
      });
    }

    const payment = await Payment.findOne({
      gateway_order_id: data.razorpay_order_id,
      gateway: RAZORPAY_GATEWAY,
    });

    if (!payment) {
      return res.status(200).json({
        message: "Payment record not found for the provided order",
        statusCode: 203,
      });
    }

    const applicationData = await findApplicationForPayment(payment);
    if (!applicationData) {
      return res.status(200).json({
        message: "Application record not found for payment",
        statusCode: 203,
      });
    }

    if (payment.status === 2 && String(applicationData.payment_status) === "2") {
      return res.status(200).json({
        message: "Payment already verified",
        statusCode: 200,
        data: payment,
      });
    }

    const [razorpayPayment, razorpayOrder] = await Promise.all([
      razorpay.payments.fetch(data.razorpay_payment_id),
      razorpay.orders.fetch(data.razorpay_order_id),
    ]);

    if (!razorpayPayment) {
      return res.status(422).json({
        message: "Razorpay payment details could not be fetched",
        statusCode: 422,
      });
    }

    if (razorpayPayment.order_id !== data.razorpay_order_id) {
      payment.status = 3;
      payment.error_status = "ORDER_MISMATCH";
      payment.transaction_error_desc =
        "Razorpay payment order does not match the initiated order";
      await payment.save();

      return res.status(422).json({
        message: "Razorpay order mismatch",
        statusCode: 422,
      });
    }

    const storedAmountInPaise = toPaiseAmount(payment.amount?.toString());
    if (
      storedAmountInPaise &&
      Number(razorpayPayment.amount) !== Number(storedAmountInPaise)
    ) {
      payment.status = 3;
      payment.error_status = "AMOUNT_MISMATCH";
      payment.transaction_error_desc =
        "Razorpay payment amount does not match the initiated amount";
      await payment.save();

      return res.status(422).json({
        message: "Payment amount mismatch",
        statusCode: 422,
      });
    }

    if ((razorpayPayment.status || "").toLowerCase() !== "captured") {
      payment.status = 3;
      payment.error_status = "PAYMENT_NOT_CAPTURED";
      payment.transaction_error_desc =
        "Razorpay payment was not captured successfully";
      payment.response_payload = JSON.stringify(razorpayPayment);
      await payment.save();

      return res.status(422).json({
        message: "Payment was not captured successfully",
        statusCode: 422,
      });
    }

    payment.status = 2;
    payment.auth_status = "SUCCESS";
    payment.gateway_payment_id = data.razorpay_payment_id;
    payment.gateway_signature = data.razorpay_signature;
    payment.bank_ref_no =
      razorpayPayment.acquirer_data?.bank_transaction_id ||
      razorpayPayment.acquirer_data?.rrn ||
      data.razorpay_payment_id;
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
    applicationData.reference_number = data.razorpay_payment_id;
    applicationData.receipt = payment.receipt || razorpayOrder?.receipt || applicationData.receipt;
    applicationData.payment_response = {
      gateway: RAZORPAY_GATEWAY,
      order_id: data.razorpay_order_id,
      payment_id: data.razorpay_payment_id,
      signature_verified: true,
      verified_at: new Date(),
    };
    await applicationData.save();

    return res.status(200).json({
      message: "Payment verified and application updated successfully",
      statusCode: 200,
      data: payment,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Unable to verify Razorpay payment",
      statusCode: 500,
    });
  }
};

export default {
  createOrder,
  verifyPayment,
  generateHash: createOrder,
  confirmPayment: verifyPayment,
};
