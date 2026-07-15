import { useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { adminLogin } from "../../features/auth/authSlice";
import { customerLogin } from "../../features/public/customerAuthSlice";
import { showSuccess } from "../../utils/toast";
import {
  MdEmail, MdLock, MdVisibility, MdVisibilityOff,
  MdLocalShipping, MdSecurity, MdLoop, MdHeadset,
  MdArrowBack,
} from "react-icons/md";
import { FaGoogle, FaFacebook, FaShoppingBag } from "react-icons/fa";
import loginBg from "../../assets/images/login.png";

const features = [
  { icon: MdLocalShipping, title: "Fast & Free Delivery",  sub: "On orders above ₹499" },
  { icon: MdSecurity,      title: "Secure Payments",       sub: "100% secure & trusted" },
  { icon: MdLoop,          title: "Easy Returns",          sub: "7 days return policy" },
  { icon: MdHeadset,       title: "24/7 Support",          sub: "We are here to help" },
];

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // After login, go back to where user came from (e.g. /checkout), else go home
  const from = location.state?.from || "/";

  const [showPass,    setShowPass]    = useState(false);
  const [rememberMe,  setRememberMe]  = useState(true);
  const [loading,     setLoading]     = useState(false);
  const [serverError, setServerError] = useState(null);

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    setServerError(null);
    try {
      const adminPayload = (await dispatch(adminLogin(data))).payload;
      if (adminPayload?.success) {
        const role = adminPayload.data?.role_slug;
        showSuccess("Welcome back!");
        navigate(
          ["super_admin", "admin", "employee"].includes(role) ? "/admin/dashboard" : from,
          { replace: true }
        );
        return;
      }

      const custPayload = (await dispatch(customerLogin(data))).payload;
      if (custPayload?.success) {
        showSuccess("Welcome back!");
        navigate(from, { replace: true });
        return;
      }

      const msg =
        adminPayload?.message !== "Access denied"
          ? adminPayload?.message
          : custPayload?.message || "Invalid email or password";
      setServerError(msg || "Invalid email or password");
    } catch {
      setServerError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#eef1f8]">

      {/* ── Left Panel — full background image ── */}
      <div
        className="hidden lg:flex lg:w-[48%] relative flex-col justify-between p-10 overflow-hidden rounded-2xl m-4"
        style={{
          backgroundImage: `url(${loginBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Dark overlay so text is readable */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70 rounded-2xl" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-[#f5a623] rounded-xl flex items-center justify-center shadow-lg">
            <FaShoppingBag size={18} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-lg leading-none">
              <span className="text-[#f5a623]">Shop</span><span className="text-white">Zone</span>
            </p>
            <p className="text-white/50 text-[10px] tracking-widest uppercase">Your Store. Your Style.</p>
          </div>
        </div>

        {/* Hero Text + Features */}
        <div className="relative z-10">
          <h2 className="text-white text-5xl font-extrabold leading-tight drop-shadow">
            Shop Everything
          </h2>
          <h2 className="text-[#f5a623] text-5xl font-extrabold leading-tight mb-5 drop-shadow">
            You Love
          </h2>
          <p className="text-white/70 text-sm leading-relaxed max-w-xs mb-8">
            Discover the best products across fashion, electronics, mobiles, laptops & more.
            Quality you can trust, prices you'll love!
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

        {/* Bottom spacer — the image itself shows the products */}
        <div className="relative z-10 h-4" />
      </div>

      {/* ── Right Panel — white form ── */}
      <div className="flex-1 flex items-center justify-center px-8 py-12 bg-white m-4 rounded-2xl shadow-sm relative">

        {/* Back to Home */}
        <Link
          to="/"
          className="absolute top-5 right-5 flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-blue-600 transition-colors group"
        >
          <MdArrowBack size={16} className="group-hover:-translate-x-0.5 transition-transform" />
          Back to Home
        </Link>

        <div className="w-full max-w-[400px]">

          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 mb-8 justify-center">
            <div className="w-9 h-9 bg-[#f5a623] rounded-xl flex items-center justify-center">
              <FaShoppingBag size={16} className="text-white" />
            </div>
            <span className="text-xl font-bold">
              <span className="text-[#f5a623]">Shop</span><span className="text-gray-900">Zone</span>
            </span>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Welcome Back! 👋</h1>
            <p className="text-gray-400 text-sm mt-2">Login to your account and continue shopping.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
              <div className="relative">
                <MdEmail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="email"
                  placeholder="Enter your email"
                  className={`w-full border rounded-xl pl-10 pr-4 py-3.5 text-sm text-gray-700 placeholder-gray-400 outline-none transition-all ${
                    errors.email
                      ? "border-red-400 ring-1 ring-red-400"
                      : "border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  }`}
                  {...register("email", {
                    required: "Email is required",
                    pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Invalid email" },
                  })}
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <MdLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="Enter your password"
                  className={`w-full border rounded-xl pl-10 pr-11 py-3.5 text-sm text-gray-700 placeholder-gray-400 outline-none transition-all ${
                    errors.password
                      ? "border-red-400 ring-1 ring-red-400"
                      : "border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  }`}
                  {...register("password", { required: "Password is required", minLength: { value: 6, message: "Password must be at least 6 characters" } })}
                />
                <button
                  type="button" tabIndex={-1}
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPass ? <MdVisibilityOff size={18} /> : <MdVisibility size={18} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
              <div className="flex justify-end mt-1.5">
                <Link to="/forgot-password" className="text-xs font-semibold text-blue-600 hover:underline">
                  Forgot Password?
                </Link>
              </div>
            </div>

            {/* Server error */}
            {serverError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-600">
                {serverError}
              </div>
            )}

            {/* Remember me */}
            <div className="flex items-center gap-2">
              <input
                id="remember" type="checkbox" checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded accent-blue-600 cursor-pointer"
              />
              <label htmlFor="remember" className="text-sm text-gray-600 cursor-pointer select-none">
                Remember me
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit" disabled={loading}
              className="w-full py-3.5 rounded-xl text-white font-bold text-sm bg-blue-600 hover:bg-blue-700 active:scale-[0.99] transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-blue-200"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Logging in...
                </span>
              ) : "Login"}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 whitespace-nowrap">or continue with</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Social */}
          <div className="space-y-3">
            <button type="button"
              className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-xl py-3.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              <FaGoogle size={16} className="text-red-500" /> Continue with Google
            </button>
            <button type="button"
              className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-xl py-3.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              <FaFacebook size={16} className="text-blue-600" /> Continue with Facebook
            </button>
          </div>

          <p className="text-center text-sm text-gray-500 mt-7">
            Don't have an account?{" "}
            <Link to="/register" className="font-semibold text-blue-600 hover:underline">Sign up</Link>
          </p>
        </div>
      </div>

    </div>
  );
};

export default Login;
