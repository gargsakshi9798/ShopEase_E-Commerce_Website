import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  MdPerson, MdShoppingBag, MdLocationOn,
  MdNotifications, MdLogout, MdFavoriteBorder,
  MdChevronRight, MdLocalOffer, MdStar, MdSettings,
  MdHelpOutline,
} from "react-icons/md";
import { customerLogout } from "../../../features/public/customerAuthSlice";
import toast from "react-hot-toast";

const navItems = [
  { to: "/account",         icon: MdPerson,        label: "My Account",       exact: true },
  { to: "/my-profile",      icon: MdPerson,        label: "My Profile" },
  { to: "/my-orders",       icon: MdShoppingBag,   label: "My Orders" },
  { to: "/my-addresses",    icon: MdLocationOn,    label: "My Addresses" },
  { to: "/wishlist",        icon: MdFavoriteBorder,label: "My Wishlist" },
  { to: "/my-coupons",      icon: MdLocalOffer,    label: "My Coupons" },
  { to: "/my-reviews",      icon: MdStar,          label: "My Reviews" },
  { to: "/my-tickets",      icon: MdHelpOutline,   label: "My Support Tickets" },
  { to: "/notifications",   icon: MdNotifications, label: "Notifications" },
  { to: "/my-settings",     icon: MdSettings,      label: "Settings" },
];

const AccountLayout = ({ children }) => {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const customer  = useSelector((s) => s.customerAuth?.user);
  const profile   = useSelector((s) => s.publicProfile?.profile);
  const unread    = useSelector((s) => s.publicNotification?.unread ?? 0);
  const openTickets = useSelector((s) =>
    (s.publicSupport?.list || []).filter((t) => t.status === "waiting_customer").length
  );

  const displayUser = profile ?? customer;

  const handleLogout = () => {
    dispatch(customerLogout());
    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-[1280px] mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">

          {/* ── Sidebar ── */}
          <aside className="lg:w-64 flex-shrink-0">

            {/* Profile card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
              <div className="flex items-center gap-3">
                {displayUser?.profile_image ? (
                  <img
                    src={displayUser.profile_image}
                    alt="avatar"
                    className="w-14 h-14 rounded-full object-cover border-2 border-primary-100"
                  />
                ) : (
                  <div className="w-14 h-14 bg-primary-600 rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                    {(displayUser?.name ?? "U")[0].toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-bold text-gray-900 truncate">{displayUser?.name ?? "Customer"}</p>
                  <p className="text-xs text-gray-400 truncate">{displayUser?.email ?? ""}</p>
                </div>
              </div>
            </div>

            {/* Nav links */}
            <nav className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {navItems.map(({ to, icon: Icon, label, exact }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={exact}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-4 py-3 text-sm transition-colors border-b border-gray-50 last:border-0 ${
                      isActive
                        ? "bg-primary-50 text-primary-600 font-semibold"
                        : "text-gray-700 hover:bg-gray-50"
                    }`
                  }
                >
                  <span className="flex items-center gap-3">
                    <Icon size={18} className="flex-shrink-0" />
                    {label}
                    {label === "Notifications" && unread > 0 && (
                      <span className="ml-1 min-w-[18px] h-[18px] bg-primary-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                        {unread > 9 ? "9+" : unread}
                      </span>
                    )}
                    {label === "My Support Tickets" && openTickets > 0 && (
                      <span className="ml-1 min-w-[18px] h-[18px] bg-yellow-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                        {openTickets > 9 ? "9+" : openTickets}
                      </span>
                    )}
                  </span>
                  <MdChevronRight size={16} className="text-gray-300 flex-shrink-0" />
                </NavLink>
              ))}

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors border-t border-gray-100"
              >
                <MdLogout size={18} /> Logout
              </button>
            </nav>
          </aside>

          {/* ── Main content ── */}
          <main className="flex-1 min-w-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default AccountLayout;
