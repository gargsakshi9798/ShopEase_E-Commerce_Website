/**
 * razorpayService.js
 *
 * Frontend service layer for Razorpay integration.
 *
 * Responsibilities:
 *   - Load the Razorpay checkout.js SDK script (once, cached)
 *   - Launch the Razorpay checkout modal with full options
 *   - Provide a self-contained openCheckout() function that the
 *     useRazorpay hook and RazorpayButton component consume
 *
 * This file has ZERO React dependencies — it is plain JS so it can be
 * used outside of React if needed (e.g. in a vanilla TS utility).
 */

// ─── Constants ────────────────────────────────────────────────────────────────
const RAZORPAY_SCRIPT_URL = "https://checkout.razorpay.com/v1/checkout.js";
const RAZORPAY_BRAND_COLOR = "#2563eb"; // Tailwind primary-600

// ─── SDK Loader (singleton promise) ─────────────────────────────────────────
let _sdkPromise = null;

/**
 * Loads the Razorpay checkout.js script exactly once.
 * Subsequent calls return the cached promise.
 *
 * @returns {Promise<boolean>} Resolves true on success, false on failure.
 */
export const loadRazorpaySdk = () => {
  // Already loaded — resolve immediately
  if (window.Razorpay) return Promise.resolve(true);

  // In-flight load — reuse the existing promise
  if (_sdkPromise) return _sdkPromise;

  _sdkPromise = new Promise((resolve) => {
    const script    = document.createElement("script");
    script.src      = RAZORPAY_SCRIPT_URL;
    script.async    = true;
    script.onload   = () => resolve(true);
    script.onerror  = () => {
      _sdkPromise = null; // allow retry on next call
      resolve(false);
    };
    document.body.appendChild(script);
  });

  return _sdkPromise;
};

// ─── Checkout Launcher ────────────────────────────────────────────────────────

/**
 * Opens the Razorpay checkout modal.
 *
 * @param {object}   opts
 * @param {string}   opts.key_id             - Razorpay public key (rzp_test_xxx / rzp_live_xxx)
 * @param {string}   opts.razorpay_order_id  - Order ID returned by your backend (order_xxx)
 * @param {number}   opts.amount             - Amount in PAISE (e.g. ₹500 → 50000)
 * @param {string}   [opts.currency]         - Defaults to "INR"
 * @param {string}   [opts.name]             - Merchant name shown in modal
 * @param {string}   [opts.description]      - Short payment description
 * @param {string}   [opts.image]            - Merchant logo URL
 * @param {string}   [opts.theme_color]      - Hex color for modal accent
 * @param {object}   [opts.prefill]          - { name, email, contact }
 * @param {object}   [opts.notes]            - Key-value metadata passed to Razorpay
 * @param {string}   [opts.method]           - Force a payment method: "upi"|"card"|"netbanking"|"emi"
 *
 * @param {function} opts.onSuccess          - Called with Razorpay response on successful payment
 *                                             Signature: ({ razorpay_order_id, razorpay_payment_id, razorpay_signature }) => void
 * @param {function} [opts.onDismiss]        - Called when the user closes the modal without paying
 * @param {function} [opts.onError]          - Called with an Error object if the SDK fails to load
 *
 * @returns {Promise<void>}
 */
export const openRazorpayCheckout = async ({
  key_id,
  razorpay_order_id,
  amount,
  currency       = "INR",
  name           = "ShopEase",
  description    = "Order Payment",
  image          = null,
  theme_color    = RAZORPAY_BRAND_COLOR,
  prefill        = {},
  notes          = {},
  method         = null,
  onSuccess,
  onDismiss      = () => {},
  onError        = () => {},
}) => {
  // ── 1. Load SDK ────────────────────────────────────────────────────────────
  const loaded = await loadRazorpaySdk();
  if (!loaded) {
    const err = new Error(
      "Failed to load Razorpay payment gateway. Please check your internet connection and try again."
    );
    onError(err);
    return;
  }

  // ── 2. Validate required params ────────────────────────────────────────────
  if (!key_id) {
    const err = new Error("Razorpay key_id is missing. Configure VITE_RAZORPAY_KEY_ID in client/.env");
    onError(err);
    return;
  }
  if (!razorpay_order_id) {
    const err = new Error("razorpay_order_id is required to open checkout");
    onError(err);
    return;
  }

  // ── 3. Build options ───────────────────────────────────────────────────────
  const options = {
    key:         key_id,
    amount,
    currency,
    name,
    description,
    order_id:    razorpay_order_id,
    prefill,
    notes,
    theme:       { color: theme_color },
    modal: {
      backdropclose: false,             // prevent accidental close on backdrop click
      escape:        false,             // prevent Esc key dismissal
      ondismiss:     () => onDismiss(),
    },
    handler: (response) => {
      // response = { razorpay_order_id, razorpay_payment_id, razorpay_signature }
      if (typeof onSuccess === "function") {
        onSuccess(response);
      }
    },
  };

  // Optional: merchant logo
  if (image) options.image = image;

  // Optional: force a specific payment method
  if (method) {
    const methodMap = {
      upi:        { upi: true },
      card:       { card: true },
      netbanking: { netbanking: true },
      emi:        { emi: true },
      wallet:     { wallet: true },
    };
    if (methodMap[method]) options.method = methodMap[method];
  }

  // ── 4. Open checkout ───────────────────────────────────────────────────────
  const rzp = new window.Razorpay(options);

  // Razorpay fires this when a payment fails (before the modal closes)
  rzp.on("payment.failed", (response) => {
    console.error("[RazorpayService] payment.failed:", response.error);
    onError(
      Object.assign(
        new Error(response.error?.description || "Payment failed"),
        { razorpayError: response.error }
      )
    );
  });

  rzp.open();
};

// ─── Utility: format amount display ──────────────────────────────────────────

/**
 * Converts paise to a human-readable rupee string.
 * @param {number} paise
 * @returns {string}  e.g. "₹1,299"
 */
export const formatPaise = (paise) =>
  `₹${(paise / 100).toLocaleString("en-IN")}`;
