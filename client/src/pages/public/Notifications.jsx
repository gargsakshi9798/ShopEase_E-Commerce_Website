import { useState } from "react";
import { MdNotifications, MdLocalShipping, MdLocalOffer, MdStar, MdSecurity, MdInfo, MdCheckCircle, MdDelete } from "react-icons/md";

const icons = {
  order:   <MdLocalShipping size={20} className="text-blue-600"/>,
  offer:   <MdLocalOffer size={20} className="text-orange-500"/>,
  review:  <MdStar size={20} className="text-amber-500"/>,
  security:<MdSecurity size={20} className="text-red-500"/>,
  info:    <MdInfo size={20} className="text-gray-500"/>,
  success: <MdCheckCircle size={20} className="text-green-500"/>,
};
const bgs = {
  order:"bg-blue-50 border-blue-100",offer:"bg-orange-50 border-orange-100",
  review:"bg-amber-50 border-amber-100",security:"bg-red-50 border-red-100",
  info:"bg-gray-50 border-gray-100",success:"bg-green-50 border-green-100",
};

const defaultNotifs = [
  { id:1, type:"order",   title:"Your order has been shipped!",              body:"Order #SE2024001 (Samsung Galaxy S24 Ultra) is on the way. Expected delivery July 11.",  time:"2 hours ago",   read:false },
  { id:2, type:"offer",   title:"Flash Deal: 40% off on Electronics",        body:"Limited time offer! Grab top electronics at unbeatable prices. Use code FLASH40.",       time:"5 hours ago",   read:false },
  { id:3, type:"success", title:"Refund processed successfully",             body:"₹897 has been refunded to your original payment method for Order #SE2024005.",           time:"Yesterday",     read:false },
  { id:4, type:"review",  title:"Review your recent purchase",               body:"How was your experience with Nike Air Max 270? Share your review and earn 50 reward points.", time:"2 days ago",  read:true  },
  { id:5, type:"offer",   title:"Exclusive offer: Extra 20% off for you",    body:"Because you're a Gold member, enjoy an extra 20% off on your next Fashion purchase.",    time:"3 days ago",    read:true  },
  { id:6, type:"security","title":"New login detected",                      body:"A new sign-in was detected on Chrome, Windows in Gurugram. If this wasn't you, secure your account.", time:"4 days ago", read:true },
  { id:7, type:"order",   title:"Order delivered successfully",              body:"Your order #SE2024002 (Nike Air Max 270) has been delivered. Enjoy!",                    time:"5 days ago",    read:true  },
  { id:8, type:"info",    title:"Price drop on your wishlist item",           body:"Atomic Habits is now ₹100 cheaper! It's in your wishlist. Grab it before stock runs out.", time:"1 week ago",  read:true  },
];

const Notifications = () => {
  const [notifs, setNotifs] = useState(defaultNotifs);
  const [filter, setFilter] = useState("All");

  const unread = notifs.filter(n => !n.read).length;
  const filtered = filter === "All" ? notifs : filter === "Unread" ? notifs.filter(n => !n.read) : notifs.filter(n => n.read);

  const markRead   = (id) => setNotifs(n => n.map(x => x.id === id ? {...x, read:true} : x));
  const markAllRead = () => setNotifs(n => n.map(x => ({...x, read:true})));
  const remove     = (id) => setNotifs(n => n.filter(x => x.id !== id));

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-[700px] mx-auto px-4 py-8 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-extrabold text-gray-900">Notifications</h1>
            {unread > 0 && (
              <span className="bg-primary-600 text-white text-xs font-extrabold px-2 py-0.5 rounded-full">{unread} new</span>
            )}
          </div>
          {unread > 0 && (
            <button onClick={markAllRead} className="text-sm font-bold text-primary-600 hover:underline">Mark all as read</button>
          )}
        </div>

        <div className="flex gap-2">
          {["All","Unread","Read"].map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${filter === f ? "bg-primary-600 text-white shadow" : "bg-white border border-gray-200 text-gray-600 hover:border-primary-400"}`}>
              {f}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center shadow-sm">
            <span className="text-5xl">🔔</span>
            <p className="text-gray-500 mt-4 font-bold">No notifications</p>
            <p className="text-sm text-gray-400 mt-1">You're all caught up!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((n) => (
              <div key={n.id} onClick={() => markRead(n.id)}
                className={`bg-white rounded-2xl border p-4 shadow-sm cursor-pointer transition-all hover:shadow-md ${!n.read ? "border-primary-200 bg-primary-50/30" : "border-gray-100"}`}>
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 ${bgs[n.type]} border rounded-xl flex items-center justify-center flex-shrink-0`}>
                    {icons[n.type]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm ${!n.read ? "font-extrabold text-gray-900" : "font-semibold text-gray-700"}`}>{n.title}</p>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {!n.read && <div className="w-2 h-2 bg-primary-600 rounded-full flex-shrink-0"/>}
                        <button onClick={(e) => { e.stopPropagation(); remove(n.id); }}
                          className="w-6 h-6 flex items-center justify-center text-gray-300 hover:text-red-400 transition-colors">
                          <MdDelete size={14}/>
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{n.body}</p>
                    <p className="text-[10px] text-gray-400 mt-1.5 font-medium">{n.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
export default Notifications;
