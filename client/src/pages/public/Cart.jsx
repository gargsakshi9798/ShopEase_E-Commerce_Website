import { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  MdShoppingCart, MdDelete, MdArrowBack,
  MdLocalShipping, MdLocalOffer, MdSecurity,
  MdCheck, MdContentCopy, MdFlashOn, MdBookmark, MdBookmarkBorder,
} from "react-icons/md";
import { FaTag } from "react-icons/fa";
import { MdFavoriteBorder, MdFavorite } from "react-icons/md";
import {
  addToCart, updateQty, removeFromCart, clearCart,
  updateQtyApi, removeItemApi, saveForLaterApi, clearCartApi,
} from "../../features/public/publicCartSlice";
import { toggleWishlist } from "../../features/public/publicWishlistSlice";
import { GET } from "../../utils/Methods";
import { APIS } from "../../utils/APIS";
import { useSettings } from "../../hooks/useSettings";

// ─── Coupon Chip ──────────────────────────────────────────────────────────────
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

// ─── Cart Item Row ────────────────────────────────────────────────────────────
const CartItem = ({ item, isLoggedIn }) => {
  const dispatch = useDispatch();
  const { syncing } = useSelector((s) => s.publicCart);
  const wishlist = useSelector((s) => s.publicWishlist.items);
  const isWished = wishlist.some((w) => w._id === item._id);

  // #4 Update Quantity — API for logged-in, local for guest
  const handleQtyChange = useCallback((newQty) => {
    if (newQty < 1) return;
    if (isLoggedIn && item.cartItemId) {
      dispatch(updateQtyApi({ cartItemId: item.cartItemId, qty: newQty }))
        .unwrap()
        .catch(() => toast.error("Failed to update quantity"));
    } else {
      dispatch(updateQty({ id: item._id, qty: newQty }));
    }
  }, [dispatch, isLoggedIn, item]);

  // #5 Remove Item — API for logged-in, local for guest
  const handleRemove = useCallback(() => {
    if (isLoggedIn && item.cartItemId) {
      dispatch(removeItemApi(item.cartItemId))
        .unwrap()
        .then(() => toast.success("Item removed"))
        .catch(() => toast.error("Failed to remove item"));
    } else {
      dispatch(removeFromCart(item._id));
      toast.success("Item removed from cart");
    }
  }, [dispatch, isLoggedIn, item]);

  // #6 Save For Later — API for logged-in, wishlist toggle for guest
  const handleSaveForLater = useCallback(() => {
    if (isLoggedIn && item.cartItemId) {
      dispatch(saveForLaterApi(item.cartItemId))
        .unwrap()
        .then(() => toast.success(item.saved_for_later ? "Moved back to cart" : "Saved for later"))
        .catch(() => toast.error("Failed to save for later"));
    } else {
      dispatch(toggleWishlist(item));
      toast.success(isWished ? "Removed from wishlist" : "Saved to wishlist!");
    }
  }, [dispatch, isLoggedIn, item, isWished]);

  const itemTotal = item.price * (item.qty ?? 1);

  return (
    <div className={`bg-white rounded-2xl border p-4 flex gap-4 shadow-sm transition-opacity ${syncing ? "opacity-70 pointer-events-none" : "border-gray-100"}`}>
      {/* Image */}
      <Link to={`/product/${item._id}`}
        className="w-24 h-24 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0 hover:opacity-90 transition-opacity overflow-hidden">
        {item.img
          ? <img src={item.img} alt={item.name} className="w-full h-full object-contain p-1" onError={(e) => { e.currentTarget.style.display = "none"; }} />
          : <span className="text-4xl">🛒</span>}
      </Link>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            {item.brand && <p className="text-[11px] text-gray-400 font-medium">{item.brand}</p>}
            <Link to={`/product/${item._id}`}
              className="text-sm font-semibold text-gray-800 hover:text-primary-600 line-clamp-2">
              {item.name}
            </Link>
            {/* #4 Handle deleted / unavailable products */}
            {item.status === false && (
              <span className="inline-flex items-center gap-1 mt-1 text-[11px] font-semibold text-red-500 bg-red-50 border border-red-100 px-2 py-0.5 rounded-lg">
                ⚠ No longer available — please remove
              </span>
            )}
            {/* #3 Out of stock badge (product still active but stock = 0) */}
            {item.status !== false && item.stock === 0 && (
              <span className="inline-flex items-center gap-1 mt-1 text-[11px] font-semibold text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-lg">
                Out of stock
              </span>
            )}
          </div>
          <button onClick={handleRemove} disabled={syncing}
            className="w-7 h-7 flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0">
            <MdDelete size={16} />
          </button>
        </div>

        {/* Price + Qty row */}
        <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-gray-900">₹{itemTotal.toLocaleString()}</span>
            {(item.qty ?? 1) > 1 && (
              <span className="text-xs text-gray-400">(₹{item.price.toLocaleString()} × {item.qty})</span>
            )}
            {item.mrp > item.price && (
              <span className="text-xs text-gray-400 line-through">₹{(item.mrp * (item.qty ?? 1)).toLocaleString()}</span>
            )}
          </div>
          {/* Qty control — disabled for unavailable/out-of-stock items */}
          <div className={`flex items-center border rounded-xl overflow-hidden ${item.status === false || item.stock === 0 ? "border-gray-100 opacity-40 pointer-events-none" : "border-gray-200"}`}>
            <button onClick={() => handleQtyChange((item.qty ?? 1) - 1)} disabled={syncing}
              className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors font-bold">−</button>
            <span className="w-8 text-center text-sm font-bold">{item.qty ?? 1}</span>
            <button onClick={() => handleQtyChange((item.qty ?? 1) + 1)}
              disabled={syncing || ((item.qty ?? 1) >= (item.stock ?? Infinity))}
              className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors font-bold disabled:opacity-40">+</button>
          </div>
        </div>

        {/* Save for Later */}
        <button onClick={handleSaveForLater} disabled={syncing}
          className="mt-2 flex items-center gap-1 text-xs text-gray-400 hover:text-primary-600 transition-colors">
          {isLoggedIn
            ? item.saved_for_later
              ? <><MdBookmark size={13} className="text-primary-600" /> Move to Cart</>
              : <><MdBookmarkBorder size={13} /> Save for Later</>
            : isWished
              ? <><MdFavorite size={13} className="text-rose-500" /> Saved to Wishlist</>
              : <><MdFavoriteBorder size={13} /> Save for Later</>
          }
        </button>
      </div>
    </div>
  );
};

// ─── Main Cart Page ───────────────────────────────────────────────────────────
const Cart = () => {
  const dispatch   = useDispatch();
  const navigate   = useNavigate();
  const { items, syncing } = useSelector((s) => s.publicCart);
  const customer   = useSelector((s) => s.customerAuth?.user);
  const isLoggedIn = useSelector((s) => s.customerAuth?.isLogin);
  const { s }      = useSettings();

  const freeShippingThreshold = Number(s("free_shipping_threshold", 499));
  const defaultShippingCharge = Number(s("default_shipping_charge", 49));

  // Split items into active cart and saved-for-later
  const activeItems = items.filter((i) => !i.saved_for_later);
  const savedItems  = items.filter((i) => i.saved_for_later);

  // #3 + #4 Separate unavailable items so they're excluded from pricing
  const orderableItems     = activeItems.filter((i) => i.status !== false && i.stock !== 0);
  const unavailableItems   = activeItems.filter((i) => i.status === false || i.stock === 0);

  // Live coupons from API
  const [liveCoupons,   setLiveCoupons]   = useState([]);
  const [couponInput,   setCouponInput]   = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError,   setCouponError]   = useState("");

  useEffect(() => {
    if (!customer) return;
    GET(APIS.Customer.Coupons)
      .then((res) => setLiveCoupons(res?.data ?? []))
      .catch(() => {});
  }, [customer]);

  const subtotal = orderableItems.reduce((sum, i) => sum + i.price * (i.qty ?? 1), 0);
  const mrpTotal = orderableItems.reduce((sum, i) => sum + (i.mrp ?? i.price) * (i.qty ?? 1), 0);
  const savings  = mrpTotal - subtotal;

  const couponDiscount = appliedCoupon
    ? appliedCoupon.discount_type === "percentage"
      ? Math.min(
          Math.round(subtotal * appliedCoupon.discount_value / 100),
          appliedCoupon.max_discount_amount || Infinity
        )
      : Math.min(appliedCoupon.discount_value, subtotal)
    : 0;

  const deliveryCharge = subtotal >= freeShippingThreshold ? 0 : defaultShippingCharge;
  const grandTotal     = subtotal - couponDiscount + deliveryCharge;

  const applyCoupon = () => {
    setCouponError("");
    const code  = couponInput.trim().toLowerCase();
    const found = liveCoupons.find((c) => c.code.toLowerCase() === code);
    if (found) {
      const minOrder = found.min_order_amount || 0;
      if (subtotal < minOrder) {
        setCouponError(`Minimum order ₹${minOrder.toLocaleString()} required`);
        return;
      }
      setAppliedCoupon(found);
      toast.success(`Coupon "${found.code}" applied!`);
    } else {
      setCouponError("Invalid or expired coupon code");
    }
  };

  // #7 Clear Cart — API for logged-in, local for guest
  const handleClearCart = () => {
    if (isLoggedIn) {
      dispatch(clearCartApi())
        .unwrap()
        .then(() => toast.success("Cart cleared"))
        .catch(() => toast.error("Failed to clear cart"));
    } else {
      dispatch(clearCart());
      toast.success("Cart cleared");
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

  // Empty active cart
  if (activeItems.length === 0 && savedItems.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 px-4">
        <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center">
          <MdShoppingCart size={48} className="text-blue-300" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Your cart is empty</h2>
        <p className="text-gray-400 text-sm text-center max-w-xs">
          Looks like you haven't added anything yet. Start shopping!
        </p>
        <Link to="/"
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
            <span className="text-base font-semibold text-gray-400">
              ({orderableItems.length} {orderableItems.length === 1 ? "item" : "items"})
            </span>
          </h1>
          <button onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors">
            <MdArrowBack size={16} /> Back
          </button>
        </div>

        {/* Syncing indicator */}
        {syncing && (
          <div className="mb-3 flex items-center gap-2 text-xs text-primary-600 font-medium">
            <div className="w-3.5 h-3.5 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
            Syncing cart…
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6">

          {/* ── Left column ── */}
          <div className="flex-1 min-w-0 space-y-4">

            {/* Free delivery banner */}
            {subtotal > 0 && subtotal < freeShippingThreshold && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 flex items-center gap-2">
                <MdLocalShipping size={18} className="text-amber-600 flex-shrink-0" />
                <p className="text-sm text-amber-700">
                  Add <span className="font-bold">₹{(freeShippingThreshold - subtotal).toLocaleString()}</span> more for <span className="font-bold">FREE delivery</span>!
                </p>
              </div>
            )}
            {subtotal >= freeShippingThreshold && subtotal > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-2xl px-4 py-3 flex items-center gap-2">
                <MdCheck size={18} className="text-green-600 flex-shrink-0" />
                <p className="text-sm text-green-700 font-semibold">🎉 You've unlocked FREE delivery!</p>
              </div>
            )}

            {/* Active cart items */}
            {activeItems.length > 0 && (
              <div className="space-y-3">
                {activeItems.map((item) => (
                  <CartItem key={`${item._id}-${item.cartItemId ?? ""}`} item={item} isLoggedIn={isLoggedIn} />
                ))}
              </div>
            )}

            {/* ── #6 Saved for Later section ── */}
            {savedItems.length > 0 && (
              <div>
                <h2 className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-1.5">
                  <MdBookmark size={16} className="text-primary-500" />
                  Saved for Later ({savedItems.length})
                </h2>
                <div className="space-y-3">
                  {savedItems.map((item) => (
                    <CartItem key={`saved-${item._id}-${item.cartItemId ?? ""}`} item={item} isLoggedIn={isLoggedIn} />
                  ))}
                </div>
              </div>
            )}

            {/* Coupon Section */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <p className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                <FaTag size={14} className="text-green-600" /> Apply Coupon
              </p>
              <div className="flex gap-2 mb-3">
                <input value={couponInput} onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  placeholder="Enter coupon code"
                  className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 font-mono uppercase"
                  onKeyDown={(e) => e.key === "Enter" && applyCoupon()} />
                <button onClick={applyCoupon}
                  className="px-5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold rounded-xl transition-colors">
                  Apply
                </button>
              </div>
              {couponError && <p className="text-red-500 text-xs mb-2">{couponError}</p>}
              {appliedCoupon && (
                <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-3 py-2 mb-3">
                  <p className="text-xs text-green-700 font-semibold">
                    ✅ "{appliedCoupon.code}" — You save ₹{couponDiscount.toLocaleString()}
                  </p>
                  <button onClick={() => { setAppliedCoupon(null); setCouponInput(""); }}
                    className="text-xs text-red-500 font-semibold hover:underline ml-2">Remove</button>
                </div>
              )}
              <div className="space-y-2">
                {liveCoupons.slice(0, 4).map((c) => (
                  <CouponChip key={c._id || c.code} coupon={c}
                    onCopy={(code) => { setCouponInput(code); toast.success(`Code "${code}" pasted!`); }} />
                ))}
                {liveCoupons.length === 0 && (
                  <p className="text-xs text-gray-400 text-center py-2">
                    {customer ? "No coupons available right now" : "Login to see available coupons"}
                  </p>
                )}
              </div>
            </div>

            {/* Clear cart */}
            {activeItems.length > 0 && (              <div className="flex justify-end">
                <button onClick={handleClearCart} disabled={syncing}
                  className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 font-medium disabled:opacity-50">
                  <MdDelete size={15} /> Clear Cart
                </button>
              </div>
            )}
          </div>

          {/* ── Right column — Order Summary ── */}
          <div className="lg:w-[360px] flex-shrink-0 space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm sticky top-24">
              <h2 className="text-base font-bold text-gray-800 mb-4">Order Summary</h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({orderableItems.length} items)</span>
                  <span className="font-semibold text-gray-900">₹{subtotal.toLocaleString()}</span>
                </div>

                {savings > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span className="font-semibold">−₹{savings.toLocaleString()}</span>
                  </div>
                )}

                {couponDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Coupon ({appliedCoupon?.code})</span>
                    <span className="font-semibold">−₹{couponDiscount.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between text-gray-600">
                  <span className="flex items-center gap-1">
                    <MdLocalShipping size={14} /> Delivery
                  </span>
                  {deliveryCharge === 0
                    ? <span className="font-semibold text-green-600">FREE</span>
                    : <span className="font-semibold text-gray-900">₹{deliveryCharge}</span>
                  }
                </div>

                <div className="border-t border-gray-100 pt-3 flex justify-between">
                  <span className="font-bold text-gray-900 text-base">Total</span>
                  <span className="font-bold text-gray-900 text-lg">₹{grandTotal.toLocaleString()}</span>
                </div>

                {(savings + couponDiscount) > 0 && (
                  <div className="bg-green-50 rounded-xl px-3 py-2 text-center">
                    <p className="text-xs text-green-700 font-semibold">
                      🎉 You're saving ₹{(savings + couponDiscount).toLocaleString()} on this order!
                    </p>
                  </div>
                )}
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={orderableItems.length === 0 || syncing}
                className="mt-5 w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <MdFlashOn size={18} />
                {isLoggedIn ? "Proceed to Checkout" : "Login to Checkout"}
              </button>
              {unavailableItems.length > 0 && (
                <p className="mt-2 text-xs text-red-500 text-center">
                  ⚠ {unavailableItems.length} item{unavailableItems.length > 1 ? "s are" : " is"} unavailable and excluded from checkout
                </p>
              )}

              {/* Trust badges */}
              <div className="mt-4 flex items-center justify-center gap-4 text-[11px] text-gray-400">
                <span className="flex items-center gap-1"><MdSecurity size={13} /> Secure Checkout</span>
                <span className="flex items-center gap-1"><MdLocalOffer size={13} /> Best Prices</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Cart;
