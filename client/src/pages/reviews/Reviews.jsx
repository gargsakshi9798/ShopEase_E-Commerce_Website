import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchReviews, approveReview, deleteReview } from "../../features/reviews/reviewSlice";
import DataTable    from "../../components/common/DataTable";
import ConfirmDelete from "../../components/common/ConfirmDelete";
import Modal         from "../../components/common/Modal";
import { POST }      from "../../utils/Methods";
import { APIS }      from "../../utils/APIS";
import { formatDate, getImgUrl } from "../../utils/Methods";
import toast from "react-hot-toast";
import {
  MdSearch, MdDelete, MdCheckCircle, MdCancel, MdStar,
  MdRefresh, MdClose, MdFilterList, MdReply, MdInfo,
} from "react-icons/md";

const StarRating = ({ rating }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((s) => (
      <MdStar key={s} size={14} className={s <= rating ? "text-yellow-400" : "text-gray-200"} />
    ))}
    <span className="text-xs text-gray-500 ml-1">{rating}/5</span>
  </div>
);

const Reviews = () => {
  const dispatch = useDispatch();
  const { list, total, status } = useSelector((s) => s.review);
  const loading = status === "loading";

  const [page, setPage]               = useState(1);
  const [search, setSearch]           = useState("");
  const [ratingFilter, setRatingFilter] = useState("");
  const [approvedFilter, setApprovedFilter] = useState("");
  const [deleteId, setDeleteId]       = useState(null);
  const [deleting, setDeleting]       = useState(false);
  const [viewReview, setViewReview]   = useState(null);
  const [replyModal, setReplyModal]   = useState(null);
  const [replyText, setReplyText]     = useState("");
  const [replying, setReplying]       = useState(false);

  // ── Load ──────────────────────────────────────────────────────────────────
  const load = (p = page) => {
    const params = { page: p, per_page: 10 };
    if (ratingFilter)  params.rating      = ratingFilter;
    if (approvedFilter !== "") params.is_approved = approvedFilter;
    dispatch(fetchReviews(params));
  };

  useEffect(() => { load(page); }, [page, ratingFilter, approvedFilter]);
  useEffect(() => {
    const t = setTimeout(() => { setPage(1); load(1); }, 350);
    return () => clearTimeout(t);
  }, [search]);

  // ── Stats ─────────────────────────────────────────────────────────────────
  const approvedCount = list.filter((r) => r.is_approved).length;
  const pendingCount  = list.filter((r) => !r.is_approved).length;
  const avgRating     = list.length ? (list.reduce((s, r) => s + r.rating, 0) / list.length).toFixed(1) : 0;

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleApprove = async (review) => {
    try {
      const res = await dispatch(approveReview({ id: review._id, is_approved: !review.is_approved }));
      if (res.payload?.success) {
        toast.success(review.is_approved ? "Review rejected" : "Review approved");
        load(page);
        if (viewReview?._id === review._id) setViewReview({ ...viewReview, is_approved: !review.is_approved });
      }
    } catch { toast.error("Action failed"); }
  };

  const onDelete = async () => {
    setDeleting(true);
    try {
      await dispatch(deleteReview(deleteId));
      toast.success("Review deleted"); setDeleteId(null); load();
      if (viewReview?._id === deleteId) setViewReview(null);
    } catch { toast.error("Delete failed"); }
    finally { setDeleting(false); }
  };

  const submitReply = async () => {
    if (!replyText.trim()) return;
    setReplying(true);
    try {
      await POST(`${APIS.Reviews}/${replyModal._id}/reply`, { reply: replyText });
      toast.success("Reply sent");
      setReplyModal(null);
      setReplyText("");
      load(page);
    } catch { toast.error("Reply failed"); }
    finally { setReplying(false); }
  };

  // ── Table columns ─────────────────────────────────────────────────────────
  const columns = [
    {
      key: "product_id", label: "Product",
      render: (v) => (
        <div className="flex items-center gap-2 min-w-[160px]">
          <div className="w-8 h-8 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
            {v?.thumbnail && (
              <img src={getImgUrl(v.thumbnail)} alt="" className="w-full h-full object-cover"
                onError={(e) => { e.target.src = "/placeholder.png"; }} />
            )}
          </div>
          <p className="text-sm text-gray-700 truncate max-w-[120px]">{v?.name || "—"}</p>
        </div>
      ),
    },
    {
      key: "user_id", label: "Customer",
      render: (v) => (
        <div>
          <p className="text-sm font-medium text-gray-800">{v?.name || "—"}</p>
          <p className="text-xs text-gray-400">{v?.email || ""}</p>
        </div>
      ),
    },
    {
      key: "rating", label: "Rating",
      render: (v) => <StarRating rating={v} />,
    },
    {
      key: "review", label: "Review",
      render: (v, row) => (
        <div>
          {row.title && <p className="text-xs font-semibold text-gray-700 mb-0.5">{row.title}</p>}
          <p className="text-xs text-gray-500 max-w-[200px] truncate">{v || "—"}</p>
        </div>
      ),
    },
    {
      key: "is_verified_purchase", label: "Verified",
      render: (v) => (
        <span className={`badge text-[10px] ${v ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"}`}>
          {v ? "✓ Verified" : "Unverified"}
        </span>
      ),
    },
    {
      key: "is_approved", label: "Status",
      render: (v) => (
        <span className={`badge ${v ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
          {v ? "Approved" : "Pending"}
        </span>
      ),
    },
    {
      key: "createdAt", label: "Date",
      render: (v) => <span className="text-xs text-gray-400">{formatDate(v)}</span>,
    },
    {
      key: "actions", label: "",
      render: (_, row) => (
        <div className="flex items-center gap-1">
          <button onClick={() => setViewReview(row)} className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50" title="View">
            <MdInfo size={16} />
          </button>
          <button
            onClick={() => handleApprove(row)}
            className={`p-1.5 rounded-lg ${row.is_approved ? "text-orange-600 hover:bg-orange-50" : "text-green-600 hover:bg-green-50"}`}
            title={row.is_approved ? "Reject review" : "Approve review"}
          >
            {row.is_approved ? <MdCancel size={16} /> : <MdCheckCircle size={16} />}
          </button>
          <button onClick={() => { setReplyModal(row); setReplyText(row.reply || ""); }}
            className="p-1.5 rounded-lg text-purple-600 hover:bg-purple-50" title="Reply">
            <MdReply size={16} />
          </button>
          <button onClick={() => setDeleteId(row._id)} className="p-1.5 rounded-lg text-red-600 hover:bg-red-50" title="Delete">
            <MdDelete size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reviews</h1>
          <p className="text-sm text-gray-500 mt-0.5">Moderate and manage customer product reviews</p>
        </div>
        <button onClick={() => load(page)} className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50" title="Refresh">
          <MdRefresh size={18} />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Reviews", value: total,         icon: MdStar,        bg: "bg-yellow-50", color: "text-yellow-600" },
          { label: "Approved",      value: approvedCount, icon: MdCheckCircle, bg: "bg-green-50",  color: "text-green-600",  sub: "this page" },
          { label: "Pending",       value: pendingCount,  icon: MdCancel,      bg: "bg-orange-50", color: "text-orange-600", sub: "this page" },
          { label: "Avg Rating",    value: avgRating,     icon: MdStar,        bg: "bg-blue-50",   color: "text-blue-600",   sub: "this page" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl p-4 shadow-card flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.bg} flex-shrink-0`}>
              <s.icon size={20} className={s.color} />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">{s.value ?? 0}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
              {s.sub && <p className="text-[10px] text-gray-400">{s.sub}</p>}
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-card overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <MdFilterList size={16} className="text-gray-400" />
            <select value={ratingFilter} onChange={(e) => { setRatingFilter(e.target.value); setPage(1); }}
              className="input-field text-sm py-1.5 w-36">
              <option value="">All Ratings</option>
              {[5,4,3,2,1].map((r) => <option key={r} value={r}>{'⭐'.repeat(r)} {r} Star{r > 1 ? "s" : ""}</option>)}
            </select>
            <select value={approvedFilter} onChange={(e) => { setApprovedFilter(e.target.value); setPage(1); }}
              className="input-field text-sm py-1.5 w-36">
              <option value="">All Status</option>
              <option value="true">Approved</option>
              <option value="false">Pending</option>
            </select>
            {(ratingFilter || approvedFilter !== "") && (
              <button onClick={() => { setRatingFilter(""); setApprovedFilter(""); setPage(1); }}
                className="text-xs text-primary-600 hover:underline">Clear</button>
            )}
          </div>
          <div className="ml-auto text-xs text-gray-400">Total: <span className="font-semibold text-gray-700">{total}</span></div>
        </div>
        <DataTable columns={columns} data={list} loading={loading} total={total} perPage={10} onPageChange={(p) => setPage(p)} />
      </div>

      {/* ── View Drawer ───────────────────────────────────────────────────── */}
      {viewReview && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black bg-opacity-40" onClick={() => setViewReview(null)} />
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl overflow-y-auto flex flex-col animate-slide-in-right">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h3 className="text-lg font-semibold text-gray-800">Review Details</h3>
              <button onClick={() => setViewReview(null)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
                <MdClose size={20} />
              </button>
            </div>
            <div className="flex-1 px-6 py-5 space-y-4">
              {/* Product */}
              {viewReview.product_id && (
                <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                  {viewReview.product_id.thumbnail && (
                    <img src={getImgUrl(viewReview.product_id.thumbnail)} alt="" className="w-12 h-12 rounded-lg object-cover" />
                  )}
                  <div>
                    <p className="text-xs text-gray-400">Product</p>
                    <p className="text-sm font-semibold text-gray-800">{viewReview.product_id.name}</p>
                  </div>
                </div>
              )}
              {/* Customer */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold">
                  {viewReview.user_id?.name?.[0]?.toUpperCase() || "?"}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{viewReview.user_id?.name}</p>
                  <p className="text-xs text-gray-400">{viewReview.user_id?.email}</p>
                </div>
              </div>
              {/* Rating */}
              <StarRating rating={viewReview.rating} />
              {/* Review text */}
              {viewReview.title && <p className="text-sm font-bold text-gray-800">{viewReview.title}</p>}
              {viewReview.review && <p className="text-sm text-gray-600 leading-relaxed">{viewReview.review}</p>}
              {/* Status badges */}
              <div className="flex gap-2 flex-wrap">
                <span className={`badge ${viewReview.is_approved ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                  {viewReview.is_approved ? "Approved" : "Pending Approval"}
                </span>
                {viewReview.is_verified_purchase && <span className="badge bg-blue-100 text-blue-700">✓ Verified Purchase</span>}
              </div>
              {/* Reply */}
              {viewReview.reply && (
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-3">
                  <p className="text-xs font-semibold text-purple-600 mb-1">Admin Reply</p>
                  <p className="text-sm text-gray-700">{viewReview.reply}</p>
                </div>
              )}
              <p className="text-xs text-gray-400">Posted on {formatDate(viewReview.createdAt)}</p>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex gap-2 sticky bottom-0 bg-white flex-wrap">
              <button onClick={() => handleApprove(viewReview)}
                className={`flex-1 text-sm py-2 rounded-xl border font-medium transition-colors ${
                  viewReview.is_approved
                    ? "border-orange-200 text-orange-700 hover:bg-orange-50"
                    : "border-green-200 text-green-700 hover:bg-green-50"
                }`}>
                {viewReview.is_approved ? "Reject" : "Approve"}
              </button>
              <button onClick={() => { setReplyModal(viewReview); setReplyText(viewReview.reply || ""); }}
                className="flex-1 text-sm py-2 rounded-xl border border-purple-200 text-purple-700 hover:bg-purple-50 font-medium">
                <MdReply size={14} className="inline mr-1" /> Reply
              </button>
              <button onClick={() => { setViewReview(null); setDeleteId(viewReview._id); }}
                className="flex-1 text-sm py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 font-medium">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Reply Modal ───────────────────────────────────────────────────── */}
      <Modal isOpen={!!replyModal} onClose={() => { setReplyModal(null); setReplyText(""); }}
        title="Reply to Review" size="sm"
        footer={<>
          <button onClick={() => { setReplyModal(null); setReplyText(""); }} className="btn-secondary text-sm px-4 py-2">Cancel</button>
          <button onClick={submitReply} disabled={replying || !replyText.trim()}
            className="btn-primary text-sm px-5 py-2 disabled:opacity-50">
            {replying ? "Sending..." : "Send Reply"}
          </button>
        </>}
      >
        <div className="space-y-3">
          {replyModal?.review && (
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400 mb-1">Customer Review</p>
              <StarRating rating={replyModal.rating} />
              <p className="text-sm text-gray-600 mt-1">{replyModal.review}</p>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Your Reply</label>
            <textarea rows={4} value={replyText} onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write a helpful reply..." className="input-field resize-none" />
          </div>
        </div>
      </Modal>

      <ConfirmDelete isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={onDelete} loading={deleting}
        title="Delete Review" message="Are you sure you want to delete this review? This action cannot be undone." />
    </div>
  );
};

export default Reviews;
