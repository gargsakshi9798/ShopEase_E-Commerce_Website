import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  MdStar, MdStarHalf, MdStarBorder, MdShoppingCart,
  MdFavoriteBorder, MdFavorite, MdArrowBack, MdLocalShipping,
  MdSecurity, MdUndo, MdShare, MdExpandMore, MdExpandLess,
  MdVerified, MdThumbUp,
} from "react-icons/md";
import toast from "../../utils/toast";
import { fetchProductDetail, clearDetail } from "../../features/public/publicProductSlice";
import { addToCart, addToCartApi } from "../../features/public/publicCartSlice";
import { toggleWishlist } from "../../features/public/publicWishlistSlice";
import { GET, POST } from "../../utils/Methods";
import { APIS } from "../../utils/APIS";
import Cookies from "js-cookie";
import { useSettings } from "../../hooks/useSettings";
import useRecentlyViewed from "../../hooks/useRecentlyViewed";

// ─── Star rating ─────────────────────────────────────────────────────────────
const StarRating = ({ value = 0, max = 5, size = 16 }) => (
  <span className="flex items-center">
    {Array.from({ length: max }).map((_, i) => {
      const filled = i + 1 <= Math.floor(value);
      const half   = !filled && i + 0.5 < value;
      return filled
        ? <MdStar key={i} size={size} className="text-amber-400" />
        : half
          ? <MdStarHalf key={i} size={size} className="text-amber-400" />
          : <MdStarBorder key={i} size={size} className="text-gray-300" />;
    })}
  </span>
);

// ─── Review Form ─────────────────────────────────────────────────────────────
const ReviewForm = ({ productId, onSubmitted }) => {
  const [rating,  setRating]  = useState(0);
  const [hover,   setHover]   = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) { toast.error("Please select a rating"); return; }
    if (comment.trim().length < 10) { toast.error("Review must be at least 10 characters"); return; }
    setLoading(true);
    try {
      await POST(APIS.Customer.Reviews, { product_id: productId, rating, comment });
      toast.success("Review submitted!");
      setRating(0); setComment("");
      onSubmitted?.();
    } catch {
      toast.error("Failed to submit review. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
      <h4 className="text-sm font-bold text-gray-800 mb-3">Write a Review</h4>
      {/* Star picker */}
      <div className="flex items-center gap-1 mb-3">
        {[1, 2, 3, 4, 5].map((s) => (
          <button key={s} type="button"
            onMouseEnter={() => setHover(s)} onMouseLeave={() => setHover(0)}
            onClick={() => setRating(s)}>
            <MdStar size={28} className={(hover || rating) >= s ? "text-amber-400" : "text-gray-300"} />
          </button>
        ))}
        {rating > 0 && (
          <span className="ml-2 text-sm text-gray-500">
            {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][rating]}
          </span>
        )}
      </div>
      <textarea
        value={comment} onChange={(e) => setComment(e.target.value)}
        placeholder="Share your experience with this product... (min 10 characters)"
        rows={3}
        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 resize-none"
      />
      <button type="submit" disabled={loading}
        className="mt-3 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white text-sm font-bold px-6 py-2.5 rounded-xl transition-colors">
        {loading ? "Submitting..." : "Submit Review"}
      </button>
    </form>
  );
};

// ─── Reviews Section ──────────────────────────────────────────────────────────
const ReviewsSection = ({ productId }) => {
  const [reviews, setReviews]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const isLoggedIn = !!Cookies.get("shopease_customer_token");

  const loadReviews = async () => {
    setLoading(true);
    try {
      const res = await GET(`${APIS.Customer.Reviews}/product/${productId}`);
      const data = res?.data;
      // Handle both { data: [...] } and { data: { reviews: [...] } } shapes
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.reviews)
          ? data.reviews
          : Array.isArray(data?.data)
            ? data.data
            : [];
      setReviews(list);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  useEffect(() => { if (productId) loadReviews(); }, [productId]);

  const handleHelpful = async (id) => {
    try {
      await POST(`${APIS.Customer.Reviews}/${id}/helpful`, {});
      toast.success("Marked as helpful!");
      loadReviews();
    } catch { toast.error("Failed"); }
  };

  return (
    <div>
      <h3 className="text-base font-bold text-gray-900 mb-4">Customer Reviews</h3>

      {isLoggedIn && <div className="mb-5"><ReviewForm productId={productId} onSubmitted={loadReviews} /></div>}

      {loading && <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-20 bg-gray-100 rounded-2xl animate-pulse" />)}</div>}

      {!loading && reviews.length === 0 && (
        <p className="text-sm text-gray-400 py-6 text-center">No reviews yet. Be the first to review!</p>
      )}

      {!loading && reviews.map((r) => (
        <div key={r._id} className="border-b border-gray-100 py-4 last:border-0">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-xs font-bold text-primary-600">
              {r.user_id?.name?.[0]?.toUpperCase() ?? "U"}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">{r.user_id?.name ?? "Customer"}</p>
              <div className="flex items-center gap-1">
                <StarRating value={r.rating} size={12} />
                {r.verified_purchase && (
                  <span className="text-[10px] text-green-600 flex items-center gap-0.5 ml-1">
                    <MdVerified size={11} /> Verified Purchase
                  </span>
                )}
              </div>
            </div>
            <span className="ml-auto text-xs text-gray-400">
              {new Date(r.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-1">{r.comment}</p>
          <button onClick={() => handleHelpful(r._id)}
            className="mt-2 flex items-center gap-1 text-xs text-gray-400 hover:text-primary-600 transition-colors">
            <MdThumbUp size={13} /> Helpful ({r.helpful_count ?? 0})
          </button>
        </div>
      ))}
    </div>
  );
};

// ─── Main Product Detail ─────────────────────────────────────────────────────
const ProductDetail = () => {
  const { slug }   = useParams();
  const dispatch   = useDispatch();
  const navigate   = useNavigate();
  const { s }      = useSettings();

  const trust1 = s("product_trust_1", "Free delivery on orders above ₹499");
  const trust2 = s("product_trust_2", "7-day easy return policy");
  const trust3 = s("product_trust_3", "100% secure payments");

  const { detail, detailStatus } = useSelector((s) => s.publicProduct);
  const wishlist   = useSelector((s) => s.publicWishlist.items);
  const isLoggedIn = useSelector((s) => s.customerAuth?.isLogin);
  const { relatedProducts } = useSelector((s) => s.publicProduct);
  const isWished   = wishlist.some((w) => w._id === detail?._id);

  const { record: recordView } = useRecentlyViewed();

  const [selectedImg,   setSelectedImg]   = useState(0);
  const [selectedVar,   setSelectedVar]   = useState(null);
  const [qty,           setQty]           = useState(1);
  const [specExpanded,  setSpecExpanded]  = useState(false);

  useEffect(() => {
    dispatch(fetchProductDetail(slug));
    return () => dispatch(clearDetail());
  }, [dispatch, slug]);

  useEffect(() => {
    if (detail?.variants?.length) setSelectedVar(detail.variants[0]);
  }, [detail]);

  // Record this product in Recently Viewed as soon as the detail loads
  useEffect(() => {
    if (!detail?._id) return;
    recordView({
      _id:        detail._id,
      name:       detail.name,
      slug:       detail.slug,
      thumbnail:  detail.thumbnail,
      price:      detail.price,
      mrp:        detail.mrp,
      brand_name: detail.brand_id?.name ?? "",
    });
  }, [detail?._id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (detailStatus === "loading") {
    return (
      <div className="max-w-[1280px] mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8 animate-pulse">
          <div className="lg:w-[420px] bg-white rounded-2xl h-96" />
          <div className="flex-1 space-y-4">
            <div className="h-6 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
            <div className="h-10 bg-gray-200 rounded w-1/3" />
          </div>
        </div>
      </div>
    );
  }

  if (detailStatus === "failed" || (detailStatus === "succeeded" && !detail)) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <span className="text-6xl">😕</span>
        <h2 className="text-xl font-bold text-gray-700">Product not found</h2>
        <Link to="/products" className="text-sm text-primary-600 hover:underline">← Back to Products</Link>
      </div>
    );
  }

  if (!detail) return null;

  const images  = detail.images?.length ? detail.images : [detail.thumbnail].filter(Boolean);
  const price   = selectedVar ? selectedVar.price : detail.price;
  const mrp     = selectedVar ? selectedVar.mrp   : detail.mrp;
  const stock   = selectedVar ? selectedVar.stock : detail.stock;
  const disc    = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;

  const handleAddToCart = () => {
    if (stock <= 0) { toast.error("This product is out of stock"); return; }
    if (!detail.status) { toast.error("This product is no longer available"); return; }

    const cartProduct = {
      _id:        detail._id,
      name:       detail.name,
      price,
      mrp,
      img:        images[0] ?? "",
      brand:      detail.brand_id?.name ?? "",
      variant_id: selectedVar?._id ?? null,
      stock,
      status:     detail.status,
    };

    if (isLoggedIn) {
      dispatch(addToCartApi({ product: cartProduct, qty }))
        .unwrap()
        .catch(() => {}); // fallback already handled inside thunk
    } else {
      dispatch(addToCart({ product: cartProduct, qty }));
    }
    toast.success("Added to cart!");
  };

  const handleBuyNow = () => {
    if (!Cookies.get("shopease_customer_token")) {
      toast.error("Please login to place an order");
      navigate("/login", { state: { from: "/checkout" } });
      return;
    }
    handleAddToCart();
    navigate("/checkout");
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-[1280px] mx-auto px-4 py-6">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-5 text-sm text-gray-400">
          <Link to="/" className="hover:text-primary-600 transition-colors">Home</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-primary-600 transition-colors">Products</Link>
          {detail.category_id?.name && (
            <><span>/</span>
            <Link to={`/products?category=${detail.category_id._id}`} className="hover:text-primary-600 transition-colors">{detail.category_id.name}</Link></>
          )}
          <span>/</span>
          <span className="text-gray-600 line-clamp-1">{detail.name}</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">

          {/* ── Left: Images ── */}
          <div className="lg:w-[420px] flex-shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
              {/* Main image */}
              <div className="h-80 flex items-center justify-center p-4">
                {images.length > 0
                  ? <img src={images[selectedImg]} alt={detail.name} className="w-full h-full object-contain" />
                  : <span className="text-8xl">🛒</span>}
              </div>
              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2 px-4 pb-4 overflow-x-auto">
                  {images.map((img, i) => (
                    <button key={i} onClick={() => setSelectedImg(i)}
                      className={`w-16 h-16 flex-shrink-0 rounded-xl border-2 overflow-hidden transition-all ${
                        i === selectedImg ? "border-primary-600" : "border-gray-200 hover:border-gray-400"
                      }`}>
                      <img src={img} alt="" className="w-full h-full object-contain p-1" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Right: Details ── */}
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">

              {/* Brand + name */}
              {detail.brand_id?.name && (
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">{detail.brand_id.name}</p>
              )}
              <h1 className="text-2xl font-bold text-gray-900 mt-1 leading-tight">{detail.name}</h1>

              {/* Rating */}
              {detail.rating_count > 0 && (
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm bg-green-600 text-white px-2 py-0.5 rounded flex items-center gap-0.5">
                    {detail.rating_avg?.toFixed(1)} <MdStar size={13} />
                  </span>
                  <span className="text-sm text-gray-400">{detail.rating_count} ratings</span>
                </div>
              )}

              {/* Price */}
              <div className="flex items-baseline gap-3 mt-4">
                <span className="text-3xl font-extrabold text-gray-900">₹{price?.toLocaleString()}</span>
                {mrp > price && (
                  <span className="text-base text-gray-400 line-through">₹{mrp?.toLocaleString()}</span>
                )}
                {disc > 0 && (
                  <span className="text-sm bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-lg">{disc}% off</span>
                )}
              </div>

              {/* Variants */}
              {detail.variants?.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    {detail.variants[0]?.name ?? "Variant"}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {detail.variants.map((v) => (
                      <button key={v._id} onClick={() => setSelectedVar(v)}
                        className={`px-3 py-1.5 rounded-xl border text-sm font-semibold transition-all ${
                          selectedVar?._id === v._id
                            ? "border-primary-600 bg-primary-50 text-primary-600"
                            : "border-gray-200 text-gray-700 hover:border-gray-400"
                        } ${v.stock === 0 ? "opacity-40 cursor-not-allowed" : ""}`}
                        disabled={v.stock === 0}>
                        {v.value}
                        {v.stock === 0 && <span className="ml-1 text-[10px] text-red-400">(Out)</span>}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Qty */}
              <div className="flex items-center gap-3 mt-4">
                <p className="text-xs font-semibold text-gray-500 uppercase">Qty</p>
                <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                  <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="w-9 h-9 flex items-center justify-center hover:bg-gray-50 font-bold text-lg">−</button>
                  <span className="w-10 text-center text-sm font-bold">{qty}</span>
                  <button onClick={() => setQty((q) => Math.min(stock, q + 1))} className="w-9 h-9 flex items-center justify-center hover:bg-gray-50 font-bold text-lg" disabled={qty >= stock}>+</button>
                </div>
                <span className={`text-xs font-semibold ${stock > 0 ? "text-green-600" : "text-red-500"}`}>
                  {stock > 10 ? "In Stock" : stock > 0 ? `Only ${stock} left!` : "Out of Stock"}
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-5">
                <button onClick={handleAddToCart} disabled={stock === 0}
                  className="flex-1 flex items-center justify-center gap-2 border-2 border-primary-600 text-primary-600 hover:bg-primary-50 font-bold py-3 rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                  <MdShoppingCart size={20} /> Add to Cart
                </button>
                <button onClick={handleBuyNow} disabled={stock === 0}
                  className="flex-1 flex items-center justify-center bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                  Buy Now
                </button>
                <button onClick={() => dispatch(toggleWishlist({ _id: detail._id, name: detail.name, price, mrp, img: images[0] ?? "🛒", brand: detail.brand_id?.name ?? "" }))}
                  className="w-12 h-12 border border-gray-200 rounded-xl flex items-center justify-center hover:border-rose-300 hover:bg-rose-50 transition-colors flex-shrink-0">
                  {isWished ? <MdFavorite size={22} className="text-rose-500" /> : <MdFavoriteBorder size={22} className="text-gray-400" />}
                </button>
              </div>

              {/* Delivery info */}
              <div className="mt-5 space-y-2 border-t border-gray-100 pt-4">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <MdLocalShipping size={15} className="text-blue-500" /> {trust1}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <MdUndo size={15} className="text-green-500" /> {trust2}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <MdSecurity size={15} className="text-amber-500" /> {trust3}
                </div>
              </div>
            </div>

            {/* Description */}
            {detail.description && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm mt-4">
                <h3 className="text-base font-bold text-gray-900 mb-2">Product Description</h3>
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{detail.description}</p>              </div>
            )}

            {/* Specifications */}
            {detail.specifications?.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm mt-4">
                <button
                  onClick={() => setSpecExpanded((v) => !v)}
                  className="w-full flex items-center justify-between text-base font-bold text-gray-900">
                  Specifications
                  {specExpanded ? <MdExpandLess size={22} /> : <MdExpandMore size={22} />}
                </button>
                {specExpanded && (
                  <div className="mt-4 divide-y divide-gray-50">
                    {detail.specifications.map((s, i) => (
                      <div key={i} className="flex py-2 text-sm">
                        <span className="w-40 flex-shrink-0 text-gray-500 font-medium">{s.key}</span>
                        <span className="text-gray-800">{s.value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Reviews */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm mt-4">
              <ReviewsSection productId={detail._id} />
            </div>
          </div>
        </div>

        {/* ── Related Products ── */}
        {relatedProducts.length > 0 && (
          <div className="mt-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">You Might Also Like</h2>
              {detail.category_id?._id && (
                <Link
                  to={`/products?category_id=${detail.category_id._id}`}
                  className="text-sm text-primary-600 font-semibold hover:underline flex items-center gap-1"
                >
                  View More
                </Link>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
              {relatedProducts.slice(0, 10).map((rp) => {
                const rpPrice = rp.price ?? 0;
                const rpMrp   = rp.mrp ?? rpPrice;
                const rpDisc  = rpMrp > rpPrice ? Math.round(((rpMrp - rpPrice) / rpMrp) * 100) : 0;
                return (
                  <Link
                    key={rp._id}
                    to={rp.slug ? `/product/${rp.slug}` : "/products"}
                    className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group flex flex-col"
                  >
                    <div className="h-36 bg-gray-50 flex items-center justify-center overflow-hidden relative">
                      {rp.thumbnail
                        ? <img src={rp.thumbnail} alt={rp.name} className="w-full h-full object-contain p-2" />
                        : <span className="text-5xl">🛒</span>}
                      {rpDisc > 0 && (
                        <span className="absolute top-2 right-2 text-[10px] bg-green-100 text-green-700 font-bold px-1.5 py-0.5 rounded">{rpDisc}% off</span>
                      )}
                    </div>
                    <div className="p-3 flex flex-col flex-1">
                      <p className="text-xs font-semibold text-gray-800 line-clamp-2 flex-1">{rp.name}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-sm font-bold text-gray-900">₹{rpPrice.toLocaleString()}</span>
                        {rpMrp > rpPrice && <span className="text-xs text-gray-400 line-through">₹{rpMrp.toLocaleString()}</span>}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ProductDetail;
