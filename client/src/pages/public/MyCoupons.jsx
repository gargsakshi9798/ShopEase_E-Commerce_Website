import { useState } from "react";
import { MdContentCopy, MdCheck, MdLocalOffer, MdSearch } from "react-icons/md";
import toast from "react-hot-toast";

const coupons = [
  { code:"WELCOME20",  desc:"20% off on your first order",         min:"No minimum",    disc:"20% off",    validTill:"Dec 31, 2026", type:"percent", color:"from-violet-500 to-purple-700", used:false, cat:"All Categories"  },
  { code:"MOBILE10",   desc:"10% off on Mobiles",                  min:"Min ₹5,000",    disc:"10% off",    validTill:"Aug 31, 2026", type:"percent", color:"from-blue-500 to-indigo-600",   used:false, cat:"Mobiles"          },
  { code:"FASHION30",  desc:"30% off on Fashion",                   min:"Min ₹999",      disc:"30% off",    validTill:"Jul 31, 2026", type:"percent", color:"from-pink-500 to-rose-600",     used:false, cat:"Fashion"          },
  { code:"SAVE500",    desc:"Flat ₹500 off on Electronics",         min:"Min ₹3,000",    disc:"₹500 off",   validTill:"Sep 15, 2026", type:"flat",    color:"from-cyan-500 to-blue-600",     used:false, cat:"Electronics"      },
  { code:"GROCERY10",  desc:"10% off on Grocery & Daily Essentials",min:"Min ₹300",      disc:"10% off",    validTill:"Jul 20, 2026", type:"percent", color:"from-green-500 to-emerald-700", used:false, cat:"Grocery"          },
  { code:"HDFC10",     desc:"10% off with HDFC Bank Cards",         min:"No minimum",    disc:"10% off",    validTill:"Dec 31, 2026", type:"bank",    color:"from-slate-600 to-gray-700",    used:false, cat:"All — Bank Offer" },
  { code:"BOOK15",     desc:"15% off on Books",                     min:"Min ₹299",      disc:"15% off",    validTill:"Aug 31, 2026", type:"percent", color:"from-orange-500 to-red-600",    used:false, cat:"Books"            },
  { code:"SPORT20",    desc:"20% off on Sports & Fitness",          min:"Min ₹799",      disc:"20% off",    validTill:"Jul 25, 2026", type:"percent", color:"from-lime-500 to-green-600",    used:true,  cat:"Sports"           },
];

const filters = ["All","Available","Used","Expiring Soon"];

const MyCoupons = () => {
  const [search, setSearch]   = useState("");
  const [filter, setFilter]   = useState("All");
  const [copied, setCopied]   = useState(null);

  const copy = (code) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(code); toast.success(`Coupon "${code}" copied!`);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  const filtered = coupons.filter((c) => {
    const matchSearch = !search || c.code.toLowerCase().includes(search.toLowerCase()) || c.cat.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "All" || (filter === "Available" && !c.used) || (filter === "Used" && c.used);
    return matchSearch && matchFilter;
  });

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-[900px] mx-auto px-4 py-8 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-extrabold text-gray-900">My Coupons</h1>
            <p className="text-xs text-gray-400 mt-0.5">{coupons.filter(c=>!c.used).length} coupons available</p>
          </div>
          <div className="relative w-full sm:w-64">
            <MdSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search coupons…"
              className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary-500"/>
          </div>
        </div>
        <div className="flex gap-2">
          {filters.map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${filter === f ? "bg-primary-600 text-white shadow" : "bg-white border border-gray-200 text-gray-600 hover:border-primary-400"}`}>
              {f}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center shadow-sm">
            <span className="text-5xl">🎟️</span>
            <p className="text-gray-500 mt-4 font-bold">No coupons found</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {filtered.map((c) => (
              <div key={c.code} className={`relative rounded-2xl overflow-hidden shadow-sm ${c.used ? "opacity-60" : ""}`}>
                {/* Colored top band */}
                <div className={`bg-gradient-to-r ${c.color} p-5 text-white`}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <MdLocalOffer size={14} className="text-white/80"/>
                        <span className="text-xs font-semibold text-white/80">{c.cat}</span>
                      </div>
                      <p className="text-2xl font-extrabold">{c.disc}</p>
                      <p className="text-white/80 text-xs mt-0.5">{c.desc}</p>
                    </div>
                    {c.used && <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0">Used</span>}
                  </div>
                </div>
                {/* Bottom — dashed divider + code */}
                <div className="bg-white border border-t-0 border-gray-100 px-5 py-3.5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg px-3 py-1.5 inline-block">
                        <span className="text-base font-extrabold text-gray-800 tracking-widest">{c.code}</span>
                      </div>
                      <p className="text-[10px] text-gray-400 mt-1.5">{c.min} · Valid till {c.validTill}</p>
                    </div>
                    {!c.used && (
                      <button onClick={() => copy(c.code)}
                        className="flex items-center gap-1.5 bg-primary-600 hover:bg-primary-700 text-white font-bold px-3.5 py-2 rounded-xl text-xs transition-colors flex-shrink-0">
                        {copied === c.code ? <><MdCheck size={13}/> Copied</> : <><MdContentCopy size={13}/> Copy</>}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
export default MyCoupons;
