import { postRequest } from "./requestService";

const RAZORPAY_SCRIPT_ID = "rzp_test_SicSCTBmKwh4Bk";
const RAZORPAY_SCRIPT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

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

  return postRequest("payment/order", formData);
};

export const verifyRazorpayPayment = async (payload) =>
  postRequest("payment/verify", payload);

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
            throw new Error(
              verificationResponse?.message ||
                "Payment verification did not complete successfully"
            );
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
