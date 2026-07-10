import { useState } from "react";
import { Link } from "react-router-dom";
import {
  MdStar, MdStarBorder, MdEdit, MdDelete,
  MdCheck, MdArrowForward,
} from "react-icons/md";
import toast from "react-hot-toast";

// ─── Static demo review data ──────────────────────────────────────────────────
const initialReviews = [
  {
    id: 1, orderId: "SE2024002", product: "Nike Air Max 270",
    emoji: "👟", category: "Sports", date: "Jul 6, 2026",
    rating: 5, title: "Absolutely love these shoes!",
    body: "Super comfortable right out of the box. The cushioning is excellent for daily walks and light running. The design looks premium and gets a lot of compliments. Highly recommend!",
    helpful: 12, verified: true, images: ["👟", "✨👟", "👟🏃"],
  },
  {
    id: 2, orderId: "SE2024004", product: "LEGO Classic Brick Box 900pcs",
    emoji: "🧱", category: "Toys", date: "Jun 30, 2026",
    rating: 5, title: "Best gift for kids — hours of fun",
    body: "My 7-year-old has been playing with this for days non-stop. All pieces are genuine LEGO, fit perfectly and the variety of colours is great for creative building. Storage box is a bonus.",
    helpful: 8, verified: true, images: ["🧱", "🧱✨"],
  },
  {
    id: 3, orderId: "SE2024006", product: "Prestige Pressure Cooker 5L",
    emoji: "🍲", category: "Home & Kitchen", date: "Jun 22, 2026",
    rating: 4, title: "Solid cooker, great build quality",
    body: "Good quality cooker that feels sturdy and well-made. The gasket fits snugly and the safety valve works correctly. One star off because the handles get a little warm during cooking.",
    helpful: 5, verified: true, images: [],
  },
];

// ─── Pending (bought but not yet reviewed) ───────────────────────────────────
const pendingReviews = [
  { orderId: "SE2024001", product: "Samsung Galaxy S24 Ultra", emoji: "📱", category: "Mobiles",     date: "Jul 7, 2026"  },
  { orderId: "SE2024003", product: "Atomic Habits — Paperback",emoji: "📗", category: "Books",       date: "Jul 3, 2026"  },
];

// ─── Star selector ────────────────────────────────────────────────────────────
const StarSelector = ({ value, onChange }) => (
  <div className="flex items-center gap-1">
    {[1, 2, 3, 4, 5].map((s) => (
      <button key={s} type="button" onClick={() => onChange(s)} className="transition-transform hover:scale-110">
        {s <= value
          ? <MdStar size={28} className="text-amber-400" />
          : <MdStarBorder size={28} className="text-gray-300" />}
      </button>
    ))}
    <span className="text-sm font-bold text-gray-600 ml-2">
      {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][value]}
    </span>
  </div>
);

// ─── Display Stars ────────────────────────────────────────────────────────────
const Stars = ({ rating, size = 15 }) => (
  <span className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((s) => (
      s <= rating
        ? <MdStar key={s} size={size} className="text-amber-400" />
        : <MdStarBorder key={s} size={size} className="text-gray-200" />
    ))}
  </span>
);

// ─── Write/Edit Form ──────────────────────────────────────────────────────────
const ReviewForm = ({ initial = null, productName, onSave, onCancel }) => {
  const [rating, setRating] = useState(initial?.rating || 0);
  const [title,  setTitle]  = useState(initial?.title  || "");
  const [body,   setBody]   = useState(initial?.body   || "");

  const submit = (e) => {
    e.preventDefault();
    if (!rating)   { toast.error("Please select a star rating"); return; }
    if (!title.trim()){ toast.error("Please add a review title"); return; }
    if (!body.trim()) { toast.error("Please write your review"); return; }
    onSave({ rating, title: title.trim(), body: body.trim() });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="text-xs font-extrabold text-gray-500 mb-2 block">Your Rating *</label>
        <StarSelector value={rating} onChange={setRating} />
      </div>
      <div>
        <label className="text-xs font-extrabold text-gray-500 mb-1 block">Review Title *</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={100}
          placeholder="Summarise your experience in one line"
          className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500" />
        <p className="text-[10px] text-gray-400 mt-1 text-right">{title.length}/100</p>
      </div>
      <div>
        <label className="text-xs font-extrabold text-gray-500 mb-1 block">Detailed Review *</label>
        <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={4} maxLength={1000}
          placeholder="What did you like or dislike? What should buyers know? Be specific and helpful."
          className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 resize-none" />
        <p className="text-[10px] text-gray-400 mt-1 text-right">{body.length}/1000</p>
      </div>
      <div className="flex gap-3">
        <button type="button" onClick={onCancel}
          className="flex-1 border border-gray-200 text-gray-600 font-bold py-3 rounded-xl hover:bg-gray-50 transition-colors text-sm">
          Cancel
        </button>
        <button type="submit"
          className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-extrabold py-3 rounded-xl transition-colors shadow-md text-sm flex items-center justify-center gap-2">
          <MdCheck size={16} /> {initial ? "Update Review" : "Submit Review"}
        </button>
      </div>
    </form>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const MyReviews = () => {
  const [reviews,  setReviews]  = useState(initialReviews);
  const [pending,  setPending]  = useState(pendingReviews);
  const [editId,   setEditId]   = useState(null);
  const [writeFor, setWriteFor] = useState(null);   // pending review item
  const [activeTab, setTab]     = useState("submitted");

  // Submit new review from pending
  const handleNew = (item, data) => {
    const newReview = {
      id: Date.now(), orderId: item.orderId, product: item.product,
      emoji: item.emoji, category: item.category,
      date: new Date().toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" }),
      verified: true, helpful: 0, images: [],
      ...data,
    };
    setReviews((r) => [newReview, ...r]);
    setPending((p) => p.filter((x) => x.orderId !== item.orderId));
    setWriteFor(null);
    toast.success("Review submitted! Thank you.");
  };

  // Update existing review
  const handleEdit = (id, data) => {
    setReviews((r) => r.map((x) => x.id === id ? { ...x, ...data } : x));
    setEditId(null);
    toast.success("Review updated successfully!");
  };

  // Delete review
  const handleDelete = (id, product) => {
    setReviews((r) => r.filter((x) => x.id !== id));
    toast.success(`Review for "${product}" deleted`);
  };

  // Mark helpful
  const markHelpful = (id) => {
    setReviews((r) => r.map((x) => x.id === id ? { ...x, helpful: x.helpful + 1 } : x));
    toast.success("Thanks for your feedback!");
  };

  return (
    <div className="bg-gray-50 min-h-screen">

      {/* Page Header */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-[900px] mx-auto px-4 py-5">
          <h1 className="text-xl font-extrabold text-gray-900">My Reviews</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            {reviews.length} review{reviews.length !== 1 ? "s" : ""} submitted
            {pending.length > 0 && ` · ${pending.length} pending`}
          </p>
          {/* Tabs */}
          <div className="flex gap-2 mt-4">
            {[
              { key: "submitted", label: `Submitted (${reviews.length})` },
              { key: "pending",   label: `Pending (${pending.length})`, dot: pending.length > 0 },
            ].map((t) => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${activeTab === t.key ? "bg-primary-600 text-white shadow" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                {t.label}
                {t.dot && <span className="w-2 h-2 bg-white rounded-full opacity-80" />}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-[900px] mx-auto px-4 py-6 space-y-4">

        {/* ── SUBMITTED REVIEWS TAB ── */}
        {activeTab === "submitted" && (
          <>
            {reviews.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 py-20 text-center shadow-sm">
                <span className="text-5xl">⭐</span>
                <p className="text-gray-600 font-bold mt-4">No reviews yet</p>
                <p className="text-sm text-gray-400 mt-1">Reviews you write will appear here</p>
                <button onClick={() => setTab("pending")}
                  className="inline-flex items-center gap-1.5 mt-5 bg-primary-600 hover:bg-primary-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors">
                  Write a Review <MdArrowForward size={14} />
                </button>
              </div>
            ) : (
              reviews.map((r) => (
                <div key={r.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  {/* Product info */}
                  <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-gray-50 bg-gray-50/50">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-2xl shadow-sm">{r.emoji}</div>
                      <div>
                        <p className="text-sm font-extrabold text-gray-900">{r.product}</p>
                        <p className="text-xs text-gray-400 mt-0.5">Order #{r.orderId} · {r.date}</p>
                      </div>
                    </div>
                    {r.verified && (
                      <span className="flex items-center gap-1 bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0">
                        <MdCheck size={11} /> Verified Purchase
                      </span>
                    )}
                  </div>

                  {/* Review content or edit form */}
                  <div className="px-5 py-5">
                    {editId === r.id ? (
                      <ReviewForm
                        initial={r}
                        productName={r.product}
                        onSave={(data) => handleEdit(r.id, data)}
                        onCancel={() => setEditId(null)}
                      />
                    ) : (
                      <>
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div>
                            <Stars rating={r.rating} />
                            <p className="text-sm font-extrabold text-gray-900 mt-2">{r.title}</p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <button onClick={() => setEditId(r.id)}
                              className="w-8 h-8 border border-gray-200 rounded-lg flex items-center justify-center text-gray-400 hover:border-blue-300 hover:text-blue-600 transition-colors">
                              <MdEdit size={15} />
                            </button>
                            <button onClick={() => handleDelete(r.id, r.product)}
                              className="w-8 h-8 border border-gray-200 rounded-lg flex items-center justify-center text-gray-400 hover:border-red-300 hover:text-red-500 transition-colors">
                              <MdDelete size={15} />
                            </button>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed">{r.body}</p>
                        {r.images.length > 0 && (
                          <div className="flex gap-2 mt-3">
                            {r.images.map((img, i) => (
                              <div key={i} className="w-16 h-16 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-center text-2xl">{img}</div>
                            ))}
                          </div>
                        )}
                        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-50">
                          <button onClick={() => markHelpful(r.id)}
                            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-primary-600 font-medium transition-colors">
                            👍 Helpful ({r.helpful})
                          </button>
                          <span className="text-xs text-gray-300">|</span>
                          <span className="text-xs text-gray-400">{r.category}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </>
        )}

        {/* ── PENDING REVIEWS TAB ── */}
        {activeTab === "pending" && (
          <>
            {pending.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 py-20 text-center shadow-sm">
                <span className="text-5xl">🎉</span>
                <p className="text-gray-600 font-bold mt-4">All caught up!</p>
                <p className="text-sm text-gray-400 mt-1">You've reviewed all your recent purchases.</p>
                <button onClick={() => setTab("submitted")}
                  className="inline-flex items-center gap-1.5 mt-5 border border-gray-200 text-gray-600 font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-gray-50 transition-colors">
                  See Submitted Reviews
                </button>
              </div>
            ) : (
              pending.map((item) => (
                <div key={item.orderId} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  {/* Product info */}
                  <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-center text-2xl">{item.emoji}</div>
                      <div>
                        <p className="text-sm font-extrabold text-gray-900">{item.product}</p>
                        <p className="text-xs text-gray-400 mt-0.5">Order #{item.orderId} · Delivered {item.date}</p>
                      </div>
                    </div>
                    <span className="text-xs bg-amber-100 text-amber-700 font-bold px-2.5 py-1 rounded-full flex-shrink-0">Awaiting Review</span>
                  </div>

                  {/* Write form or button */}
                  <div className="px-5 py-5">
                    {writeFor === item.orderId ? (
                      <ReviewForm
                        productName={item.product}
                        onSave={(data) => handleNew(item, data)}
                        onCancel={() => setWriteFor(null)}
                      />
                    ) : (
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold text-gray-700">How was your experience?</p>
                          <p className="text-xs text-gray-400 mt-0.5">Your review helps millions of shoppers make better decisions.</p>
                          {/* Preview stars — clickable to start review */}
                          <div className="flex items-center gap-1 mt-3">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <button key={s} onClick={() => setWriteFor(item.orderId)}
                                className="transition-transform hover:scale-125">
                                <MdStarBorder size={24} className="text-gray-300 hover:text-amber-400 transition-colors" />
                              </button>
                            ))}
                            <span className="text-xs text-gray-400 ml-2">Click to rate</span>
                          </div>
                        </div>
                        <button onClick={() => setWriteFor(item.orderId)}
                          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-colors shadow-md flex-shrink-0">
                          <MdStar size={15} /> Write Review
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}

            {/* Tip card */}
            {pending.length > 0 && (
              <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">💡</span>
                <div>
                  <p className="text-sm font-extrabold text-amber-800">Earn 50 reward points per review!</p>
                  <p className="text-xs text-amber-600 mt-0.5">Write a detailed review with a photo to earn bonus points redeemable on your next order.</p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MyReviews;
