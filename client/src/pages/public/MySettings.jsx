import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  MdSecurity, MdNotifications, MdLanguage, MdDeleteForever,
  MdCheck, MdVisibility, MdVisibilityOff, MdWarning,
  MdHourglassEmpty, MdCheckCircle, MdCancel, MdInfo,
  MdSend, MdClose,
} from "react-icons/md";
import { customerLogout } from "../../features/public/customerAuthSlice";
import {
  submitDeletionRequest,
  fetchMyDeletionRequest,
  cancelDeletionRequest,
  resetSubmitStatus,
} from "../../features/public/publicAccountDeletionSlice";
import toast from "react-hot-toast";

// ── Toggle component ──────────────────────────────────────────────────────────
const Toggle = ({ enabled, onChange, label, desc }) => (
  <div className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
    <div>
      <p className="text-sm font-semibold text-gray-800">{label}</p>
      {desc && <p className="text-xs text-gray-400 mt-0.5">{desc}</p>}
    </div>
    <button
      onClick={() => onChange(!enabled)}
      className={`relative w-11 h-6 rounded-full transition-all flex-shrink-0 ${enabled ? "bg-primary-600" : "bg-gray-200"}`}
    >
      <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${enabled ? "left-[22px]" : "left-0.5"}`} />
    </button>
  </div>
);

// ── Status badge helper ───────────────────────────────────────────────────────
const STATUS_META = {
  pending:  { label: "Pending Review",      color: "bg-amber-100 text-amber-700",   icon: MdHourglassEmpty },
  reviewed: { label: "Forwarded to Admin",  color: "bg-blue-100 text-blue-700",     icon: MdInfo },
  approved: { label: "Approved",            color: "bg-green-100 text-green-700",   icon: MdCheckCircle },
  rejected: { label: "Rejected",            color: "bg-red-100 text-red-700",       icon: MdCancel },
  deleted:  { label: "Account Deleted",     color: "bg-gray-100 text-gray-600",     icon: MdDeleteForever },
};

const StatusBadge = ({ status }) => {
  const meta = STATUS_META[status] || STATUS_META.pending;
  const Icon = meta.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${meta.color}`}>
      <Icon size={13} /> {meta.label}
    </span>
  );
};

// ── DELETION ZONE ─────────────────────────────────────────────────────────────
const DELETION_REASONS = [
  "I no longer need this account",
  "I have privacy concerns",
  "I'm not satisfied with the service",
  "I created a duplicate account",
  "I want to remove my personal data",
  "Other",
];

const DeletionZone = () => {
  const dispatch = useDispatch();
  const { myRequest, fetchStatus, submitStatus, cancelStatus } =
    useSelector((s) => s.publicAccountDeletion);

  const [showForm,        setShowForm]        = useState(false);
  const [reason,          setReason]          = useState("");
  const [additionalInfo,  setAdditionalInfo]  = useState("");
  const [confirmText,     setConfirmText]      = useState("");
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  // Fetch current request status on mount
  useEffect(() => {
    dispatch(fetchMyDeletionRequest());
  }, [dispatch]);

  // After successful submit, re-fetch to show the new status card
  useEffect(() => {
    if (submitStatus === "succeeded") {
      dispatch(resetSubmitStatus());
      setShowForm(false);
      setReason("");
      setAdditionalInfo("");
      setConfirmText("");
      dispatch(fetchMyDeletionRequest());
    }
  }, [submitStatus, dispatch]);

  const handleSubmit = async () => {
    if (!reason) { toast.error("Please select a reason"); return; }
    if (confirmText !== "DELETE") { toast.error('Type "DELETE" to confirm'); return; }

    const res = await dispatch(submitDeletionRequest({ reason, additional_info: additionalInfo }));
    if (res.payload?.success) {
      toast.success("Deletion request submitted. Our team will review it shortly.");
    } else {
      toast.error(res.payload?.message || "Failed to submit request");
    }
  };

  const handleCancel = async () => {
    const res = await dispatch(cancelDeletionRequest());
    if (res.payload?.success) {
      toast.success("Deletion request cancelled");
      setShowCancelConfirm(false);
    } else {
      toast.error(res.payload?.message || "Failed to cancel");
    }
  };

  const isSubmitting = submitStatus === "loading";
  const isCancelling = cancelStatus === "loading";
  const isLoading    = fetchStatus === "loading";

  // ── Active request card ────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <section className="bg-red-50 border border-red-100 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-red-100 border border-red-200 rounded-xl flex items-center justify-center">
            <MdDeleteForever size={20} className="text-red-600" />
          </div>
          <div>
            <p className="text-sm font-extrabold text-red-700">Account Deletion</p>
            <p className="text-xs text-red-400">Loading your request status…</p>
          </div>
        </div>
        <div className="flex justify-center py-4">
          <div className="w-6 h-6 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
        </div>
      </section>
    );
  }

  // If an active request exists, show its status card
  if (myRequest && ["pending", "reviewed", "approved"].includes(myRequest.status)) {
    return (
      <section className="bg-red-50 border border-red-100 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-100 border border-red-200 rounded-xl flex items-center justify-center">
            <MdDeleteForever size={20} className="text-red-600" />
          </div>
          <div>
            <p className="text-sm font-extrabold text-red-700">Account Deletion Request</p>
            <p className="text-xs text-red-400">Your request is currently being processed</p>
          </div>
        </div>

        {/* Status card */}
        <div className="bg-white rounded-xl border border-red-100 p-4 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Request Status</p>
            <StatusBadge status={myRequest.status} />
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex gap-2">
              <span className="text-gray-400 min-w-[90px]">Reason:</span>
              <span className="text-gray-700 font-medium">{myRequest.reason}</span>
            </div>
            {myRequest.additional_info && (
              <div className="flex gap-2">
                <span className="text-gray-400 min-w-[90px]">Details:</span>
                <span className="text-gray-600">{myRequest.additional_info}</span>
              </div>
            )}
            <div className="flex gap-2">
              <span className="text-gray-400 min-w-[90px]">Submitted:</span>
              <span className="text-gray-600">
                {new Date(myRequest.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
              </span>
            </div>
            {myRequest.employee_notes && (
              <div className="flex gap-2">
                <span className="text-gray-400 min-w-[90px]">Team note:</span>
                <span className="text-gray-600 italic">"{myRequest.employee_notes}"</span>
              </div>
            )}
            {myRequest.reviewed_by?.name && (
              <div className="flex gap-2">
                <span className="text-gray-400 min-w-[90px]">Reviewed by:</span>
                <span className="text-gray-600">{myRequest.reviewed_by.name}</span>
              </div>
            )}
          </div>

          {/* Flow steps */}
          <div className="pt-2">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Processing Steps</p>
            <div className="flex items-center gap-1">
              {[
                { label: "Submitted",      done: true },
                { label: "Employee Review",done: myRequest.status !== "pending" },
                { label: "Admin Decision", done: myRequest.status === "approved" },
              ].map((step, i, arr) => (
                <div key={step.label} className="flex items-center gap-1 flex-1">
                  <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold
                    ${step.done ? "bg-green-500 text-white" : "bg-gray-200 text-gray-400"}`}>
                    {step.done ? "✓" : i + 1}
                  </div>
                  <p className={`text-[10px] font-semibold leading-tight ${step.done ? "text-green-600" : "text-gray-400"}`}>
                    {step.label}
                  </p>
                  {i < arr.length - 1 && (
                    <div className={`h-0.5 flex-1 mx-1 rounded ${step.done ? "bg-green-300" : "bg-gray-200"}`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Cancel — only allowed when still pending */}
        {myRequest.status === "pending" && (
          <>
            {!showCancelConfirm ? (
              <button
                onClick={() => setShowCancelConfirm(true)}
                className="w-full border border-gray-200 bg-white text-gray-600 font-semibold py-2.5 rounded-xl text-sm hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                <MdClose size={16} /> Cancel My Request
              </button>
            ) : (
              <div className="bg-white rounded-xl border border-red-200 p-4 space-y-3">
                <p className="text-sm font-semibold text-gray-700">
                  Are you sure you want to cancel your deletion request?
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowCancelConfirm(false)}
                    className="flex-1 border border-gray-200 text-gray-600 font-semibold py-2 rounded-xl text-sm hover:bg-gray-50"
                  >
                    Keep Request
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={isCancelling}
                    className="flex-1 bg-gray-800 text-white font-bold py-2 rounded-xl text-sm hover:bg-gray-900 disabled:opacity-60"
                  >
                    {isCancelling ? "Cancelling…" : "Yes, Cancel"}
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Approved — show deactivation notice */}
        {myRequest.status === "approved" && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <p className="text-sm font-bold text-green-800 flex items-center gap-2">
              <MdCheckCircle size={16} /> Request Approved
            </p>
            <p className="text-xs text-green-700 mt-1">
              Your account has been deactivated. Our team will complete the data deletion process within 30 days.
              You will receive a confirmation email once done.
            </p>
          </div>
        )}
      </section>
    );
  }

  // ── Request form ───────────────────────────────────────────────────────────
  return (
    <section className="bg-red-50 border border-red-100 rounded-2xl p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-red-100 border border-red-200 rounded-xl flex items-center justify-center">
          <MdDeleteForever size={20} className="text-red-600" />
        </div>
        <div>
          <p className="text-sm font-extrabold text-red-700">Danger Zone</p>
          <p className="text-xs text-red-400">Account deletion requires admin approval</p>
        </div>
      </div>

      {!showForm ? (
        <>
          <div className="bg-white rounded-xl border border-red-100 p-4 space-y-2">
            <p className="text-xs font-bold text-gray-600 flex items-center gap-1.5">
              <MdInfo size={14} className="text-blue-500" /> How account deletion works
            </p>
            <ul className="text-xs text-gray-500 space-y-1.5 list-none">
              {[
                "You submit a deletion request with a reason",
                "Our team reviews the request and checks for pending orders or dues",
                "The request is forwarded to an admin for final approval",
                "Once approved, your account is deactivated and data is permanently removed within 30 days",
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-4 h-4 bg-red-100 text-red-600 rounded-full text-[10px] font-bold flex items-center justify-center mt-0.5">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ul>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="w-full border-2 border-dashed border-red-300 text-red-600 font-bold py-3 rounded-xl hover:bg-red-100 transition-colors text-sm flex items-center justify-center gap-2"
          >
            <MdDeleteForever size={18} /> Request Account Deletion
          </button>
        </>
      ) : (
        <div className="bg-white rounded-xl border border-red-200 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-gray-800">Account Deletion Request</p>
            <button
              onClick={() => { setShowForm(false); setReason(""); setAdditionalInfo(""); setConfirmText(""); }}
              className="p-1 rounded-lg hover:bg-gray-100 text-gray-400"
            >
              <MdClose size={18} />
            </button>
          </div>

          {/* Warning */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
            <MdWarning size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800 leading-relaxed">
              <strong>This action is irreversible.</strong> All your orders, addresses, reviews, and personal data will be permanently deleted once approved. Any pending orders must be resolved first.
            </p>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5">
              Reason for deletion <span className="text-red-500">*</span>
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-red-400 focus:ring-1 focus:ring-red-200 bg-white"
            >
              <option value="">Select a reason…</option>
              {DELETION_REASONS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          {/* Additional info */}
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5">
              Additional details <span className="text-gray-400">(optional)</span>
            </label>
            <textarea
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              placeholder="Tell us more about your concern so we can help…"
              rows={3}
              maxLength={500}
              className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-red-400 focus:ring-1 focus:ring-red-200 resize-none"
            />
            <p className="text-[10px] text-gray-400 text-right mt-0.5">{additionalInfo.length}/500</p>
          </div>

          {/* Confirmation */}
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5">
              Type <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-red-600">DELETE</span> to confirm
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
              placeholder="Type DELETE here"
              className={`w-full border rounded-xl px-3.5 py-2.5 text-sm outline-none font-mono transition-all
                ${confirmText === "DELETE"
                  ? "border-red-400 ring-1 ring-red-200 bg-red-50"
                  : "border-gray-200 focus:border-red-300"}`}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              onClick={() => { setShowForm(false); setReason(""); setAdditionalInfo(""); setConfirmText(""); }}
              className="flex-1 border border-gray-200 text-gray-600 font-semibold py-2.5 rounded-xl text-sm hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !reason || confirmText !== "DELETE"}
              className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-2.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Submitting…</>
              ) : (
                <><MdSend size={15} /> Submit Request</>
              )}
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

// ── Main MySettings ───────────────────────────────────────────────────────────
const MySettings = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [oldPw,    setOldPw]    = useState("");
  const [newPw,    setNewPw]    = useState("");
  const [confPw,   setConfPw]   = useState("");
  const [showOld,  setShowOld]  = useState(false);
  const [showNew,  setShowNew]  = useState(false);
  const [showConf, setShowConf] = useState(false);

  const [notifs, setNotifs]   = useState({ orderUpdates: true, promotions: true, priceDrops: true, newsletter: false, sms: true, push: true });
  const [privacy, setPrivacy] = useState({ profileVisible: true, reviewsPublic: true, dataSharing: false });

  const toggleNotif   = (k, v) => setNotifs(n => ({ ...n, [k]: v }));
  const togglePrivacy = (k, v) => setPrivacy(p => ({ ...p, [k]: v }));

  const changePassword = (e) => {
    e.preventDefault();
    if (newPw !== confPw)  { toast.error("Passwords don't match!"); return; }
    if (newPw.length < 8)  { toast.error("Password must be at least 8 characters"); return; }
    toast.success("Password updated successfully!");
    setOldPw(""); setNewPw(""); setConfPw("");
  };

  const PwInput = ({ label, val, set, show, toggle }) => (
    <div>
      <label className="text-xs font-bold text-gray-500 mb-1 block">{label}</label>
      <div className="relative">
        <input
          type={show ? "text" : "password"} value={val}
          onChange={(e) => set(e.target.value)} required placeholder="••••••••"
          className="w-full border border-gray-200 rounded-xl px-3.5 pr-10 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-200"
        />
        <button type="button" onClick={toggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
          {show ? <MdVisibilityOff size={17} /> : <MdVisibility size={17} />}
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
              <MdSecurity size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-extrabold text-gray-900">Change Password</p>
              <p className="text-xs text-gray-400">Use a strong password you don't use elsewhere</p>
            </div>
          </div>
          <form onSubmit={changePassword} className="space-y-4">
            <PwInput label="Current Password *"     val={oldPw}  set={setOldPw}  show={showOld}  toggle={() => setShowOld(v => !v)} />
            <PwInput label="New Password *"         val={newPw}  set={setNewPw}  show={showNew}  toggle={() => setShowNew(v => !v)} />
            <PwInput label="Confirm New Password *" val={confPw} set={setConfPw} show={showConf} toggle={() => setShowConf(v => !v)} />
            {newPw && (
              <div className="flex gap-1.5 flex-wrap">
                {["8+ chars", "Uppercase", "Number", "Special"].map((r, i) => {
                  const pass = [newPw.length >= 8, /[A-Z]/.test(newPw), /\d/.test(newPw), /[^A-Za-z0-9]/.test(newPw)][i];
                  return (
                    <span key={r} className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${pass ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"}`}>
                      {pass ? "✓" : "○"} {r}
                    </span>
                  );
                })}
              </div>
            )}
            <button type="submit" className="w-full bg-primary-600 hover:bg-primary-700 text-white font-extrabold py-3 rounded-xl text-sm transition-colors shadow-md flex items-center justify-center gap-2">
              <MdCheck size={16} /> Update Password
            </button>
          </form>
        </section>

        {/* Notifications */}
        <section className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-purple-50 border border-purple-100 rounded-xl flex items-center justify-center">
              <MdNotifications size={20} className="text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-extrabold text-gray-900">Notification Preferences</p>
              <p className="text-xs text-gray-400">Choose what alerts you receive</p>
            </div>
          </div>
          <Toggle enabled={notifs.orderUpdates} onChange={(v) => toggleNotif("orderUpdates", v)} label="Order Updates"      desc="Shipping, delivery and return notifications" />
          <Toggle enabled={notifs.promotions}   onChange={(v) => toggleNotif("promotions", v)}   label="Deals & Promotions" desc="Flash sales, coupons and exclusive offers" />
          <Toggle enabled={notifs.priceDrops}   onChange={(v) => toggleNotif("priceDrops", v)}   label="Price Drop Alerts"  desc="When wishlist items go on sale" />
          <Toggle enabled={notifs.newsletter}   onChange={(v) => toggleNotif("newsletter", v)}   label="Newsletter"         desc="Weekly curated deals and new arrivals" />
          <Toggle enabled={notifs.sms}          onChange={(v) => toggleNotif("sms", v)}          label="SMS Notifications"  desc="Text messages for important updates" />
          <Toggle enabled={notifs.push}         onChange={(v) => toggleNotif("push", v)}         label="Push Notifications" desc="Browser and app push alerts" />
          <button
            onClick={() => toast.success("Notification preferences saved!")}
            className="mt-4 w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 rounded-xl text-sm transition-colors"
          >
            Save Preferences
          </button>
        </section>

        {/* Privacy */}
        <section className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-green-50 border border-green-100 rounded-xl flex items-center justify-center">
              <MdLanguage size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm font-extrabold text-gray-900">Privacy Settings</p>
              <p className="text-xs text-gray-400">Control your data and visibility</p>
            </div>
          </div>
          <Toggle enabled={privacy.profileVisible} onChange={(v) => togglePrivacy("profileVisible", v)} label="Public Profile"   desc="Allow others to see your profile and reviews" />
          <Toggle enabled={privacy.reviewsPublic}  onChange={(v) => togglePrivacy("reviewsPublic", v)}  label="Public Reviews"   desc="Show your name on product reviews" />
          <Toggle enabled={privacy.dataSharing}    onChange={(v) => togglePrivacy("dataSharing", v)}    label="Personalisation"  desc="Allow data use for personalised recommendations" />
        </section>

        {/* Danger Zone — account deletion request */}
        <DeletionZone />
      </div>
    </div>
  );
};

export default MySettings;
