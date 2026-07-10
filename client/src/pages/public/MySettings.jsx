import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { MdSecurity, MdNotifications, MdLanguage, MdDeleteForever, MdCheck, MdVisibility, MdVisibilityOff } from "react-icons/md";
import { customerLogout } from "../../features/public/customerAuthSlice";
import toast from "react-hot-toast";

const Toggle = ({ enabled, onChange, label, desc }) => (
  <div className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
    <div>
      <p className="text-sm font-semibold text-gray-800">{label}</p>
      {desc && <p className="text-xs text-gray-400 mt-0.5">{desc}</p>}
    </div>
    <button onClick={() => onChange(!enabled)}
      className={`relative w-11 h-6 rounded-full transition-all flex-shrink-0 ${enabled ? "bg-primary-600" : "bg-gray-200"}`}>
      <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${enabled ? "left-[22px]" : "left-0.5"}`}/>
    </button>
  </div>
);

const MySettings = () => {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();

  const [oldPw,    setOldPw]    = useState("");
  const [newPw,    setNewPw]    = useState("");
  const [confPw,   setConfPw]   = useState("");
  const [showOld,  setShowOld]  = useState(false);
  const [showNew,  setShowNew]  = useState(false);
  const [showConf, setShowConf] = useState(false);

  const [notifs, setNotifs] = useState({ orderUpdates:true, promotions:true, priceDrops:true, newsletter:false, sms:true, push:true });
  const [privacy,setPrivacy]= useState({ profileVisible:true, reviewsPublic:true, dataSharing:false });
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const toggleNotif  = (k, v) => setNotifs(n => ({...n, [k]:v}));
  const togglePrivacy = (k, v) => setPrivacy(p => ({...p, [k]:v}));

  const changePassword = (e) => {
    e.preventDefault();
    if (newPw !== confPw) { toast.error("Passwords don't match!"); return; }
    if (newPw.length < 8)  { toast.error("Password must be at least 8 characters"); return; }
    toast.success("Password updated successfully!");
    setOldPw(""); setNewPw(""); setConfPw("");
  };

  const deleteAccount = () => {
    dispatch(customerLogout());
    toast.success("Account deleted. Goodbye!");
    navigate("/");
  };

  const PwInput = ({ label, val, set, show, toggle }) => (
    <div>
      <label className="text-xs font-bold text-gray-500 mb-1 block">{label}</label>
      <div className="relative">
        <input type={show ? "text" : "password"} value={val} onChange={(e) => set(e.target.value)}
          required placeholder="••••••••"
          className="w-full border border-gray-200 rounded-xl px-3.5 pr-10 py-2.5 text-sm outline-none focus:border-primary-500"/>
        <button type="button" onClick={toggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
          {show ? <MdVisibilityOff size={17}/> : <MdVisibility size={17}/>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-[700px] mx-auto px-4 py-8 space-y-5">
        <div>
          <h1 className="text-xl font-extrabold text-gray-900">Account Settings</h1>
          <p className="text-xs text-gray-400 mt-0.5">Manage your security, notifications and privacy</p>
        </div>

        {/* Change Password */}
        <section className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center">
              <MdSecurity size={20} className="text-blue-600"/>
            </div>
            <div><p className="text-sm font-extrabold text-gray-900">Change Password</p><p className="text-xs text-gray-400">Use a strong password you don't use elsewhere</p></div>
          </div>
          <form onSubmit={changePassword} className="space-y-4">
            <PwInput label="Current Password *"  val={oldPw}  set={setOldPw}  show={showOld}  toggle={() => setShowOld(v=>!v)}/>
            <PwInput label="New Password *"       val={newPw}  set={setNewPw}  show={showNew}  toggle={() => setShowNew(v=>!v)}/>
            <PwInput label="Confirm New Password *"val={confPw} set={setConfPw} show={showConf} toggle={() => setShowConf(v=>!v)}/>
            {newPw && (
              <div className="flex gap-1.5">
                {["8+ chars","Uppercase","Number","Special"].map((r, i) => {
                  const pass = [newPw.length>=8, /[A-Z]/.test(newPw), /\d/.test(newPw), /[^A-Za-z0-9]/.test(newPw)][i];
                  return (
                    <span key={r} className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${pass ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"}`}>
                      {pass ? "✓" : "○"} {r}
                    </span>
                  );
                })}
              </div>
            )}
            <button type="submit" className="w-full bg-primary-600 hover:bg-primary-700 text-white font-extrabold py-3 rounded-xl text-sm transition-colors shadow-md flex items-center justify-center gap-2">
              <MdCheck size={16}/> Update Password
            </button>
          </form>
        </section>

        {/* Notifications */}
        <section className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-purple-50 border border-purple-100 rounded-xl flex items-center justify-center">
              <MdNotifications size={20} className="text-purple-600"/>
            </div>
            <div><p className="text-sm font-extrabold text-gray-900">Notification Preferences</p><p className="text-xs text-gray-400">Choose what alerts you receive</p></div>
          </div>
          <Toggle enabled={notifs.orderUpdates} onChange={(v)=>toggleNotif("orderUpdates",v)} label="Order Updates"         desc="Shipping, delivery and return notifications"/>
          <Toggle enabled={notifs.promotions}   onChange={(v)=>toggleNotif("promotions",v)}   label="Deals & Promotions"    desc="Flash sales, coupons and exclusive offers"/>
          <Toggle enabled={notifs.priceDrops}   onChange={(v)=>toggleNotif("priceDrops",v)}   label="Price Drop Alerts"     desc="When wishlist items go on sale"/>
          <Toggle enabled={notifs.newsletter}   onChange={(v)=>toggleNotif("newsletter",v)}   label="Newsletter"            desc="Weekly curated deals and new arrivals"/>
          <Toggle enabled={notifs.sms}          onChange={(v)=>toggleNotif("sms",v)}          label="SMS Notifications"     desc="Text messages for important updates"/>
          <Toggle enabled={notifs.push}         onChange={(v)=>toggleNotif("push",v)}         label="Push Notifications"    desc="Browser and app push alerts"/>
          <button onClick={() => toast.success("Notification preferences saved!")}
            className="mt-4 w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 rounded-xl text-sm transition-colors">
            Save Preferences
          </button>
        </section>

        {/* Privacy */}
        <section className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-green-50 border border-green-100 rounded-xl flex items-center justify-center">
              <MdLanguage size={20} className="text-green-600"/>
            </div>
            <div><p className="text-sm font-extrabold text-gray-900">Privacy Settings</p><p className="text-xs text-gray-400">Control your data and visibility</p></div>
          </div>
          <Toggle enabled={privacy.profileVisible} onChange={(v)=>togglePrivacy("profileVisible",v)} label="Public Profile"   desc="Allow others to see your profile and reviews"/>
          <Toggle enabled={privacy.reviewsPublic}  onChange={(v)=>togglePrivacy("reviewsPublic",v)}  label="Public Reviews"   desc="Show your name on product reviews"/>
          <Toggle enabled={privacy.dataSharing}    onChange={(v)=>togglePrivacy("dataSharing",v)}    label="Personalisation"  desc="Allow data use for personalised recommendations"/>
        </section>

        {/* Danger Zone */}
        <section className="bg-red-50 border border-red-100 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-red-100 border border-red-200 rounded-xl flex items-center justify-center">
              <MdDeleteForever size={20} className="text-red-600"/>
            </div>
            <div><p className="text-sm font-extrabold text-red-700">Danger Zone</p><p className="text-xs text-red-400">These actions are irreversible</p></div>
          </div>
          {!deleteConfirm ? (
            <button onClick={() => setDeleteConfirm(true)}
              className="w-full border-2 border-dashed border-red-300 text-red-600 font-bold py-3 rounded-xl hover:bg-red-100 transition-colors text-sm">
              Delete My Account
            </button>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-red-700 font-semibold">Are you absolutely sure? All your data, orders and wishlist will be permanently deleted.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirm(false)} className="flex-1 border border-gray-200 text-gray-600 font-bold py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-sm">Cancel</button>
                <button onClick={deleteAccount} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-extrabold py-2.5 rounded-xl transition-colors text-sm">Yes, Delete</button>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
export default MySettings;
