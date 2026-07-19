import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  MdNotifications, MdDoneAll, MdDone, MdCircle,
  MdDeleteOutline, MdRefresh, MdFilterList,
  MdShoppingCart, MdWarningAmber, MdInventory2,
  MdInfoOutline,
} from "react-icons/md";
import {
  fetchNotifications,
  markAllRead,
  markAllReadLocal,
  markOneRead,
  markOneReadLocal,
  deleteNotification,
  deleteNotificationLocal,
} from "../../features/notifications/notificationSlice";
import { formatDateTime } from "../../utils/Methods";
import ConfirmDelete from "../../components/common/ConfirmDelete";

// ── Type config ──────────────────────────────────────────────────────────────
const TYPE_CONFIG = {
  order:   { icon: MdShoppingCart, bg: "bg-blue-50",    text: "text-blue-600",   label: "Order"   },
  warning: { icon: MdWarningAmber, bg: "bg-orange-50",  text: "text-orange-600", label: "Warning" },
  general: { icon: MdInventory2,   bg: "bg-yellow-50",  text: "text-yellow-600", label: "General" },
  payment: { icon: MdInfoOutline,  bg: "bg-green-50",   text: "text-green-600",  label: "Payment" },
  return:  { icon: MdInfoOutline,  bg: "bg-purple-50",  text: "text-purple-600", label: "Return"  },
  promo:   { icon: MdInfoOutline,  bg: "bg-pink-50",    text: "text-pink-600",   label: "Promo"   },
  account: { icon: MdInfoOutline,  bg: "bg-gray-100",   text: "text-gray-600",   label: "Account" },
};

const getTypeConfig = (type) =>
  TYPE_CONFIG[type?.toLowerCase()] ?? { icon: MdNotifications, bg: "bg-gray-100", text: "text-gray-500", label: "System" };

const FILTER_TABS = [
  { key: "",        label: "All"     },
  { key: "unread",  label: "Unread"  },
  { key: "order",   label: "Orders"  },
  { key: "warning", label: "Warnings"},
  { key: "general", label: "General" },
];

// ── Component ────────────────────────────────────────────────────────────────
const Notifications = () => {
  const dispatch = useDispatch();
  const { list, total, total_unread, status } = useSelector((s) => s.notifications);

  const [filter, setFilter]           = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null); // { _id, title }
  const [deleting, setDeleting]         = useState(false);

  const loading = status === "loading";

  // ── Load ──────────────────────────────────────────────────────────────────
  const load = () => dispatch(fetchNotifications({ per_page: 50 }));

  useEffect(() => { load(); }, []);

  // ── Filtered list ─────────────────────────────────────────────────────────
  const displayed = list.filter((n) => {
    if (filter === "unread") return !n.is_read;
    if (filter)              return n.type === filter;
    return true;
  });

  // ── Helpers ───────────────────────────────────────────────────────────────
  // Dynamic notifications (_order, _stock, pending_orders) have synthetic IDs
  // that are not valid MongoDB ObjectIds — never send them to the server.
  const isStoredNotification = (id) => {
    const s = String(id);
    return !s.includes("_") && s !== "pending_orders";
  };

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleMarkOne = (n) => {
    if (n.is_read) return;
    dispatch(markOneReadLocal(n._id));
    // Only call the API for real DB-backed notifications
    if (isStoredNotification(n._id)) {
      dispatch(markOneRead(n._id));
    }
  };

  const handleMarkAll = () => {
    if (total_unread === 0) { toast("All notifications are already read"); return; }
    dispatch(markAllReadLocal());
    dispatch(markAllRead()).then((res) => {
      if (res.meta.requestStatus === "fulfilled") toast.success("All notifications marked as read");
      else toast.error("Failed to mark all as read");
    });
  };

  const handleDeleteClick = (e, n) => {
    e.stopPropagation();
    // Only stored notifications (plain ObjectId, no suffix) can be deleted from DB.
    // Dynamic ones (e.g. "abc123_order") are removed optimistically from local list only.
    setDeleteTarget(n);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);

    const isDynamic = !isStoredNotification(deleteTarget._id);

    // Optimistically remove from UI
    dispatch(deleteNotificationLocal(deleteTarget._id));

    if (!isDynamic) {
      const res = await dispatch(deleteNotification(deleteTarget._id));
      if (res.meta.requestStatus === "fulfilled") {
        toast.success("Notification deleted");
      } else {
        // Roll back by reloading if server call fails
        toast.error("Failed to delete notification");
        load();
      }
    } else {
      toast.success("Notification dismissed");
    }

    setDeleting(false);
    setDeleteTarget(null);
  };

  // ── Stats ─────────────────────────────────────────────────────────────────
  const totalCount  = list.length;
  const unreadCount = total_unread;
  const readCount   = totalCount - unreadCount;

  return (
    <div className="space-y-5">

      {/* ── Page Header ───────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-sm text-gray-500 mt-0.5">System alerts, order updates, and low-stock warnings</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={load}
            disabled={loading}
            className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition-colors"
            title="Refresh"
          >
            <MdRefresh size={18} className={loading ? "animate-spin" : ""} />
          </button>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAll}
              className="flex items-center gap-1.5 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-xl transition-colors"
            >
              <MdDoneAll size={16} /> Mark All Read
            </button>
          )}
        </div>
      </div>

      {/* ── Stats Row ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total",  value: totalCount,  bg: "bg-gray-50",    icon: MdNotifications, color: "text-gray-600"   },
          { label: "Unread", value: unreadCount, bg: "bg-red-50",     icon: MdCircle,        color: "text-red-500"    },
          { label: "Read",   value: readCount,   bg: "bg-green-50",   icon: MdDone,          color: "text-green-600"  },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl p-4 shadow-card flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${s.bg}`}>
              <s.icon size={20} className={s.color} />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Main Card ─────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl shadow-card overflow-hidden">

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 px-4 py-3 border-b border-gray-100 overflow-x-auto">
          <MdFilterList size={16} className="text-gray-400 mr-1 flex-shrink-0" />
          {FILTER_TABS.map((tab) => {
            const count =
              tab.key === ""       ? list.length
              : tab.key === "unread" ? list.filter((n) => !n.is_read).length
              : list.filter((n) => n.type === tab.key).length;
            return (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  filter === tab.key
                    ? "bg-primary-100 text-primary-700"
                    : "text-gray-500 hover:bg-gray-100"
                }`}
              >
                {tab.label}
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  filter === tab.key ? "bg-primary-200 text-primary-800" : "bg-gray-100 text-gray-500"
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
          <span className="ml-auto text-xs text-gray-400 flex-shrink-0">
            {displayed.length} notification{displayed.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* ── Loading skeleton ──────────────────────────────────────────── */}
        {loading && list.length === 0 && (
          <div className="divide-y divide-gray-50">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3 px-5 py-4 animate-pulse">
                <div className="w-10 h-10 bg-gray-100 rounded-xl flex-shrink-0" />
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-3 bg-gray-100 rounded w-1/3" />
                  <div className="h-3 bg-gray-100 rounded w-2/3" />
                  <div className="h-2 bg-gray-50  rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Empty state ───────────────────────────────────────────────── */}
        {!loading && displayed.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-16 text-center px-4">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
              <MdNotifications size={32} className="text-gray-300" />
            </div>
            <p className="text-gray-600 font-semibold">No notifications</p>
            <p className="text-sm text-gray-400">
              {filter ? "No notifications match the selected filter" : "You're all caught up!"}
            </p>
          </div>
        )}

        {/* ── Notification list ─────────────────────────────────────────── */}
        {displayed.length > 0 && (
          <div className="divide-y divide-gray-50">
            {displayed.map((n) => {
              const cfg  = getTypeConfig(n.type);
              const Icon = cfg.icon;
              return (
                <div
                  key={n._id}
                  onClick={() => handleMarkOne(n)}
                  className={`group flex items-start gap-3 px-5 py-4 transition-colors cursor-pointer ${
                    !n.is_read ? "bg-primary-50/40 hover:bg-primary-50/60" : "hover:bg-gray-50"
                  }`}
                >
                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                    {n.icon ? (
                      <span className="text-base leading-none">{n.icon}</span>
                    ) : (
                      <Icon size={18} className={cfg.text} />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm font-semibold truncate ${!n.is_read ? "text-gray-900" : "text-gray-700"}`}>
                        {n.title ?? "Notification"}
                      </p>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {/* Read status badge */}
                        {!n.is_read ? (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-primary-600 bg-primary-100 px-1.5 py-0.5 rounded-full">
                            <MdCircle size={5} /> New
                          </span>
                        ) : (
                          <MdDone size={14} className="text-gray-300" />
                        )}
                        {/* Delete button */}
                        <button
                          onClick={(e) => handleDeleteClick(e, n)}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                          title="Dismiss notification"
                        >
                          <MdDeleteOutline size={16} />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5 leading-relaxed line-clamp-2">{n.message}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <p className="text-xs text-gray-400">{formatDateTime(n.time ?? n.createdAt)}</p>
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}>
                        {cfg.label}
                      </span>
                      {n.link && (
                        <a
                          href={n.link}
                          onClick={(e) => e.stopPropagation()}
                          className="text-xs text-primary-600 hover:underline"
                        >
                          View →
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer count */}
        {displayed.length > 0 && (
          <div className="px-5 py-3 border-t border-gray-50 flex items-center justify-between text-xs text-gray-400">
            <span>Showing {displayed.length} of {totalCount} notifications</span>
            {unreadCount > 0 && (
              <span className="text-primary-600 font-medium">{unreadCount} unread</span>
            )}
          </div>
        )}
      </div>

      {/* ── Delete Confirm Modal ──────────────────────────────────────────── */}
      <ConfirmDelete
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        loading={deleting}
        title="Dismiss Notification"
        message={`Are you sure you want to dismiss "${deleteTarget?.title ?? "this notification"}"? This action cannot be undone.`}
      />
    </div>
  );
};

export default Notifications;
