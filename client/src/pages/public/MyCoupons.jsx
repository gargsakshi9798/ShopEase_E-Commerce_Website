import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MdContentCopy, MdCheck, MdLocalOffer, MdSearch, MdShoppingCart } from "react-icons/md";
import toast from "react-hot-toast";
import { GET } from "../../utils/Methods";
import { APIS } from "../../utils/APIS";

// ─── Coupon Card ──────────────────────────────────────────────────────────────
const GRADIENT_MAP = {
  percentage: "from-violet-500 to-purple-700",
  flat:       "from-blue-500 to-indigo-600",
};

const formatDiscount = (coupon) =>
  coupon.discount_type === "percentage"
    ? `${coupon.discount_value}% OFF`
    : `₹${coupon.discount_value} OFF`;

const formatValidTill = (date) => {
  if (!date) return "No expiry";
  return new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

const CouponCard = ({ coupon }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(coupon.code).then(() => {
      setCopied(true);
      toast.success(`Coupon "${coupon.code}" copied!`);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const grad = GRADIENT_MAP[coupon.discount_type] || "from-slate-600 to-gray-700";
  const isExpiringSoon =
    coupon.end_date && new Date(coupon.end_date) - new Date() < 3 * 24 * 60 * 60 * 1000;

  return (
    <div className="rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      {/* Colored top */}
      <div className={`bg-gradient-to-r ${grad} p-5 text-white relative`}>
        {isExpiringSoon && (
          <span className="absolute top-3 right-3 text-[10px] bg-red-500 text-white font-bold px-2 py-0.5 rounded-full">
            Expiring Soon!
          </span>
        )}
        <div className="flex items-center gap-2 mb-1">
          <MdLocalOffer size={14} className="text-white/80" />
          <span className="text-xs font-semibold text-white/80 capitalize">
            {coupon.applicable_for === "all" ? "All Products" : coupon.applicable_for}
          </span>
        </div>
        <p className="text-2xl font-extrabold leading-tight">{formatDiscount(coupon)}</p>
        <p className="text-white/80 text-xs mt-0.5 line-clamp-2">
          {coupon.title || coupon.description || "Exclusive discount"}
        </p>
        {coupon.min_order_amount > 0 && (
          <p className="text-white/60 text-[10px] mt-1">
            Min order: ₹{coupon.min_order_amount.toLocaleString()}
          </p>
        )}
        {coupon.max_discount_amount && coupon.discount_type === "percentage" && (
          <p className="text-white/60 text-[10px]">
            Max discount: ₹{coupon.max_discount_amount.toLocaleString()}
          </p>
        )}
      </div>

      {/* Bottom */}
      <div className="bg-white px-5 py-3.5 flex items-center justify-between gap-3">
        <div>
          <div className="border-2 border-dashed border-gray-300 rounded-lg px-3 py-1.5 inline-block">
            <span className="text-sm font-extrabold text-gray-800 tracking-widest">{coupon.code}</span>
          </div>
          <p className="text-[10px] text-gray-400 mt-1.5">
            Valid till {formatValidTill(coupon.end_date)}
          </p>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 bg-primary-600 hover:bg-primary-700 text-white font-bold px-3.5 py-2 rounded-xl text-xs transition-colors flex-shrink-0"
        >
          {copied ? <><MdCheck size={13} /> Copied!</> : <><MdContentCopy size={13} /> Copy</>}
        </button>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const MyCoupons = () => {
  const [coupons,  setCoupons]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");
  const [filter,   setFilter]   = useState("All");

  useEffect(() => {
    const fetchCoupons = async () => {
      setLoading(true);
      try {
        const res = await GET(APIS.Customer.Coupons);
        setCoupons(res?.data ?? []);
      } catch {
        toast.error("Failed to load coupons");
      } finally {
        setLoading(false);
      }
    };
    fetchCoupons();
  }, []);

  const filtered = coupons.filter((c) => {
    const matchSearch =
      !search ||
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      (c.title || "").toLowerCase().includes(search.toLowerCase());
    const isExpiringSoon =
      c.end_date && new Date(c.end_date) - new Date() < 3 * 24 * 60 * 60 * 1000;
    const matchFilter =
      filter === "All" ||
      (filter === "Percentage" && c.discount_type === "percentage") ||
      (filter === "Flat"       && c.discount_type === "flat") ||
      (filter === "Expiring"   && isExpiringSoon);
    return matchSearch && matchFilter;
  });

  const FILTERS = ["All", "Percentage", "Flat", "Expiring"];

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-[900px] mx-auto px-4 py-8 space-y-5">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
              <MdLocalOffer size={22} className="text-primary-600" /> Available Coupons
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              {loading ? "Loading…" : `${filtered.length} coupon${filtered.length !== 1 ? "s" : ""} available`}
            </p>
          </div>
          <div className="relative w-full sm:w-64">
            <MdSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search coupons…"
              className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                filter === f
                  ? "bg-primary-600 text-white shadow"
                  : "bg-white border border-gray-200 text-gray-600 hover:border-primary-400"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="grid sm:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden shadow-sm">
                <div className="h-28 bg-gray-200 animate-pulse" />
                <div className="bg-white p-4 h-14 animate-pulse" />
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && filtered.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center shadow-sm">
            <span className="text-5xl block mb-3">🎟️</span>
            <p className="text-gray-700 font-bold">No coupons found</p>
            <p className="text-sm text-gray-400 mt-1">
              {search ? "Try a different search term" : "No active coupons available right now"}
            </p>
          </div>
        )}

        {/* Coupons grid */}
        {!loading && filtered.length > 0 && (
          <div className="grid sm:grid-cols-2 gap-4">
            {filtered.map((c) => <CouponCard key={c._id} coupon={c} />)}
          </div>
        )}

        {/* CTA */}
        <div className="bg-gradient-to-r from-primary-600 to-blue-600 rounded-2xl p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-extrabold text-lg">Ready to shop?</p>
            <p className="text-white/70 text-sm mt-0.5">Apply your coupon during checkout to save!</p>
          </div>
          <Link
            to="/products"
            className="flex items-center gap-2 bg-white text-primary-700 font-bold px-5 py-3 rounded-xl hover:bg-gray-50 transition-colors text-sm flex-shrink-0"
          >
            <MdShoppingCart size={18} /> Shop Now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MyCoupons;
