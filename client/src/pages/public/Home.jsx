import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { MdChevronLeft, MdChevronRight, MdArrowForward, MdStar, MdShoppingCart, MdFavoriteBorder, MdFavorite } from "react-icons/md";
import { FaTruck, FaUndo, FaShieldAlt, FaTag, FaHeadset } from "react-icons/fa";
import toast from "react-hot-toast";
import { fetchPublicProducts, fetchPublicCategories } from "../../features/public/publicProductSlice";
import { addToCart } from "../../features/public/publicCartSlice";
import { toggleWishlist } from "../../features/public/publicWishlistSlice";
import { GET } from "../../utils/Methods";
import { APIS } from "../../utils/APIS";
import { getImgUrl } from "../../utils/Methods";
import { useSettings } from "../../hooks/useSettings";

// ─── Icon map for feature strip ──────────────────────────────────────────────
const FEATURE_ICONS = [FaTruck, FaUndo, FaShieldAlt, FaTag, FaHeadset];

// ─── Default feature strip (fallback when settings key is empty) ─────────────
const DEFAULT_FEATURES = [
  { label: "Free Delivery",       sub: "On orders above ₹499"              },
  { label: "Easy Returns",         sub: "7 days return policy"               },
  { label: "Secure Payments",      sub: "100% secure payments"               },
  { label: "Best Price Guarantee", sub: "Find a lower price? We'll match it" },
  { label: "24/7 Support",         sub: "We are here to help"                },
];

// ─── Default bottom features ─────────────────────────────────────────────────
const DEFAULT_BOTTOM = [
  { icon: "📦", label: "Wide Range",       sub: "Millions of products"     },
  { icon: "⭐", label: "Top Brands",        sub: "100% Original Products"   },
  { icon: "🔒", label: "Secure Checkout",  sub: "Multiple payment options" },
  { icon: "🚚", label: "Track Order",      sub: "Real-time order tracking" },
  { icon: "🎁", label: "Exclusive Offers", sub: "Best deals & discounts"   },
];

// Fallback hero banners when API returns none
const fallbackBanners = [
  {
    id: 1,
    title: "Big Savings on",
    highlight: "Top Brands!",
    sub: "Shop the best products at unbeatable prices.",
    badge: "UP TO\n60%\nOFF",
    badgeBg: "bg-orange-500",
    bg: "from-[#eef2ff] to-[#e0e7ff]",
    img: "🛒",
    cta: "Shop Now",
    ctaLink: "/fashion",
  },
  {
    id: 2,
    title: "New Arrivals in",
    highlight: "Electronics!",
    sub: "Latest gadgets at the best prices.",
    badge: "UP TO\n50%\nOFF",
    badgeBg: "bg-red-500",
    bg: "from-[#fff7ed] to-[#ffedd5]",
    img: "📱",
    cta: "Explore Now",
    ctaLink: "/electronics",
  },
];

// ─── Countdown hook ───────────────────────────────────────────────────────────
const useCountdown = (h = 12, m = 45, s = 30) => {
  const [time, setTime] = useState({ h, m, s });
  useEffect(() => {
    const id = setInterval(() => {
      setTime((prev) => {
        let { h, m, s } = prev;
        if (s > 0) return { h, m, s: s - 1 };
        if (m > 0) return { h, m: m - 1, s: 59 };
        if (h > 0) return { h: h - 1, m: 59, s: 59 };
        return { h: 23, m: 59, s: 59 };
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);
  return time;
};

const pad = (n) => String(n).padStart(2, "0");

// ─── Smart Image component ────────────────────────────────────────────────────
const SmartImg = ({ src, alt, fallback = "🛒", className = "w-full h-full object-contain" }) => {
  const [broken, setBroken] = useState(false);
  if (!src || broken) return <span className="text-5xl select-none">{fallback}</span>;
  return <img src={getImgUrl(src)} alt={alt || ""} className={className} onError={() => setBroken(true)} />;
};

// ─── Product Card (home) ──────────────────────────────────────────────────────
const HomeProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const wishlist = useSelector((s) => s.publicWishlist.items);
  const isWished = wishlist.some((w) => w._id === product._id);

  const price = product.price ?? 0;
  const mrp   = product.mrp ?? price;
  const disc  = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : (product.discount_percent ?? 0);

  const handleCart = (e) => {
    e.preventDefault();
    dispatch(addToCart({
      product: { _id: product._id, name: product.name, price, mrp, img: product.thumbnail || "", brand: product.brand_id?.name ?? "" },
      qty: 1,
    }));
    toast.success("Added to cart!");
  };
  const handleWish = (e) => {
    e.preventDefault();
    dispatch(toggleWishlist({ _id: product._id, name: product.name, price, mrp, img: product.thumbnail || "" }));
    toast.success(isWished ? "Removed from wishlist" : "Added to wishlist!");
  };

  return (
    <Link
      to={`/product/${product.slug || product._id}`}
      className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden hover:shadow-card-hover transition-shadow group flex flex-col"
    >
      <div className="relative bg-gray-50 h-40 flex items-center justify-center overflow-hidden">
        <SmartImg src={product.thumbnail} alt={product.name} />
        {disc > 0 && (
          <span className="absolute top-2 right-2 text-[10px] bg-green-100 text-green-700 font-bold px-1.5 py-0.5 rounded-lg">{disc}% off</span>
        )}
        <button onClick={handleWish}
          className="absolute bottom-2 right-2 w-7 h-7 bg-white rounded-full shadow flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          {isWished ? <MdFavorite size={14} className="text-rose-500" /> : <MdFavoriteBorder size={14} className="text-gray-400" />}
        </button>
      </div>
      <div className="p-3 flex flex-col flex-1">
        <p className="text-[10px] text-gray-400 font-medium truncate">{product.brand_id?.name}</p>
        <p className="text-xs font-semibold text-gray-800 mt-0.5 line-clamp-2 flex-1">{product.name}</p>
        {product.rating_avg > 0 && (
          <div className="flex items-center gap-1 mt-1">
            <span className="flex items-center gap-0.5 bg-green-600 text-white text-[10px] px-1 py-0.5 rounded font-bold">
              {product.rating_avg?.toFixed(1)} <MdStar size={9} />
            </span>
          </div>
        )}
        <div className="flex items-center gap-1.5 mt-1.5">
          <span className="text-sm font-bold text-gray-900">₹{price.toLocaleString()}</span>
          {mrp > price && <span className="text-[11px] text-gray-400 line-through">₹{mrp.toLocaleString()}</span>}
        </div>
        <button onClick={handleCart}
          className="mt-2 w-full flex items-center justify-center gap-1 bg-primary-600 hover:bg-primary-700 text-white text-[11px] font-bold py-2 rounded-xl transition-colors">
          <MdShoppingCart size={12} /> Add
        </button>
      </div>
    </Link>
  );
};

// ─── Skeleton loaders ─────────────────────────────────────────────────────────
const ProductSkeleton = () => (
  <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
    <div className="h-40 bg-gray-200" />
    <div className="p-3 space-y-2">
      <div className="h-3 bg-gray-200 rounded w-1/3" />
      <div className="h-3 bg-gray-200 rounded w-3/4" />
      <div className="h-6 bg-gray-200 rounded mt-2" />
    </div>
  </div>
);

// ─── Home Page ────────────────────────────────────────────────────────────────
const Home = () => {
  const dispatch = useDispatch();
  const { s } = useSettings();
  const { products: apiProducts, categories: apiCategories, status } = useSelector((s) => s.publicProduct);

  const [bannerIdx,   setBannerIdx]   = useState(0);
  const [heroBanners, setHeroBanners] = useState([]);
  const [homeData,    setHomeData]    = useState(null);
  const [homeLoading, setHomeLoading] = useState(true);
  const countdown = useCountdown(12, 45, 30);

  // Fetch home data (banners, featured, bestsellers, new arrivals)
  useEffect(() => {
    const fetchHome = async () => {
      try {
        const res = await GET(APIS.Public.Home);
        if (res?.data) setHomeData(res.data);
      } catch {
        // fallback gracefully
      } finally {
        setHomeLoading(false);
      }
    };
    fetchHome();
    dispatch(fetchPublicCategories());
    dispatch(fetchPublicProducts({ per_page: 12, sort: "rating_count", order: "desc" }));
  }, [dispatch]);

  // Build hero banners from API or fallback
  useEffect(() => {
    if (homeData?.banners?.length) {
      setHeroBanners(
        homeData.banners.map((b) => ({
          id:       b._id,
          title:    b.title || "Exclusive Deals",
          highlight:b.subtitle || "",
          sub:      b.description || "",
          badge:    b.badge_text || "",
          badgeBg:  "bg-orange-500",
          bg:       b.bg_color || "from-[#eef2ff] to-[#e0e7ff]",
          img:      b.image || "",
          cta:      b.cta_text || "Shop Now",
          ctaLink:  b.cta_link || "/products",
        }))
      );
    } else {
      setHeroBanners(fallbackBanners);
    }
  }, [homeData]);

  // ── Build feature strips from settings or defaults ────────────────────────
  const featureStrip = DEFAULT_FEATURES.map((def, i) => {
    const raw = s(`feature_strip_${i + 1}`, "");
    if (!raw) return { ...def, icon: FEATURE_ICONS[i] };
    const [label, sub] = raw.split("|").map((v) => v.trim());
    return { label: label || def.label, sub: sub || def.sub, icon: FEATURE_ICONS[i] };
  });

  const bottomFeatures = DEFAULT_BOTTOM.map((def, i) => {
    const raw = s(`bottom_feature_${i + 1}`, "");
    if (!raw) return def;
    const [icon, label, sub] = raw.split("|").map((v) => v.trim());
    return { icon: icon || def.icon, label: label || def.label, sub: sub || def.sub };
  });

  const banner = heroBanners[bannerIdx] || fallbackBanners[0];
  const prevBanner = () => setBannerIdx((i) => (i - 1 + heroBanners.length) % heroBanners.length);
  const nextBanner = () => setBannerIdx((i) => (i + 1) % heroBanners.length);

  // Displayed sections — prefer API homeData, fallback to general products
  const featuredProducts = homeData?.featured_products   ?? [];
  const bestSellers      = homeData?.best_sellers        ?? [];
  const newArrivals      = homeData?.new_arrivals        ?? [];
  const trendingProducts = homeData?.trending            ?? apiProducts;
  const dealOfTheDay     = homeData?.flash_sale?.[0]     ?? null;

  // Categories — prefer API, fallback to static
  const staticCategories = [
    { icon: "👕", label: "Fashion",          link: "/fashion" },
    { icon: "📱", label: "Mobiles",          link: "/mobiles" },
    { icon: "💻", label: "Electronics",      link: "/electronics" },
    { icon: "🏠", label: "Home & Kitchen",   link: "/home-kitchen" },
    { icon: "🔌", label: "Appliances",       link: "/appliances" },
    { icon: "💄", label: "Beauty",           link: "/beauty" },
    { icon: "🏋️", label: "Sports & Fitness", link: "/sports" },
    { icon: "🛒", label: "Grocery",          link: "/grocery" },
    { icon: "📚", label: "Books",            link: "/books" },
    { icon: "🧸", label: "Toys",             link: "/toys" },
    { icon: "🚗", label: "Automotive",       link: "/automotive" },
    { icon: "⊞",  label: "More",             link: "/more" },
  ];

  const displayCategories = apiCategories.length
    ? apiCategories.slice(0, 11).map((c) => ({
        icon:  c.icon || "🛍️",
        label: c.name,
        link:  `/${c.slug || c.name.toLowerCase().replace(/\s+/g, "-")}`,
      })).concat([{ icon: "⊞", label: "More", link: "/more" }])
    : staticCategories;

  return (
    <div className="bg-gray-50">

      {/* ── Hero + Deal of the Day ── */}
      <div className="max-w-[1280px] mx-auto px-4 pt-4 pb-2">
        <div className="flex gap-4">

          {/* Hero Slider */}
          <div className={`flex-1 relative rounded-2xl overflow-hidden bg-gradient-to-br ${banner?.bg || "from-[#eef2ff] to-[#e0e7ff]"} min-h-[260px] flex items-center px-10 py-8`}>
            <div className="flex-1 z-10 relative">
              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight">{banner?.title}</h1>
              <h1 className="text-3xl md:text-4xl font-extrabold text-primary-600 leading-tight">{banner?.highlight}</h1>
              <p className="text-gray-600 mt-2 mb-5 text-sm max-w-xs">{banner?.sub}</p>
              <Link
                to={banner?.ctaLink || "/products"}
                className="inline-block bg-primary-600 hover:bg-primary-700 text-white font-bold px-6 py-2.5 rounded-xl transition-colors text-sm"
              >
                {banner?.cta || "Shop Now"}
              </Link>
            </div>

            {banner?.badge && (
              <div className={`absolute top-6 right-6 ${banner.badgeBg || "bg-orange-500"} text-white text-center px-4 py-3 rounded-2xl font-extrabold text-xs leading-tight shadow-lg z-10`}>
                {banner.badge.split("\n").map((l, i) => (
                  <p key={i} className={i === 1 ? "text-2xl" : ""}>{l}</p>
                ))}
              </div>
            )}

            <div className="hidden sm:flex items-end justify-center w-48 text-8xl pb-2 select-none">
              {banner?.img && (banner.img.startsWith("http") || banner.img.startsWith("/"))
                ? <SmartImg src={banner.img} alt={banner.title} className="w-40 h-40 object-contain" fallback="🛒" />
                : <span>{banner?.img || "🛒"}</span>}
            </div>

            <button onClick={prevBanner} className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow transition-all">
              <MdChevronLeft size={20} />
            </button>
            <button onClick={nextBanner} className="absolute right-16 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow transition-all">
              <MdChevronRight size={20} />
            </button>

            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {heroBanners.map((_, i) => (
                <button key={i} onClick={() => setBannerIdx(i)}
                  className={`w-2 h-2 rounded-full transition-all ${i === bannerIdx ? "bg-primary-600 w-5" : "bg-gray-300"}`} />
              ))}
            </div>
          </div>

          {/* Deal of the Day */}
          <div className="hidden lg:flex flex-col w-64 bg-white rounded-2xl shadow-card overflow-hidden flex-shrink-0">
            <div className="bg-amber-50 border-b border-amber-100 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">⏰</span>
                <span className="text-sm font-bold text-gray-800">Deal of the Day</span>
              </div>
              <div className="flex items-center gap-1 text-primary-600 font-bold text-sm">
                <span className="bg-primary-600 text-white px-1.5 py-0.5 rounded text-xs">{pad(countdown.h)}</span>
                <span>:</span>
                <span className="bg-primary-600 text-white px-1.5 py-0.5 rounded text-xs">{pad(countdown.m)}</span>
                <span>:</span>
                <span className="bg-primary-600 text-white px-1.5 py-0.5 rounded text-xs">{pad(countdown.s)}</span>
              </div>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center p-5 text-center">
              {dealOfTheDay ? (
                <>
                  <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center mb-3 overflow-hidden">
                    <SmartImg src={dealOfTheDay.thumbnail} alt={dealOfTheDay.name} fallback="🎧" className="w-full h-full object-contain" />
                  </div>
                  <p className="text-sm font-semibold text-gray-800 line-clamp-2">{dealOfTheDay.name}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-lg font-bold text-gray-900">₹{dealOfTheDay.price?.toLocaleString()}</span>
                    {dealOfTheDay.mrp > dealOfTheDay.price && (
                      <>
                        <span className="text-sm text-gray-400 line-through">₹{dealOfTheDay.mrp?.toLocaleString()}</span>
                        <span className="text-xs bg-green-100 text-green-700 font-bold px-1.5 py-0.5 rounded">{dealOfTheDay.discount_percent ?? Math.round(((dealOfTheDay.mrp - dealOfTheDay.price) / dealOfTheDay.mrp) * 100)}% OFF</span>
                      </>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="text-7xl mb-3">🎧</div>
                  <p className="text-sm font-semibold text-gray-800">Today's Best Deal</p>
                  <p className="text-xs text-gray-500 mb-3">Exclusive daily offers</p>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg font-bold text-gray-900">Up to 60%</span>
                    <span className="text-xs bg-green-100 text-green-700 font-bold px-1.5 py-0.5 rounded">OFF</span>
                  </div>
                </>
              )}
            </div>
            <div className="px-4 pb-4">
              <Link
                to={dealOfTheDay ? `/product/${dealOfTheDay.slug || dealOfTheDay._id}` : "/products"}
                className="block w-full text-center bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 rounded-xl text-sm transition-colors"
              >
                Shop Now
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Shop by Category ── */}
      <div className="max-w-[1280px] mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Shop by Category</h2>
          <Link to="/categories" className="text-sm text-primary-600 font-semibold flex items-center gap-0.5 hover:underline">
            View All <MdArrowForward size={16} />
          </Link>
        </div>
        <div className="bg-white rounded-2xl shadow-card p-4">
          <div className="grid grid-cols-6 sm:grid-cols-8 lg:grid-cols-12 gap-2">
            {displayCategories.map((cat) => (
              <Link
                key={cat.label}
                to={cat.link}
                className="flex flex-col items-center gap-2 p-2 rounded-xl hover:bg-primary-50 transition-colors group"
              >
                <div className="w-12 h-12 bg-gray-100 group-hover:bg-primary-100 rounded-full flex items-center justify-center text-2xl transition-colors">
                  {cat.icon}
                </div>
                <span className="text-[11px] text-gray-600 group-hover:text-primary-600 text-center leading-tight font-medium">
                  {cat.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── Feature Strip ── */}
      <div className="max-w-[1280px] mx-auto px-4 pb-4">
        <div className="bg-white rounded-2xl shadow-card">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 divide-x divide-y sm:divide-y-0 divide-gray-100">
            {featureStrip.map(({ icon: Icon, label, sub }) => (
              <div key={label} className="flex items-center gap-3 px-5 py-4">
                <div className="w-9 h-9 bg-primary-50 rounded-full flex items-center justify-center flex-shrink-0">
                  <Icon size={17} className="text-primary-600" />
                </div>
                <div>
                  <p className="text-[12px] font-semibold text-gray-800">{label}</p>
                  <p className="text-[11px] text-gray-500">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Trending / Featured Products ── */}
      {(trendingProducts.length > 0 || status === "loading") && (
        <div className="max-w-[1280px] mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">🔥 Trending Products</h2>
            <Link to="/products" className="text-sm text-primary-600 font-semibold hover:underline flex items-center gap-0.5">
              View All <MdArrowForward size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {status === "loading"
              ? Array.from({ length: 6 }).map((_, i) => <ProductSkeleton key={i} />)
              : trendingProducts.slice(0, 12).map((p) => <HomeProductCard key={p._id} product={p} />)}
          </div>
        </div>
      )}

      {/* ── Best Sellers ── */}
      {bestSellers.length > 0 && (
        <div className="max-w-[1280px] mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">⭐ Best Sellers</h2>
            <Link to="/products?sort=total_sold&order=desc" className="text-sm text-primary-600 font-semibold hover:underline flex items-center gap-0.5">
              View All <MdArrowForward size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {bestSellers.slice(0, 6).map((p) => <HomeProductCard key={p._id} product={p} />)}
          </div>
        </div>
      )}

      {/* ── New Arrivals ── */}
      {newArrivals.length > 0 && (
        <div className="max-w-[1280px] mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">🆕 New Arrivals</h2>
            <Link to="/products?sort=createdAt&order=desc" className="text-sm text-primary-600 font-semibold hover:underline flex items-center gap-0.5">
              View All <MdArrowForward size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {newArrivals.slice(0, 6).map((p) => <HomeProductCard key={p._id} product={p} />)}
          </div>
        </div>
      )}

      {/* ── Bottom Feature Strip ── */}
      <div className="max-w-[1280px] mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl shadow-card">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 divide-x divide-y sm:divide-y-0 divide-gray-100">
            {bottomFeatures.map(({ icon, label, sub }) => (
              <div key={label} className="flex items-center gap-3 px-5 py-4">
                <span className="text-2xl flex-shrink-0">{icon}</span>
                <div>
                  <p className="text-[12px] font-semibold text-gray-800">{label}</p>
                  <p className="text-[11px] text-gray-500">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
};

export default Home;
