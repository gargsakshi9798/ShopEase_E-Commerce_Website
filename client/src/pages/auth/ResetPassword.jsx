import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  MdLock, MdVisibility, MdVisibilityOff,
  MdArrowBack, MdCheckCircle, MdEmail,
  MdLocalShipping, MdSecurity, MdLoop, MdHeadset,
} from "react-icons/md";
import { FaShoppingBag } from "react-icons/fa";
import { POST } from "../../utils/Methods";
import { APIS } from "../../utils/APIS";
import loginBg from "../../assets/images/login.png";
import PasswordStrengthIndicator from "../../components/common/PasswordStrengthIndicator";
import ConfirmPasswordMatch from "../../components/common/ConfirmPasswordMatch";
import { showSuccess, showError } from "../../utils/toast";

const features = [
  { icon: MdLocalShipping, title: "Fast & Free Delivery", sub: "On orders above ₹499" },
  { icon: MdSecurity,      title: "Secure Payments",      sub: "100% secure & trusted" },
  { icon: MdLoop,          title: "Easy Returns",         sub: "7 days return policy"  },
  { icon: MdHeadset,       title: "24/7 Support",         sub: "We are here to help"   },
];

const ResetPassword = () => {
  const navigate  = useNavigate();
  const location  = useLocation();

  // Email passed via navigate state from ForgotPassword page
  const [email, setEmail] = useState(location.state?.email || "");

  const [showNew,      setShowNew]      = useState(false);
  const [showConf,     setShowConf]     = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [done,         setDone]         = useState(false);
  const [pwdValue,     setPwdValue]     = useState("");
  const [confirmValue, setConfirmValue] = useState("");
  const [serverErr,    setServerErr]    = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  // ── No email guard ─────────────────────────────────────────────────────────
  if (!email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#eef1f8] px-4">
        <div className="bg-white rounded-2xl shadow-sm p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5">
            <MdLock size={32} className="text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Invalid Access</h2>
          <p className="text-gray-500 text-sm mb-6 leading-relaxed">
            Please start from the Forgot Password page to receive your OTP.
          </p>
          <Link
            to="/forgot-password"
            className="block w-full py-3 rounded-xl text-white font-bold text-sm bg-blue-600 hover:bg-blue-700 transition-colors text-center"
          >
            Go to Forgot Password
          </Link>
          <Link to="/login" className="block mt-4 text-sm text-gray-400 hover:text-blue-600 transition-colors">
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  // ── Submit handler ─────────────────────────────────────────────────────────
  const onSubmit = async ({ otp, password }) => {
    setLoading(true);
    setServerErr("");
    try {
      // Backend expects: { email, otp, new_password }
      await POST(APIS.Auth.ResetPassword, {
        email,
        otp:          otp.trim(),
        new_password: password,
      });
      setDone(true);
      showSuccess("Password reset successfully!");
    } catch (err) {
      const data = err?.response?.data;
      const msg =
        data?.data?.otp      ||
        data?.data?.password ||
        data?.message        ||
        "Failed to reset password. The OTP may have expired.";
      setServerErr(msg);
      showError(msg);
    } finally {
      setLoading(false);
    }
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

        {/* Hero text */}
        <div className="relative z-10">
          <h2 className="text-white text-5xl font-extrabold leading-tight drop-shadow">
            Secure Your
          </h2>
          <h2 className="text-[#f5a623] text-5xl font-extrabold leading-tight mb-5 drop-shadow">
            Account!
          </h2>
          <p className="text-white/70 text-sm leading-relaxed max-w-xs mb-8">
            Enter the OTP sent to your email and create a strong new password.
            We recommend a mix of letters, numbers, and symbols.
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
          to="/forgot-password"
          className="absolute top-5 left-5 flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-blue-600 transition-colors group"
        >
          <MdArrowBack size={16} className="group-hover:-translate-x-0.5 transition-transform" />
          Back
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

          {!done ? (
            <>
              {/* Header */}
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <MdLock size={32} className="text-blue-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900">Reset Password</h1>
                <p className="text-gray-400 text-sm mt-2 leading-relaxed">
                  Enter the OTP sent to{" "}
                  <span className="font-semibold text-gray-600">{email}</span>
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

                {/* OTP field */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    OTP Code
                  </label>
                  <div className="relative">
                    <MdEmail
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                      size={18}
                    />
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="Enter 6-digit OTP"
                      className={`w-full border rounded-xl pl-10 pr-4 py-3.5 text-sm text-gray-700 placeholder-gray-400 outline-none tracking-[0.3em] font-mono transition-all ${
                        errors.otp
                          ? "border-red-400 ring-1 ring-red-400"
                          : "border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      }`}
                      {...register("otp", {
                        required: "OTP is required",
                        pattern: {
                          value: /^\d{6}$/,
                          message: "Enter the 6-digit OTP from your email",
                        },
                      })}
                    />
                  </div>
                  {errors.otp && (
                    <p className="text-red-500 text-xs mt-1">{errors.otp.message}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1.5">
                    OTP is valid for 10 minutes.{" "}
                    <Link to="/forgot-password" className="text-blue-600 font-semibold hover:underline">
                      Resend OTP
                    </Link>
                  </p>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    New Password
                  </label>
                  <div className="relative">
                    <MdLock
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                      size={18}
                    />
                    <input
                      type={showNew ? "text" : "password"}
                      placeholder="Create a new password"
                      className={`w-full border rounded-xl pl-10 pr-11 py-3.5 text-sm text-gray-700 placeholder-gray-400 outline-none transition-all ${
                        errors.password
                          ? "border-red-400 ring-1 ring-red-400"
                          : "border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      }`}
                      {...register("password", {
                        required: "Password is required",
                        minLength: { value: 8, message: "Password must be at least 8 characters" },
                        onChange: (e) => setPwdValue(e.target.value),
                      })}
                    />
                    <button
                      type="button" tabIndex={-1}
                      onClick={() => setShowNew((v) => !v)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showNew ? <MdVisibilityOff size={18} /> : <MdVisibility size={18} />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
                  )}
                  <PasswordStrengthIndicator password={pwdValue} />
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <MdLock
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                      size={18}
                    />
                    <input
                      type={showConf ? "text" : "password"}
                      placeholder="Confirm your new password"
                      className={`w-full border rounded-xl pl-10 pr-11 py-3.5 text-sm text-gray-700 placeholder-gray-400 outline-none transition-all ${
                        errors.confirmPassword
                          ? "border-red-400 ring-1 ring-red-400"
                          : "border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      }`}
                      {...register("confirmPassword", {
                        required: "Please confirm your password",
                        validate: (v) => v === watch("password") || "Passwords do not match",
                        onChange: (e) => setConfirmValue(e.target.value),
                      })}
                    />
                    <button
                      type="button" tabIndex={-1}
                      onClick={() => setShowConf((v) => !v)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConf ? <MdVisibilityOff size={18} /> : <MdVisibility size={18} />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>
                  )}
                  <ConfirmPasswordMatch password={pwdValue} confirmPassword={confirmValue} />
                </div>

                {/* Server error banner */}
                {serverErr && (
                  <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-xs text-red-600">
                    {serverErr}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl text-white font-bold text-sm bg-blue-600 hover:bg-blue-700 active:scale-[0.99] transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-blue-200"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Resetting Password...
                    </span>
                  ) : (
                    "Reset Password"
                  )}
                </button>
              </form>
            </>
          ) : (
            /* ── Success State ── */
            <div className="text-center">
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <MdCheckCircle size={44} className="text-green-500" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Password Reset!</h1>
              <p className="text-gray-500 text-sm leading-relaxed mb-8">
                Your password has been updated successfully. You can now log in with your new password.
              </p>
              <button
                onClick={() => navigate("/login", { replace: true })}
                className="w-full py-3.5 rounded-xl text-white font-bold text-sm bg-blue-600 hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
              >
                Continue to Login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
