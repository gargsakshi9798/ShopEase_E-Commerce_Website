import { useEffect, useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  MdNotifications, MdDoneAll, MdDone, MdCircle,
  MdRefresh, MdFilterList, MdLocalShipping,
  MdPayment, MdLocalOffer, MdStar, MdSecurity,
  MdInfo, MdCheckCircle,
} from "react-icons/md";
import {
  fetchCustomerNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  markOneReadLocal,
  markAllReadLocal,
} from "../../features/public/publicNotificationSlice";
import { formatDateTime } from "../../utils/Methods";

// ── Type config ───────────────────────────────────────────────────────────────
const TYPE_CONFIG = {
  order:    { icon: MdLocalShipping, bg: "bg-blue-50",    ring: "ring-blue-100",   text: "text-blue-600",   label: "Order",   emoji: "🛒" },
  payment:  { icon: MdPayment,       bg: "bg-green-50",   ring: "ring-green-100",  text: "text-green-600",  label: "Payment", emoji: "💳" },
  promo:    { icon: MdLocalOffer,    bg: "bg-purple-50",  ring: "ring-purple-100", text: "text-purple-600", label: "Promo",   emoji: "🎉" },
  return:   { icon: MdCheckCircle,   bg: "bg-orange-50",  ring: "ring-orange-100", text: "text-orange-500", label: "Return",  emoji: "↩️" },
  account:  { icon: MdSecurity,      bg: "bg-gray-100",   ring: "ring-gray-200",   text: "text-gray-600",   label: "Account", emoji: "👤" },
  general:  { icon: MdNotifications, bg: "bg-primary-50", ring: "ring-primary-100",text: "text-primary-600",label: "General", emoji: "🔔" },
};
const getTC = (type) => TYPE_CONFIG[type?.toLowerCase()] ?? TYPE_CONFIG.general;

// ── Filter tabs ───────────────────────────────────────────────────────────────
const TABS = [
  { key: "all",     label: "All"     },
  { key: "unread",  label: "Unread"  },
  { key: "order",   label: "Orders"  },
  { key: "payment", label: "Payments"},
  { key: "promo",   label: "Promos"  },
];

// ── Skeleton row ──────────────────────────────────────────────────────────────
const Skeleton = () => (
  <div className="bg-white rounded-2xl border border-gray-100 p-4 animate-pulse flex items-start gap-3">
    <div className="w-11 h-11 rounded-2xl bg-gray-100 flex-shrink-0" />
    <div className="flex-1 space-y-2 pt-1">
      <div className="h-3.5 bg-gray-100 rounded w-2/5" />
      <div className="h-3   bg-gray-100 rounded w-4/5" />
      <div className="h-2.5 bg-gray-50  rounded w-1/4" />
    </div>
  </div>
);

// ── Main page ─────────────────────────────────────────────────────────────────
const Notifications = () => {
  const dispatch = useDispatch();
  const { notifications, unread, total, status, lastFetched } =
    useSelector((s) => s.publicNotification);

  const [tab,        setTab]        = useState("all");
  const [refreshing, setRefreshing] = useState(false);

  const loading = status === "loading" || status === "idle";

  // ── Load + auto-refresh every 60 s ────────────────────────────────────────
  const load = useCallback(
    (silent = false) => {
      if (!silent) setRefreshing(true);
      dispatch(fetchCustomerNotifications({ per_page: 50 })).finally(() =>
        setRefreshing(false)
      );
    },
    [dispatch]
  );

  useEffect(() => {
    load(true);
    const t = setInterval(() => load(true), 60_000);
    return () => clearInterval(t);
  }, [load]);

  // ── Filtered list ─────────────────────────────────────────────────────────
  const displayed =
    tab === "all"    ? notifications
    : tab === "unread" ? notifications.filter((n) => !n.is_read)
    : notifications.filter((n) => n.type?.toLowerCase() === tab);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleMarkOne = (n) => {
    if (n.is_read) return;
    dispatch(markOneReadLocal(n._id));
    dispatch(markNotificationRead(n._id));
  };

  const handleMarkAll = () => {
    if (unread === 0) { toast("All notifications are already read"); return; }
    dispatch(markAllReadLocal());
    dispatch(markAllNotificationsRead()).then((r) => {
      if (r.meta.requestStatus === "fulfilled") toast.success("All marked as read");
      else toast.error("Something went wrong");
    });
  };

  // Tab badge counts
  const tabCount = (key) => {
    if (key === "all")    return notifications.length;
    if (key === "unread") return unread;
    return notifications.filter((n) => n.type?.toLowerCase() === key).length;
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-[720px] mx-auto px-4 py-8 space-y-5">

        {/* ── Page header ─────────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
              Notifications
              {unread > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
                  {unread > 99 ? "99+" : unread} new
                </span>
              )}
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">
              {lastFetched
                ? `Last updated ${formatDateTime(lastFetched)}`
                : "Updates every 60 seconds"}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => load(false)}
              disabled={refreshing || loading}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-500 hover:bg-gray-100 disabled:opacity-40 transition-colors"
              title="Refresh"
            >
              <MdRefresh size={16} className={refreshing ? "animate-spin" : ""} />
              Refresh
            </button>
            {unread > 0 && (
              <button
                onClick={handleMarkAll}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold transition-colors"
              >
                <MdDoneAll size={16} /> Mark all read
              </button>
            )}
          </div>
        </div>

        {/* ── Stats strip ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Total",  value: total,               color: "text-gray-700",    bg: "bg-white"          },
            { label: "Unread", value: unread,              color: "text-red-600",     bg: "bg-red-50"         },
            { label: "Read",   value: total - unread,      color: "text-green-600",   bg: "bg-green-50"       },
          ].map((s) => (
            <div key={s.label} className={`${s.bg} rounded-2xl border border-gray-100 px-4 py-3 text-center shadow-sm`}>
              <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-400 font-medium mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* ── Filter tabs ─────────────────────────────────────────────── */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
          <MdFilterList size={15} className="text-gray-400 flex-shrink-0" />
          {TABS.map((t) => {
            const cnt = tabCount(t.key);
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex-shrink-0 ${
                  tab === t.key
                    ? "bg-primary-600 text-white shadow-sm"
                    : "bg-white border border-gray-200 text-gray-500 hover:border-primary-300 hover:text-primary-600"
                }`}
              >
                {t.label}
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  tab === t.key ? "bg-white/25 text-white" : "bg-gray-100 text-gray-500"
                }`}>
                  {cnt}
                </span>
              </button>
            );
          })}
        </div>

        {/* ── Loading skeletons ────────────────────────────────────────── */}
        {loading && notifications.length === 0 && (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} />)}
          </div>
        )}

        {/* ── Empty state ──────────────────────────────────────────────── */}
        {!loading && displayed.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center shadow-sm">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <MdNotifications size={32} className="text-gray-200" />
            </div>
            <p className="text-gray-600 font-bold">No notifications</p>
            <p className="text-sm text-gray-400 mt-1">
              {tab !== "all" ? "Try switching to 'All'" : "You're all caught up!"}
            </p>
            {tab !== "all" && (
              <button
                onClick={() => setTab("all")}
                className="mt-3 text-sm text-primary-600 font-semibold hover:underline"
              >
                Show all notifications
              </button>
            )}
          </div>
        )}

        {/* ── Notification list ────────────────────────────────────────── */}
        {displayed.length > 0 && (
          <div className="space-y-2">
            {displayed.map((n) => {
              const tc   = getTC(n.type);
              const Icon = tc.icon;
              return (
                <div
                  key={n._id}
                  onClick={() => handleMarkOne(n)}
                  className={`group bg-white rounded-2xl border shadow-sm p-4 flex items-start gap-3 cursor-pointer transition-all hover:shadow-md ${
                    !n.is_read
                      ? "border-primary-200 bg-gradient-to-r from-primary-50/60 to-white"
                      : "border-gray-100"
                  }`}
                >
                  {/* Icon */}
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ring-2 ${tc.bg} ${tc.ring}`}>
                    <Icon size={20} className={tc.text} />
                  </div>

                  {/* Body */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm leading-snug ${
                        !n.is_read ? "font-extrabold text-gray-900" : "font-semibold text-gray-700"
                      }`}>
                        {n.title ?? "Notification"}
                      </p>
                      <div className="flex items-center gap-1.5 flex-shrink-0 mt-0.5">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${tc.bg} ${tc.text}`}>
                          {tc.label}
                        </span>
                        {!n.is_read
                          ? <MdCircle size={8} className="text-primary-600" />
                          : <MdDone size={14} className="text-gray-300" />
                        }
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">{n.message}</p>
                    <p className="text-[11px] text-gray-300 font-medium mt-1.5">
                      {formatDateTime(n.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Footer ──────────────────────────────────────────────────── */}
        {displayed.length > 0 && (
          <div className="flex items-center justify-between text-xs text-gray-400 py-1 px-1">
            <span>Showing {displayed.length} of {total} notifications</span>
            <Link to="/account" className="text-primary-600 font-semibold hover:underline">
              My Account →
            </Link>
          </div>
        )}

      </div>
    </div>
  );
};

export default Notifications;
