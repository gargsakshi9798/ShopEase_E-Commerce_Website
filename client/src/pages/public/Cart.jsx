import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  MdShoppingCart, MdDelete, MdArrowBack,
  MdLocalShipping, MdLocalOffer, MdSecurity,
  MdCheck, MdContentCopy, MdFlashOn,
} from "react-icons/md";
import { FaTag } from "react-icons/fa";
import { removeFromCart, updateQty, clearCart } from "../../features/public/publicCartSlice";
import { toggleWishlist } from "../../features/public/publicWishlistSlice";
import { MdFavoriteBorder, MdFavorite } from "react-icons/md";
import { GET } from "../../utils/Methods";
import { APIS } from "../../utils/APIS";
import { useEffect } from "react";
import { useSettings } from "../../hooks/useSettings";

const CouponChip = ({ coupon, onCopy }) => {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    onCopy(coupon.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="flex items-center justify-between bg-green-50 border border-dashed border-green-300 rounded-xl px-3 py-2">
      <div className="flex items-center gap-2">
        <FaTag size={12} className="text-green-600" />
        <span className="text-xs font-bold text-green-700 mr-1">{coupon.code}</span>
        <span className="text-xs text-gray-500">{coupon.desc}</span>
      </div>
      <button onClick={copy} className="flex items-center gap-1 text-xs font-semibold text-green-700 ml-2 flex-shrink-0">
        {copied ? <MdCheck size={13} /> : <MdContentCopy size={13} />}
        {copied ? "Copied!" : "Copy"}
      </button>
    </div>
  );
};

// ─── Cart Item Row ─────────────────────────────────────────────────────────────
const CartItem = ({ item }) => {
  const dispatch = useDispatch();
  const wishlist = useSelector((s) => s.publicWishlist.items);
  const isWished = wishlist.some((w) => w._id === item._id);

  const handleQtyChange = (newQty) => {
    if (newQty < 1) return;
    dispatch(updateQty({ id: item._id, qty: newQty }));
  };

  const handleRemove = () => {
    dispatch(removeFromCart(item._id));
    toast.success("Item removed from cart");
  };

  const handleWishlist = () => {
    dispatch(toggleWishlist(item));
    toast.success(isWished ? "Removed from wishlist" : "Saved to wishlist!");
  };

  const itemTotal = item.price * item.qty;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 flex gap-4 shadow-sm">
      {/* Image */}
      <Link to={`/fashion/product/${item._id}`}
        className="w-24 h-24 bg-gray-50 rounded-xl flex items-center justify-center text-5xl flex-shrink-0 hover:opacity-90 transition-opacity">
        {item.img}
      </Link>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-[11px] text-gray-400 font-medium">{item.brand}</p>
            <Link to={`/fashion/product/${item._id}`}
              className="text-sm font-semibold text-gray-800 hover:text-primary-600 line-clamp-2">
              {item.name}
            </Link>
          </div>
          <button onClick={handleRemove}
            className="w-7 h-7 flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0">
            <MdDelete size={16} />
          </button>
        </div>

        {/* Selected attrs */}
        <div className="flex items-center gap-3 mt-1">
          {item.selectedSize && (
            <span className="text-[11px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-lg font-medium">
              Size: {item.selectedSize}
            </span>
          )}
          {item.selectedColor && (
            <span className="text-[11px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-lg font-medium">
              {item.selectedColor}
            </span>
          )}
        </div>

        {/* Price + Qty row */}
        <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-gray-900">₹{itemTotal.toLocaleString()}</span>
            {item.qty > 1 && (
              <span className="text-xs text-gray-400">(₹{item.price.toLocaleString()} × {item.qty})</span>
            )}
            {item.mrp && (
              <span className="text-xs text-gray-400 line-through">₹{(item.mrp * item.qty).toLocaleString()}</span>
            )}
          </div>

          {/* Qty control */}
          <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
            <button onClick={() => handleQtyChange(item.qty - 1)}
              className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors font-bold">−</button>
            <span className="w-8 text-center text-sm font-bold">{item.qty}</span>
            <button onClick={() => handleQtyChange(item.qty + 1)}
              className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors font-bold">+</button>
          </div>
        </div>

        {/* Wishlist save */}
        <button onClick={handleWishlist}
          className="mt-2 flex items-center gap-1 text-xs text-gray-400 hover:text-rose-500 transition-colors">
          {isWished ? <MdFavorite size={13} className="text-rose-500" /> : <MdFavoriteBorder size={13} />}
          {isWished ? "Saved to Wishlist" : "Save for Later"}
        </button>
      </div>
    </div>
  );
};

// ─── Main Cart Page ─────────────────────────────────────────────────────────────
const Cart = () => {
  const dispatch   = useDispatch();
  const navigate   = useNavigate();
  const { items }  = useSelector((s) => s.publicCart);
  const customer   = useSelector((s) => s.customerAuth?.user);
  const { s }      = useSettings();

  // Shipping config from settings (fallback to standard values)
  const freeShippingThreshold = Number(s("free_shipping_threshold", 499));
  const defaultShippingCharge = Number(s("default_shipping_charge", 49));

  // Live coupons from API (fallback empty so cart still works)
  const [liveCoupons, setLiveCoupons] = useState([]);

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const res = await GET(APIS.Customer.Coupons);
        setLiveCoupons(res?.data ?? []);
      } catch { /* silent — cart works without coupons */ }
    };
    if (customer) fetchCoupons();
  }, [customer]);

  const [couponInput,   setCouponInput]   = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError,   setCouponError]   = useState("");

  const subtotal  = items.reduce((s, i) => s + i.price * i.qty, 0);
  const mrpTotal  = items.reduce((s, i) => s + (i.mrp ?? i.price) * i.qty, 0);
  const savings   = mrpTotal - subtotal;

  const couponDiscount = appliedCoupon
    ? appliedCoupon.type === "percent" || appliedCoupon.discount_type === "percentage"
      ? Math.round(subtotal * (appliedCoupon.discount || appliedCoupon.discount_value) / 100)
      : Math.min(appliedCoupon.discount || appliedCoupon.discount_value, subtotal)
    : 0;

  const deliveryCharge = subtotal >= freeShippingThreshold ? 0 : defaultShippingCharge;
  const grandTotal     = subtotal - couponDiscount + deliveryCharge;

  // Merge live coupons (from API) with any locally applied coupon
  const displayCoupons = liveCoupons.length > 0 ? liveCoupons : [];

  const applyCoupon = () => {
    setCouponError("");
    const code = couponInput.trim().toLowerCase();
    // Search in live coupons first, then any local fallback
    const found = liveCoupons.find((c) => c.code.toLowerCase() === code);
    if (found) {
      const minOrder = found.min_order_amount || 0;
      if (subtotal < minOrder) {
        setCouponError(`Minimum order ₹${minOrder.toLocaleString()} required for this coupon`);
        return;
      }
      setAppliedCoupon(found);
      toast.success(`Coupon "${found.code}" applied!`);
    } else {
      setCouponError("Invalid or expired coupon code");
    }
  };

  const handlePlaceOrder = () => {
    if (!customer) {
      toast.error("Please login to place an order");
      navigate("/login", { state: { from: "/checkout" } });
      return;
    }
    navigate("/checkout");
  };

  // Empty cart
  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 px-4">
        <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center">
          <MdShoppingCart size={48} className="text-blue-300" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Your cart is empty</h2>
        <p className="text-gray-400 text-sm text-center max-w-xs">
          Looks like you haven't added anything yet. Start shopping!
        </p>
        <Link to="/fashion"
          className="mt-2 inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-bold px-6 py-3 rounded-xl transition-colors">
          <MdArrowBack size={18} /> Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-[1280px] mx-auto px-4 py-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <MdShoppingCart size={26} className="text-primary-600" />
            Shopping Cart
            <span className="text-base font-semibold text-gray-400">({items.length} {items.length === 1 ? "item" : "items"})</span>
          </h1>
          <button onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors">
            <MdArrowBack size={16} /> Back
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">

          {/* ── Left: Items + Coupons ── */}
          <div className="flex-1 min-w-0 space-y-4">

            {/* Delivery banner */}
            {subtotal < freeShippingThreshold && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 flex items-center gap-2">
                <MdLocalShipping size={18} className="text-amber-600 flex-shrink-0" />
                <p className="text-sm text-amber-700">
                  Add items worth <span className="font-bold">₹{(freeShippingThreshold - subtotal).toLocaleString()}</span> more for <span className="font-bold">FREE delivery</span>!
                </p>
              </div>
            )}
            {subtotal >= freeShippingThreshold && (
              <div className="bg-green-50 border border-green-200 rounded-2xl px-4 py-3 flex items-center gap-2">
                <MdCheck size={18} className="text-green-600 flex-shrink-0" />
                <p className="text-sm text-green-700 font-semibold">🎉 You've unlocked FREE delivery!</p>
              </div>
            )}

            {/* Cart items */}
            <div className="space-y-3">
              {items.map((item) => <CartItem key={`${item._id}-${item.selectedSize}-${item.selectedColor}`} item={item} />)}
            </div>

            {/* Coupon Section */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <p className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                <FaTag size={14} className="text-green-600" /> Apply Coupon
              </p>
              <div className="flex gap-2 mb-3">
                <input value={couponInput} onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  placeholder="Enter coupon code"
                  className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 font-mono uppercase"
                  onKeyDown={(e) => e.key === "Enter" && applyCoupon()}
                />
                <button onClick={applyCoupon}
                  className="px-5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold rounded-xl transition-colors">
                  Apply
                </button>
              </div>
              {couponError && <p className="text-red-500 text-xs mb-2">{couponError}</p>}
              {appliedCoupon && (
                <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-3 py-2 mb-3">
                  <p className="text-xs text-green-700 font-semibold">
                    ✅ "{appliedCoupon.code}" applied — You save ₹{couponDiscount.toLocaleString()}
                  </p>
                  <button onClick={() => { setAppliedCoupon(null); setCouponInput(""); }}
                    className="text-xs text-red-500 font-semibold hover:underline ml-2">Remove</button>
                </div>
              )}
              <div className="space-y-2">
                {displayCoupons.slice(0, 4).map((c) => (
                  <CouponChip
                    key={c._id || c.code}
                    coupon={c}
                    onCopy={(code) => { setCouponInput(code); toast.success(`Code "${code}" pasted!`); }}
                  />
                ))}
                {displayCoupons.length === 0 && (
                  <p className="text-xs text-gray-400 text-center py-2">
                    {customer ? "No coupons available right now" : "Login to see available coupons"}
                  </p>
                )}
              </div>
            </div>

            {/* Clear cart */}
            <div className="flex justify-end">
              <button onClick={() => { dispatch(clearCart()); toast.success("Cart cleared"); }}
                className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 font-medium">
                <MdDelete size={15} /> Clear Cart
              </button>
            </div>
          </div>

          {/* ── Right: Price Summary ── */}
          <div className="lg:w-80 flex-shrink-0 space-y-4">

            {/* Price details */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm sticky top-24">
              <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-4">Price Details</h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-700">
                  <span>Price ({items.length} {items.length === 1 ? "item" : "items"})</span>
                  <span className="font-medium">₹{mrpTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span className="font-semibold">− ₹{savings.toLocaleString()}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Coupon ({appliedCoupon.code})</span>
                    <span className="font-semibold">− ₹{couponDiscount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-700">
                  <span>Delivery Charges</span>
                  {deliveryCharge === 0
                    ? <span className="text-green-600 font-semibold">FREE</span>
                    : <span className="font-medium">₹{deliveryCharge}</span>
                  }
                </div>
                <div className="border-t border-dashed border-gray-200 pt-3 flex justify-between font-bold text-gray-900 text-base">
                  <span>Total Amount</span>
                  <span>₹{grandTotal.toLocaleString()}</span>
                </div>
              </div>

              {(savings + couponDiscount) > 0 && (
                <p className="mt-3 text-xs text-green-600 font-semibold bg-green-50 rounded-xl px-3 py-2 text-center">
                  🎉 You're saving ₹{(savings + couponDiscount).toLocaleString()} on this order!
                </p>
              )}

              <button onClick={handlePlaceOrder}
                className="mt-5 w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-200 active:scale-[0.98]">
                <MdFlashOn size={18} /> Place Order
              </button>

              {/* Trust badges */}
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <MdSecurity size={14} className="text-green-500" />
                  Safe and Secure Payments. Easy returns.
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <MdLocalShipping size={14} className="text-blue-500" />
                  {deliveryCharge === 0
                    ? "Free delivery on this order"
                    : `Free delivery on orders above ₹${freeShippingThreshold.toLocaleString()}`}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <MdLocalOffer size={14} className="text-amber-500" />
                  100% Original Products Guaranteed
                </div>
              </div>
            </div>

            {/* Wishlist shortcut */}
            <Link to="/wishlist"
              className="block bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-rose-50 rounded-xl flex items-center justify-center">
                    <MdFavorite size={18} className="text-rose-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">My Wishlist</p>
                    <p className="text-xs text-gray-400">View saved items</p>
                  </div>
                </div>
                <span className="text-primary-600 text-xs font-semibold">View →</span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
