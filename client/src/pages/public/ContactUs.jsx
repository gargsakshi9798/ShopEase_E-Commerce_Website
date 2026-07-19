import { useState, useEffect, useRef } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useSelector } from "react-redux";
import {
  MdHeadset, MdEmail, MdPhone, MdLocationOn, MdSend, MdCheck,
  MdShoppingBag, MdPayment, MdInventory2, MdRateReview,
  MdLinkOff, MdExpandMore, MdAddPhotoAlternate, MdClose, MdImage,
} from "react-icons/md";
import { FaWhatsapp, FaFacebook, FaInstagram, FaTwitter } from "react-icons/fa";
import { POST_FORM, GET } from "../../utils/Methods";
import { APIS } from "../../utils/APIS";

// ── Static data ───────────────────────────────────────────────────────────────

const DEPARTMENTS = [
  "Order & Delivery",
  "Returns & Refunds",
  "Payment Issue",
  "Product Query",
  "Account Help",
  "Feedback / Suggestion",
  "Other",
];

// Which departments can show a linked-item dropdown (requires auth)
const DEPT_WITH_OPTIONS = new Set([
  "Order & Delivery",
  "Returns & Refunds",
  "Payment Issue",
  "Product Query",
  "Feedback / Suggestion",
]);

// Icon + placeholder label per department
const DEPT_META = {
  "Order & Delivery":      { icon: MdShoppingBag,  placeholder: "Select an order (optional)" },
  "Returns & Refunds":     { icon: MdShoppingBag,  placeholder: "Select the order to return (optional)" },
  "Payment Issue":         { icon: MdPayment,       placeholder: "Select the payment / order (optional)" },
  "Product Query":         { icon: MdInventory2,    placeholder: "Select a product (optional)" },
  "Feedback / Suggestion": { icon: MdRateReview,    placeholder: "Select a product you reviewed (optional)" },
};

// ── Component ─────────────────────────────────────────────────────────────────

const ContactUs = () => {
  const { isLogin } = useSelector((s) => s.customerAuth);

  const [submitted,    setSubmitted]    = useState(false);
  const [loading,      setLoading]      = useState(false);
  // Dynamic options state
  const [options,      setOptions]      = useState([]);
  const [optLoading,   setOptLoading]   = useState(false);
  const [optError,     setOptError]     = useState(false);
  const [selectedOpt,  setSelectedOpt]  = useState(null);
  const [dropOpen,     setDropOpen]     = useState(false);
  const dropRef = useRef(null);
  // Image upload state
  const [images,       setImages]       = useState([]);  // [{file, preview}]
  const [imageError,   setImageError]   = useState("");
  const imageInputRef  = useRef(null);

  const {
    register,
    handleSubmit,
    setError,
    reset,
    control,
    getValues,
    formState: { errors },
  } = useForm({ defaultValues: { dept: "Order & Delivery" } });

  // Watch the department field reactively
  const watchedDept = useWatch({ control, name: "dept" });

  // ── Close dropdown on outside click ────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setDropOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Fetch options when department changes ───────────────────────────────────
  useEffect(() => {
    // Reset selection whenever department changes
    setSelectedOpt(null);
    setOptions([]);
    setOptError(false);
    setDropOpen(false);

    // Only fetch if logged in and this dept supports options
    if (!isLogin || !DEPT_WITH_OPTIONS.has(watchedDept)) return;

    let cancelled = false;
    const fetchOptions = async () => {
      setOptLoading(true);
      try {
        const res = await GET(APIS.Customer.ContactOptions(watchedDept));
        if (!cancelled) {
          setOptions(res?.data || []);
        }
      } catch {
        if (!cancelled) setOptError(true);
      } finally {
        if (!cancelled) setOptLoading(false);
      }
    };

    fetchOptions();
    return () => { cancelled = true; };
  }, [watchedDept, isLogin]);

  // ── Image handlers ─────────────────────────────────────────────────────────
  const handleImageChange = (e) => {
    const incoming = Array.from(e.target.files || []);
    if (!incoming.length) return;

    // How many slots remain
    const remaining = 2 - images.length;
    if (remaining <= 0) {
      setImageError("You can upload a maximum of 2 images.");
      e.target.value = "";
      return;
    }

    const toAdd = incoming.slice(0, remaining);
    const invalid = toAdd.filter(
      (f) => !["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(f.type)
    );
    if (invalid.length) {
      setImageError("Only JPEG, PNG, and WebP images are allowed.");
      e.target.value = "";
      return;
    }
    const tooBig = toAdd.filter((f) => f.size > 5 * 1024 * 1024);
    if (tooBig.length) {
      setImageError("Each image must be 5 MB or smaller.");
      e.target.value = "";
      return;
    }

    setImageError("");
    const newEntries = toAdd.map((f) => ({ file: f, preview: URL.createObjectURL(f) }));
    setImages((prev) => [...prev, ...newEntries]);
    e.target.value = ""; // allow re-selecting the same file
  };

  const removeImage = (idx) => {
    setImages((prev) => {
      URL.revokeObjectURL(prev[idx].preview);
      return prev.filter((_, i) => i !== idx);
    });
    setImageError("");
  };

  // ── Submit ──────────────────────────────────────────────────────────────────
  const onSubmit = async (data) => {
    // Client-side image guard
    if (images.length < 1) {
      setImageError("Please attach at least 1 image.");
      return;
    }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("name",            data.name.trim());
      fd.append("email",           data.email.trim());
      fd.append("phone",           data.phone?.trim() || "");
      fd.append("department",      data.dept);
      fd.append("subject",         data.dept || "General Enquiry");
      fd.append("message",         data.message.trim());
      fd.append("reference_id",    selectedOpt?._id    || "");
      fd.append("reference_type",  selectedOpt?.type   || "none");
      fd.append("reference_label", selectedOpt?.label  || "");
      images.forEach((img) => fd.append("images", img.file));

      const res = await POST_FORM(APIS.Contact, fd);
      if (res?.success) {
        setSubmitted(true);
      } else {
        setError("root", { type: "server", message: res?.message || "Failed to send message." });
      }
    } catch (err) {
      const serverErrors = err?.response?.data?.errors;
      if (serverErrors && typeof serverErrors === "object") {
        if (serverErrors.images) setImageError(serverErrors.images);
        Object.entries(serverErrors).forEach(([field, msg]) => {
          if (field === "images") return;
          const formField = field === "subject" ? "dept" : field;
          setError(formField, { type: "server", message: msg });
        });
      } else {
        setError("root", {
          type: "server",
          message: err?.response?.data?.message || "Something went wrong. Please try again.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Shared input classes ────────────────────────────────────────────────────
  const f   = "w-full border rounded-xl px-3.5 py-2.5 text-sm outline-none transition-all";
  const ok  = "border-gray-200 focus:border-primary-500 focus:ring-1 focus:ring-primary-500";
  const bad = "border-red-400 ring-1 ring-red-400";

  // Show options row: logged in + dept has options
  const showOptionsRow = isLogin && DEPT_WITH_OPTIONS.has(watchedDept);
  const DeptIcon = DEPT_META[watchedDept]?.icon || null;

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero */}
      <div className="bg-gradient-to-br from-primary-700 to-indigo-600 text-white">
        <div className="max-w-[1000px] mx-auto px-4 py-14 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <MdHeadset size={32} />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-3">Contact Us</h1>
          <p className="text-white/75 text-sm max-w-md mx-auto">
            We're here 24/7 to help. Choose the most convenient way to reach us.
          </p>
        </div>
      </div>

      <div className="max-w-[1000px] mx-auto px-4 py-10 space-y-8">
        {/* Contact Channels */}
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { icon: <MdPhone size={28} className="text-green-600" />,    title: "Call Us",  info: "1800-123-4567",       sub: "Mon–Sun, 9 AM – 9 PM",   bg: "bg-green-50 border-green-100",     action: "tel:18001234567" },
            { icon: <MdEmail size={28} className="text-blue-600" />,     title: "Email Us", info: "support@shopease.in", sub: "Reply within 24 hours",  bg: "bg-blue-50 border-blue-100",       action: "mailto:support@shopease.in" },
            { icon: <FaWhatsapp size={28} className="text-green-500" />, title: "WhatsApp", info: "+91 98765 43210",     sub: "Chat with us instantly", bg: "bg-emerald-50 border-emerald-100", action: "https://wa.me/919876543210" },
          ].map((c) => (
            <a key={c.title} href={c.action}
              className={`${c.bg} border rounded-2xl p-5 flex flex-col items-center text-center gap-3 hover:shadow-md transition-all group`}>
              {c.icon}
              <div>
                <p className="text-sm font-extrabold text-gray-900 group-hover:text-primary-600">{c.title}</p>
                <p className="text-xs font-semibold text-gray-700 mt-0.5">{c.info}</p>
                <p className="text-xs text-gray-500">{c.sub}</p>
              </div>
            </a>
          ))}
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* ── Contact Form ── */}
          <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 p-7 shadow-sm">
            <h2 className="text-lg font-extrabold text-gray-900 mb-6">Send Us a Message</h2>

            {submitted ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <MdCheck size={32} className="text-green-600" />
                </div>
                <h3 className="text-lg font-extrabold text-gray-900 mb-2">Message Sent!</h3>
                <p className="text-sm text-gray-500 max-w-xs mx-auto">
                  Thank you, {getValues("name")}! Our team will get back to you within 24 hours.
                </p>
                {selectedOpt && (
                  <p className="mt-2 text-xs text-gray-400">
                    Regarding: <span className="font-semibold text-gray-600">{selectedOpt.label}</span>
                  </p>
                )}
                <button
                  onClick={() => { setSubmitted(false); reset(); setSelectedOpt(null); setOptions([]); setImages([]); setImageError(""); }}
                  className="mt-5 text-sm text-primary-600 font-semibold hover:underline"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>

                {/* Row 1 — Name + Email */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-600 mb-1 block">Full Name *</label>
                    <input
                      placeholder="Your full name"
                      className={`${f} ${errors.name ? bad : ok}`}
                      {...register("name", {
                        required: "Name is required",
                        minLength: { value: 2, message: "Minimum 2 characters" },
                        maxLength: { value: 100, message: "Maximum 100 characters" },
                        validate: (v) => v.trim().length >= 2 || "Name cannot be only spaces",
                      })}
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-600 mb-1 block">Email Address *</label>
                    <input
                      type="email"
                      placeholder="your@email.com"
                      className={`${f} ${errors.email ? bad : ok}`}
                      {...register("email", {
                        required: "Email is required",
                        pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Enter a valid email address" },
                      })}
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                  </div>
                </div>

                {/* Row 2 — Phone + Department */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-600 mb-1 block">Phone Number</label>
                    <input
                      type="tel"
                      placeholder="+91 98765 43210"
                      className={`${f} ${errors.phone ? bad : ok}`}
                      {...register("phone", {
                        pattern: { value: /^[\d\s+\-().]{7,20}$/, message: "Enter a valid phone number" },
                      })}
                    />
                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-600 mb-1 block">Department *</label>
                    <select
                      className={`${f} bg-white ${errors.dept ? bad : ok}`}
                      {...register("dept", { required: "Please select a department" })}
                    >
                      {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
                    </select>
                    {errors.dept && <p className="text-red-500 text-xs mt-1">{errors.dept.message}</p>}
                  </div>
                </div>

                {/* ── Dynamic options row ───────────────────────────────── */}
                {showOptionsRow && (
                  <div className="animate-fade-in">
                    <label className="text-xs font-bold text-gray-600 mb-1 block flex items-center gap-1.5">
                      {DeptIcon && <DeptIcon size={13} className="text-primary-500" />}
                      Related {watchedDept === "Payment Issue" ? "Payment" : watchedDept === "Product Query" ? "Product" : "Order"}
                      <span className="text-gray-400 font-normal">(optional)</span>
                    </label>

                    {/* Loading state */}
                    {optLoading && (
                      <div className="flex items-center gap-2 px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-400">
                        <span className="w-3.5 h-3.5 border-2 border-gray-300 border-t-primary-500 rounded-full animate-spin flex-shrink-0" />
                        Fetching your {watchedDept === "Product Query" ? "products" : "orders"}…
                      </div>
                    )}

                    {/* Error state */}
                    {!optLoading && optError && (
                      <div className="flex items-center gap-2 px-3.5 py-2.5 border border-red-200 bg-red-50 rounded-xl text-sm text-red-500">
                        <MdLinkOff size={15} /> Could not load options. You can still send your message.
                      </div>
                    )}

                    {/* No data */}
                    {!optLoading && !optError && options.length === 0 && (
                      <div className="flex items-center gap-2 px-3.5 py-2.5 border border-gray-100 bg-gray-50 rounded-xl text-sm text-gray-400">
                        <MdLinkOff size={15} />
                        No {watchedDept === "Product Query" ? "products" : watchedDept === "Feedback / Suggestion" ? "reviewed products" : "recent orders"} found.
                        You can still describe your issue below.
                      </div>
                    )}

                    {/* Custom dropdown */}
                    {!optLoading && !optError && options.length > 0 && (
                      <div className="relative" ref={dropRef}>
                        {/* Trigger button */}
                        <button
                          type="button"
                          onClick={() => setDropOpen((o) => !o)}
                          className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 border rounded-xl text-sm transition-all bg-white text-left
                            ${dropOpen ? "border-primary-500 ring-1 ring-primary-500" : "border-gray-200 hover:border-gray-300"}`}
                        >
                          {selectedOpt ? (
                            <div className="flex items-center gap-2.5 min-w-0">
                              {selectedOpt.image ? (
                                <img src={selectedOpt.image} alt="" className="w-7 h-7 rounded-lg object-cover flex-shrink-0 border border-gray-100" />
                              ) : (
                                <div className="w-7 h-7 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                  {DeptIcon && <DeptIcon size={14} className="text-primary-500" />}
                                </div>
                              )}
                              <div className="min-w-0">
                                <p className="text-gray-800 font-medium truncate">{selectedOpt.label}</p>
                                <p className="text-xs text-gray-400 truncate">{selectedOpt.sub}</p>
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-400">{DEPT_META[watchedDept]?.placeholder}</span>
                          )}
                          <MdExpandMore
                            size={18}
                            className={`text-gray-400 flex-shrink-0 transition-transform ${dropOpen ? "rotate-180" : ""}`}
                          />
                        </button>

                        {/* Dropdown list */}
                        {dropOpen && (
                          <div className="absolute z-30 top-full mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                            {/* "None" option */}
                            <button
                              type="button"
                              onClick={() => { setSelectedOpt(null); setDropOpen(false); }}
                              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm hover:bg-gray-50 transition-colors border-b border-gray-100
                                ${!selectedOpt ? "bg-primary-50 text-primary-700 font-medium" : "text-gray-500"}`}
                            >
                              <MdLinkOff size={15} className="flex-shrink-0" />
                              None / General enquiry
                            </button>

                            {/* Scrollable options list */}
                            <div className="max-h-56 overflow-y-auto">
                              {options.map((opt) => {
                                const isSelected = selectedOpt?._id?.toString() === opt._id?.toString();
                                return (
                                  <button
                                    key={opt._id?.toString()}
                                    type="button"
                                    onClick={() => { setSelectedOpt(opt); setDropOpen(false); }}
                                    className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-left hover:bg-gray-50 transition-colors
                                      ${isSelected ? "bg-primary-50" : ""}`}
                                  >
                                    {opt.image ? (
                                      <img src={opt.image} alt="" className="w-8 h-8 rounded-lg object-cover flex-shrink-0 border border-gray-100" />
                                    ) : (
                                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
                                        ${isSelected ? "bg-primary-100" : "bg-gray-100"}`}>
                                        {DeptIcon && <DeptIcon size={15} className={isSelected ? "text-primary-600" : "text-gray-500"} />}
                                      </div>
                                    )}
                                    <div className="min-w-0 flex-1">
                                      <p className={`font-medium truncate ${isSelected ? "text-primary-700" : "text-gray-800"}`}>{opt.label}</p>
                                      <p className="text-xs text-gray-400 truncate">{opt.sub}</p>
                                    </div>
                                    {isSelected && (
                                      <MdCheck size={16} className="text-primary-600 flex-shrink-0" />
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Hint for guest users — will show if user NOT logged in on a dept that supports options */}
                  </div>
                )}

                {/* Guest hint for depts that support options but user is not logged in */}
                {!isLogin && DEPT_WITH_OPTIONS.has(watchedDept) && (
                  <div className="flex items-start gap-2 px-3.5 py-3 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-700">
                    <MdShoppingBag size={15} className="flex-shrink-0 mt-0.5" />
                    <span>
                      <a href="/login" className="font-bold underline underline-offset-2 hover:text-blue-900">Log in</a>
                      {" "}to link a specific order or product to your message for faster support.
                    </span>
                  </div>
                )}

                {/* Message */}
                <div>
                  <label className="text-xs font-bold text-gray-600 mb-1 block">Message *</label>
                  <textarea
                    rows={5}
                    placeholder="Describe your issue or question in detail…"
                    className={`${f} resize-none ${errors.message ? bad : ok}`}
                    {...register("message", {
                      required: "Message is required",
                      minLength: { value: 10, message: "Minimum 10 characters" },
                      maxLength: { value: 2000, message: "Maximum 2000 characters" },
                    })}
                  />
                  {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message.message}</p>}
                </div>

                {/* Root / server-level error */}
                {errors.root && (
                  <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
                    {errors.root.message}
                  </div>
                )}

                {/* ── Attach Images ─────────────────────────────────────── */}
                <div>
                  <label className="text-xs font-bold text-gray-600 mb-1.5 block">
                    Attach Images <span className="text-red-500">*</span>
                    <span className="text-gray-400 font-normal ml-1">(min 1, max 2 · JPEG / PNG / WebP · max 5 MB each)</span>
                  </label>

                  <div className="flex items-start gap-3 flex-wrap">
                    {/* Uploaded previews */}
                    {images.map((img, idx) => (
                      <div key={idx} className="relative w-24 h-24 rounded-xl overflow-hidden border border-gray-200 flex-shrink-0 group">
                        <img
                          src={img.preview}
                          alt={`attachment ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute top-1 right-1 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Remove image"
                        >
                          <MdClose size={12} />
                        </button>
                        <div className="absolute bottom-0 left-0 right-0 bg-black/40 text-white text-[9px] text-center py-0.5">
                          {idx === 0 ? "Image 1" : "Image 2"}
                        </div>
                      </div>
                    ))}

                    {/* Add-more button — hidden once limit reached */}
                    {images.length < 2 && (
                      <button
                        type="button"
                        onClick={() => imageInputRef.current?.click()}
                        className={`w-24 h-24 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1 transition-colors flex-shrink-0
                          ${imageError ? "border-red-400 bg-red-50" : "border-gray-300 hover:border-primary-400 hover:bg-primary-50"}`}
                      >
                        {images.length === 0 ? (
                          <>
                            <MdAddPhotoAlternate size={22} className={imageError ? "text-red-400" : "text-gray-400"} />
                            <span className={`text-[10px] font-medium ${imageError ? "text-red-500" : "text-gray-400"}`}>Add Photo</span>
                            <span className="text-[9px] text-gray-400">Required</span>
                          </>
                        ) : (
                          <>
                            <MdImage size={20} className="text-primary-400" />
                            <span className="text-[10px] font-medium text-primary-500">Add 2nd</span>
                            <span className="text-[9px] text-gray-400">Optional</span>
                          </>
                        )}
                      </button>
                    )}

                    {/* Count badge when both slots filled */}
                    {images.length === 2 && (
                      <div className="flex items-center gap-1.5 text-xs text-green-600 font-medium self-end pb-2">
                        <MdCheck size={15} /> 2 / 2 images attached
                      </div>
                    )}
                  </div>

                  {/* Hidden file input */}
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    multiple
                    className="hidden"
                    onChange={handleImageChange}
                  />

                  {imageError && (
                    <p className="text-red-500 text-xs mt-1.5">{imageError}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-bold py-3.5 rounded-xl transition-colors shadow-md shadow-blue-200 disabled:opacity-60"
                >
                  {loading
                    ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending…</>
                    : <><MdSend size={17} /> Send Message</>}
                </button>
              </form>
            )}
          </div>

          {/* ── Sidebar ── */}
          <div className="lg:col-span-2 space-y-4">
            {/* Office Address */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <h3 className="text-sm font-extrabold text-gray-900 mb-3 flex items-center gap-2">
                <MdLocationOn size={18} className="text-red-500" /> Our Office
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                ShopEase Technologies Pvt. Ltd.<br />
                12th Floor, DLF Cyber Hub,<br />
                Sector 24, Gurugram,<br />
                Haryana – 122002, India
              </p>
              <p className="text-xs text-gray-400 mt-2">Office hours: Mon–Fri, 10 AM – 6 PM</p>
            </div>

            {/* Social */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <h3 className="text-sm font-extrabold text-gray-900 mb-3">Follow Us</h3>
              <div className="flex gap-3">
                {[
                  { icon: FaFacebook,  color: "text-blue-600 hover:bg-blue-50",  href: "#" },
                  { icon: FaInstagram, color: "text-pink-600 hover:bg-pink-50",  href: "#" },
                  { icon: FaTwitter,   color: "text-sky-500 hover:bg-sky-50",    href: "#" },
                  { icon: FaWhatsapp,  color: "text-green-600 hover:bg-green-50", href: "#" },
                ].map(({ icon: Icon, color, href }) => (
                  <a key={color} href={href}
                    className={`w-10 h-10 border border-gray-200 rounded-xl flex items-center justify-center ${color} transition-colors`}>
                    <Icon size={17} />
                  </a>
                ))}
              </div>
            </div>

            {/* Response Time */}
            <div className="bg-primary-50 border border-primary-100 rounded-2xl p-5">
              <h3 className="text-sm font-extrabold text-primary-800 mb-3">&#128338; Response Times</h3>
              {[
                ["Live Chat", "< 2 minutes"],
                ["WhatsApp",  "< 30 minutes"],
                ["Email",     "< 24 hours"],
                ["Phone",     "Immediate"],
              ].map(([ch, t]) => (
                <div key={ch} className="flex items-center justify-between py-1.5 border-b border-primary-100 last:border-0">
                  <span className="text-xs text-primary-700 font-medium">{ch}</span>
                  <span className="text-xs font-extrabold text-primary-800">{t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
