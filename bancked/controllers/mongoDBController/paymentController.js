import { getUserId, sendServiceResponse } from "../../helpers/controllerHelper.js";
import { errorResponse, sendValidationError } from "../../helpers/responseHelper.js";
import {
  validatePaymentConfirmationData,
  validatePaymentData,
} from "../../helpers/paymentSchemaHelper.js";
import { createOrderService, verifyPaymentService } from "../../services/payment.service.js";

export const createOrder = async (req, res) => {
  const { isValid, errors, data } = validatePaymentData(req.body);
  if (!isValid) return sendValidationError(res, errors);

  try {
    const result = await createOrderService({
      payload: data,
      userId: String(getUserId(req) || ""),
    });

    if (result.statusCode === 422 && result.errors) {
      return sendValidationError(res, result.errors);
    }

    return sendServiceResponse(res, result);
  } catch (error) {
    return errorResponse(res, error, "Unable to create Razorpay order");
  }
};

export const verifyPayment = async (req, res) => {
  const { isValid, errors, data } = validatePaymentConfirmationData(req.body);
  if (!isValid) return sendValidationError(res, errors);

  try {
    const result = await verifyPaymentService(data);
    return sendServiceResponse(res, result);
  } catch (error) {
    return errorResponse(res, error, "Unable to verify Razorpay payment");
  }
};

export default {
  createOrder,
  verifyPayment,
  generateHash: createOrder,
  confirmPayment: verifyPayment,
};
