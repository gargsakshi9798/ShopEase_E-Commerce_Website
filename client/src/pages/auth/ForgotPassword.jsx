import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import {
  MdEmail, MdArrowBack, MdCheckCircle,
  MdLocalShipping, MdSecurity, MdLoop, MdHeadset,
} from "react-icons/md";
import { FaShoppingBag } from "react-icons/fa";
import { POST } from "../../utils/Methods";
import { APIS } from "../../utils/APIS";
import loginBg from "../../assets/images/login.png";
import { showSuccess, showError } from "../../utils/toast";

const features = [
  { icon: MdLocalShipping, title: "Fast & Free Delivery", sub: "On orders above ₹499" },
  { icon: MdSecurity,      title: "Secure Payments",      sub: "100% secure & trusted" },
  { icon: MdLoop,          title: "Easy Returns",         sub: "7 days return policy"  },
  { icon: MdHeadset,       title: "24/7 Support",         sub: "We are here to help"   },
];

// ─── Step 1 — Email Form ──────────────────────────────────────────────────────
const EmailStep = ({ onOtpSent }) => {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async ({ email }) => {
    setLoading(true);
    try {
      await POST(APIS.Auth.ForgotPassword, { email });
      showSuccess("OTP sent to your email!");
      onOtpSent(email);
    } catch (err) {
      const data = err?.response?.data;
      const msg =
        data?.data?.email ||
        data?.message ||
        "Failed to send OTP. Please try again.";
      showError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <MdEmail size={32} className="text-blue-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Forgot Password?</h1>
        <p className="text-gray-400 text-sm mt-2 leading-relaxed">
          Enter your registered email. We'll send a 6-digit OTP to reset your password.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Email Address
          </label>
          <div className="relative">
            <MdEmail
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="email"
              placeholder="Enter your registered email"
              className={`w-full border rounded-xl pl-10 pr-4 py-3.5 text-sm text-gray-700 placeholder-gray-400 outline-none transition-all ${
                errors.email
                  ? "border-red-400 ring-1 ring-red-400"
                  : "border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              }`}
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Enter a valid email address",
                },
              })}
            />
          </div>
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-xl text-white font-bold text-sm bg-blue-600 hover:bg-blue-700 active:scale-[0.99] transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-blue-200"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Sending OTP...
            </span>
          ) : (
            "Send OTP"
          )}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-7">
        Remember your password?{" "}
        <Link to="/login" className="font-semibold text-blue-600 hover:underline">
          Login
        </Link>
      </p>
    </>
  );
};

// ─── Step 2 — OTP Sent confirmation ──────────────────────────────────────────
const OtpSentStep = ({ email, onResend }) => {
  const navigate  = useNavigate();
  const [resending, setResending] = useState(false);

  const handleResend = async () => {
    setResending(true);
    try {
      await POST(APIS.Auth.ForgotPassword, { email });
      showSuccess("OTP resent!");
    } catch {
      showError("Failed to resend OTP. Please try again.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="text-center">
      <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
        <MdCheckCircle size={44} className="text-green-500" />
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Check Your Email!</h1>
      <p className="text-gray-500 text-sm leading-relaxed mb-1">
        We've sent a 6-digit OTP to:
      </p>
      <p className="font-semibold text-gray-800 text-sm mb-6 break-all">{email}</p>

      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-left mb-6 space-y-2">
        <p className="text-xs font-semibold text-blue-700">What to do next:</p>
        {[
          "Open the email from ShopEase",
          "Copy the 6-digit OTP",
          "Click 'Enter OTP' below",
          "Set your new password",
        ].map((step, i) => (
          <div key={i} className="flex items-start gap-2">
            <span className="w-5 h-5 bg-blue-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
              {i + 1}
            </span>
            <p className="text-xs text-gray-600">{step}</p>
          </div>
        ))}
      </div>

      <button
        onClick={() => navigate("/reset-password", { state: { email } })}
        className="w-full py-3.5 rounded-xl text-white font-bold text-sm bg-blue-600 hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 mb-3"
      >
        Enter OTP & Reset Password
      </button>

      <p className="text-xs text-gray-400">
        Didn't receive the email? Check your spam folder or{" "}
        <button
          onClick={handleResend}
          disabled={resending}
          className="text-blue-600 font-semibold hover:underline disabled:opacity-50"
        >
          {resending ? "Resending..." : "resend OTP"}
        </button>
        .
      </p>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const ForgotPassword = () => {
  const [step,  setStep]  = useState("email");  // "email" | "sent"
  const [email, setEmail] = useState("");

  const handleOtpSent = (sentTo) => {
    setEmail(sentTo);
    setStep("sent");
  };

  return (
    <div className="min-h-screen flex bg-[#eef1f8]">

      {/* ── Left Panel ── */}
      <div
        className="hidden lg:flex lg:w-[48%] relative flex-col justify-between p-10 overflow-hidden rounded-2xl m-4"
        style={{
          backgroundImage: `url(${loginBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70 rounded-2xl" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-[#f5a623] rounded-xl flex items-center justify-center shadow-lg">
            <FaShoppingBag size={18} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-lg leading-none">
              <span className="text-[#f5a623]">Shop</span>
              <span className="text-white">Ease</span>
            </p>
            <p className="text-white/50 text-[10px] tracking-widest uppercase">Your Store. Your Style.</p>
          </div>
        </div>

        {/* Hero text + features */}
        <div className="relative z-10">
          <h2 className="text-white text-5xl font-extrabold leading-tight drop-shadow">
            Don't Worry,
          </h2>
          <h2 className="text-[#f5a623] text-5xl font-extrabold leading-tight mb-5 drop-shadow">
            We've Got You!
          </h2>
          <p className="text-white/70 text-sm leading-relaxed max-w-xs mb-8">
            Forgot your password? Enter your email and we'll send a 6-digit OTP to
            securely reset your password in seconds.
          </p>
          <div className="space-y-4">
            {features.map(({ icon: Icon, title, sub }) => (
              <div key={title} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center flex-shrink-0 border border-white/20">
                  <Icon size={19} className="text-white" />
                </div>
                <div>
                  <p className="text-white text-sm font-semibold drop-shadow">{title}</p>
                  <p className="text-white/55 text-xs mt-0.5">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 h-4" />
      </div>

      {/* ── Right Panel ── */}
      <div className="flex-1 flex items-center justify-center px-8 py-12 bg-white m-4 rounded-2xl shadow-sm relative">

        <Link
          to="/login"
          className="absolute top-5 left-5 flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-blue-600 transition-colors group"
        >
          <MdArrowBack size={16} className="group-hover:-translate-x-0.5 transition-transform" />
          Back to Login
        </Link>

        <div className="w-full max-w-[400px]">

          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 mb-8 justify-center">
            <div className="w-9 h-9 bg-[#f5a623] rounded-xl flex items-center justify-center">
              <FaShoppingBag size={16} className="text-white" />
            </div>
            <span className="text-xl font-bold">
              <span className="text-[#f5a623]">Shop</span>
              <span className="text-gray-900">Ease</span>
            </span>
          </div>

          {step === "email"
            ? <EmailStep onOtpSent={handleOtpSent} />
            : <OtpSentStep email={email} />
          }
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
