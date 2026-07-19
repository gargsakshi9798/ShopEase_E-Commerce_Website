/**
 * useRazorpay.js
 *
 * Reusable React hook that encapsulates the entire Razorpay payment flow:
 *   1. Load the Razorpay SDK on mount (preloads to reduce latency)
 *   2. Call the backend to create a Razorpay order
 *   3. Open the Razorpay checkout modal
 *   4. Call the backend to verify the payment signature + persist the order
 *   5. Return state and a single `pay()` trigger to the consumer
 *
 * Usage:
 *   const { pay, status, error, reset } = useRazorpay({
 *     addressId,
 *     cartItems,
 *     onSuccess: (orderResult) => navigate("/order-confirmed"),
 *     onDismiss: () => toast("Payment cancelled"),
 *   });
 *
 *   <button onClick={pay} disabled={status === "loading"}>Pay Now</button>
 *
 * Status lifecycle:
 *   idle → loading (creating order) → checkout (modal open) →
 *   verifying → success | error
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { useDispatch, useSelector }                  from "react-redux";
import toast                                          from "../../utils/toast";

import {
  createRazorpayOrder,
  verifyRazorpayPayment,
} from "../features/public/publicPaymentSlice";

import {
  loadRazorpaySdk,
  openRazorpayCheckout,
} from "../services/razorpay/razorpayService";

// ─── Status enum ─────────────────────────────────────────────────────────────
export const RAZORPAY_STATUS = Object.freeze({
  IDLE:       "idle",
  LOADING:    "loading",    // creating the Razorpay order on the backend
  CHECKOUT:   "checkout",   // Razorpay modal is open
  VERIFYING:  "verifying",  // verifying signature + persisting order
  SUCCESS:    "success",
  ERROR:      "error",
});

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * @param {object}   config
 * @param {string}   config.addressId          - MongoDB Address _id for delivery
 * @param {Array}    [config.cartItems]         - Cart items (fallback if DB cart is empty)
 * @param {string}   [config.paymentMethod]     - "razorpay" | "upi" | "card" | "emi"
 * @param {string}   [config.notes]             - Optional order notes
 * @param {function} config.onSuccess           - Called with the order result on success
 * @param {function} [config.onDismiss]         - Called when user closes modal without paying
 * @param {function} [config.onError]           - Called with Error when something fails
 *
 * @returns {{
 *   pay:    () => Promise<void>,
 *   status: string,
 *   error:  string | null,
 *   reset:  () => void,
 * }}
 */
const useRazorpay = ({
  addressId,
  cartItems      = [],
  paymentMethod  = "razorpay",
  notes          = "",
  onSuccess,
  onDismiss,
  onError,
} = {}) => {
  const dispatch = useDispatch();
  const { checkoutSummary } = useSelector((s) => s.publicPayment);

  const [status, setStatus] = useState(RAZORPAY_STATUS.IDLE);
  const [error,  setError]  = useState(null);

  // Guard against state updates after unmount
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const safeSet = (fn) => { if (mountedRef.current) fn(); };

  // ── Preload the SDK on mount ─────────────────────────────────────────────
  useEffect(() => {
    loadRazorpaySdk().catch(() => {
      // Non-fatal — we retry inside pay()
    });
  }, []);

  // ── reset ────────────────────────────────────────────────────────────────
  const reset = useCallback(() => {
    safeSet(() => {
      setStatus(RAZORPAY_STATUS.IDLE);
      setError(null);
    });
  }, []);

  // ── Main pay() trigger ───────────────────────────────────────────────────
  const pay = useCallback(async () => {
    if (!addressId) {
      toast.error("Please select a delivery address first");
      return;
    }
    if (status === RAZORPAY_STATUS.LOADING || status === RAZORPAY_STATUS.VERIFYING) {
      return; // already in-flight
    }

    safeSet(() => { setStatus(RAZORPAY_STATUS.LOADING); setError(null); });

    // ── Step 1: Create Razorpay order on the backend ─────────────────────
    const createRes = await dispatch(
      createRazorpayOrder({ address_id: addressId, cart_items: cartItems })
    );

    if (!createRes.payload?.success) {
      const msg =
        createRes.payload?.errors ||
        createRes.payload?.message ||
        "Failed to initiate payment. Please try again.";

      safeSet(() => { setStatus(RAZORPAY_STATUS.ERROR); setError(msg); });
      toast.error(msg);
      if (typeof onError === "function") onError(new Error(msg));
      return;
    }

    const {
      razorpay_order_id,
      amount,
      currency,
      key_id,
    } = createRes.payload.data;

    safeSet(() => setStatus(RAZORPAY_STATUS.CHECKOUT));

    // ── Step 2: Open Razorpay checkout modal ─────────────────────────────
    await openRazorpayCheckout({
      key_id:            key_id || import.meta.env.VITE_RAZORPAY_KEY_ID,
      razorpay_order_id,
      amount,
      currency,
      method:            paymentMethod === "razorpay" ? null : paymentMethod,

      // ── onSuccess: signature received from Razorpay ───────────────────
      onSuccess: async (razorpayResponse) => {
        safeSet(() => setStatus(RAZORPAY_STATUS.VERIFYING));

        const verifyRes = await dispatch(
          verifyRazorpayPayment({
            razorpay_order_id:   razorpayResponse.razorpay_order_id,
            razorpay_payment_id: razorpayResponse.razorpay_payment_id,
            razorpay_signature:  razorpayResponse.razorpay_signature,
            address_id:          addressId,
            payment_method:      paymentMethod,
            cart_items:          cartItems,
            notes,
          })
        );

        if (verifyRes.payload?.success) {
          safeSet(() => { setStatus(RAZORPAY_STATUS.SUCCESS); setError(null); });
          toast.success("Payment successful! Order confirmed 🎉");
          if (typeof onSuccess === "function") {
            onSuccess(verifyRes.payload.data);
          }
        } else {
          const verifyMsg =
            verifyRes.payload?.errors ||
            verifyRes.payload?.message ||
            "Payment verification failed. Contact support if amount was deducted.";

          safeSet(() => { setStatus(RAZORPAY_STATUS.ERROR); setError(verifyMsg); });
          toast.error(verifyMsg);
          if (typeof onError === "function") onError(new Error(verifyMsg));
        }
      },

      // ── onDismiss: user closed the modal ──────────────────────────────
      onDismiss: () => {
        safeSet(() => { setStatus(RAZORPAY_STATUS.IDLE); setError(null); });
        toast("Payment cancelled", { icon: "ℹ️" });
        if (typeof onDismiss === "function") onDismiss();
      },

      // ── onError: SDK load failure or payment.failed event ─────────────
      onError: (err) => {
        const msg = err?.message || "Payment failed. Please try again.";
        safeSet(() => { setStatus(RAZORPAY_STATUS.ERROR); setError(msg); });
        toast.error(msg);
        if (typeof onError === "function") onError(err);
      },
    });
  }, [dispatch, addressId, cartItems, paymentMethod, notes, onSuccess, onDismiss, onError, status]);

  return { pay, status, error, reset };
};

export default useRazorpay;
