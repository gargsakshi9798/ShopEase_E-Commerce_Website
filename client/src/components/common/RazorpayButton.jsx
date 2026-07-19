/**
 * RazorpayButton.jsx
 *
 * Plug-and-play Razorpay payment button component.
 *
 * Wraps useRazorpay into a self-contained button that handles all states:
 *   idle → loading → checkout (modal) → verifying → success / error
 *
 * Basic usage (drop into any page):
 * ─────────────────────────────────
 *   <RazorpayButton
 *     addressId={selectedAddressId}
 *     cartItems={cartItems}
 *     amount={checkoutSummary.total_amount}
 *     onSuccess={(order) => navigate("/order-confirmed")}
 *   />
 *
 * Advanced usage (custom label + method):
 * ────────────────────────────────────────
 *   <RazorpayButton
 *     addressId={selectedAddressId}
 *     cartItems={cartItems}
 *     amount={1299}
 *     paymentMethod="upi"
 *     label="Pay with UPI"
 *     className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl"
 *     onSuccess={(order) => console.log("Order placed:", order)}
 *     onDismiss={() => toast("You cancelled the payment")}
 *     onError={(err) => console.error(err)}
 *   />
 *
 * Props:
 *   addressId      {string}    required  – MongoDB Address _id
 *   cartItems      {Array}     optional  – cart item fallback
 *   amount         {number}    required  – total amount in ₹ (display only)
 *   paymentMethod  {string}    optional  – "razorpay"|"upi"|"card"|"emi"|"netbanking"
 *   notes          {string}    optional  – order notes
 *   label          {string}    optional  – button label (default: "Pay ₹X")
 *   className      {string}    optional  – override button classes
 *   disabled       {boolean}   optional  – external disable flag
 *   showAmount     {boolean}   optional  – show amount in button (default true)
 *   onSuccess      {function}  required  – callback(orderResult)
 *   onDismiss      {function}  optional  – callback()
 *   onError        {function}  optional  – callback(Error)
 */

import { MdLock, MdCheckCircle } from "react-icons/md";
import { SiRazorpay }            from "react-icons/si";
import useRazorpay, { RAZORPAY_STATUS } from "../../hooks/useRazorpay";

// ─── Spinner ──────────────────────────────────────────────────────────────────
const Spinner = ({ size = 16 }) => (
  <span
    style={{ width: size, height: size }}
    className="inline-block border-2 border-white border-t-transparent rounded-full animate-spin flex-shrink-0"
    aria-hidden="true"
  />
);

// ─── RazorpayButton ───────────────────────────────────────────────────────────
const RazorpayButton = ({
  // Payment config
  addressId,
  cartItems     = [],
  amount        = 0,
  paymentMethod = "razorpay",
  notes         = "",

  // UI config
  label         = null,
  className     = null,
  disabled      = false,
  showAmount    = true,

  // Callbacks
  onSuccess,
  onDismiss,
  onError,
}) => {
  const { pay, status, error, reset } = useRazorpay({
    addressId,
    cartItems,
    paymentMethod,
    notes,
    onSuccess,
    onDismiss,
    onError,
  });

  const isLoading    = status === RAZORPAY_STATUS.LOADING;
  const isCheckout   = status === RAZORPAY_STATUS.CHECKOUT;
  const isVerifying  = status === RAZORPAY_STATUS.VERIFYING;
  const isSuccess    = status === RAZORPAY_STATUS.SUCCESS;
  const isError      = status === RAZORPAY_STATUS.ERROR;
  const isBusy       = isLoading || isCheckout || isVerifying;

  // ── Button label ────────────────────────────────────────────────────────
  const amountStr  = amount > 0
    ? `₹${Number(amount).toLocaleString("en-IN")}`
    : "";

  const defaultLabel = showAmount && amountStr
    ? `Pay ${amountStr}`
    : "Pay Now";

  const buttonLabel = label || defaultLabel;

  // ── Derived label shown inside button based on current state ────────────
  const renderContent = () => {
    if (isLoading) {
      return (
        <>
          <Spinner size={16} />
          <span>Preparing payment…</span>
        </>
      );
    }
    if (isCheckout) {
      return (
        <>
          <Spinner size={16} />
          <span>Complete payment in popup…</span>
        </>
      );
    }
    if (isVerifying) {
      return (
        <>
          <Spinner size={16} />
          <span>Verifying payment…</span>
        </>
      );
    }
    if (isSuccess) {
      return (
        <>
          <MdCheckCircle size={18} />
          <span>Payment Confirmed!</span>
        </>
      );
    }
    return (
      <>
        <MdLock size={16} className="flex-shrink-0" />
        <span>{buttonLabel}</span>
      </>
    );
  };

  // ── Base + state-dependent classes ──────────────────────────────────────
  const baseClasses =
    "inline-flex items-center justify-center gap-2 font-bold text-sm " +
    "rounded-xl px-6 py-3.5 transition-all select-none focus:outline-none " +
    "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500";

  const stateClasses = isSuccess
    ? "bg-green-500 text-white cursor-default"
    : isBusy || disabled
      ? "bg-primary-400 text-white cursor-not-allowed opacity-80"
      : "bg-primary-600 hover:bg-primary-700 active:scale-[0.98] text-white shadow-md shadow-blue-200";

  const resolvedClass = className
    ? `${baseClasses} ${className}`
    : `${baseClasses} ${stateClasses} w-full`;

  return (
    <div className="space-y-2">
      {/* ── Main button ──────────────────────────────────────────────── */}
      <button
        type="button"
        onClick={isSuccess ? undefined : pay}
        disabled={isBusy || disabled || isSuccess}
        className={resolvedClass}
        aria-busy={isBusy}
        aria-label={isBusy ? "Processing payment" : buttonLabel}
      >
        {renderContent()}
      </button>

      {/* ── Error message + retry ────────────────────────────────────── */}
      {isError && error && (
        <div
          role="alert"
          className="flex items-start justify-between gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3"
        >
          <p className="text-xs text-red-600 font-medium leading-relaxed flex-1">
            {error}
          </p>
          <button
            type="button"
            onClick={reset}
            className="text-xs text-red-500 hover:text-red-700 font-bold whitespace-nowrap underline flex-shrink-0"
          >
            Try again
          </button>
        </div>
      )}

      {/* ── Security badge ───────────────────────────────────────────── */}
      {!isSuccess && (
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-400">
          <SiRazorpay size={13} className="text-[#072654]" aria-hidden="true" />
          <span>Secured by Razorpay • 256-bit SSL</span>
        </div>
      )}
    </div>
  );
};

export default RazorpayButton;
