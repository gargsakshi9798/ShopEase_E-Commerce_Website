/**
 * Advanced · Professional · Modern Design
 */
import { useState, useEffect, useRef, useCallback, useMemo, memo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchMyOrders, trackOrder }        from "../../../features/public/publicOrderSlice";
import { fetchCustomerProfile }             from "../../../features/public/publicProfileSlice";
import { fetchAddresses }                   from "../../../features/public/publicAddressSlice";
import { createTicket, fetchMyTickets }     from "../../../features/public/publicSupportSlice";
import toast from "react-hot-toast";

/* ─────────────────────────── UTILS ─────────────────────────────────────────── */
const uid   = () => Date.now().toString(36) + Math.random().toString(36).slice(2);
const clock = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
const fmt   = (n) => Number(n || 0).toLocaleString("en-IN");
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" }) : "—";

/* markdown: **bold** → <strong>, \n → <br> */
const md = (t = "") =>
  t.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/\n/g, "<br/>");

/* ─────────────────────────── CONSTANTS ─────────────────────────────────────── */
const BOT_NAME   = "Shivi";
const TYPING_MS  = 750;

const ORDER_BADGE = {
  pending    : "bg-amber-100 text-amber-700 border border-amber-200",
  confirmed  : "bg-sky-100 text-sky-700 border border-sky-200",
  processing : "bg-violet-100 text-violet-700 border border-violet-200",
  shipped    : "bg-indigo-100 text-indigo-700 border border-indigo-200",
  out_for_delivery: "bg-blue-100 text-blue-700 border border-blue-200",
  delivered  : "bg-emerald-100 text-emerald-700 border border-emerald-200",
  cancelled  : "bg-red-100 text-red-700 border border-red-200",
  returned   : "bg-orange-100 text-orange-700 border border-orange-200",
};

const TICKET_BADGE = {
  open            : "bg-blue-100 text-blue-700 border border-blue-200",
  in_progress     : "bg-orange-100 text-orange-700 border border-orange-200",
  waiting_customer: "bg-yellow-100 text-yellow-700 border border-yellow-200",
  resolved        : "bg-emerald-100 text-emerald-700 border border-emerald-200",
  closed          : "bg-gray-100 text-gray-500 border border-gray-200",
};

const TICKET_CATS = [
  { value: "order",     label: "📦 Order Issue"       },
  { value: "payment",   label: "💳 Payment Problem"   },
  { value: "product",   label: "🛍️ Product Issue"     },
  { value: "shipping",  label: "🚚 Shipping/Delivery" },
  { value: "return",    label: "↩️ Return/Refund"     },
  { value: "account",   label: "👤 Account Help"      },
  { value: "technical", label: "🔧 Technical Issue"   },
  { value: "other",     label: "💬 Other"             },
];

/* ─────────────────────────── ICONS ─────────────────────────────────────────── */
const I = {
  Chat    : ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  X       : ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="w-5 h-5"><path d="M18 6 6 18M6 6l12 12"/></svg>,
  Send    : ()=><svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>,
  Bot     : ({cls="w-5 h-5"})=>(
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className={cls}>
      {/* Background circle */}
      <circle cx="40" cy="40" r="40" fill="url(#avatarBg)"/>
      {/* Hair — back layer */}
      <ellipse cx="40" cy="24" rx="18" ry="19" fill="#4A2C0A"/>
      {/* Neck */}
      <rect x="35" y="47" width="10" height="11" rx="3" fill="#FBBF8A"/>
      {/* Shoulders / blazer */}
      <path d="M14 80 Q16 58 28 55 L34 57 Q40 60 46 57 L52 55 Q64 58 66 80Z" fill="#4F46E5"/>
      {/* Shirt collar */}
      <path d="M34 57 Q40 63 46 57 L48 62 Q40 68 32 62Z" fill="#fff"/>
      {/* Face */}
      <ellipse cx="40" cy="36" rx="15" ry="17" fill="#FBBF8A"/>
      {/* Hair — front top */}
      <path d="M25 30 Q24 16 40 14 Q56 16 55 30 Q52 20 40 19 Q28 20 25 30Z" fill="#4A2C0A"/>
      {/* Side hair left */}
      <path d="M25 30 Q22 38 24 46 Q28 40 28 35Z" fill="#4A2C0A"/>
      {/* Side hair right */}
      <path d="M55 30 Q58 38 56 46 Q52 40 52 35Z" fill="#4A2C0A"/>
      {/* Eyebrows */}
      <path d="M31 32 Q34 30 37 32" stroke="#7C4A1A" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M43 32 Q46 30 49 32" stroke="#7C4A1A" strokeWidth="1.5" strokeLinecap="round"/>
      {/* Eyes */}
      <ellipse cx="34" cy="35" rx="2.8" ry="3" fill="#2D1B0E"/>
      <ellipse cx="46" cy="35" rx="2.8" ry="3" fill="#2D1B0E"/>
      {/* Eye shine */}
      <circle cx="35" cy="34" r="1" fill="white"/>
      <circle cx="47" cy="34" r="1" fill="white"/>
      {/* Nose */}
      <path d="M39 39 Q40 41 41 39" stroke="#D4956A" strokeWidth="1.2" strokeLinecap="round"/>
      {/* Smile */}
      <path d="M35 43 Q40 47 45 43" stroke="#C0705A" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      {/* Earrings */}
      <circle cx="25" cy="42" r="1.8" fill="#818CF8"/>
      <circle cx="55" cy="42" r="1.8" fill="#818CF8"/>
      {/* Headset / mic dot */}
      <circle cx="56" cy="36" r="3.5" fill="#4F46E5" opacity="0.9"/>
      <path d="M56 33 L56 39" stroke="white" strokeWidth="1.2" strokeLinecap="round"/>
      {/* Gradient def */}
      <defs>
        <radialGradient id="avatarBg" cx="50%" cy="40%" r="50%">
          <stop offset="0%" stopColor="#EDE9FE"/>
          <stop offset="100%" stopColor="#C7D2FE"/>
        </radialGradient>
      </defs>
    </svg>
  ),
  Refresh : ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>,
  Check   : ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-2.5 h-2.5"><path d="M20 6 9 17l-5-5"/></svg>,
  Arrow   : ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3"><path d="m9 18 6-6-6-6"/></svg>,
  Minimize: ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="w-4 h-4"><path d="M5 12h14"/></svg>,
  Star    : ()=><svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>,
};

/* ─────────────────────────── DESIGN TOKENS ─────────────────────────────────── */
// All colours / gradients in one place — easy to theme
const T = {
  fab     : "from-indigo-600 via-violet-600 to-purple-600",
  header  : "from-indigo-600 via-violet-600 to-purple-700",
  msgBot  : "bg-white/90 backdrop-blur border border-white/60 text-gray-800",
  msgUser : "bg-gradient-to-br from-indigo-500 to-violet-600 text-white",
  pill    : "bg-white/80 backdrop-blur border border-indigo-100 text-indigo-700 hover:bg-indigo-50 hover:border-indigo-300",
  card    : "bg-white/80 backdrop-blur border border-gray-100 hover:border-indigo-200 hover:shadow-md",
  form    : "bg-white/90 backdrop-blur border border-gray-100 shadow-lg",
  input   : "bg-white/70 border border-gray-200 focus-within:border-indigo-400 focus-within:bg-white",
  badge   : "text-[10px] font-bold px-2 py-0.5 rounded-full",
};

/* ─────────────────────────── SUB-COMPONENTS ────────────────────────────────── */

/* Chat message bubble */
const Bubble = memo(({ msg }) => {
  const isBot = msg.role === "bot";
  return (
    <div className={`flex gap-2 mb-3 animate-fade-in ${isBot ? "items-start" : "items-end flex-row-reverse"}`}>
      {isBot && (
        <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 mt-0.5 shadow-md shadow-indigo-200 ring-2 ring-white">
          <I.Bot cls="w-8 h-8" />
        </div>
      )}
      <div className="max-w-[80%]">
        <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${isBot ? `${T.msgBot} rounded-tl-sm` : `${T.msgUser} rounded-tr-sm`}`}>
          {isBot
            ? <span dangerouslySetInnerHTML={{ __html: md(msg.text) }} />
            : msg.text
          }
        </div>
        <div className={`flex items-center gap-1 mt-0.5 ${isBot ? "ml-1" : "justify-end mr-1"}`}>
          <span className="text-[10px] text-gray-400">{msg.time}</span>
          {!isBot && <span className="text-indigo-400 flex items-center"><I.Check /></span>}
        </div>
      </div>
    </div>
  );
});
Bubble.displayName = "Bubble";

/* Typing dots */
const Dots = () => (
  <div className="flex gap-2 items-start mb-3 animate-fade-in">
    <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 shadow-md shadow-indigo-200 ring-2 ring-white">
      <I.Bot cls="w-8 h-8" />
    </div>
    <div className={`${T.msgBot} rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm`}>
      <div className="flex gap-1 items-center">
        {[0,160,320].map(d => (
          <span key={d} className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay:`${d}ms` }} />
        ))}
      </div>
    </div>
  </div>
);

/* Quick-reply pills */
const Pills = memo(({ options, onSelect }) => (
  <div className="flex flex-wrap gap-1.5 mt-1 mb-2 pl-9 animate-fade-in">
    {options.map(o => (
      <button key={o.id} onClick={() => onSelect(o)}
        className={`text-xs px-3 py-1.5 rounded-full font-semibold transition-all duration-150 active:scale-95 shadow-sm ${T.pill}`}>
        {o.label}
      </button>
    ))}
  </div>
));
Pills.displayName = "Pills";

/* Order card */
const OrderCard = memo(({ order, onClick }) => {
  const badge = ORDER_BADGE[order.status] || "bg-gray-100 text-gray-600 border border-gray-200";
  const itemName = order.items?.[0]?.product_id?.name || order.items?.[0]?.name || "Product";
  const more = order.items?.length > 1 ? ` +${order.items.length - 1} more` : "";
  return (
    <button onClick={onClick} className={`w-full text-left rounded-2xl p-3 mb-2 transition-all duration-200 ${T.card}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="font-mono text-[11px] font-bold text-indigo-600">{order.order_number}</span>
            <span className={`${T.badge} ${badge} capitalize`}>{order.status?.replace(/_/g," ")}</span>
          </div>
          <p className="text-xs font-semibold text-gray-800 truncate">{itemName}{more}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">₹{fmt(order.total_amount)} · {fmtDate(order.createdAt)}</p>
        </div>
        <div className="text-gray-300 flex-shrink-0 mt-1"><I.Arrow /></div>
      </div>
    </button>
  );
});
OrderCard.displayName = "OrderCard";

/* Ticket card */
const TicketCard = memo(({ ticket, onClick }) => {
  const badge = TICKET_BADGE[ticket.status] || "bg-gray-100 text-gray-600 border border-gray-200";
  return (
    <button onClick={onClick} className={`w-full text-left rounded-2xl p-3 mb-2 transition-all duration-200 ${T.card}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <span className="font-mono text-[11px] font-bold text-indigo-600">{ticket.ticket_number}</span>
          <p className="text-xs font-semibold text-gray-800 truncate mt-0.5">{ticket.subject}</p>
          <p className="text-[10px] text-gray-400 mt-0.5">{ticket.replies?.length || 0} replies · {fmtDate(ticket.createdAt)}</p>
        </div>
        <span className={`${T.badge} ${badge} flex-shrink-0 capitalize`}>{ticket.status?.replace(/_/g," ")}</span>
      </div>
    </button>
  );
});
TicketCard.displayName = "TicketCard";

/* Address card */
const AddressCard = memo(({ addr, index }) => (
  <div className={`rounded-2xl p-3 mb-2 ${T.card}`}>
    <div className="flex items-start justify-between">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="text-xs font-bold text-gray-700">{addr.full_name || addr.name || `Address ${index+1}`}</span>
          {addr.is_default && (
            <span className="bg-indigo-100 text-indigo-700 text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-indigo-200">DEFAULT</span>
          )}
        </div>
        <p className="text-[11px] text-gray-500 leading-relaxed">
          {[addr.address_line1, addr.address_line2, addr.city, addr.state, addr.pincode].filter(Boolean).join(", ")}
        </p>
        {addr.contact_no && <p className="text-[10px] text-gray-400 mt-0.5">📞 {addr.contact_no}</p>}
      </div>
      <span className="text-[10px] font-semibold text-gray-400 capitalize border border-gray-200 rounded-lg px-2 py-0.5">{addr.address_type || "Home"}</span>
    </div>
  </div>
));
AddressCard.displayName = "AddressCard";

/* Ticket form */
const TicketForm = memo(({ onSubmit, onCancel, loading }) => {
  const [form, setForm] = useState({ category:"other", subject:"", description:"" });
  const [errs, setErrs] = useState({});
  const validate = () => {
    const e = {};
    if (!form.subject.trim())     e.subject = "Subject is required";
    if (!form.description.trim()) e.description = "Please describe the issue";
    setErrs(e); return !Object.keys(e).length;
  };
  return (
    <div className={`mx-1 my-2 rounded-2xl p-4 space-y-3 animate-fade-in ${T.form}`}>
      <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
        <div className="w-7 h-7 rounded-xl bg-indigo-100 flex items-center justify-center">
          <span className="text-sm">🎫</span>
        </div>
        <div>
          <p className="text-xs font-bold text-gray-800">Raise a Support Ticket</p>
          <p className="text-[10px] text-gray-400">We respond within 24 hours</p>
        </div>
      </div>

      <div>
        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1 block">Category</label>
        <select value={form.category} onChange={e => setForm({...form, category:e.target.value})}
          className="w-full text-xs border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-indigo-400 bg-gray-50/80 font-medium">
          {TICKET_CATS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
      </div>

      <div>
        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1 block">Subject *</label>
        <input type="text" placeholder="Brief summary…" value={form.subject}
          onChange={e => setForm({...form, subject:e.target.value})}
          className={`w-full text-xs border rounded-xl px-3 py-2 outline-none focus:border-indigo-400 bg-gray-50/80 ${errs.subject?"border-red-300":"border-gray-200"}`}/>
        {errs.subject && <p className="text-red-500 text-[10px] mt-0.5">{errs.subject}</p>}
      </div>

      <div>
        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1 block">Description *</label>
        <textarea rows={3} placeholder="Describe your issue in detail…" value={form.description}
          onChange={e => setForm({...form, description:e.target.value})}
          className={`w-full text-xs border rounded-xl px-3 py-2 outline-none focus:border-indigo-400 bg-gray-50/80 resize-none ${errs.description?"border-red-300":"border-gray-200"}`}/>
        {errs.description && <p className="text-red-500 text-[10px] mt-0.5">{errs.description}</p>}
      </div>

      <div className="flex gap-2 pt-1">
        <button onClick={onCancel} className="flex-1 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-500 hover:bg-gray-50 transition-colors">Cancel</button>
        <button onClick={() => validate() && onSubmit(form)} disabled={loading}
          className="flex-1 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-xs font-bold hover:from-indigo-700 hover:to-violet-700 disabled:opacity-50 flex items-center justify-center gap-1.5 transition-all shadow-md shadow-indigo-200">
          {loading ? <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : "🚀"}
          Submit Ticket
        </button>
      </div>
    </div>
  );
});
TicketForm.displayName = "TicketForm";

/* Track order input */
const TrackInput = memo(({ onSubmit, onCancel, loading }) => {
  const [val, setVal] = useState("");
  return (
    <div className={`mx-1 my-2 rounded-2xl p-4 space-y-3 animate-fade-in ${T.form}`}>
      <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
        <div className="w-7 h-7 rounded-xl bg-indigo-100 flex items-center justify-center"><span className="text-sm">🚚</span></div>
        <div>
          <p className="text-xs font-bold text-gray-800">Track Your Order</p>
          <p className="text-[10px] text-gray-400">Enter your order number below</p>
        </div>
      </div>
      <input type="text" placeholder="e.g. ORD-20240001" value={val}
        onChange={e => setVal(e.target.value.trim())}
        onKeyDown={e => e.key==="Enter" && val && onSubmit(val)}
        className="w-full text-xs border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-indigo-400 bg-gray-50/80 font-mono"/>
      <div className="flex gap-2">
        <button onClick={onCancel} className="flex-1 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-500 hover:bg-gray-50 transition-colors">Cancel</button>
        <button onClick={() => val && onSubmit(val)} disabled={!val || loading}
          className="flex-1 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-xs font-bold disabled:opacity-40 flex items-center justify-center gap-1.5 shadow-md shadow-indigo-200 transition-all">
          {loading ? <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : "🔍"}
          Track
        </button>
      </div>
    </div>
  );
});
TrackInput.displayName = "TrackInput";

/* ─────────────────────────── HOME MENU GRID ────────────────────────────────── */
const MENU_ITEMS_AUTH = [
  { id:"my_orders",    emoji:"📦", label:"My Orders",       sub:"View & manage orders"   },
  { id:"track_order",  emoji:"🚚", label:"Track Order",      sub:"Real-time tracking"     },
  { id:"my_profile",   emoji:"👤", label:"My Profile",       sub:"Name, email, phone"     },
  { id:"my_addresses", emoji:"📍", label:"Addresses",        sub:"Saved delivery spots"   },
  { id:"cart_summary", emoji:"🛒", label:"Cart Summary",     sub:"Items & total"          },
  { id:"my_tickets",   emoji:"🎫", label:"My Tickets",       sub:"Support history"        },
  { id:"new_ticket",   emoji:"🆕", label:"Raise Ticket",     sub:"Report an issue"        },
  { id:"return_help",  emoji:"↩️", label:"Return & Refund",  sub:"7-day easy returns"     },
  { id:"payment_help", emoji:"💳", label:"Payment Help",     sub:"Billing & charges"      },
  { id:"faq",          emoji:"❓", label:"FAQs",             sub:"Common questions"       },
  { id:"coupon_help",  emoji:"🏷️", label:"Coupons & Offers", sub:"Discounts & deals"      },
  { id:"human",        emoji:"🧑‍💼",label:"Human Agent",      sub:"Talk to support team"   },
];

const MENU_ITEMS_GUEST = [
  { id:"track_order",  emoji:"🚚", label:"Track Order",      sub:"Enter your order no."   },
  { id:"faq_returns",  emoji:"↩️", label:"Returns",          sub:"Policy & process"       },
  { id:"faq_payment",  emoji:"💳", label:"Payment Help",     sub:"Methods & issues"       },
  { id:"faq",          emoji:"❓", label:"FAQs",             sub:"Common questions"       },
  { id:"go_login",     emoji:"🔑", label:"Login",            sub:"Access your account"    },
  { id:"go_register",  emoji:"📝", label:"Register",         sub:"Create free account"    },
  { id:"go_contact",   emoji:"📬", label:"Contact Us",       sub:"Get in touch"           },
  { id:"coupon_help",  emoji:"🏷️", label:"Coupons & Offers", sub:"Current promotions"     },
];

const HomeMenu = memo(({ items, onSelect }) => (
  <div className="pl-9 animate-fade-in">
    <div className="grid grid-cols-2 gap-1.5 mt-1 mb-2">
      {items.map(it => (
        <button key={it.id} onClick={() => onSelect(it)}
          className="text-left bg-white/70 backdrop-blur border border-gray-100 rounded-2xl p-2.5 hover:border-indigo-200 hover:bg-white hover:shadow-md transition-all duration-150 active:scale-95 group">
          <span className="text-lg leading-none block mb-1">{it.emoji}</span>
          <p className="text-[11px] font-bold text-gray-800 group-hover:text-indigo-700 transition-colors leading-tight">{it.label}</p>
          <p className="text-[9px] text-gray-400 mt-0.5 leading-tight">{it.sub}</p>
        </button>
      ))}
    </div>
  </div>
));
HomeMenu.displayName = "HomeMenu";

/* ─────────────────────────── FAQ DATABASE ──────────────────────────────────── */
const FAQ = {
  shipping: {
    q: "How long does shipping take?",
    a: "**Shipping Timeframes:**\n\n• **Standard Delivery:** 5–7 business days\n• **Express Delivery:** 2–3 business days\n• **Same-Day:** Available in select cities (order before 11 AM)\n• **Free shipping** on orders above ₹499\n\nYou'll receive a tracking link via SMS & email once your order is shipped.",
  },
  return_policy: {
    q: "What is the return policy?",
    a: "**Return & Refund Policy:**\n\n• **7-day** return window from delivery date\n• Items must be **unused** and in **original packaging**\n• Electronics: 7 days | Clothing: 30 days | Books: Non-returnable\n• Damaged/wrong items — **free pickup + full refund**\n• Refund in 5–7 business days to original payment method\n\nGo to **My Orders → Select Order → Request Return** to initiate.",
  },
  payment_methods: {
    q: "What payment methods are accepted?",
    a: "**We Accept:**\n\n• 💳 Credit & Debit Cards (Visa, Mastercard, RuPay)\n• 📱 UPI (GPay, PhonePe, Paytm, BHIM)\n• 🏦 Net Banking (50+ banks)\n• 💰 Cash on Delivery (orders up to ₹10,000)\n• 🏪 EMI — 3/6/9/12 months on orders ≥ ₹3,000\n• 🎁 ShopEase Gift Cards",
  },
  cancel_order: {
    q: "How to cancel an order?",
    a: "**Cancel an Order:**\n\nYou can cancel within **24 hours** of placing the order:\n\n1. Go to **My Orders**\n2. Select the order you want to cancel\n3. Click **Cancel Order**\n4. Choose a reason and confirm\n\n**After 24 hours:** Order may already be shipped — you can still return it after delivery.\n\nRefund is processed within **3–5 business days**.",
  },
  coupon: {
    q: "How do I use a coupon?",
    a: "**Using Coupons:**\n\n1. Add items to your cart\n2. Go to **Checkout**\n3. Enter coupon code in the **\"Apply Coupon\"** field\n4. Click **Apply** — discount will be shown instantly\n\n**Tips:**\n• Check **My Coupons** page for available codes\n• One coupon per order\n• Minimum order amounts may apply\n• Coupons cannot be combined with other offers",
  },
  account_help: {
    q: "Account related help",
    a: "**Account Help:**\n\n• **Forgot password?** → Login page → *Forgot Password* → Check email\n• **Change password** → My Account → Settings → Change Password\n• **Update profile** → My Account → Profile → Edit\n• **Delete account** → My Settings → Account Deletion\n• **Email not verified?** → Check spam folder or request new verification link",
  },
  gift_card: {
    q: "How do gift cards work?",
    a: "**ShopEase Gift Cards:**\n\n• Available in denominations: ₹500, ₹1000, ₹2000, ₹5000\n• **Valid for 12 months** from purchase date\n• Can be used for any product on ShopEase\n• **Not applicable** on Cash on Delivery orders\n• Balance check: My Account → Gift Cards\n• Multiple gift cards can be combined",
  },
  warranty: {
    q: "What about product warranty?",
    a: "**Warranty Information:**\n\n• Electronics — Manufacturer warranty (1–2 years)\n• Appliances — Brand warranty certificate included\n• Warranty claims: Contact manufacturer directly or raise a ticket\n• ShopEase provides **7-day replacement** for defective products\n\nAll warranty documents are available in your order details.",
  },
};

/* ─────────────────────────── MAIN WIDGET ───────────────────────────────────── */
const BACK_PILL = { id:"back_menu", label:"↩ Main Menu" };
const makeRetryPill = (id) => ({ id, label:"🔄 Retry" });

const ChatBotWidget = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLogin, user }                          = useSelector(s => s.customerAuth);
  const { items: cartItems, count: cartCount }     = useSelector(s => s.publicCart);
  const { mutating }                               = useSelector(s => s.publicSupport);

  /* ── widget state ── */
  const [isOpen,       setIsOpen]       = useState(false);
  const [unread,       setUnread]       = useState(0);
  const [peeked,       setPeeked]       = useState(false);
  const [isMinimized,  setIsMinimized]  = useState(false);

  /* ── chat state ── */
  const [msgs,         setMsgs]         = useState([]);
  const [input,        setInput]        = useState("");
  const [typing,       setTyping]       = useState(false);
  const [pills,        setPills]        = useState([]);
  const [menuItems,    setMenuItems]    = useState([]);   // home grid
  const [inlineEl,     setInlineEl]     = useState(null); // "ticket"|"track"
  const [trackLoading, setTrackLoading] = useState(false);

  const bottomRef = useRef(null);
  const inputRef  = useRef(null);
  const peekRef   = useRef(null);

  /* ── scroll to bottom ── */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, typing, inlineEl, menuItems]);

  /* ── auto-peek 8 s ── */
  useEffect(() => {
    if (!sessionStorage.getItem("shivi_seen")) {
      peekRef.current = setTimeout(() => {
        if (!peeked) { setPeeked(true); setUnread(1); sessionStorage.setItem("shivi_seen","1"); }
      }, 8000);
    }
    return () => clearTimeout(peekRef.current);
  }, [peeked]);

  /* ── core helpers ── */
  const botSay = useCallback((text, newPills = [], newMenu = [], delay = TYPING_MS) => {
    setTyping(true); setPills([]); setMenuItems([]);
    setTimeout(() => {
      setTyping(false);
      setMsgs(p => [...p, { id:uid(), role:"bot", text, time:clock() }]);
      if (newPills.length)  setPills(newPills);
      if (newMenu.length)   setMenuItems(newMenu);
    }, delay);
  }, []);

  const userSay = useCallback((text) => {
    setMsgs(p => [...p, { id:uid(), role:"user", text, time:clock() }]);
    setPills([]); setMenuItems([]); setInlineEl(null);
  }, []);

  const inlineCards = useCallback((cardType, cards) => {
    setMsgs(p => [...p, { id:uid(), role:"bot", time:clock(), type:"cards", cardType, cards }]);
  }, []);

  /* ── main menu ── */
  const mainMenu = useMemo(() => isLogin ? MENU_ITEMS_AUTH : MENU_ITEMS_GUEST, [isLogin]);

  const openMenu = useCallback(() => {
    const name = user?.name?.split(" ")[0];
    const txt  = isLogin
      ? `What would you like help with today, **${name}**? 👇`
      : "How can I help you today? Choose a topic below 👇";
    botSay(txt, [], isLogin ? MENU_ITEMS_AUTH : MENU_ITEMS_GUEST);
  }, [isLogin, user, botSay]);

  /* ── init ── */
  const initChat = useCallback(() => {
    const name = user?.name?.split(" ")[0] || "";
    const greet = isLogin
      ? `Hey **${name}**! 👋 I'm **Shivi**, your ShopEase AI assistant.\n\nI can help with orders, tracking, returns, payments, your profile and much more. What do you need?`
      : "Hey there! 👋 I'm **Shivi**, your ShopEase AI assistant.\n\nI can help with orders, tracking, returns, payments and more. What can I do for you?";
    setMsgs([{ id:uid(), role:"bot", text:greet, time:clock() }]);
    setMenuItems(isLogin ? MENU_ITEMS_AUTH : MENU_ITEMS_GUEST);
    setPills([]); setInlineEl(null);
  }, [isLogin, user]);

  const handleOpen = useCallback(() => {
    setIsOpen(true); setUnread(0); setIsMinimized(false);
    if (msgs.length === 0) initChat();
    setTimeout(() => inputRef.current?.focus(), 200);
  }, [msgs.length, initChat]);

  const handleClose    = useCallback(() => setIsOpen(false), []);
  const handleMinimize = ()  => setIsMinimized(v => !v);

  /* ── reinitialize chat on login/logout ── */
  useEffect(() => {
    if (isOpen && msgs.length > 0) { initChat(); }
  }, [isLogin]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ════════════════════ FLOW HANDLERS ════════════════════ */

  /* ── My Orders ── */
  const doMyOrders = useCallback(async () => {
    botSay("Fetching your recent orders…", [], [], 300);
    try {
      const res    = await dispatch(fetchMyOrders({ page:1, per_page:5 })).unwrap();
      const orders = res?.data?.data ?? res?.data ?? [];
      if (!orders.length) {
        botSay("You haven't placed any orders yet. Start shopping! 🛍️", [
          { id:"go_home", label:"🏠 Shop Now" }, BACK_PILL,
        ]);
        return;
      }
      botSay(`Here are your **${orders.length}** most recent orders:`, [
        { id:"track_order",  label:"🚚 Track an Order"  },
        { id:"return_help",  label:"↩️ Return / Refund" },
        { id:"go_my_orders", label:"📋 View All Orders" },
        BACK_PILL,
      ], [], 300);
      setTimeout(() => inlineCards("orders", orders), 300 + 120);
    } catch {
      botSay("Couldn't load your orders right now. Please try again.", [makeRetryPill("my_orders"), BACK_PILL]);
    }
  }, [dispatch, botSay, inlineCards]);

  /* ── Track Order ── */
  const doTrackPrompt = useCallback(() => {
    botSay("Please enter your **order number** below 👇", [], [], 350);
    setTimeout(() => setInlineEl("track"), 470);
  }, [botSay]);

  const doTrackSubmit = useCallback(async (orderNum) => {
    userSay(`🔍 Track: ${orderNum}`);
    setInlineEl(null);
    setTrackLoading(true);
    botSay("Looking up your order…", [], [], 300);
    try {
      const res = await dispatch(trackOrder(orderNum)).unwrap();
      const o   = res?.data ?? res;
      setTrackLoading(false);
      if (!o) {
        botSay("❌ No order found with that number. Please double-check and try again.", [
          { id:"track_order", label:"🔄 Try Again" }, BACK_PILL,
        ]);
        return;
      }
      const lines = [
        `🚚 **Order #${o.order_number}**`,
        `**Status:** ${(o.status||"—").replace(/_/g," ").toUpperCase()}`,
        o.items?.length  ? `**Items:** ${o.items.map(i=>i.product_id?.name||i.name||"Item").join(", ")}` : null,
        o.total_amount   ? `**Amount:** ₹${fmt(o.total_amount)}` : null,
        o.estimated_delivery ? `**Est. Delivery:** ${fmtDate(o.estimated_delivery)}` : null,
        o.tracking_number    ? `**AWB / Tracking:** ${o.tracking_number}` : null,
      ].filter(Boolean).join("\n");
      botSay(lines, [
        { id:"my_orders",   label:"📦 All My Orders"  },
        { id:"return_help", label:"↩️ Request Return" },
        { id:"new_ticket",  label:"🎫 Raise Ticket"   },
        BACK_PILL,
      ], [], 300);
    } catch {
      setTrackLoading(false);
      botSay("❌ Order not found. Please check the number and try again.", [
        { id:"track_order", label:"🔄 Try Again" }, BACK_PILL,
      ]);
    }
  }, [dispatch, botSay, userSay]);

  /* ── My Profile ── */
  const doMyProfile = useCallback(async () => {
    botSay("Fetching your profile details…", [], [], 300);
    try {
      const res = await dispatch(fetchCustomerProfile()).unwrap();
      const p   = res?.data ?? res;
      const lines = [
        "👤 **Your Profile**",
        `**Name:** ${p?.name || "—"}`,
        `**Email:** ${p?.email || "—"}`,
        `**Phone:** ${p?.contact_no || "Not added yet"}`,
        p?.created_at ? `**Member Since:** ${fmtDate(p.created_at)}` : null,
      ].filter(Boolean).join("\n");
      botSay(lines, [
        { id:"go_profile",   label:"✏️ Edit Profile"    },
        { id:"my_addresses", label:"📍 My Addresses"    },
        { id:"go_settings",  label:"⚙️ Settings"        },
        BACK_PILL,
      ], [], 300);
    } catch {
      botSay("Couldn't load your profile. Please try again.", [makeRetryPill("my_profile"), BACK_PILL]);
    }
  }, [dispatch, botSay]);

  /* ── My Addresses ── */
  const doMyAddresses = useCallback(async () => {
    botSay("Loading your saved addresses…", [], [], 300);
    try {
      const res  = await dispatch(fetchAddresses()).unwrap();
      const list = res?.data ?? [];
      if (!list.length) {
        botSay("You have no saved addresses yet. Add one to speed up checkout!", [
          { id:"go_addresses", label:"➕ Add Address" }, BACK_PILL,
        ]);
        return;
      }
      botSay(`📍 Your **${list.length}** saved address${list.length>1?"es":""}:`, [
        { id:"go_addresses", label:"📍 Manage Addresses" },
        { id:"go_checkout",  label:"🛒 Go to Checkout"   },
        BACK_PILL,
      ], [], 300);
      setTimeout(() => inlineCards("addresses", list), 300 + 120);
    } catch {
      botSay("Couldn't fetch addresses right now.", [makeRetryPill("my_addresses"), BACK_PILL]);
    }
  }, [dispatch, botSay, inlineCards]);

  /* ── Cart Summary ── */
  const doCartSummary = useCallback(() => {
    const active = cartItems.filter(i => !i.saved_for_later);
    if (!active.length) {
      botSay("Your cart is currently empty. Browse our collection and add items! 🛍️", [
        { id:"go_home",    label:"🏠 Shop Now"    },
        { id:"go_cart",    label:"🛒 View Cart"   },
        BACK_PILL,
      ]);
      return;
    }
    const total = active.reduce((s,i) => s + (i.price||0)*(i.qty||1), 0);
    const lines = [
      `🛒 **Your Cart (${cartCount} item${cartCount!==1?"s":""}):**`,
      ...active.slice(0,5).map((i,idx) =>
        `${idx+1}. **${i.name||"Product"}** × ${i.qty||1} — ₹${fmt((i.price||0)*(i.qty||1))}`
      ),
      active.length>5 ? `…and **${active.length-5}** more item(s)` : null,
      "",
      `**Subtotal: ₹${fmt(total)}**`,
    ].filter(v => v !== null).join("\n");
    botSay(lines, [
      { id:"go_cart",     label:"🛒 View Cart"     },
      { id:"go_checkout", label:"✅ Checkout Now"   },
      { id:"coupon_help", label:"🏷️ Apply Coupon"  },
      BACK_PILL,
    ]);
  }, [cartItems, cartCount, botSay]);

  /* ── My Tickets ── */
  const doMyTickets = useCallback(async () => {
    botSay("Loading your support tickets…", [], [], 300);
    try {
      const res     = await dispatch(fetchMyTickets({ page:1, per_page:5 })).unwrap();
      const tickets = res?.data?.data ?? [];
      if (!tickets.length) {
        botSay("You haven't raised any support tickets yet.", [
          { id:"new_ticket", label:"🆕 Raise a Ticket" }, BACK_PILL,
        ]);
        return;
      }
      botSay(`🎫 Your **${tickets.length}** recent ticket${tickets.length>1?"s":""}:`, [
        { id:"new_ticket",    label:"🆕 New Ticket"         },
        { id:"go_my_tickets", label:"📋 All Tickets Page"   },
        BACK_PILL,
      ], [], 300);
      setTimeout(() => inlineCards("tickets", tickets), 300 + 120);
    } catch {
      botSay("Couldn't load your tickets right now.", [makeRetryPill("my_tickets"), BACK_PILL]);
    }
  }, [dispatch, botSay, inlineCards]);

  /* ── New Ticket ── */
  const doNewTicket = useCallback(() => {
    botSay("Sure! Fill in the form below and I'll create your ticket instantly. 🎫", [], [], 350);
    setTimeout(() => setInlineEl("ticket"), 470);
  }, [botSay]);

  const doTicketSubmit = useCallback(async (form) => {
    userSay(`📝 Ticket: ${form.subject}`);
    setInlineEl(null);
    botSay("Creating your support ticket…", [], [], 300);
    try {
      const res = await dispatch(createTicket({
        subject: form.subject, description: form.description, category: form.category,
      })).unwrap();
      if (res?.success) {
        botSay(
          `✅ **Ticket Created Successfully!**\n\n🎫 **Ticket #:** ${res.data?.ticket_number||"—"}\n📌 **Subject:** ${form.subject}\n🏷️ **Category:** ${form.category}\n\nOur support team will respond within **24 hours**. You'll get an email notification when we reply.`,
          [
            { id:"my_tickets",    label:"🎫 View My Tickets"  },
            { id:"go_my_tickets", label:"📋 Tickets Page"     },
            BACK_PILL,
          ],
          [],
          300
        );
      } else {
        botSay(res?.message||"Failed to create ticket. Please try again.", [makeRetryPill("new_ticket"), BACK_PILL]);
      }
    } catch (err) {
      toast.error(err?.message||"Something went wrong");
      botSay("Something went wrong. Please try again.", [makeRetryPill("new_ticket"), BACK_PILL]);
    }
  }, [dispatch, botSay, userSay]);

  /* ── Return Help ── */
  const doReturnHelp = useCallback(() => {
    botSay(FAQ.return_policy.a, [
      { id:"my_orders",  label:"📦 My Orders"    },
      { id:"new_ticket", label:"🎫 Raise Ticket" },
      BACK_PILL,
    ]);
  }, [botSay]);

  /* ── Payment Help ── */
  const doPaymentHelp = useCallback(() => {
    botSay(FAQ.payment_methods.a + "\n\n**Payment Issue?**\n• Failed payment → auto-refunded in 5–7 days\n• Charged but no order? → Raise a ticket immediately", [
      { id:"new_ticket", label:"🎫 Raise Ticket"    },
      { id:"go_contact", label:"📬 Contact Support" },
      BACK_PILL,
    ]);
  }, [botSay]);

  /* ── FAQ Hub ── */
  const doFAQ = useCallback(() => {
    botSay("Here are all the frequently asked questions. Pick a topic:", [
      { id:"faq_shipping",  label:"🚚 Shipping"       },
      { id:"faq_returns",   label:"↩️ Returns"         },
      { id:"faq_payment",   label:"💳 Payments"        },
      { id:"faq_cancel",    label:"❌ Cancel Order"    },
      { id:"coupon_help",   label:"🏷️ Coupons"         },
      { id:"faq_account",   label:"👤 Account"         },
      { id:"faq_warranty",  label:"🛡️ Warranty"        },
      { id:"faq_giftcard",  label:"🎁 Gift Cards"      },
      BACK_PILL,
    ]);
  }, [botSay]);

  /* ── Coupon Help ── */
  const doCouponHelp = useCallback(() => {
    botSay(FAQ.coupon.a, [
      { id:"go_my_coupons", label:"🏷️ My Coupons Page" },
      { id:"go_cart",       label:"🛒 Go to Cart"       },
      BACK_PILL,
    ]);
  }, [botSay]);

  /* ── Human Agent ── */
  const doHuman = useCallback(() => {
    botSay(
      "I'll connect you with our support team! 🧑‍💼\n\nOur agents respond within **2–4 hours** during business hours (Mon–Sat, 9 AM – 6 PM IST).\n\n📧 **Email:** support@shopease.in\n📞 **Phone:** 1800-XXX-XXXX (Toll Free)\n\nThe fastest way is to **raise a support ticket** and our team will personally assist you.",
      [
        { id:"new_ticket",    label:"🆕 Raise a Ticket"  },
        { id:"my_tickets",    label:"🎫 My Tickets"       },
        { id:"go_contact",    label:"📬 Contact Us Page"  },
        BACK_PILL,
      ]
    );
  }, [botSay]);

  /* ════════════════════ PILL / MENU DISPATCHER ════════════════════ */
  const requireLogin = useCallback((cb) => {
    if (!isLogin) {
      botSay("Please **login** first to access this feature.", [
        { id:"go_login",    label:"🔑 Login Now"   },
        { id:"go_register", label:"📝 Register"    },
        BACK_PILL,
      ]);
    } else cb();
  }, [isLogin, botSay]);

  const dispatchAction = useCallback((id, label) => {
    /* ── navigation map ── */
    const navMap = {
      go_home        : "/",
      go_cart        : "/cart",
      go_checkout    : "/checkout",
      go_my_orders   : "/my-orders",
      go_profile     : "/my-profile",
      go_addresses   : "/my-addresses",
      go_settings    : "/my-settings",
      go_my_tickets  : "/my-tickets",
      go_my_coupons  : "/my-coupons",
      go_login       : "/login",
      go_register    : "/register",
      go_contact     : "/contact-us",
      go_help        : "/help-center",
      go_returns     : "/returns",
      go_shipping    : "/shipping-policy",
      go_track_page  : "/track-order",
    };
    if (navMap[id]) {
      userSay(label);
      navigate(navMap[id]);
      handleClose();
      return;
    }
    switch (id) {
      case "my_orders"    : userSay(label); requireLogin(doMyOrders);    break;
      case "track_order"  : userSay(label); doTrackPrompt();             break;
      case "my_profile"   : userSay(label); requireLogin(doMyProfile);   break;
      case "my_addresses" : userSay(label); requireLogin(doMyAddresses); break;
      case "cart_summary" : userSay(label); doCartSummary();             break;
      case "my_tickets"   : userSay(label); requireLogin(doMyTickets);   break;
      case "new_ticket"   : userSay(label); requireLogin(doNewTicket);   break;
      case "return_help"  :
      case "faq_returns"  : userSay(label); doReturnHelp();              break;
      case "payment_help" :
      case "faq_payment"  : userSay(label); doPaymentHelp();             break;
      case "faq"          : userSay(label); doFAQ();                     break;
      case "coupon_help"  : userSay(label); doCouponHelp();              break;
      case "human"        : userSay(label); doHuman();                   break;
      case "faq_shipping" : userSay(label); botSay(FAQ.shipping.a,       [BACK_PILL]); break;
      case "faq_cancel"   : userSay(label); botSay(FAQ.cancel_order.a,   [{ id:"my_orders",label:"📦 My Orders" }, BACK_PILL]); break;
      case "faq_account"  : userSay(label); botSay(FAQ.account_help.a,   [{ id:"go_settings",label:"⚙️ Settings" }, BACK_PILL]); break;
      case "faq_warranty" : userSay(label); botSay(FAQ.warranty.a,       [{ id:"new_ticket",label:"🎫 Raise Ticket" }, BACK_PILL]); break;
      case "faq_giftcard" : userSay(label); botSay(FAQ.gift_card.a,      [{ id:"go_home",label:"🎁 Buy Gift Card" }, BACK_PILL]); break;
      case "back_menu"    :
        userSay("↩ Main Menu");
        setTimeout(() => openMenu(), 150);
        break;
      default:
        userSay(label);
        botSay("I didn't catch that. Here's what I can help you with:", [], mainMenu);
    }
  }, [
    isLogin, userSay, botSay, navigate, mainMenu, handleClose,
    requireLogin, doMyOrders, doTrackPrompt, doMyProfile,
    doMyAddresses, doCartSummary, doMyTickets, doNewTicket,
    doReturnHelp, doPaymentHelp, doFAQ, doCouponHelp, doHuman,
    openMenu,
  ]);

  const handlePill = useCallback((pill) => dispatchAction(pill.id, pill.label), [dispatchAction]);
  const handleMenu = useCallback((item) => dispatchAction(item.id, `${item.emoji} ${item.label}`), [dispatchAction]);

  /* ════════════════════ FREE-TEXT NLP ════════════════════ */
  const handleSend = useCallback(() => {
    const text = input.trim();
    if (!text) return;
    setInput("");

    const t = text.toLowerCase();

    /* greetings */
    if (/^(hi+|hello|hey|howdy|namaste|hola|sup|yo|good\s?(morning|evening|afternoon|day))/.test(t)) {
      const name = user?.name?.split(" ")[0] || "there";
      userSay(text);
      botSay(`Hey **${name}**! 😊 Great to see you. What can I help you with today?`, [], mainMenu);
      return;
    }
    /* farewells */
    if (/\b(bye|goodbye|see you|cya|thanks|thank you|thx|ok done|that'?s all|no more)\b/.test(t)) {
      userSay(text);
      botSay("You're welcome! 😊 Happy shopping at ShopEase. See you next time! 🛍️");
      return;
    }

    userSay(text);

    /* orders */
    if (/\border(s|ed)?\b|my order|recent order|order list|purchase/.test(t)) {
      requireLogin(doMyOrders); return;
    }
    /* tracking */
    if (/track|where.*order|order.*status|shipped|dispatch|courier|awb|delivery status/.test(t)) {
      doTrackPrompt(); return;
    }
    /* return & refund */
    if (/return|refund|exchange|replace|wrong item|damaged|defect|money back/.test(t)) {
      doReturnHelp(); return;
    }
    /* cancel */
    if (/cancel.*order|order.*cancel/.test(t)) {
      botSay(FAQ.cancel_order.a, [{ id:"my_orders",label:"📦 My Orders" }, BACK_PILL]); return;
    }
    /* payment */
    if (/pay(ment|ing|ed)?|bill|invoice|charge|debit|credit|upi|emi|failed.*pay|pay.*fail/.test(t)) {
      doPaymentHelp(); return;
    }
    /* shipping */
    if (/ship(ping)?|delivery time|how long|when.*deliver|dispatch time/.test(t)) {
      botSay(FAQ.shipping.a, [BACK_PILL]); return;
    }
    /* profile */
    if (/\bprofile\b|my name|my email|my phone|update.*detail|account.*detail/.test(t)) {
      requireLogin(doMyProfile); return;
    }
    /* address */
    if (/address|pincode|city|location|delivery.*address|add.*address/.test(t)) {
      requireLogin(doMyAddresses); return;
    }
    /* cart */
    if (/\bcart\b|basket|bag|items.*added|added.*item/.test(t)) {
      doCartSummary(); return;
    }
    /* coupon / offer */
    if (/coupon|promo.*code|discount|offer|deal|voucher/.test(t)) {
      doCouponHelp(); return;
    }
    /* ticket / support */
    if (/\bticket(s)?\b|my ticket|support.*ticket|complaint/.test(t)) {
      requireLogin(doMyTickets); return;
    }
    if (/raise.*ticket|create.*ticket|new.*ticket|open.*ticket|file.*complaint/.test(t)) {
      requireLogin(doNewTicket); return;
    }
    /* human / agent */
    if (/human|agent|staff|person|real.*person|talk.*to.*someone|escalate/.test(t)) {
      doHuman(); return;
    }
    /* warranty */
    if (/warrant(y|ies)|guarantee|product.*quality/.test(t)) {
      botSay(FAQ.warranty.a, [{ id:"new_ticket",label:"🎫 Raise Ticket" }, BACK_PILL]); return;
    }
    /* gift card */
    if (/gift.*card|giftcard|gift voucher/.test(t)) {
      botSay(FAQ.gift_card.a, [{ id:"go_home",label:"🎁 Buy Gift Card" }, BACK_PILL]); return;
    }
    /* account / password */
    if (/password|forgot.*pass|reset.*pass|change.*pass|login.*issue|can'?t.*log/.test(t)) {
      botSay(FAQ.account_help.a, [{ id:"go_settings",label:"⚙️ Settings" }, BACK_PILL]); return;
    }
    /* login / register */
    if (/\blogin\b|sign.?in/.test(t)) {
      navigate("/login"); handleClose(); return;
    }
    if (/\bregister\b|sign.?up|create.*account/.test(t)) {
      navigate("/register"); handleClose(); return;
    }
    /* help / faq */
    if (/\bhelp\b|faq|question|how to|how do i|what is|explain/.test(t)) {
      doFAQ(); return;
    }
    /* fallback */
    botSay(
      "I'm not entirely sure about that, but here's what I can help you with:",
      [],
      mainMenu
    );
  }, [
    input, user, isLogin, mainMenu, botSay, userSay, navigate, handleClose,
    requireLogin, doMyOrders, doTrackPrompt, doReturnHelp, doPaymentHelp,
    doMyProfile, doMyAddresses, doCartSummary, doCouponHelp,
    doMyTickets, doNewTicket, doHuman, doFAQ,
  ]);

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  /* ════════════════════ RENDER ════════════════════ */
  return (
    <>
      {/* ── Floating Action Button Area ───────────────────────────────── */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-2.5">

        {/* Peek bubble */}
        {!isOpen && unread > 0 && (
          <button onClick={handleOpen}
            className="flex items-center gap-2.5 bg-white/95 backdrop-blur-md border border-white/60 shadow-2xl shadow-indigo-200/60 rounded-2xl px-4 py-2.5 animate-bounce-once hover:shadow-indigo-300/60 transition-all max-w-[230px]">
            <div className="w-10 h-10 rounded-full overflow-hidden shadow-md shadow-indigo-300 flex-shrink-0 ring-2 ring-indigo-100">
              <I.Bot cls="w-10 h-10" />
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-gray-800">Hi! I'm Shivi 👋</p>
              <p className="text-[10px] text-gray-500">How can I help you?</p>
            </div>
          </button>
        )}

        {/* Main FAB */}
        <button
          onClick={isOpen ? handleClose : handleOpen}
          aria-label={isOpen ? "Close Tanne" : "Chat with Tanne"}
          className={`relative w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 active:scale-90 overflow-hidden
            ${isOpen
              ? "bg-gray-800 hover:bg-gray-700 shadow-gray-400/40"
              : `shadow-indigo-400/50 hover:shadow-indigo-500/60 ring-2 ring-white`
            }`}>
          {isOpen
            ? <span className="text-white"><I.X /></span>
            : <I.Bot cls="w-14 h-14" />
          }
          {/* unread badge */}
          {!isOpen && unread > 0 && (
            <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 shadow-lg animate-pulse">
              {unread}
            </span>
          )}
          {/* online dot */}
          {!isOpen && (
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 border-2 border-white rounded-full shadow" />
          )}
        </button>
      </div>

      {/* ── Chat Window ───────────────────────────────────────────────── */}
      <div
        className={`fixed right-6 z-[9998] w-[370px] max-w-[calc(100vw-24px)]
          flex flex-col rounded-3xl overflow-hidden
          shadow-2xl shadow-indigo-300/30 border border-white/40
          transition-all duration-300 ease-out origin-bottom-right
          ${isOpen
            ? "opacity-100 scale-100 pointer-events-auto"
            : "opacity-0 scale-95 pointer-events-none"
          }
          ${isMinimized ? "bottom-24 h-auto" : "bottom-24"}
        `}
        style={isMinimized ? {} : { height: "580px" }}
      >

        {/* ── Glassmorphism background ── */}
        <div className="absolute inset-0 bg-white/80 backdrop-blur-xl" />

        {/* ── HEADER ─────────────────────────────────────────────────── */}
        <div className={`relative bg-gradient-to-r ${T.header} px-4 py-3 flex items-center gap-3 flex-shrink-0`}>
          {/* Decorative glow */}
          <div className="absolute inset-0 bg-white/5 backdrop-blur-sm" />

          {/* Avatar */}
          <div className="relative z-10 flex-shrink-0">
            <div className="w-11 h-11 rounded-full overflow-hidden shadow-lg ring-2 ring-white/50">
              <I.Bot cls="w-11 h-11" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full" />
          </div>

          {/* Title */}
          <div className="relative z-10 flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-white font-bold text-sm">{BOT_NAME}</span>
              <span className="bg-white/20 backdrop-blur text-white text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 border border-white/20">
                <I.Star /> AI
              </span>
            </div>
            <p className="text-white/70 text-[11px] flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full inline-block" />
              Online · Replies instantly
            </p>
          </div>

          {/* Header actions */}
          <div className="relative z-10 flex items-center gap-1">
            <button
              onClick={() => { setMsgs([]); setPills([]); setMenuItems([]); setInlineEl(null); initChat(); }}
              title="Reset chat"
              className="w-7 h-7 rounded-lg text-white/60 hover:text-white hover:bg-white/15 flex items-center justify-center transition-all">
              <I.Refresh />
            </button>
            <button
              onClick={handleMinimize}
              title={isMinimized ? "Expand" : "Minimize"}
              className="w-7 h-7 rounded-lg text-white/60 hover:text-white hover:bg-white/15 flex items-center justify-center transition-all">
              <I.Minimize />
            </button>
            <button
              onClick={handleClose}
              className="w-7 h-7 rounded-lg text-white/60 hover:text-white hover:bg-white/15 flex items-center justify-center transition-all">
              <I.X />
            </button>
          </div>
        </div>

        {/* ── BODY (hidden when minimized) ──────────────────────────── */}
        {!isMinimized && (
          <>
            {/* Messages area */}
            <div className="relative flex-1 overflow-y-auto px-3 py-4 space-y-0 scroll-smooth"
              style={{ background: "linear-gradient(180deg, #f8f7ff 0%, #faf9ff 100%)" }}>

              {/* Subtle background pattern */}
              <div className="absolute inset-0 opacity-[0.03]"
                style={{ backgroundImage: "radial-gradient(circle, #4f46e5 1px, transparent 1px)", backgroundSize: "20px 20px" }} />

              <div className="relative z-10">
                {msgs.map(msg => {
                  /* ── card messages ── */
                  if (msg.type === "cards" && msg.cards) {
                    if (msg.cardType === "orders") {
                      return (
                        <div key={msg.id} className="mb-3 pl-9">
                          {msg.cards.map(o => (
                            <OrderCard key={o._id} order={o}
                              onClick={() => { navigate(`/my-orders/${o._id}`); handleClose(); }} />
                          ))}
                        </div>
                      );
                    }
                    if (msg.cardType === "tickets") {
                      return (
                        <div key={msg.id} className="mb-3 pl-9">
                          {msg.cards.map(t => (
                            <TicketCard key={t._id} ticket={t}
                              onClick={() => { navigate("/my-tickets"); handleClose(); }} />
                          ))}
                        </div>
                      );
                    }
                    if (msg.cardType === "addresses") {
                      return (
                        <div key={msg.id} className="mb-3 pl-9">
                          {msg.cards.map((a, i) => (
                            <AddressCard key={a._id || (a.address_line1 + a.pincode)} addr={a} index={i} />
                          ))}
                        </div>
                      );
                    }
                  }
                  return <Bubble key={msg.id} msg={msg} />;
                })}

                {/* Typing indicator */}
                {typing && <Dots />}

                {/* Quick-reply pills */}
                {!typing && pills.length > 0 && (
                  <Pills options={pills} onSelect={handlePill} />
                )}

                {/* Home menu grid */}
                {!typing && menuItems.length > 0 && (
                  <HomeMenu items={menuItems} onSelect={handleMenu} />
                )}

                {/* Inline ticket form */}
                {inlineEl === "ticket" && (
                  <div className="pl-9">
                    <TicketForm
                      loading={mutating}
                      onSubmit={doTicketSubmit}
                      onCancel={() => {
                        setInlineEl(null);
                        botSay("No problem! What else can I help you with?", [], mainMenu);
                      }}
                    />
                  </div>
                )}

                {/* Inline track input */}
                {inlineEl === "track" && (
                  <div className="pl-9">
                    <TrackInput
                      loading={trackLoading}
                      onSubmit={doTrackSubmit}
                      onCancel={() => {
                        setInlineEl(null);
                        botSay("Sure! What else can I help you with?", [], mainMenu);
                      }}
                    />
                  </div>
                )}

                <div ref={bottomRef} />
              </div>
            </div>

            {/* ── INPUT BAR ───────────────────────────────────────────── */}
            <div className="relative bg-white/90 backdrop-blur border-t border-gray-100/80 px-3 py-2.5 flex-shrink-0">
              <div className="flex items-end gap-2">
                <div className={`flex-1 rounded-2xl px-3.5 py-2 transition-all ${T.input}`}>
                  <textarea
                    ref={inputRef}
                    rows={1}
                    value={input}
                    onChange={e => {
                      setInput(e.target.value);
                      e.target.style.height = "auto";
                      e.target.style.height = Math.min(e.target.scrollHeight, 80) + "px";
                    }}
                    onKeyDown={handleKey}
                    placeholder="Ask me anything…"
                    className="w-full text-sm text-gray-800 bg-transparent outline-none resize-none leading-relaxed placeholder:text-gray-400"
                    style={{ maxHeight: "80px" }}
                  />
                </div>
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  aria-label="Send message"
                  className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200 active:scale-90 shadow-md
                    ${input.trim()
                      ? `bg-gradient-to-br ${T.fab} text-white shadow-indigo-300/50 hover:shadow-indigo-400/60`
                      : "bg-gray-100 text-gray-300 shadow-none"
                    }`}>
                  <I.Send />
                </button>
              </div>

              {/* Footer branding */}
              <div className="flex items-center justify-center gap-1.5 mt-1.5">
                <I.Star />
                <p className="text-[10px] text-gray-400 font-medium">
                  Tanne by ShopEase · Available 24 × 7
                </p>
              </div>
            </div>
          </>
        )}

        {/* Minimized preview bar */}
        {isMinimized && (
          <div className="relative bg-white/90 backdrop-blur px-4 py-3 flex items-center justify-between cursor-pointer" onClick={handleMinimize}>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full overflow-hidden ring-1 ring-indigo-100 flex-shrink-0">
                <I.Bot cls="w-7 h-7" />
              </div>
              <span className="text-xs font-semibold text-gray-700">Tanne — ShopEase Assistant</span>
            </div>
            <span className="text-xs text-indigo-500 font-semibold">Expand ↑</span>
          </div>
        )}
      </div>
    </>
  );
};

export default ChatBotWidget;