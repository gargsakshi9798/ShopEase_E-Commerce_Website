import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  MdNotifications, MdLocalShipping, MdLocalOffer, MdStar,
  MdSecurity, MdInfo, MdCheckCircle, MdDelete,
} from "react-icons/md";
import {
  fetchCustomerNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "../../features/public/publicNotificationSlice";
import { formatDateTime } from "../../utils/Methods";

// ─── Icon + bg per notification type ─────────────────────────────────────────
const TYPE_CONFIG = {
  order:    { icon: <MdLocalShipping size={20} className="text-blue-600"  />, bg: "bg-blue-50 border-blue-100"   },
  payment:  { icon: <MdCheckCircle   size={20} className="text-green-600" />, bg: "bg-green-50 border-green-100" },
  offer:    { icon: <MdLocalOffer    size={20} className="text-orange-500"/>, bg: "bg-orange-50 border-orange-100"},
  review:   { icon: <MdStar         size={20} className="text-amber-500" />, bg: "bg-amber-50 border-amber-100"  },
  security: { icon: <MdSecurity     size={20} className="text-red-500"   />, bg: "bg-red-50 border-red-100"      },
  info:     { icon: <MdInfo         size={20} className="text-gray-500"  />, bg: "bg-gray-50 border-gray-100"    },
  general:  { icon: <MdNotifications size={20} className="text-primary-600"/>, bg: "bg-primary-50 border-primary-100" },
};

const getConfig = (type) => TYPE_CONFIG[type] || TYPE_CONFIG.general;

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const NotifSkeleton = () => (
  <div className="bg-white rounded-2xl border border-gray-100 p-4 animate-pulse">
    <div className="flex items-start gap-3">
      <div className="w-10 h-10 rounded-xl bg-gray-200 flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-100 rounded w-full" />
        <div className="h-2.5 bg-gray-100 rounded w-1/4" />
      </div>
    </div>
  </div>
);

// ─── Main Notifications Page ──────────────────────────────────────────────────
const Notifications = () => {
  const dispatch = useDispatch();
  const { notifications, unread, status } = useSelector((s) => s.publicNotification);

  useEffect(() => {
    dispatch(fetchCustomerNotifications({ per_page: 50 }));
  }, [dispatch]);

  const handleMarkAllRead = () => {
    dispatch(markAllNotificationsRead());
  };

  const handleMarkRead = (id) => {
    dispatch(markNotificationRead(id));
  };

  const loading = status === "loading" || status === "idle";

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-[700px] mx-auto px-4 py-8 space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-extrabold text-gray-900">Notifications</h1>
            {unread > 0 && (
              <span className="bg-primary-600 text-white text-xs font-extrabold px-2 py-0.5 rounded-full">
                {unread} new
              </span>
            )}
          </div>
          {unread > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="text-sm font-bold text-primary-600 hover:underline"
            >
              Mark all as read
            </button>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => <NotifSkeleton key={i} />)}
          </div>
        )}

        {/* Empty state */}
        {!loading && notifications.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center shadow-sm">
            <span className="text-5xl">🔔</span>
            <p className="text-gray-500 mt-4 font-bold">No notifications</p>
            <p className="text-sm text-gray-400 mt-1">You're all caught up!</p>
          </div>
        )}

        {/* Notifications list */}
        {!loading && notifications.length > 0 && (
          <div className="space-y-2">
            {notifications.map((n) => {
              const cfg = getConfig(n.type);
              return (
                <div
                  key={n._id}
                  onClick={() => !n.is_read && handleMarkRead(n._id)}
                  className={`bg-white rounded-2xl border p-4 shadow-sm transition-all cursor-pointer hover:shadow-md ${
                    !n.is_read ? "border-primary-200 bg-primary-50/30" : "border-gray-100"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 ${cfg.bg} border rounded-xl flex items-center justify-center flex-shrink-0`}>
                      {cfg.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm ${!n.is_read ? "font-extrabold text-gray-900" : "font-semibold text-gray-700"}`}>
                          {n.title}
                        </p>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {!n.is_read && <div className="w-2 h-2 bg-primary-600 rounded-full" />}
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{n.message}</p>
                      <p className="text-[10px] text-gray-400 mt-1.5 font-medium">
                        {formatDateTime(n.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Load more hint */}
        {!loading && notifications.length > 0 && (
          <button
            onClick={() => dispatch(fetchCustomerNotifications({ per_page: 50 }))}
            className="w-full text-center text-xs text-primary-600 font-semibold hover:underline py-2"
          >
            Refresh Notifications
          </button>
        )}
      </div>
    </div>
  );
};

export default Notifications;
