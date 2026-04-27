import crypto from "crypto";
import { FeatureForm } from "../../models/mongodbModels/featureForm.js";
import BestFilmCritic from "../../models/mongodbModels/BestFilmCritic.js";
import Payment from "../../models/mongodbModels/Payment.js";
import { formType } from "../../services/common.js";
import BestBookCinema from "../../models/mongodbModels/BestBookCinema.js";
import {
  validatePaymentConfirmationData,
  validatePaymentData,
} from "../../helpers/paymentSchemaHelper.js";

const SUCCESS_AUTH_STATUSES = new Set(["0300", "2", "SUCCESS"]);

const getUserId = (user) => String(user?.id || user?._id || "");
const getPaymentSecret = () => process.env.PAYMENT_GATEWAY_SECRET;

const normalizeAmount = (amount) => {
  if (amount === undefined || amount === null || amount === "") return null;
  return String(amount);
};

const buildSignaturePayload = ({ payment_id, auth_status, amount, bank_ref_no }) =>
  JSON.stringify({
    payment_id,
    auth_status: String(auth_status),
    amount: normalizeAmount(amount) || "",
    bank_ref_no,
  });

const createPaymentSignature = (payload) =>
  crypto
    .createHmac("sha256", getPaymentSecret())
    .update(buildSignaturePayload(payload))
    .digest("hex");

const verifyPaymentSignature = (payload) => {
  const expectedSignature = createPaymentSignature(payload);
  const receivedSignature = String(payload.signature);

  if (!/^[0-9a-fA-F]+$/.test(receivedSignature)) return false;

  const expectedBuffer = Buffer.from(expectedSignature, "hex");
  const receivedBuffer = Buffer.from(receivedSignature, "hex");
  if (receivedBuffer.length !== expectedBuffer.length) return false;

  return crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
};

async function findApplication(payload, userId) {
  const form_Type = formType[payload.form_type];
  let Model = null;

  if (form_Type === formType.FEATURE || form_Type === formType.NON_FEATURE) {
    Model = FeatureForm;
  } else if (form_Type === formType.BEST_BOOK) {
    Model = BestBookCinema;
  } else if (form_Type === formType.BEST_FILM_CRITIC) {
    Model = BestFilmCritic;
  }

  if (!Model) {
    return { form_Type, applicationData: null };
  }

  const applicationData = await Model.findOne({
    _id: payload.id,
    client_id: userId,
  });

  return { form_Type, applicationData };
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

const generateHash = async (req, res) => {
  const { isValid, errors, data } = validatePaymentData(req.body);
  if (!isValid) {
    return res.status(422).json({
      message: "Validation failed",
      errors,
      statusCode: 422,
    });
  }

  try {
    const payload = {
      ...data,
      user: req.user,
    };

    const { form_Type, applicationData } = await findApplication(payload, getUserId(payload.user));

    if (!form_Type) {
      return res.status(422).json({
        message: "Validation failed",
        errors: { form_type: "Invalid form type" },
        statusCode: 422,
      });
    }

    if (!applicationData) {
      return res.status(200).json({
        message:
          "You are not an authorized user to payment. Please contact our support.!!",
        status: false,
        statusCode: 203,
      });
    }

    const paymentInsert = await Payment.create({
      client_id: applicationData.client_id,
      website_type: 5,
      form_type: form_Type,
      context_id: applicationData._id,
      amount: normalizeAmount(payload.amount),
      currency: payload.currency || "INR",
      request_payload: JSON.stringify({
        id: payload.id,
        form_type: payload.form_type,
        amount: normalizeAmount(payload.amount),
        currency: payload.currency || "INR",
      }),
      status: 1,
    });

    applicationData.payment_status = 1;
    await applicationData.save();

    return res.status(200).json({
      message: "Payment initiated. Awaiting verified gateway confirmation.",
      status: true,
      statusCode: 200,
      data: paymentInsert,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      statusCode: 500,
    });
  }
};

const confirmPayment = async (req, res) => {
  const { isValid, errors, data } = validatePaymentConfirmationData(req.body);
  if (!isValid) {
    return res.status(422).json({
      message: "Validation failed",
      errors,
      statusCode: 422,
    });
  }

  if (!getPaymentSecret()) {
    return res.status(500).json({
      message: "Payment gateway secret is not configured",
      statusCode: 500,
    });
  }

  try {
    if (!verifyPaymentSignature(data)) {
      return res.status(403).json({
        message: "Invalid payment signature",
        statusCode: 403,
      });
    }

    const payment = await Payment.findById(data.payment_id);
    if (!payment) {
      return res.status(200).json({
        message: "Payment record not found",
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

    const storedAmount = payment.amount?.toString();
    const receivedAmount = normalizeAmount(data.amount);
    if (storedAmount && receivedAmount && storedAmount !== receivedAmount) {
      payment.status = 3;
      payment.error_status = "AMOUNT_MISMATCH";
      payment.transaction_error_desc = "Confirmed amount does not match initiated amount";
      await payment.save();

      return res.status(422).json({
        message: "Payment amount mismatch",
        statusCode: 422,
      });
    }

    if (!SUCCESS_AUTH_STATUSES.has(String(data.auth_status).toUpperCase())) {
      payment.status = 3;
      payment.auth_status = String(data.auth_status);
      payment.error_status = "PAYMENT_NOT_SUCCESSFUL";
      payment.transaction_error_desc = "Gateway did not return a successful auth status";
      await payment.save();

      return res.status(200).json({
        message: "Payment was not successful",
        statusCode: 203,
      });
    }

    if (payment.status === 2 && applicationData.payment_status == 2) {
      return res.status(200).json({
        message: "Payment already verified",
        statusCode: 200,
        data: payment,
      });
    }

    payment.status = 2;
    payment.auth_status = String(data.auth_status);
    payment.bank_ref_no = data.bank_ref_no;
    payment.payment_method_type = data.payment_method_type || payment.payment_method_type;
    payment.currency = data.currency || payment.currency;
    payment.payment_date = data.payment_date ? new Date(data.payment_date) : new Date();
    await payment.save();

    applicationData.payment_status = 2;
    applicationData.payment_response = {
      payment_id: payment._id,
      bank_ref_no: payment.bank_ref_no,
      auth_status: payment.auth_status,
      verified_at: new Date(),
    };
    await applicationData.save();

    return res.status(200).json({
      message: "Payment verified and status updated",
      statusCode: 200,
      data: payment,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      statusCode: 500,
    });
  }
};

export default {
  generateHash,
  confirmPayment,
};
