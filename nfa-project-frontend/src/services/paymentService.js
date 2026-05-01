import { postRequest } from "./requestService";
import { apiConfig } from "./apiEndpoints";

const RAZORPAY_SCRIPT_ID = import.meta.env.VITE_RAZORPAY_SCRIPT_ID;
const RAZORPAY_SCRIPT_SRC = import.meta.env.VITE_RAZORPAY_SCRIPT_SRC;
// VITE_RAZORPAY_SCRIPT_ID=rzp_test_SicSCTBmKwh4Bk
// VITE_RAZORPAY_SCRIPT_SRC=https://checkout.razorpay.com/v1/checkout.js

let razorpayScriptPromise = null;

const toFormData = (payload) => {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      formData.append(key, value);
    }
  });
  return formData;
};

/**
 * Dynamically loads the Razorpay checkout script into the browser.
 *
 * - Returns `false` immediately when running outside the browser (`window` is undefined).
 * - Returns `true` immediately if Razorpay is already available on `window`.
 * - Reuses an in-progress script load promise if a load is already underway.
 * - Rejects if Razorpay script configuration is missing.
 * - Injects a `<script>` element with configured ID and source, resolving on load and rejecting on error.
 * - Resets the cached load promise when loading fails so future attempts may retry.
 *
 * @returns {Promise<boolean>} Promise resolving to `true` when Razorpay is available, or `false` in non-browser environments.
 */
export const loadRazorpayScript = () => {
  if (typeof window === "undefined") {
    return Promise.resolve(false);
  }

  if (window.Razorpay) {
    return Promise.resolve(true);
  }

  if (razorpayScriptPromise) {
    return razorpayScriptPromise;
  }

  if (!RAZORPAY_SCRIPT_ID || !RAZORPAY_SCRIPT_SRC) {
    return Promise.reject(new Error("Razorpay checkout is not configured"));
  }

  razorpayScriptPromise = new Promise((resolve, reject) => {
    const existingScript = document.getElementById(RAZORPAY_SCRIPT_ID);
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(true), {
        once: true,
      });
      existingScript.addEventListener(
        "error",
        () => reject(new Error("Failed to load Razorpay checkout")),
        { once: true },
      );
      return;
    }

    const script = document.createElement("script");
    script.id = RAZORPAY_SCRIPT_ID;
    script.src = RAZORPAY_SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () =>
      reject(new Error("Failed to load Razorpay checkout"));
    document.body.appendChild(script);
  }).catch((error) => {
    razorpayScriptPromise = null;
    throw error;
  });

  return razorpayScriptPromise;
};

export const createRazorpayOrder = async ({ entryId, formType }) => {
  const formData = toFormData({
    id: entryId,
    form_type: formType,
  });

  return postRequest(apiConfig.payment.order, formData);
};

export const verifyRazorpayPayment = async (payload) =>
  postRequest(apiConfig.payment.verify, payload);

/**
 * Initiates a Razorpay checkout flow for an application payment.
 *
 * Creates a Razorpay order, loads the Razorpay checkout script,
 * opens the payment modal, and verifies the payment on completion.
 *
 * @param {Object} params
 * @param {string|number} params.entryId - The application entry identifier.
 * @param {string} params.formType - The type of form being paid for.
 * @param {Object} [params.customer] - Customer prefill data.
 * @param {string} [params.customer.name] - Customer name.
 * @param {string} [params.customer.email] - Customer email address.
 * @param {string} [params.customer.contact] - Customer contact number.
 * @param {string} [params.description] - Optional payment description.
 * @returns {Promise<Object>} Resolves with order, verification, and Razorpay response objects when payment succeeds.
 * @throws {Error} If order creation fails, Razorpay checkout is unavailable, payment is cancelled, or verification fails.
 */

export const startRazorpayPayment = async ({
  entryId,
  formType,
  customer,
  description,
}) => {

  const orderResponse = await createRazorpayOrder({ entryId, formType });

  if (orderResponse?.statusCode !== 200 || !orderResponse?.data?.order_id) {
    throw new Error(orderResponse?.message || "Unable to create Razorpay order");
  }

  await loadRazorpayScript();

  if (!window.Razorpay) {
    throw new Error("Razorpay checkout is unavailable right now");
  }

  return new Promise((resolve, reject) => {
    let settled = false;

    const settleReject = (error) => {
      if (settled) return;
      settled = true;
      reject(error instanceof Error ? error : new Error(String(error)));
    };

    const settleResolve = (value) => {
      if (settled) return;
      settled = true;
      resolve(value);
    };

    const razorpay = new window.Razorpay({
      key: orderResponse.data.key,
      amount: orderResponse.data.amount,
      currency: orderResponse.data.currency,
      name: "National Film Awards",
      description: description || "Application payment",
      order_id: orderResponse.data.order_id,
      prefill: {
        name: customer?.name || "",
        email: customer?.email || "",
        contact: customer?.contact || "",
      },
      notes: {
        entry_id: String(entryId),
        form_type: formType,
      },
      theme: {
        color: "#bea460",
      },
      modal: {
        ondismiss: () => settleReject(new Error("Payment was cancelled")),
      },
      handler: async (response) => {
        try {
          const verificationResponse = await verifyRazorpayPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });

          if (verificationResponse?.statusCode !== 200) {
            throw new Error(verificationResponse?.message || "Payment verification did not complete successfully");
          }

          settleResolve({
            orderResponse,
            verificationResponse,
            razorpayResponse: response,
          });
        } catch (error) {
          settleReject(error);
        }
      },
    });

    razorpay.on("payment.failed", (response) => {
      const descriptionMessage =
        response?.error?.description ||
        response?.error?.reason ||
        response?.error?.code ||
        "Razorpay payment failed";
      settleReject(new Error(descriptionMessage));
    });

    razorpay.open();
  });
};
