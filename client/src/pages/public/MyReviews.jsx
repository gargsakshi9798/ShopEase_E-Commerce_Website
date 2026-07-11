import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  MdStar, MdStarBorder, MdEdit, MdDelete, MdCheck,
  MdArrowForward, MdRefresh,
} from "react-icons/md";
import toast from "react-hot-toast";
import { GET, POST, PUT, DELETE } from "../../utils/Methods";
import { APIS } from "../../utils/APIS";
import { formatDate, getImgUrl } from "../../utils/Methods";
import AccountLayout from "../../components/public/layout/AccountLayout";

// ─── Star selector ────────────────────────────────────────────────────────────
const StarSelector = ({ value, onChange }) => (
  <div className="flex items-center gap-1">
    {[1, 2, 3, 4, 5].map((s) => (
      <button key={s} type="button" onClick={() => onChange(s)}
        className="transition-transform hover:scale-110">
        {s <= value
          ? <MdStar size={28} className="text-amber-400" />
          : <MdStarBorder size={28} className="text-gray-300" />}
      </button>
    ))}
    {value > 0 && (
      <span className="text-sm font-bold text-gray-600 ml-2">
        {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][value]}
      </span>
    )}
  </div>
);

// ─── Display Stars ────────────────────────────────────────────────────────────
const Stars = ({ rating, size = 15 }) => (
  <span className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((s) =>
      s <= rating
        ? <MdStar key={s} size={size} className="text-amber-400" />
        : <MdStarBorder key={s} size={size} className="text-gray-200" />
    )}
  </span>
);

// ─── Skeleton card ────────────────────────────────────────────────────────────
const ReviewSkeleton = () => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-pulse">
    <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-50 bg-gray-50/50">
      <div className="w-11 h-11 bg-gray-200 rounded-xl flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        <div className="h-3 bg-gray-100 rounded w-1/3" />
      </div>
    </div>
    <div className="px-5 py-5 space-y-3">
      <div className="h-4 bg-gray-200 rounded w-1/4" />
      <div className="h-3 bg-gray-100 rounded w-3/4" />
      <div className="h-3 bg-gray-100 rounded w-2/3" />
    </div>
  </div>
);

// ─── Review Form (add / edit) ─────────────────────────────────────────────────
const ReviewForm = ({ initial = null, onSave, onCancel, saving }) => {
  const [rating, setRating] = useState(initial?.rating || 0);
  const [title,  setTitle]  = useState(initial?.title  || "");
  const [body,   setBody]   = useState(initial?.review || "");

  const submit = (e) => {
    e.preventDefault();
    if (!rating)        { toast.error("Please select a star rating"); return; }
    if (!title.trim())  { toast.error("Please add a review title"); return; }
    if (!body.trim())   { toast.error("Please write your review"); return; }
    onSave({ rating, title: title.trim(), review: body.trim() });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="text-xs font-extrabold text-gray-500 mb-2 block">Your Rating *</label>
        <StarSelector value={rating} onChange={setRating} />
      </div>
      <div>
        <label className="text-xs font-extrabold text-gray-500 mb-1 block">Review Title *</label>
        <input
          value={title} onChange={(e) => setTitle(e.target.value)} maxLength={100}
          placeholder="Summarise your experience in one line"
          className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
        />
        <p className="text-[10px] text-gray-400 mt-1 text-right">{title.length}/100</p>
      </div>
      <div>
        <label className="text-xs font-extrabold text-gray-500 mb-1 block">Detailed Review *</label>
        <textarea
          value={body} onChange={(e) => setBody(e.target.value)} rows={4} maxLength={1000}
          placeholder="What did you like or dislike? Be specific and helpful."
          className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 resize-none"
        />
        <p className="text-[10px] text-gray-400 mt-1 text-right">{body.length}/1000</p>
      </div>
      <div className="flex gap-3">
        <button type="button" onClick={onCancel} disabled={saving}
          className="flex-1 border border-gray-200 text-gray-600 font-bold py-3 rounded-xl hover:bg-gray-50 transition-colors text-sm">
          Cancel
        </button>
        <button type="submit" disabled={saving}
          className="flex-1 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white font-extrabold py-3 rounded-xl transition-colors shadow-md text-sm flex items-center justify-center gap-2">
          {saving
            ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            : <MdCheck size={16} />}
          {saving ? "Saving…" : initial ? "Update Review" : "Submit Review"}
        </button>
      </div>
    </form>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const MyReviews = () => {
  const [reviews,   setReviews]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [editId,    setEditId]    = useState(null);   // review._id being edited
  const [activeTab, setTab]       = useState("submitted");

  // ── Fetch customer's own reviews ─────────────────────────────────────────
  const loadReviews = useCallback(async () => {
    setLoading(true);
    try {
      const res = await GET(APIS.Customer.MyReviews);
      setReviews(res?.data?.data ?? res?.data ?? []);
    } catch {
      toast.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadReviews(); }, [loadReviews]);

  // ── Save (update) ─────────────────────────────────────────────────────────
  const handleUpdate = async (id, data) => {
    setSaving(true);
    try {
      await PUT(`${APIS.Customer.Reviews}/${id}`, data);
      toast.success("Review updated!");
      setEditId(null);
      loadReviews();
    } catch {
      toast.error("Failed to update review");
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async (id, productName) => {
    if (!window.confirm(`Delete your review for "${productName}"?`)) return;
    try {
      await DELETE(`${APIS.Customer.Reviews}/${id}`);
      toast.success("Review deleted");
      setReviews((r) => r.filter((x) => x._id !== id));
    } catch {
      toast.error("Failed to delete review");
    }
  };

  // ── Mark helpful ──────────────────────────────────────────────────────────
  const handleHelpful = async (id) => {
    try {
      await POST(`${APIS.Customer.Reviews}/${id}/helpful`, {});
      loadReviews();
    } catch { /* silent */ }
  };

  return (
    <AccountLayout>
      <div className="space-y-4">

        {/* Header */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center">
              <MdStar size={20} className="text-amber-500" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">My Reviews</h1>
              <p className="text-xs text-gray-400">
                {loading ? "Loading…" : `${reviews.length} review${reviews.length !== 1 ? "s" : ""} submitted`}
              </p>
            </div>
          </div>
          <button onClick={loadReviews} disabled={loading}
            className="flex items-center gap-1.5 text-xs text-gray-500 border border-gray-200 px-3 py-1.5 rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-colors">
            <MdRefresh size={14} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
        </div>

        {/* Loading skeletons */}
        {loading && (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => <ReviewSkeleton key={i} />)}
          </div>
        )}

        {/* Empty state */}
        {!loading && reviews.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center shadow-sm">
            <span className="text-5xl">⭐</span>
            <p className="text-gray-600 font-bold mt-4">No reviews yet</p>
            <p className="text-sm text-gray-400 mt-1">Reviews you write on product pages will appear here</p>
            <Link to="/"
              className="inline-flex items-center gap-1.5 mt-5 bg-primary-600 hover:bg-primary-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors">
              Start Shopping <MdArrowForward size={14} />
            </Link>
          </div>
        )}

        {/* Reviews list */}
        {!loading && reviews.map((r) => {
          const product     = r.product_id;
          const productName = product?.name || "Product";
          const productImg  = product?.thumbnail;
          const productSlug = product?.slug || product?._id;
          const orderNum    = r.order_id?.order_number;

          return (
            <div key={r._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {/* Product info header */}
              <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-gray-50 bg-gray-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-white border border-gray-200 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
                    {productImg
                      ? <img src={getImgUrl(productImg)} alt={productName} className="w-full h-full object-contain p-1" />
                      : <span className="text-2xl">📦</span>}
                  </div>
                  <div>
                    {productSlug
                      ? <Link to={`/product/${productSlug}`}
                          className="text-sm font-extrabold text-gray-900 hover:text-primary-600 transition-colors line-clamp-1">
                          {productName}
                        </Link>
                      : <p className="text-sm font-extrabold text-gray-900">{productName}</p>}
                    <p className="text-xs text-gray-400 mt-0.5">
                      {orderNum && <>Order #{orderNum} · </>}
                      {formatDate(r.createdAt)}
                    </p>
                  </div>
                </div>
                {r.is_verified_purchase && (
                  <span className="flex items-center gap-1 bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0">
                    <MdCheck size={11} /> Verified Purchase
                  </span>
                )}
              </div>

              {/* Review content / edit form */}
              <div className="px-5 py-5">
                {editId === r._id ? (
                  <ReviewForm
                    initial={r}
                    saving={saving}
                    onSave={(data) => handleUpdate(r._id, data)}
                    onCancel={() => setEditId(null)}
                  />
                ) : (
                  <>
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <Stars rating={r.rating} />
                        {r.title && (
                          <p className="text-sm font-extrabold text-gray-900 mt-2">{r.title}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button onClick={() => setEditId(r._id)}
                          className="w-8 h-8 border border-gray-200 rounded-lg flex items-center justify-center text-gray-400 hover:border-blue-300 hover:text-blue-600 transition-colors"
                          title="Edit review">
                          <MdEdit size={15} />
                        </button>
                        <button onClick={() => handleDelete(r._id, productName)}
                          className="w-8 h-8 border border-gray-200 rounded-lg flex items-center justify-center text-gray-400 hover:border-red-300 hover:text-red-500 transition-colors"
                          title="Delete review">
                          <MdDelete size={15} />
                        </button>
                      </div>
                    </div>

                    {/* Review text — field is "review" in schema, fallback to "comment" for older records */}
                    <p className="text-sm text-gray-600 leading-relaxed">{r.review || r.comment}</p>

                    {/* Images */}
                    {r.images?.length > 0 && (
                      <div className="flex gap-2 mt-3 flex-wrap">
                        {r.images.map((img, i) => (
                          <img key={i} src={getImgUrl(img)} alt="" className="w-16 h-16 rounded-xl object-cover border border-gray-200" />
                        ))}
                      </div>
                    )}

                    {/* Footer actions */}
                    <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-50">
                      <button onClick={() => handleHelpful(r._id)}
                        className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-primary-600 font-medium transition-colors">
                        👍 Helpful ({r.helpful_count ?? 0})
                      </button>
                      {product?.category_id?.name && (
                        <>
                          <span className="text-xs text-gray-300">|</span>
                          <span className="text-xs text-gray-400">{product.category_id.name}</span>
                        </>
                      )}
                      {r.is_approved === false && (
                        <span className="ml-auto text-xs bg-amber-100 text-amber-700 font-semibold px-2 py-0.5 rounded-full">
                          Pending Approval
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        })}

        {/* Tip */}
        {!loading && reviews.length > 0 && (
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex items-start gap-3">
            <span className="text-2xl flex-shrink-0">💡</span>
            <div>
              <p className="text-sm font-extrabold text-amber-800">Your reviews help other shoppers</p>
              <p className="text-xs text-amber-600 mt-0.5">
                You can write reviews directly on product pages after purchasing.
              </p>
            </div>
          </div>
        )}

      </div>
    </AccountLayout>
  );
};

export default MyReviews;
