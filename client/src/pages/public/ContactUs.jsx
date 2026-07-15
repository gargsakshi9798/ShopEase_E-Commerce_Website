import { useState } from "react";
import { MdHeadset, MdEmail, MdPhone, MdLocationOn, MdSend, MdCheck } from "react-icons/md";
import { FaWhatsapp, FaFacebook, FaInstagram, FaTwitter } from "react-icons/fa";
import { POST } from "../../utils/Methods";
import { APIS } from "../../utils/APIS";

const departments = ["Order & Delivery", "Returns & Refunds", "Payment Issue", "Product Query", "Account Help", "Feedback / Suggestion", "Other"];

const ContactUs = () => {
  const [form, setForm]       = useState({ name: "", email: "", phone: "", dept: "", message: "" });
  const [submitted, setSubmit] = useState(false);
  const [loading, setLoading]  = useState(false);
  const [error, setError]      = useState("");

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await POST(APIS.Contact, {
        name:       form.name,
        email:      form.email,
        phone:      form.phone,
        department: form.dept,
        subject:    form.dept || "General Enquiry",
        message:    form.message,
      });
      if (res?.success) {
        setSubmit(true);
      } else {
        setError(res?.message || "Failed to send message. Please try again.");
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
                <p className="text-sm text-gray-500 max-w-xs mx-auto">Thank you, {form.name}! Our team will get back to you within 24 hours.</p>
                <button onClick={() => { setSubmit(false); setForm({ name:"",email:"",phone:"",dept:"",message:"" }); }}
                  className="mt-5 text-sm text-primary-600 font-semibold hover:underline">Send another message</button>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-600 mb-1 block">Full Name *</label>
                    <input name="name" value={form.name} onChange={handle} required placeholder="Your full name"
                      className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-600 mb-1 block">Email Address *</label>
                    <input name="email" type="email" value={form.email} onChange={handle} required placeholder="your@email.com"
                      className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500" />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-600 mb-1 block">Phone Number</label>
                    <input name="phone" value={form.phone} onChange={handle} placeholder="+91 98765 43210"
                      className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-600 mb-1 block">Department *</label>
                    <select name="dept" value={form.dept} onChange={handle} required
                      className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-primary-500 bg-white">
                      <option value="">Select department</option>
                      {departments.map((d) => <option key={d}>{d}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600 mb-1 block">Message *</label>
                  <textarea name="message" value={form.message} onChange={handle} required rows={5} placeholder="Describe your issue or question in detail…"
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 resize-none" />
                </div>
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">{error}</div>
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
