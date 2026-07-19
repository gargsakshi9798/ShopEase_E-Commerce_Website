import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  MdShoppingBag, MdFavoriteBorder, MdLocationOn, MdLocalOffer,
  MdStar, MdNotifications, MdSettings, MdArrowForward,
  MdVerified, MdCardGiftcard, MdSecurity,
  MdCheckCircle, MdLocalShipping, MdPendingActions,
  MdRefresh, MdCancel, MdEdit, MdHistory, MdThumbUp,
} from "react-icons/md";
import AccountLayout from "../../components/public/layout/AccountLayout";
import { fetchMyOrders } from "../../features/public/publicOrderSlice";
import { fetchCustomerProfile } from "../../features/public/publicProfileSlice";
import { fetchCustomerNotifications } from "../../features/public/publicNotificationSlice";
import { fetchAddresses } from "../../features/public/publicAddressSlice";
import { fetchHomeData } from "../../features/public/publicHomeSlice";
import { formatDate, formatCurrency, getImgUrl } from "../../utils/Methods";
import useRecentlyViewed from "../../hooks/useRecentlyViewed";

// ── Status badge config ───────────────────────────────────────────────────────
const statusConfig = {
  pending:          { label: "Pending",       icon: MdPendingActions, color: "bg-amber-50 text-amber-700 border-amber-200" },
  confirmed:        { label: "Confirmed",     icon: MdCheckCircle,    color: "bg-blue-50 text-blue-700 border-blue-200" },
  processing:       { label: "Processing",    icon: MdRefresh,        color: "bg-purple-50 text-purple-700 border-purple-200" },
  packed:           { label: "Packed",        icon: MdShoppingBag,    color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  shipped:          { label: "Shipped",       icon: MdLocalShipping,  color: "bg-blue-50 text-blue-700 border-blue-200" },
  out_for_delivery: { label: "Out for Delivery", icon: MdLocalShipping, color: "bg-cyan-50 text-cyan-700 border-cyan-200" },
  delivered:        { label: "Delivered",     icon: MdCheckCircle,    color: "bg-green-50 text-green-700 border-green-200" },
  cancelled:        { label: "Cancelled",     icon: MdCancel,         color: "bg-red-50 text-red-600 border-red-200" },
  returned:         { label: "Returned",      icon: MdRefresh,        color: "bg-gray-100 text-gray-600 border-gray-200" },
};

const StatusBadge = ({ status }) => {
  const cfg  = statusConfig[status?.toLowerCase()] ?? statusConfig.pending;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${cfg.color}`}>
      <Icon size={11} /> {cfg.label}
    </span>
  );
};

// ── Shared small product card (used by both sections) ────────────────────────
const ProductCard = ({ product, showBadge = null }) => {
  const disc = product.mrp > product.price
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
    : 0;
  const dest = product.slug ? `/products/${product.slug}` : "/products";
  return (
    <Link to={dest}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all group flex flex-col overflow-hidden">
      {/* Image */}
      <div className="relative h-32 bg-gray-50 flex items-center justify-center overflow-hidden">
        {product.thumbnail
          ? <img
              src={getImgUrl(product.thumbnail)}
              alt={product.name}
              className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
              onError={(e) => { e.currentTarget.style.display = "none"; e.currentTarget.parentElement.innerText = "🛒"; }}
            />
          : <span className="text-4xl">🛒</span>}
        {showBadge && (
          <span className="absolute top-2 left-2 text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-full bg-primary-600 text-white tracking-wide">
            {showBadge}
          </span>
        )}
        {disc > 0 && (
          <span className="absolute top-2 right-2 text-[9px] font-extrabold bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">
            {disc}% off
          </span>
        )}
      </div>
      {/* Info */}
      <div className="p-3 flex-1 flex flex-col gap-1">
        <p className="text-[10px] text-gray-400 font-medium truncate">{product.brand_name || product.brand || ""}</p>
        <p className="text-xs font-bold text-gray-800 leading-tight line-clamp-2 group-hover:text-primary-600 transition-colors">
          {product.name}
        </p>
        <div className="flex items-baseline gap-1.5 mt-auto pt-1">
          <span className="text-sm font-extrabold text-gray-900">₹{Number(product.price || 0).toLocaleString("en-IN")}</span>
          {product.mrp > product.price && (
            <span className="text-[10px] text-gray-400 line-through">₹{Number(product.mrp).toLocaleString("en-IN")}</span>
          )}
        </div>
      </div>
    </Link>
  );
};

// ── Quick link cards ──────────────────────────────────────────────────────────
const quickLinks = [
  { icon: <MdShoppingBag size={24} className="text-blue-600"/>,     label:"My Orders",       sub:"Track & manage",       path:"/my-orders",    bg:"bg-blue-50 border-blue-100"     },
  { icon: <MdFavoriteBorder size={24} className="text-rose-600"/>,  label:"My Wishlist",     sub:"Saved items",           path:"/wishlist",     bg:"bg-rose-50 border-rose-100"     },
  { icon: <MdLocationOn size={24} className="text-green-600"/>,     label:"My Addresses",    sub:"Delivery addresses",    path:"/my-addresses", bg:"bg-green-50 border-green-100"   },
  { icon: <MdLocalOffer size={24} className="text-orange-600"/>,    label:"My Coupons",      sub:"Discount codes",        path:"/my-coupons",   bg:"bg-orange-50 border-orange-100" },
  { icon: <MdStar size={24} className="text-amber-500"/>,           label:"My Reviews",      sub:"Ratings & feedback",    path:"/my-reviews",   bg:"bg-amber-50 border-amber-100"   },
  { icon: <MdNotifications size={24} className="text-purple-600"/>, label:"Notifications",   sub:"Alerts & updates",      path:"/notifications",bg:"bg-purple-50 border-purple-100" },
  { icon: <MdCardGiftcard size={24} className="text-pink-600"/>,    label:"Gift Cards",      sub:"Buy & redeem",          path:"/gift-cards",   bg:"bg-pink-50 border-pink-100"     },
  { icon: <MdSettings size={24} className="text-slate-600"/>,       label:"Settings",        sub:"Password & prefs",      path:"/my-settings",  bg:"bg-slate-50 border-slate-100"   },
];

// ── Main Component ────────────────────────────────────────────────────────────
const MyAccount = () => {
  const dispatch = useDispatch();

  // ── Selectors ───────────────────────────────────────────────────────────────
  const customer      = useSelector((s) => s.customerAuth?.user ?? null);
  const profile       = useSelector((s) => s.publicProfile?.profile ?? null);
  const { orders, total: totalOrders, status: orderStatus } = useSelector((s) => s.publicOrder);
  const { addresses }  = useSelector((s) => s.publicAddress);
  const { unread }     = useSelector((s) => s.publicNotification);
  const wishlistCount  = useSelector((s) => s.publicWishlist?.count ?? 0);
  const cartCount      = useSelector((s) => s.publicCart?.count ?? 0);

  // Home data for recommendations
  const { best_sellers, trending, status: homeStatus } = useSelector((s) => s.publicHome);

  // Recently viewed from localStorage
  const { items: recentlyViewed } = useRecentlyViewed();

  // Recommendations: merge best_sellers + trending, deduplicate, cap at 8
  const recommended = (() => {
    const seen = new Set();
    return [...(best_sellers ?? []), ...(trending ?? [])]
      .filter((p) => { if (seen.has(p._id)) return false; seen.add(p._id); return true; })
      .slice(0, 8);
  })();

  // ── Fetch on mount ──────────────────────────────────────────────────────────
  useEffect(() => {
    dispatch(fetchCustomerProfile());
    dispatch(fetchMyOrders({ page: 1, per_page: 5 }));
    dispatch(fetchCustomerNotifications({ page: 1, per_page: 1 }));
    dispatch(fetchAddresses());
    // Only fetch home data if not already loaded
    if (homeStatus === "idle") dispatch(fetchHomeData());
  }, [dispatch]);

  const displayUser = profile ?? customer;
  const initials    = displayUser?.name?.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() || "U";

  // Derive order stats from the fetched list
  const delivered = orders.filter((o) => o.order_status === "delivered").length;
  const active    = orders.filter((o) => !["delivered","cancelled","returned"].includes(o.order_status)).length;

  // Recent 3
  const recentOrders = orders.slice(0, 3);

  return (
    <AccountLayout>
      <div className="space-y-5">

        {/* ── Profile Hero ──────────────────────────────────────────────── */}
        <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-indigo-700 rounded-3xl p-6 text-white relative overflow-hidden">
          {/* decorative blobs */}
          <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />

          <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Avatar */}
            <div className="w-18 h-18 flex-shrink-0">
              {displayUser?.profile_image ? (
                <img src={displayUser.profile_image} alt="avatar"
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-white/40" />
              ) : (
                <div className="w-16 h-16 bg-white/20 border-2 border-white/40 rounded-2xl flex items-center justify-center text-2xl font-extrabold">
                  {initials}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-extrabold">{displayUser?.name || "Customer"}</h1>
                <span className="flex items-center gap-1 bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  <MdVerified size={11} /> Verified
                </span>
              </div>
              <p className="text-white/70 text-xs mt-0.5">{displayUser?.email}</p>
              <p className="text-white/60 text-xs mt-0.5">{displayUser?.phone || displayUser?.contact_no || ""}</p>

              {/* Stat chips */}
              <div className="flex flex-wrap gap-2 mt-3">
                {[
                  { label: `${totalOrders} Orders`,       icon: "📦" },
                  { label: `${wishlistCount} Wishlisted`, icon: "❤️" },
                  { label: `${cartCount} In Cart`,        icon: "🛒" },
                  { label: "Gold Member",                  icon: "🏆" },
                ].map((s) => (
                  <span key={s.label}
                    className="flex items-center gap-1 bg-white/15 border border-white/20 rounded-full px-2.5 py-0.5 text-[11px] font-semibold">
                    {s.icon} {s.label}
                  </span>
                ))}
              </div>
            </div>

            {/* Edit button */}
            <Link to="/my-profile"
              className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 border border-white/30 text-white font-bold px-3 py-2 rounded-xl text-xs transition-colors flex-shrink-0">
              <MdEdit size={13} /> Edit Profile
            </Link>
          </div>
        </div>

        {/* ── Stats Row ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total Orders",    value: totalOrders, icon: "📦", color: "text-blue-600",   bg: "bg-blue-50" },
            { label: "Active",          value: active,      icon: "🚚", color: "text-indigo-600", bg: "bg-indigo-50" },
            { label: "Delivered",       value: delivered,   icon: "✅", color: "text-green-600",  bg: "bg-green-50" },
            { label: "Notifications",   value: unread,      icon: "🔔", color: "text-purple-600", bg: "bg-purple-50" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
              <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center text-lg flex-shrink-0`}>
                {s.icon}
              </div>
              <div>
                <p className={`text-xl font-extrabold ${s.color}`}>{s.value}</p>
                <p className="text-[11px] text-gray-400">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Quick Actions ──────────────────────────────────────────────── */}
        <section>
          <h2 className="text-sm font-extrabold text-gray-700 uppercase tracking-wider mb-3">Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {quickLinks.map((l) => (
              <Link key={l.path} to={l.path}
                className={`${l.bg} border rounded-2xl p-4 flex flex-col gap-2 hover:shadow-md hover:-translate-y-0.5 transition-all group`}>
                {l.icon}
                <div>
                  <p className="text-sm font-extrabold text-gray-900 group-hover:text-primary-600 transition-colors leading-tight">{l.label}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">{l.sub}</p>
                </div>
                <MdArrowForward size={13} className="text-gray-300 group-hover:text-primary-500 self-end transition-colors" />
              </Link>
            ))}
          </div>
        </section>

        {/* ── Recent Orders ──────────────────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-extrabold text-gray-700 uppercase tracking-wider">Recent Orders</h2>
            <Link to="/my-orders" className="text-xs text-primary-600 font-semibold hover:underline flex items-center gap-1">
              View All <MdArrowForward size={13} />
            </Link>
          </div>

          {orderStatus === "loading" && (
            <div className="bg-white rounded-2xl border border-gray-100 p-8 flex justify-center">
              <div className="w-7 h-7 border-3 border-primary-600 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {orderStatus !== "loading" && recentOrders.length === 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
              <div className="text-4xl mb-2">📦</div>
              <p className="text-gray-500 font-semibold text-sm">No orders yet</p>
              <p className="text-gray-400 text-xs mt-1">Your recent orders will appear here</p>
              <Link to="/" className="mt-3 inline-block text-xs bg-primary-600 hover:bg-primary-700 text-white font-bold px-4 py-2 rounded-xl transition-colors">
                Start Shopping
              </Link>
            </div>
          )}

          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div key={order._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div>
                    <p className="text-[10px] text-gray-400">Order No.</p>
                    <p className="text-sm font-bold text-gray-800 font-mono">
                      #{order.order_number || order._id?.slice(-8).toUpperCase()}
                    </p>
                  </div>
                  <StatusBadge status={order.order_status} />
                </div>

                {/* First item preview */}
                {order.items?.[0] && (
                  <div className="flex items-center gap-3 py-2 border-y border-gray-50">
                    <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {order.items[0].product_image
                        ? <img
                            src={order.items[0].product_image}
                            alt=""
                            className="w-full h-full object-cover"
                            onError={(e) => { e.currentTarget.style.display = "none"; e.currentTarget.parentElement.innerText = "📦"; }}
                          />
                        : <span className="text-lg">📦</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-800 truncate">{order.items[0].product_name || "Product"}</p>
                      <p className="text-[11px] text-gray-400">
                        Qty: {order.items[0].quantity}
                        {order.items.length > 1 && ` · +${order.items.length - 1} more`}
                      </p>
                    </div>
                    <p className="text-sm font-extrabold text-gray-900 flex-shrink-0">
                      {formatCurrency ? formatCurrency(order.total_amount) : `₹${order.total_amount?.toLocaleString()}`}
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between mt-2.5">
                  <p className="text-[11px] text-gray-400">
                    {formatDate ? formatDate(order.createdAt) : new Date(order.createdAt).toLocaleDateString("en-IN")}
                  </p>
                  <Link to={`/my-orders/${order._id}`}
                    className="flex items-center gap-1 text-xs text-primary-600 font-semibold hover:underline">
                    Details <MdArrowForward size={12} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Recently Viewed ────────────────────────────────────────── */}
        {recentlyViewed.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-extrabold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                <MdHistory size={16} className="text-primary-500" /> Recently Viewed
              </h2>
              <span className="text-[11px] text-gray-400">{recentlyViewed.length} item{recentlyViewed.length !== 1 ? "s" : ""}</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {recentlyViewed.slice(0, 8).map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </section>
        )}

        {/* ── Recommended For You ────────────────────────────────────── */}
        {(recommended.length > 0 || homeStatus === "loading") && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-extrabold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                <MdThumbUp size={16} className="text-primary-500" /> Recommended For You
              </h2>
              <Link to="/products" className="text-xs text-primary-600 font-semibold hover:underline flex items-center gap-1">
                Browse All <MdArrowForward size={13} />
              </Link>
            </div>

            {homeStatus === "loading" && recommended.length === 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-gray-100 h-48 animate-pulse" />
                ))}
              </div>
            )}

            {recommended.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {recommended.map((p, i) => (
                  <ProductCard
                    key={p._id}
                    product={p}
                    showBadge={i < (best_sellers?.length ?? 0) ? "Best Seller" : "Trending"}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {/* ── Bottom Row: Security + Loyalty ────────────────────────────── */}
        <div className="grid sm:grid-cols-2 gap-4">

          {/* Account Security */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 bg-green-50 border border-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <MdSecurity size={18} className="text-green-600" />
              </div>
              <div>
                <p className="text-sm font-extrabold text-gray-900">Account Security</p>
                <p className="text-[11px] text-gray-400">Keep your account safe</p>
              </div>
            </div>
            <div className="space-y-2.5">
              {[
                { label: "Email Verified",    done: true },
                { label: "Phone Linked",      done: !!(displayUser?.phone || displayUser?.contact_no) },
                { label: "Two-Factor Auth",   done: false },
                { label: "Strong Password",   done: true },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">{item.label}</span>
                  <span className={`font-bold ${item.done ? "text-green-600" : "text-amber-500"}`}>
                    {item.done ? "✓ Done" : "Set up"}
                  </span>
                </div>
              ))}
            </div>
            <Link to="/my-settings"
              className="mt-4 block text-center text-xs font-bold text-primary-600 hover:underline border-t border-gray-50 pt-3">
              Manage Security →
            </Link>
          </div>

          {/* Loyalty / Addresses */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 bg-amber-50 border border-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-lg">🏆</span>
              </div>
              <div>
                <p className="text-sm font-extrabold text-gray-900">Loyalty Status</p>
                <p className="text-[11px] text-amber-600 font-semibold">Gold Member</p>
              </div>
            </div>
            <div className="mb-3">
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-gray-500">2,450 points</span>
                <span className="text-gray-400">Platinum at 5,000</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full" style={{ width: "49%" }} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center mb-3">
              {[["2,450","Points"],["₹245","Worth"],[`${addresses.length}`,"Addresses"]].map(([v, l]) => (
                <div key={l} className="bg-amber-50 rounded-xl py-2">
                  <p className="text-sm font-extrabold text-amber-700">{v}</p>
                  <p className="text-[10px] text-gray-500">{l}</p>
                </div>
              ))}
            </div>
            <Link to="/my-coupons"
              className="block text-center text-xs font-bold text-primary-600 hover:underline border-t border-gray-50 pt-3">
              View Rewards →
            </Link>
          </div>
        </div>

      </div>
    </AccountLayout>
  );
};

export default MyAccount;
