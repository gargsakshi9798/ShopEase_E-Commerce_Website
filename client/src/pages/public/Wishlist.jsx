import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  MdFavorite, MdDelete, MdShoppingCart,
  MdArrowBack, MdFavoriteBorder,
} from "react-icons/md";
import { removeFromWishlist, clearWishlist } from "../../features/public/publicWishlistSlice";
import { addToCart } from "../../features/public/publicCartSlice";
import { discount, badgeColor } from "../../data/fashionData";

const Wishlist = () => {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { items } = useSelector((s) => s.publicWishlist);

  const handleMoveToCart = (product) => {
    dispatch(addToCart({ product, qty: 1 }));
    dispatch(removeFromWishlist(product._id));
    toast.success("Moved to cart!");
  };

  const handleRemove = (id) => {
    dispatch(removeFromWishlist(id));
    toast.success("Removed from wishlist");
  };

  const handleClearAll = () => {
    dispatch(clearWishlist());
    toast.success("Wishlist cleared");
  };

  // Empty state
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
        <Link to="/fashion"
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
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <MdFavorite size={26} className="text-rose-500" />
              My Wishlist
              <span className="text-base font-semibold text-gray-400">({items.length} {items.length === 1 ? "item" : "items"})</span>
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors">
              <MdArrowBack size={16} /> Back
            </button>
            <button onClick={handleClearAll}
              className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 font-semibold border border-red-200 hover:border-red-400 px-3 py-1.5 rounded-xl transition-colors">
              <MdDelete size={15} /> Clear All
            </button>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {items.map((product) => {
            const disc = product.mrp ? discount(product.price, product.mrp) : 0;
            return (
              <div key={product._id}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col group">

                {/* Image area */}
                <Link to={`/fashion/product/${product._id}`}
                  className="relative h-44 bg-gray-50 flex items-center justify-center text-7xl">
                  <span>{product.img}</span>
                  {product.badge && (
                    <span className={`absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-lg ${badgeColor(product.badge)}`}>
                      {product.badge}
                    </span>
                  )}
                  {disc > 0 && (
                    <span className="absolute top-2 right-2 text-[10px] bg-green-100 text-green-700 font-bold px-1.5 py-0.5 rounded-lg">
                      {disc}% off
                    </span>
                  )}
                  {/* Remove button */}
                  <button
                    onClick={(e) => { e.preventDefault(); handleRemove(product._id); }}
                    className="absolute bottom-2 right-2 w-7 h-7 bg-white rounded-full shadow flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50">
                    <MdDelete size={14} className="text-red-500" />
                  </button>
                </Link>

                {/* Info */}
                <div className="p-3 flex flex-col flex-1">
                  <p className="text-[11px] text-gray-400">{product.brand}</p>
                  <Link to={`/fashion/product/${product._id}`}
                    className="text-sm font-semibold text-gray-800 line-clamp-2 flex-1 mt-0.5 hover:text-primary-600 transition-colors">
                    {product.name}
                  </Link>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-base font-bold text-gray-900">₹{product.price?.toLocaleString()}</span>
                    {product.mrp && (
                      <span className="text-xs text-gray-400 line-through">₹{product.mrp?.toLocaleString()}</span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="mt-3 flex gap-2">
                    <button onClick={() => handleMoveToCart(product)}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold py-2.5 rounded-xl transition-colors">
                      <MdShoppingCart size={14} /> Add to Cart
                    </button>
                    <button onClick={() => handleRemove(product._id)}
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
          <Link to="/fashion"
            className="inline-flex items-center gap-2 text-sm text-primary-600 font-semibold hover:underline">
            <MdArrowBack size={16} /> Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Wishlist;
