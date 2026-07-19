import { useEffect, useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "../../utils/toast";
import {
  MdNotifications, MdDoneAll, MdDone, MdCircle,
  MdRefresh, MdLocalShipping, MdPayment,
  MdLocalOffer, MdSecurity, MdCheckCircle,
} from "react-icons/md";
import AccountLayout from "../../components/public/layout/AccountLayout";
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
  order:    { icon: MdLocalShipping, bg: "bg-blue-50",    text: "text-blue-600",   label: "Order"   },
  payment:  { icon: MdPayment,       bg: "bg-green-50",   text: "text-green-600",  label: "Payment" },
  promo:    { icon: MdLocalOffer,    bg: "bg-purple-50",  text: "text-purple-600", label: "Promo"   },
  return:   { icon: MdCheckCircle,   bg: "bg-orange-50",  text: "text-orange-500", label: "Return"  },
  account:  { icon: MdSecurity,      bg: "bg-gray-100",   text: "text-gray-600",   label: "Account" },
  general:  { icon: MdNotifications, bg: "bg-primary-50", text: "text-primary-600",label: "General" },
};
const getTC = (type) => TYPE_CONFIG[type?.toLowerCase()] ?? TYPE_CONFIG.general;

// ── Skeleton ──────────────────────────────────────────────────────────────────
const Skeleton = () => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 animate-pulse flex items-start gap-3">
    <div className="w-10 h-10 rounded-xl bg-gray-100 flex-shrink-0" />
    <div className="flex-1 space-y-2 pt-0.5">
      <div className="h-3.5 bg-gray-100 rounded w-2/5" />
      <div className="h-3   bg-gray-100 rounded w-4/5" />
      <div className="h-2.5 bg-gray-50  rounded w-1/4" />
    </div>
  </div>
);

// ── Filter tabs ───────────────────────────────────────────────────────────────
const TABS = [
  { key: "all",    label: "All"      },
  { key: "unread", label: "Unread"   },
  { key: "order",  label: "Orders"   },
  { key: "promo",  label: "Promos"   },
];

// ── Main Component ────────────────────────────────────────────────────────────
const MyNotifications = () => {
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

  const tabCount = (key) => {
    if (key === "all")    return notifications.length;
    if (key === "unread") return unread;
    return notifications.filter((n) => n.type?.toLowerCase() === key).length;
  };

  return (
    <AccountLayout>
      <div className="space-y-4">

        {/* ── Header card ─────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            {/* Left — title + count */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <MdNotifications size={20} className="text-amber-500" />
              </div>
              <div>
                <h1 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
                  Notifications
                  {unread > 0 && (
                    <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-pulse">
                      {unread > 99 ? "99+" : unread} new
                    </span>
                  )}
                </h1>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  {lastFetched ? `Updated ${formatDateTime(lastFetched)}` : "Auto-refreshes every 60s"}
                </p>
              </div>
            </div>

            {/* Right — actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => load(false)}
                disabled={refreshing || loading}
                className="p-2 rounded-xl border border-gray-200 text-gray-400 hover:bg-gray-50 disabled:opacity-40 transition-colors"
                title="Refresh"
              >
                <MdRefresh size={16} className={refreshing ? "animate-spin" : ""} />
              </button>
              {unread > 0 && (
                <button
                  onClick={handleMarkAll}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold transition-colors"
                >
                  <MdDoneAll size={14} /> Mark all read
                </button>
              )}
            </div>
          </div>

          {/* Stats pills */}
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            {[
              { label: `${total} Total`,        color: "bg-gray-100 text-gray-600"        },
              { label: `${unread} Unread`,       color: "bg-red-50 text-red-500"           },
              { label: `${total-unread} Read`,   color: "bg-green-50 text-green-600"       },
            ].map((p) => (
              <span key={p.label} className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${p.color}`}>
                {p.label}
              </span>
            ))}
          </div>
        </div>

        {/* ── Filter tabs ─────────────────────────────────────────────── */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
          {TABS.map((t) => {
            const cnt = tabCount(t.key);
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex-shrink-0 ${
                  tab === t.key
                    ? "bg-primary-600 text-white shadow-sm"
                    : "bg-white border border-gray-200 text-gray-500 hover:border-primary-300 hover:text-primary-600"
                }`}
              >
                {t.label}
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                  tab === t.key ? "bg-white/25 text-white" : "bg-gray-100 text-gray-500"
                }`}>
                  {cnt}
                </span>
              </button>
            );
          })}
        </div>

        {/* ── Loading ──────────────────────────────────────────────────── */}
        {loading && notifications.length === 0 && (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} />)}
          </div>
        )}

        {/* ── Empty state ──────────────────────────────────────────────── */}
        {!loading && displayed.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-14 text-center">
            <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <MdNotifications size={28} className="text-gray-200" />
            </div>
            <p className="text-gray-600 font-bold text-sm">No notifications</p>
            <p className="text-xs text-gray-400 mt-1">
              {tab !== "all" ? "Nothing in this category" : "You're all caught up!"}
            </p>
            {tab !== "all" && (
              <button
                onClick={() => setTab("all")}
                className="mt-3 text-xs text-primary-600 font-semibold hover:underline"
              >
                Show all
              </button>
            )}
          </div>
        )}

        {/* ── List ─────────────────────────────────────────────────────── */}
        {displayed.length > 0 && (
          <div className="space-y-2">
            {displayed.map((n) => {
              const tc   = getTC(n.type);
              const Icon = tc.icon;
              return (
                <div
                  key={n._id}
                  onClick={() => handleMarkOne(n)}
                  className={`bg-white rounded-2xl border shadow-sm p-4 flex items-start gap-3 cursor-pointer transition-all hover:shadow-md ${
                    !n.is_read
                      ? "border-primary-200 bg-gradient-to-r from-primary-50/50 to-white"
                      : "border-gray-100"
                  }`}
                >
                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${tc.bg}`}>
                    <Icon size={18} className={tc.text} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm leading-snug ${
                        !n.is_read ? "font-extrabold text-gray-900" : "font-semibold text-gray-700"
                      }`}>
                        {n.title ?? "Notification"}
                      </p>
                      <div className="flex items-center gap-1.5 flex-shrink-0 mt-0.5">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${tc.bg} ${tc.text}`}>
                          {tc.label}
                        </span>
                        {!n.is_read
                          ? <MdCircle size={7} className="text-primary-600" />
                          : <MdDone size={13} className="text-gray-300" />
                        }
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{n.message}</p>
                    <p className="text-[10px] text-gray-300 font-medium mt-1.5">
                      {formatDateTime(n.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Footer count ─────────────────────────────────────────────── */}
        {displayed.length > 0 && (
          <p className="text-center text-xs text-gray-300 py-1">
            {displayed.length} of {total} notifications
          </p>
        )}

      </div>
    </AccountLayout>
  );
};

export default MyNotifications;
