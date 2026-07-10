import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  MdShoppingBag, MdFavoriteBorder, MdLocationOn, MdLocalOffer,
  MdStar, MdNotifications, MdSettings, MdArrowForward,
  MdVerified, MdCardGiftcard, MdSecurity, MdPerson,
} from "react-icons/md";
import { FaRupeeSign } from "react-icons/fa";

const quickLinks = [
  { icon: <MdShoppingBag size={26} className="text-blue-600"/>,     label:"My Orders",      sub:"Track & manage orders",    path:"/my-orders",    bg:"bg-blue-50 border-blue-100"    },
  { icon: <MdFavoriteBorder size={26} className="text-rose-600"/>,  label:"My Wishlist",    sub:"Saved items",               path:"/wishlist",     bg:"bg-rose-50 border-rose-100"    },
  { icon: <MdLocationOn size={26} className="text-green-600"/>,     label:"My Addresses",   sub:"Saved delivery addresses",  path:"/my-addresses", bg:"bg-green-50 border-green-100"  },
  { icon: <MdLocalOffer size={26} className="text-orange-600"/>,    label:"My Coupons",     sub:"Available discount codes",  path:"/my-coupons",   bg:"bg-orange-50 border-orange-100"},
  { icon: <MdStar size={26} className="text-amber-500"/>,           label:"My Reviews",     sub:"Ratings you've submitted",  path:"/my-reviews",   bg:"bg-amber-50 border-amber-100"  },
  { icon: <MdNotifications size={26} className="text-purple-600"/>, label:"Notifications",  sub:"Alerts & updates",          path:"/notifications",bg:"bg-purple-50 border-purple-100"},
  { icon: <MdCardGiftcard size={26} className="text-pink-600"/>,    label:"Gift Cards",     sub:"Buy & redeem gift cards",   path:"/gift-cards",   bg:"bg-pink-50 border-pink-100"    },
  { icon: <MdSettings size={26} className="text-slate-600"/>,       label:"Account Settings",sub:"Password & preferences",  path:"/my-settings",  bg:"bg-slate-50 border-slate-100"  },
];

const recentOrders = [
  { id:"SE2024001", product:"Samsung Galaxy S24 Ultra", date:"Jul 7, 2026",  status:"Shipped",    amount:89999, emoji:"📱", statusColor:"bg-blue-100 text-blue-700"   },
  { id:"SE2024002", product:"Nike Air Max 270",          date:"Jul 5, 2026",  status:"Delivered",  amount:8999,  emoji:"👟", statusColor:"bg-green-100 text-green-700" },
  { id:"SE2024003", product:"Atomic Habits — Book",      date:"Jul 3, 2026",  status:"Processing", amount:399,   emoji:"📗", statusColor:"bg-amber-100 text-amber-700" },
];

const MyAccount = () => {
  const customer = useSelector((s) => s.customerAuth?.user ?? null);
  const wishlistCount = useSelector((s) => s.publicWishlist?.count ?? 0);

  const initials = customer?.name?.split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase() || "U";

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-[1100px] mx-auto px-4 py-8 space-y-6">

        {/* Profile Hero Card */}
        <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-indigo-700 rounded-3xl p-7 text-white relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none"/>
          <div className="absolute bottom-0 left-1/3 w-36 h-36 bg-white/5 rounded-full blur-2xl pointer-events-none"/>
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="w-20 h-20 bg-white/20 border-2 border-white/40 rounded-2xl flex items-center justify-center text-3xl font-extrabold flex-shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-extrabold">{customer?.name || "Guest User"}</h1>
                <span className="flex items-center gap-1 bg-white/20 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                  <MdVerified size={12}/> Verified
                </span>
              </div>
              <p className="text-white/70 text-sm mt-0.5">{customer?.email}</p>
              <p className="text-white/60 text-xs mt-0.5">{customer?.phone || "+91 XXXXX XXXXX"}</p>
              <div className="flex flex-wrap gap-3 mt-3">
                {[
                  { label:`${recentOrders.length} Orders`,  icon:"📦" },
                  { label:`${wishlistCount} Wishlisted`,    icon:"❤️" },
                  { label:"Gold Member",                    icon:"🏆" },
                ].map((s) => (
                  <span key={s.label} className="flex items-center gap-1.5 bg-white/15 border border-white/20 rounded-full px-3 py-1 text-xs font-semibold">
                    {s.icon} {s.label}
                  </span>
                ))}
              </div>
            </div>
            <Link to="/my-profile"
              className="flex items-center gap-2 bg-white/15 hover:bg-white/25 border border-white/30 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-colors flex-shrink-0">
              <MdPerson size={15}/> Edit Profile
            </Link>
          </div>
        </div>

        {/* Quick Links Grid */}
        <section>
          <h2 className="text-base font-extrabold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {quickLinks.map((l) => (
              <Link key={l.path} to={l.path}
                className={`${l.bg} border rounded-2xl p-4 flex flex-col gap-2 hover:shadow-md hover:-translate-y-0.5 transition-all group`}>
                {l.icon}
                <div>
                  <p className="text-sm font-extrabold text-gray-900 group-hover:text-primary-600 transition-colors">{l.label}</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">{l.sub}</p>
                </div>
                <MdArrowForward size={14} className="text-gray-300 group-hover:text-primary-500 self-end transition-colors"/>
              </Link>
            ))}
          </div>
        </section>

        {/* Recent Orders */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-extrabold text-gray-900">Recent Orders</h2>
            <Link to="/my-orders" className="text-sm text-primary-600 font-semibold hover:underline flex items-center gap-1">
              View All <MdArrowForward size={14}/>
            </Link>
          </div>
          <div className="space-y-3">
            {recentOrders.map((o) => (
              <div key={o.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">{o.emoji}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{o.product}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Order #{o.id} · {o.date}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-extrabold text-gray-900">&#8377;{o.amount.toLocaleString()}</p>
                  <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 ${o.statusColor}`}>{o.status}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Account Security & Services */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-50 border border-green-100 rounded-xl flex items-center justify-center">
                <MdSecurity size={20} className="text-green-600"/>
              </div>
              <div>
                <p className="text-sm font-extrabold text-gray-900">Account Security</p>
                <p className="text-xs text-gray-400">Your account is secure</p>
              </div>
            </div>
            <div className="space-y-2.5">
              {[
                { label:"Email Verified",       done:true  },
                { label:"Phone Verified",        done:!!customer?.phone },
                { label:"Two-Factor Auth",       done:false },
                { label:"Password Strength",     done:true  },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">{item.label}</span>
                  <span className={`font-bold ${item.done ? "text-green-600" : "text-amber-500"}`}>
                    {item.done ? "✓ Done" : "Set up"}
                  </span>
                </div>
              ))}
            </div>
            <Link to="/my-settings" className="mt-4 block text-center text-xs font-bold text-primary-600 hover:underline">
              Manage Security Settings
            </Link>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-amber-50 border border-amber-100 rounded-xl flex items-center justify-center">
                <span className="text-xl">🏆</span>
              </div>
              <div>
                <p className="text-sm font-extrabold text-gray-900">Loyalty Status</p>
                <p className="text-xs text-amber-600 font-semibold">Gold Member</p>
              </div>
            </div>
            <div className="mb-3">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-500">Points: 2,450</span>
                <span className="text-gray-400">Next: Platinum at 5,000</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full" style={{width:"49%"}}/>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              {[["2,450","Points"], ["₹245","Worth"], ["8","Orders"]].map(([v,l]) => (
                <div key={l} className="bg-amber-50 rounded-xl py-2">
                  <p className="text-sm font-extrabold text-amber-700">{v}</p>
                  <p className="text-[10px] text-gray-500">{l}</p>
                </div>
              ))}
            </div>
            <Link to="/my-coupons" className="mt-4 block text-center text-xs font-bold text-primary-600 hover:underline">
              View Available Rewards
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
export default MyAccount;
