import { useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { customerRegister } from "../../features/public/customerAuthSlice";
import { showSuccess, showError } from "../../utils/toast";
import {
  MdEmail, MdLock, MdPerson, MdPhone,
  MdVisibility, MdVisibilityOff,
  MdLocalShipping, MdSecurity, MdLoop, MdHeadset,
  MdLocalOffer, MdFavorite, MdArrowBack,
} from "react-icons/md";
import { FaGoogle, FaFacebook, FaShoppingBag } from "react-icons/fa";
import registerBg from "../../assets/images/regiser.png";
import PasswordStrengthIndicator from "../../components/common/PasswordStrengthIndicator";
import ConfirmPasswordMatch from "../../components/common/ConfirmPasswordMatch";

const features = [
  { icon: MdLocalOffer,    title: "Exclusive Offers",  sub: "Get access to exclusive deals and member discounts." },
  { icon: MdLocalShipping, title: "Fast Delivery",     sub: "Enjoy fast and reliable delivery at your doorstep." },
  { icon: MdFavorite,      title: "Wishlist",          sub: "Save your favorite products and buy them later." },
  { icon: MdSecurity,      title: "Secure Payments",   sub: "100% secure payments with multiple options." },
  { icon: MdHeadset,       title: "24/7 Support",      sub: "Our support team is available round the clock." },
  { icon: MdLoop,          title: "Easy Returns",      sub: "Hassle-free returns within 7 days of delivery." },
];

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status } = useSelector((s) => s.customerAuth);

  const [showPass,        setShowPass]        = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [serverError,     setServerError]     = useState(null);
  const [pwdValue,        setPwdValue]        = useState("");
  const [confirmValue,    setConfirmValue]    = useState("");

  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const password = watch("password");

  const onSubmit = async (data) => {
    setServerError(null);
    const { confirmPassword, first_name, last_name, terms, ...rest } = data;
    const payload = { ...rest, name: `${first_name.trim()} ${last_name.trim()}` };
    const res = await dispatch(customerRegister(payload));
    if (res.payload?.success) {
      showSuccess("Account created! Please log in.");
      navigate("/login");
    } else {
      const msg = res.payload?.message || "Registration failed. Please try again.";
      setServerError(msg);
      showError(msg);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#eef1f8]">

      {/* ── Left Panel — white form ── */}
      <div className="flex-1 flex items-center justify-center px-8 py-10 bg-white m-4 rounded-2xl shadow-sm overflow-y-auto relative">

        {/* Back to Home */}
        <Link
          to="/"
          className="absolute top-5 right-5 flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-blue-600 transition-colors group"
        >
          <MdArrowBack size={16} className="group-hover:-translate-x-0.5 transition-transform" />
          Back to Home
        </Link>

        <div className="w-full max-w-[430px]">

          {/* Logo */}
          <div className="flex items-center gap-2 mb-6">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow">
              <FaShoppingBag size={16} className="text-white" />
            </div>
            <span className="text-xl font-bold">
              <span className="text-blue-600">Shop</span><span className="text-gray-900">Ease</span>
            </span>
          </div>

          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Create Your Account</h1>
            <p className="text-gray-400 text-sm mt-1">Join ShopEase and start shopping the best products</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            {/* First & Last Name */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">First Name</label>
                <div className="relative">
                  <MdPerson className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
                  <input
                    type="text"
                    placeholder="Enter your first name"
                    className={`w-full border rounded-xl pl-9 pr-3 py-3 text-sm text-gray-700 placeholder-gray-400 outline-none transition-all ${
                      errors.first_name
                        ? "border-red-400 ring-1 ring-red-400"
                        : "border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    }`}
                    {...register("first_name", { required: "Required", minLength: { value: 2, message: "Min 2 chars" } })}
                  />
                </div>
                {errors.first_name && <p className="text-red-500 text-xs mt-1">{errors.first_name.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Last Name</label>
                <div className="relative">
                  <MdPerson className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
                  <input
                    type="text"
                    placeholder="Enter your last name"
                    className={`w-full border rounded-xl pl-9 pr-3 py-3 text-sm text-gray-700 placeholder-gray-400 outline-none transition-all ${
                      errors.last_name
                        ? "border-red-400 ring-1 ring-red-400"
                        : "border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    }`}
                    {...register("last_name", { required: "Required", minLength: { value: 2, message: "Min 2 chars" } })}
                  />
                </div>
                {errors.last_name && <p className="text-red-500 text-xs mt-1">{errors.last_name.message}</p>}
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email Address</label>
              <div className="relative">
                <MdEmail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className={`w-full border rounded-xl pl-10 pr-4 py-3 text-sm text-gray-700 placeholder-gray-400 outline-none transition-all ${
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

            {/* Mobile */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Mobile Number</label>
              <div className="flex gap-2">
                <div className="flex items-center border border-gray-200 rounded-xl px-3 gap-1 min-w-[72px] bg-gray-50">
                  <MdPhone className="text-gray-400" size={15} />
                  <span className="text-sm text-gray-600 font-medium">+91</span>
                  <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                <input
                  type="tel"
                  placeholder="Enter your mobile number"
                  className={`flex-1 border rounded-xl px-4 py-3 text-sm text-gray-700 placeholder-gray-400 outline-none transition-all ${
                    errors.contact_no
                      ? "border-red-400 ring-1 ring-red-400"
                      : "border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  }`}
                  {...register("contact_no", {
                    required: "Phone is required",
                    pattern: { value: /^[6-9]\d{9}$/, message: "Valid 10-digit mobile number required" },
                  })}
                />
              </div>
              {errors.contact_no && <p className="text-red-500 text-xs mt-1">{errors.contact_no.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Password</label>
              <div className="relative">
                <MdLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="Create a password"
                  className={`w-full border rounded-xl pl-10 pr-11 py-3 text-sm text-gray-700 placeholder-gray-400 outline-none transition-all ${
                    errors.password
                      ? "border-red-400 ring-1 ring-red-400"
                      : "border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  }`}
                  {...register("password", { required: "Password is required", minLength: { value: 8, message: "Min 8 characters" }, onChange: (e) => setPwdValue(e.target.value) })}
                />
                <button type="button" tabIndex={-1} onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPass ? <MdVisibilityOff size={17} /> : <MdVisibility size={17} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
              <PasswordStrengthIndicator password={pwdValue} />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Confirm Password</label>
              <div className="relative">
                <MdLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
                <input
                  type={showConfirmPass ? "text" : "password"}
                  placeholder="Confirm your password"
                  className={`w-full border rounded-xl pl-10 pr-11 py-3 text-sm text-gray-700 placeholder-gray-400 outline-none transition-all ${
                    errors.confirmPassword
                      ? "border-red-400 ring-1 ring-red-400"
                      : "border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  }`}
                  {...register("confirmPassword", {
                    required: "Please confirm your password",
                    validate: (v) => v === password || "Passwords do not match",
                    onChange: (e) => setConfirmValue(e.target.value),
                  })}
                />
                <button type="button" tabIndex={-1} onClick={() => setShowConfirmPass((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showConfirmPass ? <MdVisibilityOff size={17} /> : <MdVisibility size={17} />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
              <ConfirmPasswordMatch password={pwdValue} confirmPassword={confirmValue} />
            </div>

            {/* Terms */}
            <div className="flex items-start gap-2">
              <input id="terms" type="checkbox"
                className="w-4 h-4 rounded accent-blue-600 cursor-pointer mt-0.5 flex-shrink-0"
                {...register("terms", { required: "You must agree to the terms" })}
              />
              <label htmlFor="terms" className="text-xs text-gray-500 cursor-pointer leading-relaxed">
                I agree to the{" "}
                <Link to="#" className="text-blue-600 hover:underline font-medium">Terms & Conditions</Link>
                {" "}and{" "}
                <Link to="#" className="text-blue-600 hover:underline font-medium">Privacy Policy</Link>
              </label>
            </div>
            {errors.terms && <p className="text-red-500 text-xs -mt-2">{errors.terms.message}</p>}

            {/* Server error */}
            {serverError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-600">
                {serverError}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit" disabled={status === "loading"}
              className="w-full py-3.5 rounded-xl text-white font-bold text-sm bg-blue-600 hover:bg-blue-700 active:scale-[0.99] transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-blue-200"
            >
              {status === "loading" ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : "Register"}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 whitespace-nowrap">or register with</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Social */}
          <div className="grid grid-cols-2 gap-3">
            <button type="button"
              className="flex items-center justify-center gap-2 border border-gray-200 rounded-xl py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              <FaGoogle size={15} className="text-red-500" /> Continue with Google
            </button>
            <button type="button"
              className="flex items-center justify-center gap-2 border border-gray-200 rounded-xl py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              <FaFacebook size={15} className="text-blue-600" /> Continue with Facebook
            </button>
          </div>

          <p className="text-center text-sm text-gray-500 mt-5">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-blue-600 hover:underline">Login</Link>
          </p>
        </div>
      </div>

      {/* ── Right Panel — full background image ── */}
      <div
        className="hidden lg:flex lg:w-[48%] relative flex-col justify-between p-10 overflow-hidden rounded-2xl m-4"
        style={{
          backgroundImage: `url(${registerBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/35 to-black/65 rounded-2xl" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
            <FaShoppingBag size={18} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-lg leading-none">
              <span className="text-blue-400">Shop</span><span className="text-white">Ease</span>
            </p>
            <p className="text-white/50 text-[10px] tracking-widest uppercase">Your Store. Your Style.</p>
          </div>
        </div>

        {/* Hero Text */}
        <div className="relative z-10">
          <h2 className="text-white text-4xl font-extrabold leading-tight drop-shadow">
            Welcome to{" "}
            <span className="text-blue-400">ShopEase!</span> 👋
          </h2>
          <p className="text-white/65 text-sm leading-relaxed max-w-xs mt-3 mb-8">
            Create an account and enjoy a seamless shopping experience.
          </p>

          {/* Feature grid — 2 columns */}
          <div className="grid grid-cols-2 gap-3">
            {features.map(({ icon: Icon, title, sub }) => (
              <div key={title} className="flex items-start gap-2.5 bg-white/10 backdrop-blur-sm rounded-2xl p-3 border border-white/15">
                <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon size={16} className="text-white" />
                </div>
                <div>
                  <p className="text-white text-xs font-bold leading-tight">{title}</p>
                  <p className="text-white/55 text-[11px] mt-0.5 leading-tight">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom spacer */}
        <div className="relative z-10 h-2" />
      </div>

    </div>
  );
};

export default Register;
