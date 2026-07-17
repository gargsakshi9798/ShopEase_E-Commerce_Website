import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  MdChevronLeft, MdChevronRight, MdArrowForward, MdStar,
  MdShoppingCart, MdFavoriteBorder, MdFavorite, MdFlashOn,
} from "react-icons/md";
import {
  FaTruck, FaUndo, FaShieldAlt, FaTag, FaHeadset,
} from "react-icons/fa";
import toast from "react-hot-toast";
import { fetchHomeData } from "../../features/public/publicHomeSlice";
import { fetchPublicCategories, fetchPublicBrands } from "../../features/public/publicProductSlice";
import { addToCart } from "../../features/public/publicCartSlice";
import { toggleWishlist } from "../../features/public/publicWishlistSlice";
import { getImgUrl } from "../../utils/Methods";
import { useSettings } from "../../hooks/useSettings";

// ─── Constants ────────────────────────────────────────────────────────────────
const FEATURE_ICONS = [FaTruck, FaUndo, FaShieldAlt, FaTag, FaHeadset];
const DEFAULT_FEATURES = [
  { label: "Free Delivery",        sub: "On orders above ₹499"               },
  { label: "Easy Returns",          sub: "7-day return policy"                 },
  { label: "Secure Payments",       sub: "100% secure transactions"            },
  { label: "Best Price Guarantee",  sub: "Find lower? We'll match it"          },
  { label: "24/7 Support",          sub: "Always here to help"                 },
];

// Icon name → emoji map (for DB-stored icon names like "FiMonitor")
const ICON_MAP = {
  FiMonitor:"💻", FiTv:"📺", FiSmartphone:"📱", FiTablet:"📟",
  FiCamera:"📷", FiHeadphones:"🎧", FiWatch:"⌚", FiWifi:"📡",
  FiShoppingBag:"👗", FiShoppingCart:"🛒", FiTag:"🏷️",
  FiHome:"🏠", FiZap:"🔌", FiActivity:"🏋️",
  FiBook:"📚", FiBookOpen:"📖", FiFeather:"💄",
  FiTruck:"🚗", FiStar:"⭐", FiGift:"🎁", FiPackage:"📦",
};
const resolveIcon = (v, fb = "🛍️") => {
  if (!v) return fb;
  if (ICON_MAP[v]) return ICON_MAP[v];
  if (/^[A-Za-z]{2,}$/.test(v) && v.length > 3) return fb; // raw component name
  return v;
};

// Fallback hero banners
const FALLBACK_BANNERS = [
  {
    title: "Big Savings on", highlight: "Top Brands!",
    sub: "Shop the best products at unbeatable prices.",
    badge: "UP TO\n60%\nOFF", badgeBg: "bg-orange-500",
    bg: "from-indigo-50 to-blue-100", img: "🛒",
    cta: "Shop Now", ctaLink: "/products",
  },
  {
    title: "New Arrivals in", highlight: "Electronics!",
    sub: "Latest gadgets at the best prices.",
    badge: "UP TO\n50%\nOFF", badgeBg: "bg-red-500",
    bg: "from-amber-50 to-orange-100", img: "📱",
    cta: "Explore Now", ctaLink: "/electronics",
  },
  {
    title: "Refresh Your", highlight: "Wardrobe!",
    sub: "Trendy fashion for every occasion.",
    badge: "FLAT\n40%\nOFF", badgeBg: "bg-pink-500",
    bg: "from-pink-50 to-rose-100", img: "👗",
    cta: "Shop Fashion", ctaLink: "/fashion",
  },
];

const STATIC_CATEGORIES = [
  { icon: "👕", label: "Fashion",         link: "/fashion"      },
  { icon: "📱", label: "Mobiles",         link: "/mobiles"      },
  { icon: "💻", label: "Electronics",     link: "/electronics"  },
  { icon: "🏠", label: "Home & Kitchen",  link: "/home-kitchen" },
  { icon: "🔌", label: "Appliances",      link: "/appliances"   },
  { icon: "💄", label: "Beauty",          link: "/beauty"       },
  { icon: "🏋️", label: "Sports",          link: "/sports"       },
  { icon: "🛒", label: "Grocery",         link: "/grocery"      },
  { icon: "📚", label: "Books",           link: "/books"        },
  { icon: "🧸", label: "Toys",            link: "/toys"         },
  { icon: "🚗", label: "Automotive",      link: "/automotive"   },
  { icon: "⊞",  label: "More",            link: "/more"         },
];

// ─── Countdown hook ───────────────────────────────────────────────────────────
const useCountdown = (endTs) => {
  const calc = () => {
    const diff = Math.max(0, (endTs || Date.now() + 3600 * 6 * 1000) - Date.now());
    return {
      h: Math.floor(diff / 3600000),
      m: Math.floor((diff % 3600000) / 60000),
      s: Math.floor((diff % 60000) / 1000),
    };
  };
  const [time, setTime] = useState(calc);
  useEffect(() => {
    const id = setInterval(() => setTime(calc), 1000);
    return () => clearInterval(id);
  }, [endTs]);
  return time;
};
const pad = (n) => String(n).padStart(2, "0");

// ─── SmartImg ─────────────────────────────────────────────────────────────────
const SmartImg = ({ src, alt, fallback = "🛒", className = "w-full h-full object-contain" }) => {
  const [err, setErr] = useState(false);
  if (!src || err) return <span className="text-5xl select-none leading-none">{fallback}</span>;
  return <img src={getImgUrl(src)} alt={alt || ""} className={className} onError={() => setErr(true)} />;
};

// ─── Product Card ─────────────────────────────────────────────────────────────
const ProductCard = ({ product, size = "md" }) => {
  const dispatch = useDispatch();
  const wishlist = useSelector((s) => s.publicWishlist.items);
  const isWished = wishlist.some((w) => w._id === product._id);
  const price = product.price ?? 0;
  const mrp   = product.mrp   ?? price;
  const disc  = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : (product.discount_percent ?? 0);

  const onCart = (e) => {
    e.preventDefault();
    dispatch(addToCart({
      product: { _id: product._id, name: product.name, price, mrp, img: product.thumbnail || "", brand: product.brand_id?.name ?? "" },
      qty: 1,
    }));
    toast.success("Added to cart!");
  };
  const onWish = (e) => {
    e.preventDefault();
    dispatch(toggleWishlist({ _id: product._id, name: product.name, price, mrp, img: product.thumbnail || "" }));
    toast.success(isWished ? "Removed from wishlist" : "Added to wishlist!");
  };

  const imgH = size === "lg" ? "h-48" : "h-40";

  return (
    <Link to={`/product/${product.slug || product._id}`}
      className="bg-white rounded-2xl border border-gray-100 shadow-card hover:shadow-card-hover transition-all duration-200 group flex flex-col overflow-hidden">
      <div className={`relative bg-gray-50 ${imgH} flex items-center justify-center overflow-hidden`}>
        <SmartImg src={product.thumbnail} alt={product.name} />
        {disc > 0 && (
          <span className="absolute top-2 left-2 bg-green-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">
            {disc}% OFF
          </span>
        )}
        <button onClick={onWish}
          className="absolute top-2 right-2 w-7 h-7 bg-white rounded-full shadow flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          {isWished ? <MdFavorite size={14} className="text-rose-500" /> : <MdFavoriteBorder size={14} className="text-gray-400" />}
        </button>
      </div>
      <div className="p-3 flex flex-col flex-1">
        {product.brand_id?.name && (
          <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide truncate">{product.brand_id.name}</p>
        )}
        <p className="text-xs font-semibold text-gray-800 mt-0.5 line-clamp-2 flex-1 leading-relaxed">{product.name}</p>
        {product.rating_avg > 0 && (
          <div className="flex items-center gap-1 mt-1.5">
            <span className="flex items-center gap-0.5 bg-green-600 text-white text-[9px] px-1.5 py-0.5 rounded font-bold">
              {product.rating_avg?.toFixed(1)} <MdStar size={8} />
            </span>
            {product.rating_count > 0 && (
              <span className="text-[10px] text-gray-400">({product.rating_count})</span>
            )}
          </div>
        )}
        <div className="flex items-center gap-1.5 mt-1.5">
          <span className="text-sm font-bold text-gray-900">₹{price.toLocaleString()}</span>
          {mrp > price && <span className="text-[11px] text-gray-400 line-through">₹{mrp.toLocaleString()}</span>}
        </div>
        <button onClick={onCart}
          className="mt-2.5 w-full flex items-center justify-center gap-1.5 bg-primary-600 hover:bg-primary-700 text-white text-[11px] font-bold py-2 rounded-xl transition-colors">
          <MdShoppingCart size={13} /> Add to Cart
        </button>
      </div>
    </Link>
  );
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const CardSkeleton = () => (
  <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
    <div className="h-40 bg-gray-200" />
    <div className="p-3 space-y-2">
      <div className="h-2.5 bg-gray-200 rounded w-1/3" />
      <div className="h-3 bg-gray-200 rounded w-3/4" />
      <div className="h-3 bg-gray-200 rounded w-1/2" />
      <div className="h-8 bg-gray-200 rounded-xl mt-3" />
    </div>
  </div>
);

// ─── Section Header ───────────────────────────────────────────────────────────
const SectionHeader = ({ icon, title, viewLink, viewLabel = "View All" }) => (
  <div className="flex items-center justify-between mb-4">
    <div className="flex items-center gap-2">
      {icon && <span className="text-xl">{icon}</span>}
      <h2 className="text-lg font-bold text-gray-900">{title}</h2>
    </div>
    {viewLink && (
      <Link to={viewLink}
        className="flex items-center gap-0.5 text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors">
        {viewLabel} <MdArrowForward size={16} />
      </Link>
    )}
  </div>
);

// ─── Horizontal scroll row ────────────────────────────────────────────────────
const ScrollRow = ({ children, className = "" }) => {
  const ref = useRef(null);
  const scroll = (dir) => ref.current?.scrollBy({ left: dir * 220, behavior: "smooth" });
  return (
    <div className="relative group/row">
      <div ref={ref}
        className={`flex gap-3 overflow-x-auto pb-1 scrollbar-hide scroll-smooth ${className}`}
        style={{ scrollbarWidth: "none" }}>
        {children}
      </div>
      <button onClick={() => scroll(-1)}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 w-8 h-8 bg-white border border-gray-200 rounded-full shadow-card flex items-center justify-center z-10 opacity-0 group-hover/row:opacity-100 transition-opacity">
        <MdChevronLeft size={18} />
      </button>
      <button onClick={() => scroll(1)}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 w-8 h-8 bg-white border border-gray-200 rounded-full shadow-card flex items-center justify-center z-10 opacity-0 group-hover/row:opacity-100 transition-opacity">
        <MdChevronRight size={18} />
      </button>
    </div>
  );
};

// ─── Hero Slider ──────────────────────────────────────────────────────────────
const HeroSlider = ({ banners, dealProduct }) => {
  const [idx, setIdx] = useState(0);
  const [animating, setAnimating] = useState(false);
  const countdown = useCountdown(dealProduct?.flash_end_time ? new Date(dealProduct.flash_end_time).getTime() : null);

  useEffect(() => {
    const id = setInterval(() => go(1), 5000);
    return () => clearInterval(id);
  }, [banners.length]);

  const go = (dir) => {
    if (animating) return;
    setAnimating(true);
    setIdx((i) => (i + dir + banners.length) % banners.length);
    setTimeout(() => setAnimating(false), 350);
  };

  const b = banners[idx] || FALLBACK_BANNERS[0];
  const imgIsUrl = b.img && (b.img.startsWith("http") || b.img.startsWith("/"));

  return (
    <div className="flex gap-4 items-stretch">
      {/* Slider */}
      <div className={`flex-1 relative rounded-2xl overflow-hidden bg-gradient-to-br ${b.bg || "from-indigo-50 to-blue-100"} min-h-[280px] flex items-center`}>
        {/* Content */}
        <div className={`flex w-full items-center px-10 py-8 transition-opacity duration-300 ${animating ? "opacity-0" : "opacity-100"}`}>
          {/* Text */}
          <div className="flex-1 z-10 max-w-[54%]">
            <p className="text-xs font-bold text-primary-600 uppercase tracking-widest mb-1">ShopEase Exclusive</p>
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 leading-tight">{b.title}</h1>
            {b.highlight && (
              <h2 className="text-2xl md:text-3xl font-extrabold text-primary-600 leading-tight mt-0.5">{b.highlight}</h2>
            )}
            {b.sub && <p className="text-gray-500 mt-2 text-sm leading-relaxed line-clamp-2 max-w-xs">{b.sub}</p>}
            <div className="flex items-center gap-3 mt-5">
              <Link to={b.ctaLink || "/products"}
                className="bg-primary-600 hover:bg-primary-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-colors shadow-md">
                {b.cta || "Shop Now"}
              </Link>
              <Link to="/products"
                className="text-sm font-semibold text-gray-600 hover:text-primary-600 flex items-center gap-1 transition-colors">
                Browse All <MdArrowForward size={14} />
              </Link>
            </div>
          </div>
          {/* Image */}
          <div className="hidden sm:flex flex-1 items-center justify-center text-8xl select-none z-10">
            {imgIsUrl
              ? <SmartImg src={b.img} alt={b.title} className="w-44 h-44 object-contain drop-shadow-lg" fallback="🛒" />
              : <span className="drop-shadow-lg" style={{ fontSize: "6rem" }}>{b.img || "🛒"}</span>}
          </div>
        </div>

        {/* Badge */}
        {b.badge && (
          <div className={`absolute top-5 right-5 ${b.badgeBg || "bg-orange-500"} text-white text-center px-4 py-3 rounded-2xl font-extrabold text-[11px] leading-tight shadow-lg z-20`}>
            {b.badge.split("\n").map((l, i) => (
              <p key={i} className={i === 1 ? "text-2xl font-black" : ""}>{l}</p>
            ))}
          </div>
        )}

        {/* Arrows */}
        <button onClick={() => go(-1)}
          className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-card transition-all z-20">
          <MdChevronLeft size={22} className="text-gray-700" />
        </button>
        <button onClick={() => go(1)}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-card transition-all z-20">
          <MdChevronRight size={22} className="text-gray-700" />
        </button>

        {/* Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
          {banners.map((_, i) => (
            <button key={i} onClick={() => { setAnimating(true); setIdx(i); setTimeout(() => setAnimating(false), 350); }}
              className={`h-2 rounded-full transition-all duration-300 ${i === idx ? "bg-primary-600 w-6" : "bg-gray-300 w-2"}`} />
          ))}
        </div>
      </div>

      {/* Deal of the Day panel */}
      <div className="hidden lg:flex flex-col w-64 bg-white rounded-2xl shadow-card overflow-hidden flex-shrink-0">
        <div className="bg-gradient-to-r from-orange-500 to-red-500 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <MdFlashOn size={18} className="text-yellow-300" />
            <span className="text-sm font-bold text-white">Deal of the Day</span>
          </div>
          <div className="flex items-center gap-0.5 text-white font-mono text-xs font-bold">
            <span className="bg-white/20 px-1.5 py-0.5 rounded">{pad(countdown.h)}</span>
            <span>:</span>
            <span className="bg-white/20 px-1.5 py-0.5 rounded">{pad(countdown.m)}</span>
            <span>:</span>
            <span className="bg-white/20 px-1.5 py-0.5 rounded">{pad(countdown.s)}</span>
          </div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-5 text-center">
          {dealProduct ? (
            <>
              <div className="w-24 h-24 bg-gray-50 rounded-2xl flex items-center justify-center mb-3 overflow-hidden border border-gray-100">
                <SmartImg src={dealProduct.thumbnail} alt={dealProduct.name} fallback="🎧" className="w-full h-full object-contain p-1" />
              </div>
              <p className="text-xs font-semibold text-gray-800 line-clamp-2 leading-relaxed">{dealProduct.name}</p>
              <div className="flex items-center justify-center gap-2 mt-2 flex-wrap">
                <span className="text-lg font-extrabold text-gray-900">₹{dealProduct.price?.toLocaleString()}</span>
                {dealProduct.mrp > dealProduct.price && (
                  <span className="text-xs text-gray-400 line-through">₹{dealProduct.mrp?.toLocaleString()}</span>
                )}
              </div>
              {dealProduct.mrp > dealProduct.price && (
                <span className="mt-1 inline-block text-xs bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-lg">
                  {Math.round(((dealProduct.mrp - dealProduct.price) / dealProduct.mrp) * 100)}% OFF
                </span>
              )}
            </>
          ) : (
            <>
              <span className="text-7xl mb-3 select-none">🎧</span>
              <p className="text-sm font-bold text-gray-800">Today's Best Deal</p>
              <p className="text-xs text-gray-500 mt-1">Exclusive daily offers await</p>
              <div className="mt-3 flex items-center gap-1.5">
                <span className="text-lg font-extrabold text-gray-900">Up to 60%</span>
                <span className="text-xs bg-green-100 text-green-700 font-bold px-1.5 py-0.5 rounded-lg">OFF</span>
              </div>
            </>
          )}
        </div>
        <div className="px-4 pb-4">
          <Link to={dealProduct ? `/product/${dealProduct.slug || dealProduct._id}` : "/products"}
            className="block w-full text-center bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-2.5 rounded-xl text-sm transition-all shadow-md">
            Grab Deal →
          </Link>
        </div>
      </div>
    </div>
  );
};

// ─── Flash Sale Strip ─────────────────────────────────────────────────────────
const FlashSaleSection = ({ products }) => {
  const countdown = useCountdown(Date.now() + 1000 * 3600 * 4);
  if (!products?.length) return null;
  return (
    <div className="max-w-[1280px] mx-auto px-4 py-4">
      <div className="bg-gradient-to-r from-red-600 to-orange-500 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <MdFlashOn size={22} className="text-yellow-300 animate-pulse" />
            <span className="text-white font-extrabold text-base tracking-wide">FLASH SALE</span>
            <div className="flex items-center gap-1 ml-2">
              {["h","m","s"].map((unit, i) => (
                <span key={unit} className="flex items-center gap-0.5">
                  {i > 0 && <span className="text-white/70 font-bold text-sm">:</span>}
                  <span className="bg-white/20 text-white font-mono font-bold text-sm px-2 py-0.5 rounded">
                    {pad(countdown[unit])}
                  </span>
                </span>
              ))}
            </div>
          </div>
          <Link to="/products?sort=discount&order=desc"
            className="flex items-center gap-1 text-white/90 hover:text-white text-xs font-bold transition-colors">
            View All <MdArrowForward size={14} />
          </Link>
        </div>
        <div className="px-4 pb-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {products.slice(0, 6).map((p) => {
              const price = p.price ?? 0;
              const mrp   = p.mrp   ?? price;
              const disc  = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
              return (
                <Link key={p._id} to={`/product/${p.slug || p._id}`}
                  className="bg-white rounded-xl p-3 flex flex-col items-center text-center hover:shadow-md transition-shadow group">
                  <div className="w-full h-24 flex items-center justify-center mb-2 overflow-hidden">
                    <SmartImg src={p.thumbnail} alt={p.name} className="w-full h-full object-contain" />
                  </div>
                  <p className="text-[11px] font-semibold text-gray-800 line-clamp-2 leading-tight">{p.name}</p>
                  <div className="flex items-center gap-1.5 mt-1.5 flex-wrap justify-center">
                    <span className="text-sm font-bold text-gray-900">₹{price.toLocaleString()}</span>
                    {disc > 0 && <span className="text-[10px] bg-red-100 text-red-600 font-bold px-1 rounded">{disc}%</span>}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Brand Strip ──────────────────────────────────────────────────────────────
const BrandStrip = ({ brands }) => {
  if (!brands?.length) return null;
  return (
    <div className="max-w-[1280px] mx-auto px-4 py-4">
      <SectionHeader title="Top Brands" icon="🏆" viewLink="/products" />
      <div className="bg-white rounded-2xl shadow-card p-4">
        <div className="flex gap-4 overflow-x-auto pb-1 scrollbar-hide">
          {brands.slice(0, 12).map((brand) => (
            <Link key={brand._id}
              to={`/products?brand_id=${brand._id}`}
              className="flex-shrink-0 flex flex-col items-center gap-2 group">
              <div className="w-16 h-16 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-center overflow-hidden group-hover:border-primary-300 group-hover:bg-primary-50 transition-all">
                {brand.logo
                  ? <img src={getImgUrl(brand.logo)} alt={brand.name} className="w-12 h-12 object-contain" />
                  : <span className="text-2xl font-extrabold text-gray-300">{brand.name?.[0]}</span>}
              </div>
              <span className="text-[10px] font-semibold text-gray-500 group-hover:text-primary-600 transition-colors text-center w-16 truncate">
                {brand.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── Category Grid ────────────────────────────────────────────────────────────
const CategoryGrid = ({ categories }) => (
  <div className="max-w-[1280px] mx-auto px-4 py-4">
    <SectionHeader title="Shop by Category" viewLink="/categories" />
    <div className="bg-white rounded-2xl shadow-card p-4">
      <div className="grid grid-cols-6 sm:grid-cols-8 lg:grid-cols-12 gap-1">
        {categories.map((cat) => (
          <Link key={cat.label} to={cat.link}
            className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-primary-50 transition-colors group">
            <div className="w-12 h-12 bg-gray-100 group-hover:bg-primary-100 rounded-full flex items-center justify-center text-2xl transition-colors flex-shrink-0">
              {cat.icon}
            </div>
            <span className="text-[10px] text-gray-600 group-hover:text-primary-600 text-center leading-tight font-medium line-clamp-2 w-full">
              {cat.label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  </div>
);

// ─── Feature Strip ────────────────────────────────────────────────────────────
const FeatureStrip = ({ features }) => (
  <div className="max-w-[1280px] mx-auto px-4 py-4">
    <div className="bg-white rounded-2xl shadow-card">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
        {features.map(({ Icon, label, sub }, i) => (
          <div key={label}
            className={`flex items-center gap-3 px-5 py-4 ${i < features.length - 1 ? "border-b lg:border-b-0 lg:border-r border-gray-100" : ""}`}>
            <div className="w-10 h-10 bg-primary-50 rounded-full flex items-center justify-center flex-shrink-0">
              <Icon size={18} className="text-primary-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-gray-800 leading-tight">{label}</p>
              <p className="text-[11px] text-gray-500 leading-tight mt-0.5">{sub}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// ─── Product Grid Section ─────────────────────────────────────────────────────
const ProductSection = ({ icon, title, products, viewLink, loading, cols = 6 }) => {
  if (!loading && !products?.length) return null;
  const colClass = {
    4: "grid-cols-2 sm:grid-cols-3 md:grid-cols-4",
    6: "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6",
  }[cols] || "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6";

  return (
    <div className="max-w-[1280px] mx-auto px-4 py-4">
      <SectionHeader icon={icon} title={title} viewLink={viewLink} />
      <div className={`grid ${colClass} gap-3`}>
        {loading
          ? Array.from({ length: cols }).map((_, i) => <CardSkeleton key={i} />)
          : products.slice(0, cols).map((p) => <ProductCard key={p._id} product={p} />)
        }
      </div>
    </div>
  );
};

// ─── Promotional Banner Row ───────────────────────────────────────────────────
const PromoBanners = () => (
  <div className="max-w-[1280px] mx-auto px-4 py-4">
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {[
        { bg: "from-blue-600 to-indigo-700",  emoji: "📱", title: "Mobiles & Tablets",  sub: "Up to 40% off",    link: "/mobiles"      },
        { bg: "from-pink-500 to-rose-600",    emoji: "👗", title: "Fashion Week Sale",   sub: "Min 50% off",      link: "/fashion"      },
        { bg: "from-green-500 to-emerald-600",emoji: "🏠", title: "Home Makeover",       sub: "Starting ₹299",    link: "/home-kitchen" },
      ].map(({ bg, emoji, title, sub, link }) => (
        <Link key={title} to={link}
          className={`bg-gradient-to-br ${bg} rounded-2xl p-6 flex items-center gap-4 hover:scale-[1.02] transition-transform`}>
          <span className="text-5xl">{emoji}</span>
          <div>
            <p className="text-white font-extrabold text-base leading-tight">{title}</p>
            <p className="text-white/80 text-sm mt-0.5">{sub}</p>
            <span className="mt-2 inline-flex items-center gap-1 text-white text-xs font-bold">
              Shop Now <MdArrowForward size={13} />
            </span>
          </div>
        </Link>
      ))}
    </div>
  </div>
);

// ─── Newsletter Banner ────────────────────────────────────────────────────────
const NewsletterBanner = () => {
  const [email, setEmail] = useState("");
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.includes("@")) { toast.error("Enter a valid email"); return; }
    toast.success("You're subscribed! 🎉");
    setEmail("");
  };
  return (
    <div className="max-w-[1280px] mx-auto px-4 py-6">
      <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl px-8 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="text-center md:text-left">
          <h3 className="text-2xl font-extrabold text-white">Stay in the loop</h3>
          <p className="text-primary-200 mt-1 text-sm">Get exclusive deals, new arrivals &amp; offers directly in your inbox.</p>
        </div>
        <form onSubmit={handleSubmit} className="flex gap-2 w-full max-w-md">
          <input
            type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            className="flex-1 px-4 py-3 rounded-xl text-sm outline-none bg-white/90 placeholder-gray-400 focus:bg-white transition-colors"
          />
          <button type="submit"
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-5 py-3 rounded-xl text-sm transition-colors whitespace-nowrap">
            Subscribe
          </button>
        </form>
      </div>
    </div>
  );
};

// ─── Main Home Component ──────────────────────────────────────────────────────
const Home = () => {
  const dispatch = useDispatch();
  const { s }    = useSettings();

  // Redux state
  const {
    banners, featured_products, best_sellers, new_arrivals,
    flash_sale, trending, status,
  } = useSelector((st) => st.publicHome);
  const { categories: apiCategories, brands } = useSelector((st) => st.publicProduct);

  // Fetch on mount
  useEffect(() => {
    dispatch(fetchHomeData());
    dispatch(fetchPublicCategories());
    dispatch(fetchPublicBrands());
  }, [dispatch]);

  const loading = status === "loading" || status === "idle";

  // ── Build hero banners ──────────────────────────────────────────────────────
  const heroBanners = banners?.length
    ? banners.map((b) => ({
        title:     b.title      || "Exclusive Deals",
        highlight: b.subtitle   || "",
        sub:       b.description || "",
        badge:     b.badge_text || "",
        badgeBg:   "bg-orange-500",
        bg:        b.bg_color   || "from-indigo-50 to-blue-100",
        img:       b.image      || "",
        cta:       b.cta_text   || "Shop Now",
        ctaLink:   b.cta_link   || "/products",
      }))
    : FALLBACK_BANNERS;

  // ── Build feature strip ─────────────────────────────────────────────────────
  const featureStrip = DEFAULT_FEATURES.map((def, i) => {
    const raw = s(`feature_strip_${i + 1}`, "");
    const [label, sub] = raw ? raw.split("|").map((v) => v.trim()) : [];
    return { Icon: FEATURE_ICONS[i], label: label || def.label, sub: sub || def.sub };
  });

  // ── Build display categories ────────────────────────────────────────────────
  const displayCategories = apiCategories?.length
    ? [
        ...apiCategories.slice(0, 11).map((c) => ({
          icon:  resolveIcon(c.icon, "🛍️"),
          label: c.name,
          link:  `/${c.slug || c.name.toLowerCase().replace(/\s+/g, "-")}`,
        })),
        { icon: "⊞", label: "More", link: "/more" },
      ]
    : STATIC_CATEGORIES;

  const dealProduct = flash_sale?.[0] ?? null;

  return (
    <div className="bg-gray-50 min-h-screen pb-8">

      {/* ── Hero + Deal of the Day ── */}
      <div className="max-w-[1280px] mx-auto px-4 pt-4 pb-2">
        <HeroSlider banners={heroBanners} dealProduct={dealProduct} />
      </div>

      {/* ── Feature Strip ── */}
      <FeatureStrip features={featureStrip} />

      {/* ── Shop by Category ── */}
      <CategoryGrid categories={displayCategories} />

      {/* ── Flash Sale ── */}
      <FlashSaleSection products={flash_sale} />

      {/* ── Featured / Trending Products ── */}
      <ProductSection
        icon="🔥" title="Trending Now"
        products={trending?.length ? trending : featured_products}
        viewLink="/products"
        loading={loading && !trending?.length && !featured_products?.length}
        cols={6}
      />

      {/* ── Promo Banners ── */}
      <PromoBanners />

      {/* ── Best Sellers ── */}
      <ProductSection
        icon="⭐" title="Best Sellers"
        products={best_sellers}
        viewLink="/products?sort=total_sold&order=desc"
        loading={loading && !best_sellers?.length}
        cols={6}
      />

      {/* ── Brand Strip ── */}
      <BrandStrip brands={brands} />

      {/* ── New Arrivals ── */}
      <ProductSection
        icon="🆕" title="New Arrivals"
        products={new_arrivals}
        viewLink="/products?sort=createdAt&order=desc"
        loading={loading && !new_arrivals?.length}
        cols={6}
      />

      {/* ── Newsletter ── */}
      <NewsletterBanner />

    </div>
  );
};

export default Home;
