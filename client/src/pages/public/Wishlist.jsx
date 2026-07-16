import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  MdFavorite, MdDelete, MdShoppingCart,
  MdArrowBack, MdFavoriteBorder,
} from "react-icons/md";
import {
  removeFromWishlist, clearWishlist,
  removeWishlistItemApi, moveToCartApi,
} from "../../features/public/publicWishlistSlice";
import { addToCart, loadServerCart } from "../../features/public/publicCartSlice";

const Wishlist = () => {
  const dispatch   = useDispatch();
  const navigate   = useNavigate();
  const { items, syncing } = useSelector((s) => s.publicWishlist);
  const isLoggedIn = useSelector((s) => s.customerAuth?.isLogin);

  // ── #3 Move to Cart ──────────────────────────────────────────────────────────
  const handleMoveToCart = (item) => {
    if (isLoggedIn && item.wishlistId) {
      // Server handles cart upsert + wishlist delete atomically
      dispatch(moveToCartApi(item.wishlistId))
        .unwrap()
        .then(() => {
          // Refresh server cart so Redux cart state stays in sync
          dispatch(loadServerCart([]));
          toast.success("Moved to cart!");
        })
        .catch(() => toast.error("Failed to move to cart"));
    } else {
      // Guest — local only
      dispatch(addToCart({ product: item, qty: 1 }));
      dispatch(removeFromWishlist(item._id));
      toast.success("Moved to cart!");
    }
  };

  // ── #4 Remove Item ───────────────────────────────────────────────────────────
  const handleRemove = (item) => {
    if (isLoggedIn && item.wishlistId) {
      dispatch(removeWishlistItemApi(item.wishlistId))
        .unwrap()
        .then(() => toast.success("Removed from wishlist"))
        .catch(() => toast.error("Failed to remove item"));
    } else {
      dispatch(removeFromWishlist(item._id));
      toast.success("Removed from wishlist");
    }
  };

  // ── Clear All (local only — no bulk-delete endpoint on server) ───────────────
  const handleClearAll = () => {
    dispatch(clearWishlist());
    toast.success("Wishlist cleared");
  };

  // ── Empty state ──────────────────────────────────────────────────────────────
  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 px-4">
        <div className="w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center">
          <MdFavoriteBorder size={48} className="text-rose-300" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Your wishlist is empty</h2>
        <p className="text-gray-400 text-sm text-center max-w-xs">
          Save items you love by clicking the heart icon on any product.
        </p>
        <Link to="/"
          className="mt-2 inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-bold px-6 py-3 rounded-xl transition-colors">
          <MdArrowBack size={18} /> Continue Shopping
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
            <MdFavorite size={26} className="text-rose-500" />
            My Wishlist
            <span className="text-base font-semibold text-gray-400">
              ({items.length} {items.length === 1 ? "item" : "items"})
            </span>
          </h1>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors">
              <MdArrowBack size={16} /> Back
            </button>
            <button onClick={handleClearAll} disabled={syncing}
              className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 font-semibold border border-red-200 hover:border-red-400 px-3 py-1.5 rounded-xl transition-colors disabled:opacity-50">
              <MdDelete size={15} /> Clear All
            </button>
          </div>
        </div>

        {/* Syncing indicator */}
        {syncing && (
          <div className="mb-4 flex items-center gap-2 text-xs text-primary-600 font-medium">
            <div className="w-3.5 h-3.5 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
            Syncing wishlist…
          </div>
        )}

        {/* Product Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {items.map((item) => {
            const disc = item.mrp && item.mrp > item.price
              ? Math.round(((item.mrp - item.price) / item.mrp) * 100)
              : (item.discount_percent ?? 0);

            return (
              <div key={item.wishlistId ?? item._id}
                className={`bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group ${syncing ? "opacity-70 pointer-events-none" : ""}`}>

                {/* Image */}
                <Link to={`/product/${item._id}`}
                  className="relative h-44 bg-gray-50 flex items-center justify-center overflow-hidden">
                  {item.img
                    ? <img src={item.img} alt={item.name}
                        className="w-full h-full object-contain p-2"
                        onError={(e) => { e.currentTarget.style.display = "none"; }} />
                    : <span className="text-6xl">🛍️</span>
                  }

                  {disc > 0 && (
                    <span className="absolute top-2 left-2 text-[10px] bg-green-100 text-green-700 font-bold px-1.5 py-0.5 rounded-lg">
                      {disc}% off
                    </span>
                  )}

                  {/* Hover remove button */}
                  <button
                    onClick={(e) => { e.preventDefault(); handleRemove(item); }}
                    className="absolute bottom-2 right-2 w-7 h-7 bg-white rounded-full shadow flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50">
                    <MdDelete size={14} className="text-red-500" />
                  </button>
                </Link>

                {/* Info */}
                <div className="p-3 flex flex-col flex-1">
                  {item.brand && (
                    <p className="text-[11px] text-gray-400 font-medium">{item.brand}</p>
                  )}
                  <Link to={`/product/${item._id}`}
                    className="text-sm font-semibold text-gray-800 line-clamp-2 flex-1 mt-0.5 hover:text-primary-600 transition-colors">
                    {item.name}
                  </Link>

                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-base font-bold text-gray-900">
                      ₹{item.price?.toLocaleString()}
                    </span>
                    {item.mrp > item.price && (
                      <span className="text-xs text-gray-400 line-through">
                        ₹{item.mrp?.toLocaleString()}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="mt-3 flex gap-2">
                    <button onClick={() => handleMoveToCart(item)}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold py-2.5 rounded-xl transition-colors">
                      <MdShoppingCart size={14} />
                      {isLoggedIn ? "Move to Cart" : "Add to Cart"}
                    </button>
                    <button onClick={() => handleRemove(item)}
                      className="w-9 h-9 flex items-center justify-center border border-gray-200 rounded-xl hover:border-red-300 hover:bg-red-50 transition-colors flex-shrink-0">
                      <MdDelete size={15} className="text-gray-400 hover:text-red-500" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-8 text-center">
          <Link to="/"
            className="inline-flex items-center gap-2 text-sm text-primary-600 font-semibold hover:underline">
            <MdArrowBack size={16} /> Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Wishlist;
