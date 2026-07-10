import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  MdNotifications, MdDone, MdDoneAll,
  MdCircle, MdInfoOutline,
} from "react-icons/md";
import AccountLayout from "../../components/public/layout/AccountLayout";
import {
  fetchCustomerNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "../../features/public/publicNotificationSlice";
import { formatDateTime } from "../../utils/Methods";

// ── Notification icon by type ─────────────────────────────────────────────────
const typeColor = (type) => {
  const map = {
    order:        "bg-blue-50 text-blue-600",
    promotion:    "bg-purple-50 text-purple-600",
    system:       "bg-gray-100 text-gray-600",
    payment:      "bg-green-50 text-green-600",
    delivery:     "bg-indigo-50 text-indigo-600",
  };
  return map[type?.toLowerCase()] ?? "bg-gray-100 text-gray-600";
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const MyNotifications = () => {
  const dispatch = useDispatch();
  const { notifications, unread, status } = useSelector((s) => s.publicNotification);

  useEffect(() => {
    dispatch(fetchCustomerNotifications({ per_page: 30 }));
  }, [dispatch]);

  const handleMarkRead = (id, isRead) => {
    if (isRead) return;
    dispatch(markNotificationRead(id));
  };

  const handleMarkAll = () => {
    if (unread === 0) { toast("All notifications are already read"); return; }
    dispatch(markAllNotificationsRead()).then((res) => {
      if (res.meta.requestStatus === "fulfilled") toast.success("All marked as read");
    });
  };

  return (
    <AccountLayout>
      <div className="space-y-4">

        {/* Header */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center">
              <MdNotifications size={20} className="text-amber-600" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Notifications</h1>
              <p className="text-xs text-gray-400">
                {unread > 0 ? `${unread} unread notification${unread > 1 ? "s" : ""}` : "All caught up!"}
              </p>
            </div>
          </div>
          {unread > 0 && (
            <button
              onClick={handleMarkAll}
              className="flex items-center gap-1.5 text-sm border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold px-3 py-2 rounded-xl transition-colors"
            >
              <MdDoneAll size={16} className="text-green-500" /> Mark All Read
            </button>
          )}
        </div>

        {/* Loading */}
        {status === "loading" && notifications.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Empty state */}
        {status !== "loading" && notifications.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 flex flex-col items-center gap-3 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
              <MdNotifications size={32} className="text-gray-300" />
            </div>
            <p className="text-gray-600 font-semibold">No notifications yet</p>
            <p className="text-sm text-gray-400">We'll notify you about orders, offers and more</p>
          </div>
        )}

        {/* Notification list */}
        <div className="space-y-2">
          {notifications.map((n) => (
            <div
              key={n._id}
              onClick={() => handleMarkRead(n._id, n.is_read)}
              className={`bg-white rounded-2xl border shadow-sm p-4 flex items-start gap-3 transition-all cursor-pointer hover:shadow-md ${
                !n.is_read ? "border-primary-100 bg-primary-50/30" : "border-gray-100"
              }`}
            >
              {/* Icon */}
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${typeColor(n.type)}`}>
                <MdInfoOutline size={18} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-sm font-semibold text-gray-900 ${!n.is_read ? "text-primary-700" : ""}`}>
                    {n.title ?? "Notification"}
                  </p>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {!n.is_read && (
                      <MdCircle size={8} className="text-primary-600" />
                    )}
                    {n.is_read && (
                      <MdDone size={14} className="text-gray-300" />
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-0.5 leading-relaxed">{n.message}</p>
                <p className="text-xs text-gray-400 mt-1.5">{formatDateTime(n.createdAt)}</p>
              </div>
            </div>
          ))}
        </div>

        {notifications.length > 0 && status !== "loading" && (
          <p className="text-center text-xs text-gray-400 py-2">
            Showing {notifications.length} notifications
          </p>
        )}
      </div>
    </AccountLayout>
  );
};

export default MyNotifications;
