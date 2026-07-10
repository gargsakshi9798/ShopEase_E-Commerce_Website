import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import {
  MdStar, MdStarHalf, MdStarBorder, MdFavoriteBorder, MdFavorite,
  MdShoppingCart, MdLocalShipping, MdVerified, MdLoop, MdCheck,
  MdChevronLeft, MdChevronRight, MdLocalOffer, MdContentCopy, MdFlashOn, MdSecurity,
} from "react-icons/md";
import { FaTag } from "react-icons/fa";
import { addToCart } from "../../features/public/publicCartSlice";
import { toggleWishlist } from "../../features/public/publicWishlistSlice";
import { toysProducts, discount, badgeColor } from "../../data/toysData";

const Stars = ({ rating, size = 16 }) => {
  const full = Math.floor(rating), half = rating % 1 >= 0.5, empty = 5 - full - (half ? 1 : 0);
  return (
    <span className="flex items-center gap-0.5">
      {Array(full).fill(0).map((_, i) => <MdStar key={`f${i}`} size={size} className="text-amber-400" />)}
      {half && <MdStarHalf size={size} className="text-amber-400" />}
      {Array(empty).fill(0).map((_, i) => <MdStarBorder key={`e${i}`} size={size} className="text-amber-300" />)}
    </span>
  );
};

const CouponRow = ({ coupon }) => {
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard.writeText(coupon.code).then(() => { setCopied(true); toast.success(`Coupon "${coupon.code}" copied!`); setTimeout(() => setCopied(false), 2000); }); };
  return (
    <div className="flex items-center justify-between bg-green-50 border border-dashed border-green-300 rounded-xl px-3 py-2">
      <div className="flex items-center gap-2">
        <FaTag size={13} className="text-green-600" />
        <span className="text-xs font-bold text-green-700 mr-2">{coupon.code}</span>
        <span className="text-xs text-gray-500">{coupon.desc}</span>
      </div>
      <button onClick={copy} className="flex items-center gap-1 text-xs font-semibold text-green-700 hover:text-green-800 ml-2 flex-shrink-0">
        {copied ? <MdCheck size={14} /> : <MdContentCopy size={14} />}{copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
};

const SuggestedCard = ({ product }) => {
  const dispatch = useDispatch();
  const disc = discount(product.price, product.mrp);
  return (
    <Link to={`/toys/product/${product._id}`} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
      <div className="h-36 bg-gradient-to-br from-pink-50 to-yellow-50 flex items-center justify-center text-6xl relative">
        {product.img}
        {product.badge && <span className={`absolute top-2 left-2 text-[10px] font-bold px-1.5 py-0.5 rounded-lg ${badgeColor(product.badge)}`}>{product.badge}</span>}
      </div>
      <div className="p-3 flex flex-col flex-1">
        <p className="text-[10px] text-gray-400">{product.brand}</p>
        <p className="text-xs font-semibold text-gray-800 line-clamp-2 flex-1 mt-0.5">{product.name}</p>
        <div className="flex items-center gap-1 mt-1"><div className="flex items-center gap-0.5 bg-green-600 text-white text-[10px] px-1 py-0.5 rounded font-bold">{product.rating} <MdStar size={9} /></div></div>
        <div className="flex items-center gap-1.5 mt-1.5">
          <span className="text-sm font-bold text-gray-900">&#8377;{product.price.toLocaleString()}</span>
          <span className="text-xs text-gray-400 line-through">&#8377;{product.mrp.toLocaleString()}</span>
          <span className="text-[10px] text-green-600 font-bold">{disc}% off</span>
        </div>
        <button onClick={(e) => { e.preventDefault(); dispatch(addToCart({ product, qty: 1 })); toast.success("Added to cart!"); }}
          className="mt-2 w-full flex items-center justify-center gap-1 bg-primary-600 hover:bg-primary-700 text-white text-[11px] font-bold py-2 rounded-xl transition-colors">
          <MdShoppingCart size={13} /> Add to Cart
        </button>
      </div>
    </Link>
  );
};

const ToysProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const wishlist = useSelector((s) => s.publicWishlist.items);
  const product = toysProducts.find((p) => p._id === id);

  const [imgIdx, setImgIdx] = useState(0);
  const [selectedColor, setSelectedColor] = useState(product?.colors?.[0]?.name ?? "");
  const [selectedSize, setSelectedSize]   = useState(product?.sizes?.[0] ?? "");
  const [qty, setQty] = useState(1);
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [activeTab, setActiveTab] = useState("desc");

  if (!product) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <span className="text-7xl">😔</span>
      <p className="text-xl font-bold text-gray-700">Product not found</p>
      <Link to="/toys" className="text-primary-600 font-semibold hover:underline">&#8592; Back to Toys</Link>
    </div>
  );

  const isWished = wishlist.some((w) => w._id === product._id);
  const disc = discount(product.price, product.mrp);
  const finalPrice = appliedCoupon
    ? appliedCoupon.type === "percent" ? Math.round(product.price * (1 - appliedCoupon.discount / 100)) : Math.max(0, product.price - appliedCoupon.discount)
    : product.price;

  const related  = toysProducts.filter((p) => p._id !== product._id && p.tag === product.tag).slice(0, 6);
  const topPicks = toysProducts.filter((p) => p._id !== product._id && p.rating >= 4.4).slice(0, 6);

  const handleAddToCart = () => { dispatch(addToCart({ product: { ...product, selectedColor, selectedSize }, qty })); toast.success(`${product.name} added to cart!`); };
  const handleBuyNow    = () => {
    if (!Cookies.get("shopease_customer_token")) {
      toast.error("Please login to place an order");
      navigate("/login", { state: { from: "/checkout" } });
      return;
    }
    dispatch(addToCart({ product: { ...product, selectedColor, selectedSize }, qty }));
    navigate("/checkout");
  };
  const applyCoupon     = () => {
    const found = product.coupons.find((c) => c.code.toLowerCase() === couponInput.trim().toLowerCase());
    if (found) { setAppliedCoupon(found); toast.success(`Coupon "${found.code}" applied!`); } else { toast.error("Invalid coupon code"); }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-[1280px] mx-auto px-4 py-3">
        <nav className="flex items-center gap-1.5 text-xs text-gray-500">
          <Link to="/" className="hover:text-primary-600">Home</Link><span>/</span>
          <Link to="/toys" className="hover:text-primary-600">Toys</Link><span>/</span>
          <span className="text-gray-800 font-medium truncate max-w-[200px]">{product.name}</span>
        </nav>
      </div>
      <div className="max-w-[1280px] mx-auto px-4 pb-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Gallery */}
          <div className="lg:w-[42%] flex-shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 p-4 sticky top-24">
              <div className="relative h-80 bg-gradient-to-br from-pink-50 to-yellow-50 rounded-xl flex items-center justify-center text-[120px] mb-3 overflow-hidden">
                <span className="select-none">{product.images[imgIdx]}</span>
                {product.badge && <span className={`absolute top-3 left-3 text-xs font-bold px-2.5 py-1 rounded-xl ${badgeColor(product.badge)}`}>{product.badge}</span>}
                <span className="absolute top-3 right-3 text-xs bg-green-100 text-green-700 font-bold px-2 py-1 rounded-xl">{disc}% OFF</span>
                {imgIdx > 0 && <button onClick={() => setImgIdx((i) => i - 1)} className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center shadow hover:bg-white"><MdChevronLeft size={20} /></button>}
                {imgIdx < product.images.length - 1 && <button onClick={() => setImgIdx((i) => i + 1)} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center shadow hover:bg-white"><MdChevronRight size={20} /></button>}
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {product.images.map((img, i) => (
                  <button key={i} onClick={() => setImgIdx(i)}
                    className={`w-14 h-14 flex-shrink-0 rounded-xl bg-gradient-to-br from-pink-50 to-yellow-50 flex items-center justify-center text-3xl border-2 transition-all ${imgIdx === i ? "border-primary-500 shadow-sm" : "border-transparent hover:border-gray-300"}`}>
                    {img}
                  </button>
                ))}
              </div>
              <button onClick={() => { dispatch(toggleWishlist(product)); toast.success(isWished ? "Removed from wishlist" : "Added to wishlist!"); }}
                className={`mt-3 w-full flex items-center justify-center gap-2 border rounded-xl py-2.5 text-sm font-semibold transition-all ${isWished ? "border-rose-400 bg-rose-50 text-rose-600" : "border-gray-200 text-gray-600 hover:border-rose-300 hover:text-rose-500"}`}>
                {isWished ? <MdFavorite size={18} /> : <MdFavoriteBorder size={18} />}
                {isWished ? "Wishlisted" : "Add to Wishlist"}
              </button>
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">{product.brand}</p>
              <h1 className="text-xl font-bold text-gray-900 mt-1 leading-tight">{product.name}</h1>
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <div className="flex items-center gap-1.5 bg-green-600 text-white text-sm px-2.5 py-0.5 rounded-lg font-bold">{product.rating} <MdStar size={14} /></div>
                <Stars rating={product.rating} size={15} />
                <span className="text-sm text-gray-500">{product.reviews.toLocaleString()} ratings</span>
                <span className="flex items-center gap-1 text-xs text-green-600 font-semibold"><MdVerified size={14} /> Verified</span>
              </div>
              <div className="mt-4 pb-4 border-b border-gray-100">
                <div className="flex items-baseline gap-3 flex-wrap">
                  <span className="text-3xl font-extrabold text-gray-900">&#8377;{finalPrice.toLocaleString()}</span>
                  {appliedCoupon && <span className="text-lg font-semibold text-gray-400 line-through">&#8377;{product.price.toLocaleString()}</span>}
                  <span className="text-lg text-gray-400 line-through">&#8377;{product.mrp.toLocaleString()}</span>
                  <span className="text-sm font-bold text-green-600">{disc}% off</span>
                </div>
                {appliedCoupon && (
                  <p className="text-xs text-green-600 mt-1 font-semibold">
                    Coupon "{appliedCoupon.code}" applied — You save &#8377;{(product.price - finalPrice).toLocaleString()}
                    <button onClick={() => { setAppliedCoupon(null); setCouponInput(""); }} className="ml-2 text-red-500 underline">Remove</button>
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">Inclusive of all taxes. Free delivery available.</p>
              </div>
              <div className="mt-4">
                <p className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-1.5"><MdLocalOffer size={16} className="text-blue-600" /> Bank Offers</p>
                <div className="space-y-1.5">
                  {product.bankOffers.map((o, i) => <div key={i} className="flex items-start gap-2 text-xs text-gray-600"><span className="text-blue-500 font-bold mt-0.5">&#8250;</span> {o}</div>)}
                </div>
              </div>
            </div>

            {product.sizes.length > 1 && product.sizes[0] !== "One Size" && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <p className="text-sm font-bold text-gray-800 mb-3">Size: <span className="text-primary-600">{selectedSize}</span></p>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((s) => (
                    <button key={s} onClick={() => setSelectedSize(s)}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${selectedSize === s ? "border-primary-500 bg-primary-50 text-primary-600" : "border-gray-200 text-gray-600 hover:border-gray-400"}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {product.colors.length > 1 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <p className="text-sm font-bold text-gray-800 mb-3">Color: <span className="text-primary-600">{selectedColor}</span></p>
                <div className="flex flex-wrap gap-2.5">
                  {product.colors.map((c) => (
                    <button key={c.name} onClick={() => setSelectedColor(c.name)} title={c.name}
                      className={`w-9 h-9 rounded-full border-4 transition-all ${selectedColor === c.name ? "border-primary-500 scale-110 shadow" : "border-gray-200 hover:border-gray-400"}`}
                      style={{ backgroundColor: c.hex }} />
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-sm font-bold text-gray-700">Qty:</span>
                <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                  <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-100 font-bold text-lg">&#8722;</button>
                  <span className="w-10 text-center text-sm font-bold">{qty}</span>
                  <button onClick={() => setQty((q) => Math.min(product.stock, q + 1))} className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-100 font-bold text-lg">&#43;</button>
                </div>
                <span className="text-xs text-gray-400">({product.stock} in stock)</span>
              </div>
              <div className="flex gap-3">
                <button onClick={handleAddToCart} className="flex-1 flex items-center justify-center gap-2 bg-purple-500 hover:bg-purple-600 text-white font-bold py-3.5 rounded-xl transition-all shadow-md shadow-purple-200 active:scale-[0.98]">
                  <MdShoppingCart size={18} /> Add to Cart
                </button>
                <button onClick={handleBuyNow} className="flex-1 flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md shadow-blue-200 active:scale-[0.98]">
                  <MdFlashOn size={18} /> Buy Now
                </button>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3">
                {[
                  { icon: <MdLocalShipping size={20} className="text-primary-600" />, label: "Fast Delivery",  sub: `in ${product.deliveryDays} days` },
                  { icon: <MdLoop size={20} className="text-green-600" />,            label: "Safe for Kids",  sub: "Age-appropriate toys" },
                  { icon: <MdSecurity size={20} className="text-blue-600" />,         label: "100% Genuine",   sub: "Authentic products" },
                ].map((item) => (
                  <div key={item.label} className="flex flex-col items-center text-center gap-1">
                    {item.icon}
                    <p className="text-[11px] font-semibold text-gray-700">{item.label}</p>
                    <p className="text-[10px] text-gray-400">{item.sub}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <p className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-1.5"><FaTag size={14} className="text-green-600" /> Apply Coupon</p>
              <div className="flex gap-2 mb-3">
                <input value={couponInput} onChange={(e) => setCouponInput(e.target.value)} placeholder="Enter coupon code"
                  className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 uppercase"
                  onKeyDown={(e) => e.key === "Enter" && applyCoupon()} />
                <button onClick={applyCoupon} className="px-5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold rounded-xl transition-colors">Apply</button>
              </div>
              <div className="space-y-2">{product.coupons.map((c) => <CouponRow key={c.code} coupon={c} />)}</div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400">Sold by</p>
                <p className="text-sm font-bold text-gray-800 flex items-center gap-1"><MdVerified size={15} className="text-blue-500" /> {product.seller}</p>
              </div>
              <span className="text-xs text-green-600 font-semibold bg-green-50 border border-green-200 px-2 py-1 rounded-lg">Trusted Seller</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-6 bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="flex border-b border-gray-100">
            {[{ key: "desc", label: "Description" }, { key: "highlights", label: "Highlights" }, { key: "specs", label: "Specifications" }].map((t) => (
              <button key={t.key} onClick={() => setActiveTab(t.key)}
                className={`px-6 py-3.5 text-sm font-semibold transition-colors border-b-2 ${activeTab === t.key ? "border-primary-600 text-primary-600" : "border-transparent text-gray-500 hover:text-gray-800"}`}>
                {t.label}
              </button>
            ))}
          </div>
          <div className="p-5">
            {activeTab === "desc" && <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>}
            {activeTab === "highlights" && <ul className="space-y-2">{product.highlights.map((h, i) => <li key={i} className="flex items-start gap-2 text-sm text-gray-700"><MdCheck size={16} className="text-green-500 flex-shrink-0 mt-0.5" /> {h}</li>)}</ul>}
            {activeTab === "specs" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(product.specifications).map(([k, v]) => (
                  <div key={k} className="flex items-start gap-3 bg-gray-50 rounded-xl px-4 py-2.5">
                    <span className="text-xs font-bold text-gray-500 w-28 flex-shrink-0">{k}</span>
                    <span className="text-xs text-gray-800 font-medium">{v}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {related.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">&#127931; Similar Toys</h2>
              <Link to="/toys" className="text-sm text-primary-600 font-semibold hover:underline">View All</Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">{related.map((p) => <SuggestedCard key={p._id} product={p} />)}</div>
          </div>
        )}
        {topPicks.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">&#11088; Top Rated Toys</h2>
              <Link to="/toys" className="text-sm text-primary-600 font-semibold hover:underline">View All</Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">{topPicks.map((p) => <SuggestedCard key={p._id} product={p} />)}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ToysProductDetail;
