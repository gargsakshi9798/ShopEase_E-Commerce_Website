import { useState } from "react";
import { useForm } from "react-hook-form";
import { MdHeadset, MdEmail, MdPhone, MdLocationOn, MdSend, MdCheck } from "react-icons/md";
import { FaWhatsapp, FaFacebook, FaInstagram, FaTwitter } from "react-icons/fa";
import { POST } from "../../utils/Methods";
import { APIS } from "../../utils/APIS";

const DEPARTMENTS = ["Order & Delivery", "Returns & Refunds", "Payment Issue", "Product Query", "Account Help", "Feedback / Suggestion", "Other"];

const ContactUs = () => {
  const [submitted, setSubmitted] = useState(false);
  const [loading,   setLoading]   = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    reset,
    getValues,
    formState: { errors },
  } = useForm({ defaultValues: { dept: "Order & Delivery" } });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await POST(APIS.Contact, {
        name:       data.name.trim(),
        email:      data.email.trim(),
        phone:      data.phone?.trim() || "",
        department: data.dept,
        subject:    data.dept || "General Enquiry",
        message:    data.message.trim(),
      });
      if (res?.success) {
        setSubmitted(true);
      } else {
        // Fallback: surface a single top-level message as a form error
        setError("root", { type: "server", message: res?.message || "Failed to send message." });
      }
    } catch (err) {
      // Map server field-level errors back into react-hook-form fields
      const serverErrors = err?.response?.data?.errors;
      if (serverErrors && typeof serverErrors === "object") {
        Object.entries(serverErrors).forEach(([field, msg]) => {
          // department comes back as "subject" from the server
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

  const f = "w-full border rounded-xl px-3.5 py-2.5 text-sm outline-none transition-all";
  const ok  = "border-gray-200 focus:border-primary-500 focus:ring-1 focus:ring-primary-500";
  const bad = "border-red-400 ring-1 ring-red-400";

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero */}
      <div className="bg-gradient-to-br from-primary-700 to-indigo-600 text-white">
        <div className="max-w-[1000px] mx-auto px-4 py-14 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-5"><MdHeadset size={32} /></div>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-3">Contact Us</h1>
          <p className="text-white/75 text-sm max-w-md mx-auto">We're here 24/7 to help. Choose the most convenient way to reach us.</p>
        </div>
      </div>

      <div className="max-w-[1000px] mx-auto px-4 py-10 space-y-8">
        {/* Contact Channels */}
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { icon: <MdPhone size={28} className="text-green-600" />,   title: "Call Us",      info: "1800-123-4567",      sub: "Mon–Sun, 9 AM – 9 PM", bg: "bg-green-50 border-green-100",   action: "tel:18001234567" },
            { icon: <MdEmail size={28} className="text-blue-600" />,    title: "Email Us",     info: "support@shopease.in",sub: "Reply within 24 hours",bg: "bg-blue-50 border-blue-100",     action: "mailto:support@shopease.in" },
            { icon: <FaWhatsapp size={28} className="text-green-500" />,title: "WhatsApp",     info: "+91 98765 43210",    sub: "Chat with us instantly",bg: "bg-emerald-50 border-emerald-100",action: "https://wa.me/919876543210" },
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
          {/* Contact Form */}
          <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 p-7 shadow-sm">
            <h2 className="text-lg font-extrabold text-gray-900 mb-6">Send Us a Message</h2>
            {submitted ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4"><MdCheck size={32} className="text-green-600" /></div>
                <h3 className="text-lg font-extrabold text-gray-900 mb-2">Message Sent!</h3>
                <p className="text-sm text-gray-500 max-w-xs mx-auto">Thank you, {getValues("name")}! Our team will get back to you within 24 hours.</p>
                <button onClick={() => { setSubmitted(false); reset(); }}
                  className="mt-5 text-sm text-primary-600 font-semibold hover:underline">Send another message</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
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
                <button type="submit" disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-bold py-3.5 rounded-xl transition-colors shadow-md shadow-blue-200 disabled:opacity-60">
                  {loading
                    ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending…</>
                    : <><MdSend size={17} /> Send Message</>}
                </button>
              </form>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-2 space-y-4">
            {/* Office Address */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <h3 className="text-sm font-extrabold text-gray-900 mb-3 flex items-center gap-2"><MdLocationOn size={18} className="text-red-500" /> Our Office</h3>
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
                {[{ icon: FaFacebook, color: "text-blue-600 hover:bg-blue-50", href: "#" }, { icon: FaInstagram, color: "text-pink-600 hover:bg-pink-50", href: "#" }, { icon: FaTwitter, color: "text-sky-500 hover:bg-sky-50", href: "#" }, { icon: FaWhatsapp, color: "text-green-600 hover:bg-green-50", href: "#" }].map(({ icon: Icon, color, href }) => (
                  <a key={color} href={href} className={`w-10 h-10 border border-gray-200 rounded-xl flex items-center justify-center ${color} transition-colors`}><Icon size={17} /></a>
                ))}
              </div>
            </div>
            {/* Response Time */}
            <div className="bg-primary-50 border border-primary-100 rounded-2xl p-5">
              <h3 className="text-sm font-extrabold text-primary-800 mb-3">&#128338; Response Times</h3>
              {[["Live Chat", "< 2 minutes"], ["WhatsApp", "< 30 minutes"], ["Email", "< 24 hours"], ["Phone", "Immediate"]].map(([ch, t]) => (
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
