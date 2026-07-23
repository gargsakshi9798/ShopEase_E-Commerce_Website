/**
 * Aria — ShopEase AI Assistant
 * Advanced · Professional · 3D Girl Avatar
 */
import { useState, useEffect, useRef, useCallback, memo } from "react";
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
const BOT_NAME   = "Aria";
const TYPING_MS  = 750;
const STORAGE_KEY = "aria_chat_history";
const MAX_HISTORY = 50; // Store last 50 messages

// Sentiment keywords for escalation detection
const FRUSTRATED_WORDS = ["angry", "frustrated", "upset", "disappointed", "terrible", "worst", "useless", "pathetic", "waste", "scam", "fraud", "never", "refund now", "escalate"];
const URGENT_WORDS = ["urgent", "emergency", "immediately", "asap", "critical", "serious"];

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
  X       : ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="w-5 h-5"><path d="M18 6 6 18M6 6l12 12"/></svg>,
  Send    : ()=><svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>,
  Refresh : ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>,
  Check   : ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-2.5 h-2.5"><path d="M20 6 9 17l-5-5"/></svg>,
  Arrow   : ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3"><path d="m9 18 6-6-6-6"/></svg>,
  Minimize: ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="w-4 h-4"><path d="M5 12h14"/></svg>,
  Star    : ()=><svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>,
};

/* ─────────────────────────── 3D GIRL AVATAR ────────────────────────────────── */
/* ── Modern Professional AI Girl — fully SVG, zero dependencies ── */
const GirlAvatar = ({ size = 40, speaking = false, className = "" }) => {
  const p = "av"; // gradient id prefix
  return (
  <div className={`relative flex-shrink-0 ${className}`} style={{ width: size, height: size }}>
    {speaking && (
      <>
        <span className="absolute inset-0 rounded-full animate-ping opacity-25"
          style={{ background:"radial-gradient(circle,#818cf8,transparent 70%)" }} />
        <span className="absolute inset-[-3px] rounded-full animate-ping opacity-15"
          style={{ background:"radial-gradient(circle,#c084fc,transparent 70%)", animationDelay:"0.4s" }} />
      </>
    )}
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full"
      style={{ filter: speaking ? "drop-shadow(0 0 8px #818cf8bb) drop-shadow(0 2px 8px #0003)" : "drop-shadow(0 3px 10px #0003)" }}>
      <defs>
        <radialGradient id={`${p}bg`} cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#2d2460"/><stop offset="100%" stopColor="#0f0a2a"/>
        </radialGradient>
        <radialGradient id={`${p}sk`} cx="45%" cy="25%" r="75%">
          <stop offset="0%" stopColor="#fde8d0"/><stop offset="70%" stopColor="#f5c9a0"/><stop offset="100%" stopColor="#e8aa7a"/>
        </radialGradient>
        <linearGradient id={`${p}hr`} x1="30%" y1="0%" x2="70%" y2="100%">
          <stop offset="0%" stopColor="#2c1a0e"/><stop offset="100%" stopColor="#0d0604"/>
        </linearGradient>
        <linearGradient id={`${p}hs`} x1="20%" y1="0%" x2="80%" y2="80%">
          <stop offset="0%" stopColor="#7a4520" stopOpacity="0.6"/><stop offset="100%" stopColor="#2c1a0e" stopOpacity="0"/>
        </linearGradient>
        <linearGradient id={`${p}bz`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1e1b4b"/><stop offset="100%" stopColor="#1a1740"/>
        </linearGradient>
        <radialGradient id={`${p}ir`} cx="38%" cy="32%" r="62%">
          <stop offset="0%" stopColor="#a5b4fc"/><stop offset="50%" stopColor="#4f46e5"/><stop offset="100%" stopColor="#1e1b4b"/>
        </radialGradient>
        <linearGradient id={`${p}lp`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#e87070"/><stop offset="100%" stopColor="#c0392b"/>
        </linearGradient>
        <linearGradient id={`${p}nc`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#e8aa7a"/><stop offset="50%" stopColor="#f5c9a0"/><stop offset="100%" stopColor="#e0a070"/>
        </linearGradient>
        <linearGradient id={`${p}sh`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#f8fafc"/><stop offset="100%" stopColor="#e2e8f0"/>
        </linearGradient>
        <linearGradient id={`${p}cg`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#818cf8" stopOpacity="0.9"/><stop offset="100%" stopColor="#c084fc" stopOpacity="0.5"/>
        </linearGradient>
        <clipPath id={`${p}cl`}><circle cx="50" cy="50" r="49"/></clipPath>
      </defs>

      {/* BG */}
      <circle cx="50" cy="50" r="50" fill={`url(#${p}bg)`}/>

      {/* AI decorative rings */}
      <circle cx="50" cy="50" r="48" stroke={`url(#${p}cg)`} strokeWidth={speaking?"1.4":"0.6"} fill="none"
        opacity={speaking?"0.6":"0.2"} strokeDasharray={speaking?"3 2":"5 5"}/>
      <g opacity="0.1" stroke="#818cf8" strokeWidth="0.4" fill="none">
        <path d="M2 50 H16 L20 42 H30"/><path d="M98 50 H84 L80 42 H70"/>
        <circle cx="16" cy="50" r="1.5" fill="#818cf8" opacity="0.5"/>
        <circle cx="84" cy="50" r="1.5" fill="#818cf8" opacity="0.5"/>
      </g>

      <g clipPath={`url(#${p}cl)`}>
        {/* Shirt */}
        <path d="M30 100 L32 72 Q41 67 50 69 Q59 67 68 72 L70 100Z" fill={`url(#${p}sh)`}/>
        {/* Blazer */}
        <path d="M0 100 L0 80 Q10 65 24 62 L32 72 Q41 66 50 68 Q59 66 68 72 L76 62 Q90 65 100 80 L100 100Z" fill={`url(#${p}bz)`}/>
        <path d="M32 72 Q37 75 41 81 Q41 73 44 69 Q47 67 50 68" fill="#252266"/>
        <path d="M68 72 Q63 75 59 81 Q59 73 56 69 Q53 67 50 68" fill="#252266"/>
        <path d="M32 72 Q37 75 41 81" stroke="#4f46e5" strokeWidth="0.5" fill="none" opacity="0.5"/>
        <path d="M68 72 Q63 75 59 81" stroke="#4f46e5" strokeWidth="0.5" fill="none" opacity="0.5"/>
        {/* Neck */}
        <rect x="38" y="57" width="4" height="7" rx="2" fill={`url(#${p}nc)`}/>
        {/* Ears */}
        <ellipse cx="25" cy="49" rx="3" ry="4.5" fill="#f0bc90"/>
        <ellipse cx="75" cy="49" rx="3" ry="4.5" fill="#f0bc90"/>
        <ellipse cx="25" cy="49" rx="1.5" ry="2.5" fill="#d4885a" opacity="0.35"/>
        <ellipse cx="75" cy="49" rx="1.5" ry="2.5" fill="#d4885a" opacity="0.35"/>
        {/* Earrings */}
        <circle cx="25" cy="46" r="1.8" fill="#e0e7ff" opacity="0.9"/>
        <circle cx="25" cy="46" r="0.8" fill="white"/>
        <circle cx="75" cy="46" r="1.8" fill="#e0e7ff" opacity="0.9"/>
        <circle cx="75" cy="46" r="0.8" fill="white"/>

        {/* Hair back */}
        <path d="M27 22 Q20 35 18 56 Q17 70 21 80 Q23 70 24 52 Q25 36 29 26Z" fill={`url(#${p}hr)`}/>
        <path d="M73 22 Q80 35 82 56 Q83 70 79 80 Q77 70 76 52 Q75 36 71 26Z" fill={`url(#${p}hr)`}/>
        <path d="M28 20 Q31 12 40 8 Q50 5 60 8 Q69 12 72 20 Q64 14 50 13 Q36 14 28 20Z" fill={`url(#${p}hr)`}/>

        {/* Face */}
        <ellipse cx="50" cy="44" rx="22" ry="25" fill={`url(#${p}sk)`}/>
        <path d="M28 46 Q27 56 33 64 Q39 70 44 71 Q50 72 56 71 Q61 70 67 64 Q73 56 72 46" fill={`url(#${p}sk)`}/>

        {/* Blush */}
        <ellipse cx="34" cy="53" rx="6" ry="3.5" fill="#f87171" opacity="0.1"/>
        <ellipse cx="66" cy="53" rx="6" ry="3.5" fill="#f87171" opacity="0.1"/>

        {/* Eyebrows */}
        <path d="M31 33 Q37 29 43 31" stroke="#1a0a06" strokeWidth="2" strokeLinecap="round" fill="none"/>
        <path d="M57 31 Q63 29 69 33" stroke="#1a0a06" strokeWidth="2" strokeLinecap="round" fill="none"/>

        {/* Eyes */}
        <path d="M30 41 Q35 36 40 37.5 Q43.5 38.5 43.5 41.5 Q39 45.5 34 44.5 Q30 43 30 41Z" fill="white"/>
        <circle cx="36.5" cy="41" r="4" fill={`url(#${p}ir)`}/>
        <circle cx="36.5" cy="41" r="2.4" fill="#0a0820"/>
        <circle cx="38" cy="39.2" r="1.3" fill="white" opacity="0.95"/>
        <circle cx="35" cy="42.2" r="0.5" fill="white" opacity="0.35"/>

        <path d="M57 41 Q62 36 67 37.5 Q70.5 38.5 70.5 41.5 Q66 45.5 61 44.5 Q57 43 57 41Z" fill="white"/>
        <circle cx="63.5" cy="41" r="4" fill={`url(#${p}ir)`}/>
        <circle cx="63.5" cy="41" r="2.4" fill="#0a0820"/>
        <circle cx="65" cy="39.2" r="1.3" fill="white" opacity="0.95"/>
        <circle cx="62" cy="42.2" r="0.5" fill="white" opacity="0.35"/>

        {/* Eyeliner */}
        <path d="M30 41 Q35 36 40 37.5" stroke="#0d0604" strokeWidth="1.1" fill="none" strokeLinecap="round"/>
        <path d="M40 37.5 Q43 38 43.5 41" stroke="#0d0604" strokeWidth="0.6" fill="none" strokeLinecap="round"/>
        <path d="M57 41 Q62 36 67 37.5" stroke="#0d0604" strokeWidth="1.1" fill="none" strokeLinecap="round"/>
        <path d="M67 37.5 Q70 38 70.5 41" stroke="#0d0604" strokeWidth="0.6" fill="none" strokeLinecap="round"/>

        {/* Eyelashes */}
        {[[-1,-2],[1,-2.5],[3.5,-2.8],[6,-2.4],[8,-1.6]].map(([dx,dy],i)=>(
          <line key={i} x1={30+dx} y1={41+dy*0} x2={30+dx+dy*0.3} y2={41+dy}
            stroke="#0d0604" strokeWidth="0.85" strokeLinecap="round"/>
        ))}
        {[[0,-2],[2,-2.5],[4.5,-2.8],[7,-2.4],[9,-1.6]].map(([dx,dy],i)=>(
          <line key={i} x1={57+dx} y1={41+dy*0} x2={57+dx+dy*0.3} y2={41+dy}
            stroke="#0d0604" strokeWidth="0.85" strokeLinecap="round"/>
        ))}

        {/* Nose */}
        <path d="M48 51 Q47 54 45.5 55 Q47.5 56 50 56 Q52.5 56 54.5 55 Q53 54 52 51"
          stroke="#c9906a" strokeWidth="0.9" fill="none" opacity="0.65" strokeLinecap="round"/>

        {/* Lips */}
        <path d="M40 60.5 Q44 58 47 59 Q50 60 53 59 Q56 58 60 60.5 Q56 63 50 63.5 Q44 63 40 60.5Z"
          fill={`url(#${p}lp)`}/>
        <path d="M40 60.5 Q45 64.5 50 65 Q55 64.5 60 60.5 Q55 63.5 50 64 Q45 63.5 40 60.5Z"
          fill="#c0392b" opacity="0.8"/>
        <path d="M45 59.5 Q47.5 58.5 50 59 Q52.5 58.5 55 59.5"
          stroke="#f59090" strokeWidth="0.5" fill="none" opacity="0.5"/>
        <ellipse cx="50" cy="62.5" rx="5" ry="1.2" fill="white" opacity="0.1"/>
        {speaking && (
          <>
            <path d="M42 61 Q50 67.5 58 61 Q54 66 50 66.5 Q46 66 42 61Z" fill="#1a0606" opacity="0.8"/>
            <path d="M43.5 61.5 Q50 65 56.5 61.5 Q52 64 50 64.5 Q48 64 43.5 61.5Z" fill="white" opacity="0.9"/>
          </>
        )}

        {/* Hair front — sleek side part */}
        <path d="M28 22 Q26 14 33 9 Q41 5 50 6 Q59 5 67 9 Q74 14 72 22 Q67 14 54 12 Q50 11 46 12 Q34 14 28 22Z"
          fill={`url(#${p}hr)`}/>
        <path d="M28 22 Q25 30 24.5 40 Q26 22 33 17 Q39 13 45 13 Q34 14 28 22Z" fill={`url(#${p}hr)`}/>
        <path d="M68 18 Q72 24 73 34 Q70 22 64 16 Q58 12 50 11 Q60 11 68 18Z" fill={`url(#${p}hr)`}/>
        {/* Sheen */}
        <path d="M34 9 Q43 7 55 8 Q61 9 66 12 Q56 9 50 9 Q42 9 34 13Z" fill={`url(#${p}hs)`} opacity="0.65"/>
      </g>

      {/* AI badge */}
      <g transform="translate(67,73)">
        <rect x="0" y="0" width="22" height="12" rx="6" fill="#0f0a2a" stroke="#818cf8" strokeWidth="0.8" opacity="0.95"/>
        <text x="11" y="8.5" textAnchor="middle" fill="#a5b4fc"
          fontSize="5" fontFamily="Inter,sans-serif" fontWeight="700" letterSpacing="0.8">AI</text>
      </g>

    </svg>
  </div>
  );
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
const Bubble = memo(({ msg, isSpeaking = false }) => {
  const isBot = msg.role === "bot";
  return (
    <div className={`flex gap-2 mb-3 animate-fade-in ${isBot ? "items-end" : "items-end flex-row-reverse"}`}>
      {isBot && (
        <GirlAvatar
          size={32}
          speaking={isSpeaking}
          className="flex-shrink-0 mb-0.5"
        />
      )}
      <div className="max-w-[80%]">
        <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${isBot ? `${T.msgBot} rounded-bl-sm` : `${T.msgUser} rounded-br-sm`}`}>
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

/* Typing dots — girl avatar with bouncing dots */
const Dots = () => (
  <div className="flex gap-2 items-end mb-3 animate-fade-in">
    <GirlAvatar size={32} speaking={true} className="flex-shrink-0 mb-0.5" />
    <div className={`${T.msgBot} rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm`}>
      <div className="flex gap-1 items-center">
        {[0,160,320].map(d => (
          <span key={d} className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay:`${d}ms` }} />
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
    const subj = form.subject.trim();
    const desc = form.description.trim();
    
    // Subject validation
    if (!subj) {
      e.subject = "Subject is required";
    } else if (subj.length < 10) {
      e.subject = "Subject must be at least 10 characters (provide meaningful details)";
    } else if (subj.length > 100) {
      e.subject = "Subject too long (max 100 characters)";
    } else if (/^(.)\1{4,}$/.test(subj)) {
      e.subject = "Please write a proper subject (avoid spam patterns)";
    }
    
    // Description validation
    if (!desc) {
      e.description = "Please describe the issue in detail";
    } else if (desc.length < 20) {
      e.description = "Description too short (minimum 20 characters). Please provide more context.";
    } else if (desc.length > 1000) {
      e.description = "Description too long (max 1000 characters)";
    } else if (/^(.)\1{9,}$/.test(desc)) {
      e.description = "Invalid description (avoid repetitive spam patterns)";
    } else if (desc.split(/\s+/).length < 5) {
      e.description = "Please write at least 5 words to properly describe your issue";
    }
    
    // Category validation
    if (!form.category || form.category === "other") {
      e.category = "Please select a specific category (not 'Other')";
    }
    
    setErrs(e); 
    return !Object.keys(e).length;
  };
  
  return (
    <div className={`mx-1 my-2 rounded-2xl p-4 space-y-3 animate-fade-in ${T.form}`}>
      <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
        <div className="w-7 h-7 rounded-xl bg-indigo-100 flex items-center justify-center">
          <span className="text-sm">🎫</span>
        </div>
        <div>
          <p className="text-xs font-bold text-gray-800">Raise a Support Ticket</p>
          <p className="text-[10px] text-gray-400">We respond within 24 hours · Please provide detailed info</p>
        </div>
      </div>

      <div>
        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1 block">Category *</label>
        <select value={form.category} onChange={e => setForm({...form, category:e.target.value})}
          className={`w-full text-xs border rounded-xl px-3 py-2 outline-none focus:border-indigo-400 bg-gray-50/80 font-medium ${errs.category?"border-red-300":"border-gray-200"}`}>
          <option value="other" disabled>— Select a category —</option>
          {TICKET_CATS.filter(c => c.value !== "other").map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
        {errs.category && <p className="text-red-500 text-[10px] mt-0.5">{errs.category}</p>}
      </div>

      <div>
        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1 flex items-center justify-between">
          <span>Subject * <span className="text-gray-400 font-normal">(min 10 chars)</span></span>
          <span className={`text-[9px] ${form.subject.length >= 10 ? "text-green-600" : "text-gray-400"}`}>
            {form.subject.length}/100
          </span>
        </label>
        <input type="text" placeholder="e.g. Payment deducted but order not placed" value={form.subject}
          onChange={e => setForm({...form, subject:e.target.value})} maxLength={100}
          className={`w-full text-xs border rounded-xl px-3 py-2 outline-none focus:border-indigo-400 bg-gray-50/80 ${errs.subject?"border-red-300":"border-gray-200"}`}/>
        {errs.subject && <p className="text-red-500 text-[10px] mt-0.5">{errs.subject}</p>}
      </div>

      <div>
        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1 flex items-center justify-between">
          <span>Description * <span className="text-gray-400 font-normal">(min 20 chars)</span></span>
          <span className={`text-[9px] ${form.description.length >= 20 ? "text-green-600" : "text-gray-400"}`}>
            {form.description.length}/1000
          </span>
        </label>
        <textarea rows={4} 
          placeholder="Describe your issue in detail: What happened? When? What did you expect? Any order/product numbers?"
          value={form.description} maxLength={1000}
          onChange={e => setForm({...form, description:e.target.value})}
          className={`w-full text-xs border rounded-xl px-3 py-2 outline-none focus:border-indigo-400 bg-gray-50/80 resize-none ${errs.description?"border-red-300":"border-gray-200"}`}/>
        {errs.description && <p className="text-red-500 text-[10px] mt-0.5">{errs.description}</p>}
        <p className="text-[10px] text-gray-400 mt-1 leading-relaxed">
          💡 <strong>Tip:</strong> Provide order number, date, product name, and what went wrong for faster resolution.
        </p>
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
  const [sentiment,    setSentiment]    = useState("neutral"); // neutral|frustrated|urgent

  /* ── chat state ── */
  const [msgs,         setMsgs]         = useState([]);
  const [input,        setInput]        = useState("");
  const [typing,       setTyping]       = useState(false);
  const [pills,        setPills]        = useState([]);
  const [menuItems,    setMenuItems]    = useState([]);   // home grid
  const [inlineEl,     setInlineEl]     = useState(null); // "ticket"|"track"
  const [trackLoading, setTrackLoading] = useState(false);
  const [feedbackMsg,  setFeedbackMsg]  = useState(null); // message awaiting feedback
  const [sessionContext, setSessionContext] = useState({ viewedProducts: [], lastPage: "" });

  const bottomRef = useRef(null);
  const inputRef  = useRef(null);
  const peekRef   = useRef(null);

  /* ── Load chat history from localStorage ── */
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.msgs?.length) {
          setMsgs(parsed.msgs.slice(-MAX_HISTORY));
        }
      }
    } catch (e) { console.warn("Failed to load chat history", e); }
  }, []);

  /* ── Save chat history to localStorage ── */
  useEffect(() => {
    if (msgs.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ msgs: msgs.slice(-MAX_HISTORY), timestamp: Date.now() }));
      } catch (e) { console.warn("Failed to save chat history", e); }
    }
  }, [msgs]);

  /* ── Detect sentiment from user input ── */
  const detectSentiment = useCallback((text) => {
    const lower = text.toLowerCase();
    if (FRUSTRATED_WORDS.some(w => lower.includes(w))) return "frustrated";
    if (URGENT_WORDS.some(w => lower.includes(w))) return "urgent";
    return "neutral";
  }, []);

  /* ── Track page context (called from parent layout if available) ── */
  useEffect(() => {
    const page = window.location.pathname;
    setSessionContext(prev => ({ ...prev, lastPage: page }));
  }, [window.location.pathname]);

  /* ── scroll to bottom ── */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, typing, inlineEl, menuItems]);

  /* ── auto-peek 8 s ── */
  useEffect(() => {
    if (!sessionStorage.getItem("aria_seen")) {
      peekRef.current = setTimeout(() => {
        if (!peeked) { setPeeked(true); setUnread(1); sessionStorage.setItem("aria_seen","1"); }
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
    setMsgs(p => [...p, { id:uid(), role:"bot", text:"__CARDS__", time:clock(), cardType, cards }]);
  }, []);

  const backPill  = { id:"back_menu", label:"↩ Main Menu" };
  const retryPill = (id) => ({ id, label:"🔄 Retry" });

  /* ── main menu ── */
  const mainMenu  = isLogin ? MENU_ITEMS_AUTH : MENU_ITEMS_GUEST;
  const mainPills = [backPill];

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
      ? `Hey **${name}**! 👋 I'm **Aria**, your ShopEase AI assistant.\n\nI can help with orders, tracking, returns, payments, your profile and much more. What do you need?`
      : "Hey there! 👋 I'm **Aria**, your ShopEase AI assistant.\n\nI can help with orders, tracking, returns, payments and more. What can I do for you?";
    setMsgs([{ id:uid(), role:"bot", text:greet, time:clock() }]);
    setMenuItems(isLogin ? MENU_ITEMS_AUTH : MENU_ITEMS_GUEST);
    setPills([]); setInlineEl(null);
  }, [isLogin, user]);

  const handleOpen = useCallback(() => {
    setIsOpen(true); setUnread(0); setIsMinimized(false);
    if (msgs.length === 0) initChat();
    setTimeout(() => inputRef.current?.focus(), 200);
  }, [msgs.length, initChat]);

  const handleClose    = ()  => setIsOpen(false);
  const handleMinimize = ()  => setIsMinimized(v => !v);

  /* ════════════════════ FLOW HANDLERS ════════════════════ */

  /* ── My Orders ── */
  const doMyOrders = useCallback(async () => {
    botSay("Fetching your recent orders…", [], [], 300);
    try {
      const res    = await dispatch(fetchMyOrders({ page:1, per_page:5 })).unwrap();
      const orders = res?.data?.data ?? res?.data ?? [];
      setTimeout(() => {
        setTyping(false);
        if (!orders.length) {
          setMsgs(p => [...p, { id:uid(), role:"bot", text:"You haven't placed any orders yet. Start shopping! 🛍️", time:clock() }]);
          setPills([{ id:"go_home", label:"🏠 Shop Now" }, backPill]);
          return;
        }
        setMsgs(p => [...p, { id:uid(), role:"bot", text:`Here are your **${orders.length}** most recent orders:`, time:clock() }]);
        inlineCards("orders", orders);
        setPills([
          { id:"track_order",  label:"🚚 Track an Order"  },
          { id:"return_help",  label:"↩️ Return / Refund" },
          { id:"go_my_orders", label:"📋 View All Orders" },
          backPill,
        ]);
      }, TYPING_MS);
    } catch {
      botSay("Couldn't load your orders right now. Please try again.", [retryPill("my_orders"), backPill]);
    }
  }, [dispatch, botSay, inlineCards]);

  /* ── Track Order ── */
  const doTrackPrompt = useCallback(() => {
    botSay("Please enter your **order number** below 👇", [], [], 350);
    setTimeout(() => setInlineEl("track"), TYPING_MS + 120);
  }, [botSay]);

  const doTrackSubmit = useCallback(async (orderNum) => {
    setInlineEl(null);
    userSay(`🔍 Track: ${orderNum}`);
    setTrackLoading(true);
    botSay("Looking up your order…", [], [], 300);
    try {
      const res = await dispatch(trackOrder(orderNum)).unwrap();
      const o   = res?.data ?? res;
      setTrackLoading(false);
      if (!o) {
        botSay("❌ No order found with that number. Please double-check and try again.", [
          { id:"track_order", label:"🔄 Try Again" }, backPill,
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
      setTimeout(() => {
        setTyping(false);
        setMsgs(p => [...p, { id:uid(), role:"bot", text:lines, time:clock() }]);
        setPills([
          { id:"my_orders",   label:"📦 All My Orders"  },
          { id:"return_help", label:"↩️ Request Return" },
          { id:"new_ticket",  label:"🎫 Raise Ticket"   },
          backPill,
        ]);
      }, TYPING_MS);
    } catch {
      setTrackLoading(false);
      botSay("❌ Order not found. Please check the number and try again.", [
        { id:"track_order", label:"🔄 Try Again" }, backPill,
      ]);
    }
  }, [dispatch, botSay, userSay]);

  /* ── My Profile ── */
  const doMyProfile = useCallback(async () => {
    botSay("Fetching your profile details…", [], [], 300);
    try {
      const res = await dispatch(fetchCustomerProfile()).unwrap();
      const p   = res?.data ?? res;
      setTimeout(() => {
        setTyping(false);
        const lines = [
          "👤 **Your Profile**",
          `**Name:** ${p?.name || "—"}`,
          `**Email:** ${p?.email || "—"}`,
          `**Phone:** ${p?.contact_no || "Not added yet"}`,
          p?.created_at ? `**Member Since:** ${fmtDate(p.created_at)}` : null,
        ].filter(Boolean).join("\n");
        setMsgs(prev => [...prev, { id:uid(), role:"bot", text:lines, time:clock() }]);
        setPills([
          { id:"go_profile",   label:"✏️ Edit Profile"    },
          { id:"my_addresses", label:"📍 My Addresses"    },
          { id:"go_settings",  label:"⚙️ Settings"        },
          backPill,
        ]);
      }, TYPING_MS);
    } catch {
      botSay("Couldn't load your profile. Please try again.", [retryPill("my_profile"), backPill]);
    }
  }, [dispatch, botSay]);

  /* ── My Addresses ── */
  const doMyAddresses = useCallback(async () => {
    botSay("Loading your saved addresses…", [], [], 300);
    try {
      const res  = await dispatch(fetchAddresses()).unwrap();
      const list = res?.data ?? [];
      setTimeout(() => {
        setTyping(false);
        if (!list.length) {
          setMsgs(p => [...p, { id:uid(), role:"bot", text:"You have no saved addresses yet. Add one to speed up checkout!", time:clock() }]);
          setPills([{ id:"go_addresses", label:"➕ Add Address" }, backPill]);
          return;
        }
        setMsgs(p => [...p,
          { id:uid(), role:"bot", text:`📍 Your **${list.length}** saved address${list.length>1?"es":""}:`, time:clock() },
          { id:uid(), role:"bot", text:"__CARDS__", time:clock(), cardType:"addresses", cards:list },
        ]);
        setPills([
          { id:"go_addresses", label:"📍 Manage Addresses" },
          { id:"go_checkout",  label:"🛒 Go to Checkout"   },
          backPill,
        ]);
      }, TYPING_MS);
    } catch {
      botSay("Couldn't fetch addresses right now.", [retryPill("my_addresses"), backPill]);
    }
  }, [dispatch, botSay]);

  /* ── Cart Summary ── */
  const doCartSummary = useCallback(() => {
    const active = cartItems.filter(i => !i.saved_for_later);
    if (!active.length) {
      botSay("Your cart is currently empty. Browse our collection and add items! 🛍️", [
        { id:"go_home",    label:"🏠 Shop Now"    },
        { id:"go_cart",    label:"🛒 View Cart"   },
        backPill,
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
      backPill,
    ]);
  }, [cartItems, cartCount, botSay]);

  /* ── My Tickets ── */
  const doMyTickets = useCallback(async () => {
    botSay("Loading your support tickets…", [], [], 300);
    try {
      const res     = await dispatch(fetchMyTickets({ page:1, per_page:5 })).unwrap();
      const tickets = res?.data?.data ?? [];
      setTimeout(() => {
        setTyping(false);
        if (!tickets.length) {
          setMsgs(p => [...p, { id:uid(), role:"bot", text:"You haven't raised any support tickets yet.", time:clock() }]);
          setPills([{ id:"new_ticket", label:"🆕 Raise a Ticket" }, backPill]);
          return;
        }
        setMsgs(p => [...p,
          { id:uid(), role:"bot", text:`🎫 Your **${tickets.length}** recent ticket${tickets.length>1?"s":""}:`, time:clock() },
          { id:uid(), role:"bot", text:"__CARDS__", time:clock(), cardType:"tickets", cards:tickets },
        ]);
        setPills([
          { id:"new_ticket",    label:"🆕 New Ticket"         },
          { id:"go_my_tickets", label:"📋 All Tickets Page"   },
          backPill,
        ]);
      }, TYPING_MS);
    } catch {
      botSay("Couldn't load your tickets right now.", [retryPill("my_tickets"), backPill]);
    }
  }, [dispatch, botSay]);

  /* ── New Ticket ── */
  const doNewTicket = useCallback(() => {
    botSay("Sure! Fill in the form below and I'll create your ticket instantly. 🎫", [], [], 350);
    setTimeout(() => setInlineEl("ticket"), TYPING_MS + 120);
  }, [botSay]);

  const doTicketSubmit = useCallback(async (form) => {
    setInlineEl(null);
    userSay(`📝 Ticket: ${form.subject}`);
    botSay("Creating your support ticket…", [], [], 300);
    try {
      const res = await dispatch(createTicket({
        subject: form.subject, description: form.description, category: form.category,
      })).unwrap();
      if (res?.success) {
        setTimeout(() => {
          setTyping(false);
          setMsgs(p => [...p, { id:uid(), role:"bot", time:clock(), text:
            `✅ **Ticket Created Successfully!**\n\n🎫 **Ticket #:** ${res.data?.ticket_number||"—"}\n📌 **Subject:** ${form.subject}\n🏷️ **Category:** ${form.category}\n\nOur support team will respond within **24 hours**. You'll get an email notification when we reply.`
          }]);
          setPills([
            { id:"my_tickets",    label:"🎫 View My Tickets"  },
            { id:"go_my_tickets", label:"📋 Tickets Page"     },
            backPill,
          ]);
        }, TYPING_MS);
      } else {
        botSay(res?.message||"Failed to create ticket. Please try again.", [retryPill("new_ticket"), backPill]);
      }
    } catch (err) {
      toast.error(err?.message||"Something went wrong");
      botSay("Something went wrong. Please try again.", [retryPill("new_ticket"), backPill]);
    }
  }, [dispatch, botSay, userSay]);

  /* ── Return Help ── */
  const doReturnHelp = useCallback(() => {
    botSay(FAQ.return_policy.a, [
      { id:"my_orders",  label:"📦 My Orders"    },
      { id:"new_ticket", label:"🎫 Raise Ticket" },
      backPill,
    ]);
  }, [botSay]);

  /* ── Payment Help ── */
  const doPaymentHelp = useCallback(() => {
    botSay(FAQ.payment_methods.a + "\n\n**Payment Issue?**\n• Failed payment → auto-refunded in 5–7 days\n• Charged but no order? → Raise a ticket immediately", [
      { id:"new_ticket", label:"🎫 Raise Ticket"    },
      { id:"go_contact", label:"📬 Contact Support" },
      backPill,
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
      backPill,
    ]);
  }, [botSay]);

  /* ── Coupon Help ── */
  const doCouponHelp = useCallback(() => {
    botSay(FAQ.coupon.a, [
      { id:"go_my_coupons", label:"🏷️ My Coupons Page" },
      { id:"go_cart",       label:"🛒 Go to Cart"       },
      backPill,
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
        backPill,
      ]
    );
  }, [botSay]);

  /* ════════════════════ PILL / MENU DISPATCHER ════════════════════ */
  const requireLogin = useCallback((cb) => {
    if (!isLogin) {
      botSay("Please **login** first to access this feature.", [
        { id:"go_login",    label:"🔑 Login Now"   },
        { id:"go_register", label:"📝 Register"    },
        backPill,
      ]);
    } else cb();
  }, [isLogin, botSay]);

  const dispatch_action = useCallback((id, label) => {
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
      case "faq_shipping" : userSay(label); botSay(FAQ.shipping.a,       [backPill]); break;
      case "faq_cancel"   : userSay(label); botSay(FAQ.cancel_order.a,   [{ id:"my_orders",label:"📦 My Orders" }, backPill]); break;
      case "faq_account"  : userSay(label); botSay(FAQ.account_help.a,   [{ id:"go_settings",label:"⚙️ Settings" }, backPill]); break;
      case "faq_warranty" : userSay(label); botSay(FAQ.warranty.a,       [{ id:"new_ticket",label:"🎫 Raise Ticket" }, backPill]); break;
      case "faq_giftcard" : userSay(label); botSay(FAQ.gift_card.a,      [{ id:"go_home",label:"🎁 Buy Gift Card" }, backPill]); break;
      case "back_menu"    :
        userSay("↩ Main Menu");
        setTimeout(() => openMenu(), 150);
        break;
      default:
        userSay(label);
        botSay("I didn't catch that. Here's what I can help you with:", [], mainMenu);
    }
  }, [
    isLogin, userSay, botSay, navigate, mainMenu,
    requireLogin, doMyOrders, doTrackPrompt, doMyProfile,
    doMyAddresses, doCartSummary, doMyTickets, doNewTicket,
    doReturnHelp, doPaymentHelp, doFAQ, doCouponHelp, doHuman,
    openMenu,
  ]);

  const handlePill = useCallback((pill) => {
    // Handle feedback
    if (pill.id.startsWith("feedback_")) {
      const rating = pill.id.replace("feedback_", "");
      userSay(pill.label);
      if (rating === "good") {
        botSay("Thank you for the feedback! 🙏 We're glad we could help. Have a great day!");
      } else if (rating === "okay") {
        botSay("Thanks for letting us know. We'll keep improving! If you need anything else, I'm here.");
      } else {
        botSay("Sorry we couldn't meet your expectations. 😔 Would you like to speak with a human agent for better assistance?", [
          { id:"human", label:"🧑‍💼 Talk to Agent" },
          { id:"new_ticket", label:"🎫 Raise Ticket" },
        ]);
      }
      return;
    }
    dispatch_action(pill.id, pill.label);
  }, [dispatch_action, userSay, botSay]);
  const handleMenu = useCallback((item) => dispatch_action(item.id, `${item.emoji} ${item.label}`), [dispatch_action]);

  /* ════════════════════ FREE-TEXT NLP ════════════════════ */
  const handleSend = useCallback(() => {
    const text = input.trim();
    if (!text) return;
    setInput("");

    const t = text.toLowerCase();
    
    // Detect sentiment
    const detectedSentiment = detectSentiment(text);
    setSentiment(detectedSentiment);

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
      botSay("You're welcome! 😊 Happy shopping at ShopEase. See you next time! 🛍️\n\n*Rate this conversation:*", [
        { id:"feedback_good", label:"👍 Helpful" },
        { id:"feedback_okay", label:"😐 Okay" },
        { id:"feedback_bad",  label:"👎 Not Helpful" },
      ]);
      return;
    }

    // Handle frustrated sentiment - escalate immediately
    if (detectedSentiment === "frustrated") {
      userSay(text);
      botSay(
        "I'm really sorry to hear you're having a frustrating experience. 😔\n\nLet me connect you with our **senior support team** right away — they'll personally handle your issue with priority.\n\n**Your concern matters to us.**",
        [
          { id:"new_ticket",  label:"🎫 Raise Priority Ticket" },
          { id:"human",       label:"🧑‍💼 Talk to Manager" },
          { id:"go_contact",  label:"📞 Call Support Now" },
          backPill,
        ]
      );
      return;
    }

    // Handle urgent requests
    if (detectedSentiment === "urgent") {
      userSay(text);
      botSay(
        "Got it — this sounds **urgent**. Let me help you immediately. ⚡\n\nWhat specifically do you need urgent help with?",
        [
          { id:"track_order",  label:"🚚 Track Order"   },
          { id:"new_ticket",   label:"🎫 Priority Ticket" },
          { id:"return_help",  label:"↩️ Return/Refund" },
          { id:"payment_help", label:"💳 Payment Issue" },
          { id:"human",        label:"🧑‍💼 Human Agent" },
        ]
      );
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
      botSay(FAQ.cancel_order.a, [{ id:"my_orders",label:"📦 My Orders" }, backPill]); return;
    }
    /* payment */
    if (/pay(ment|ing|ed)?|bill|invoice|charge|debit|credit|upi|emi|failed.*pay|pay.*fail/.test(t)) {
      doPaymentHelp(); return;
    }
    /* shipping */
    if (/ship(ping)?|delivery time|how long|when.*deliver|dispatch time/.test(t)) {
      botSay(FAQ.shipping.a, [backPill]); return;
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
      botSay(FAQ.warranty.a, [{ id:"new_ticket",label:"🎫 Raise Ticket" }, backPill]); return;
    }
    /* gift card */
    if (/gift.*card|giftcard|gift voucher/.test(t)) {
      botSay(FAQ.gift_card.a, [{ id:"go_home",label:"🎁 Buy Gift Card" }, backPill]); return;
    }
    /* account / password */
    if (/password|forgot.*pass|reset.*pass|change.*pass|login.*issue|can'?t.*log/.test(t)) {
      botSay(FAQ.account_help.a, [{ id:"go_settings",label:"⚙️ Settings" }, backPill]); return;
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
    
    /* ── Smart contextual fallback with proactive suggestions ── */
    const suggestions = [];
    
    // Cart has items? Suggest checkout
    if (cartCount > 0) {
      suggestions.push({ id:"go_checkout", label:`🛒 Checkout (${cartCount} items)` });
    }
    
    // Has pending orders? Suggest tracking
    if (isLogin) {
      suggestions.push({ id:"my_orders", label:"📦 Check My Orders" });
    }
    
    // Always offer help
    suggestions.push({ id:"faq", label:"❓ Browse FAQs" });
    suggestions.push(backPill);
    
    botSay(
      "I'm not entirely sure about that, but here's what I can help you with:",
      suggestions.length > 0 ? suggestions : [],
      mainMenu
    );
  }, [
    input, user, isLogin, mainMenu, botSay, userSay, navigate,
    requireLogin, doMyOrders, doTrackPrompt, doReturnHelp, doPaymentHelp,
    doMyProfile, doMyAddresses, doCartSummary, doCouponHelp,
    doMyTickets, doNewTicket, doHuman, doFAQ, openMenu,
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
            className="flex items-center gap-2.5 bg-white/95 backdrop-blur-md border border-white/60 shadow-2xl shadow-indigo-200/60 rounded-2xl px-3 py-2 hover:shadow-indigo-300/60 transition-all max-w-[240px]"
            style={{ animation: "slideUpFade 0.5s ease-out" }}>
            <GirlAvatar size={44} speaking={true} className="flex-shrink-0" />
            <div className="text-left">
              <p className="text-xs font-bold text-gray-800">Hi! I'm {BOT_NAME} 👋</p>
              <p className="text-[10px] text-gray-500">How can I help you today?</p>
              <div className="flex gap-0.5 mt-1">
                {[0,120,240].map(d=>(
                  <span key={d} className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay:`${d}ms`}} />
                ))}
              </div>
            </div>
          </button>
        )}

        {/* Main FAB — girl avatar */}
        <button
          onClick={isOpen ? handleClose : handleOpen}
          aria-label={isOpen ? `Close ${BOT_NAME}` : `Chat with ${BOT_NAME}`}
          className={`relative w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 active:scale-90 overflow-visible
            ${isOpen ? "bg-gray-800 hover:bg-gray-700 shadow-gray-400/40" : "shadow-indigo-400/50 hover:shadow-indigo-500/60"}`}
          style={!isOpen ? { background:"linear-gradient(135deg,#6366f1 0%,#7c3aed 50%,#9333ea 100%)" } : {}}>
          {isOpen ? (
            <span className="text-white"><I.X /></span>
          ) : (
            <div className="relative w-full h-full flex items-center justify-center"
              style={{ animation:"float 3s ease-in-out infinite" }}>
              <GirlAvatar size={56} speaking={false} />
            </div>
          )}
          {/* Unread badge */}
          {!isOpen && unread > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 shadow-lg animate-pulse">
              {unread}
            </span>
          )}
          {/* Online dot */}
          {!isOpen && <span className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-emerald-400 border-2 border-white rounded-full shadow" />}
          {/* Ripple rings */}
          {!isOpen && (
            <>
              <span className="absolute inset-0 rounded-full border-2 border-indigo-400/40 animate-ping" style={{animationDuration:"2s"}} />
              <span className="absolute inset-[-6px] rounded-full border border-indigo-300/20 animate-ping" style={{animationDuration:"2.5s",animationDelay:"0.5s"}} />
            </>
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

          {/* Girl Avatar in header — larger, animated */}
          <div className="relative z-10 flex-shrink-0" style={{ animation:"float 4s ease-in-out infinite" }}>
            <GirlAvatar size={44} speaking={typing} />
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
                  if (msg.text === "__CARDS__" && msg.cards) {
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
                            <AddressCard key={a._id || i} addr={a} index={i} />
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
                  Aria by ShopEase · Available 24 × 7
                </p>
              </div>
            </div>
          </>
        )}

        {/* Minimized preview bar */}
        {isMinimized && (
          <div className="relative bg-white/90 backdrop-blur px-4 py-3 flex items-center justify-between cursor-pointer" onClick={handleMinimize}>
            <div className="flex items-center gap-2">
              <GirlAvatar size={28} speaking={false} />
              <span className="text-xs font-semibold text-gray-700">{BOT_NAME} — ShopEase Assistant</span>
            </div>
            <span className="text-xs text-indigo-500 font-semibold">Expand ↑</span>
          </div>
        )}
      </div>
    </>
  );
};

export default ChatBotWidget;