import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAdminDetails } from "../../features/auth/authSlice";
import { PATCH, POST } from "../../utils/Methods";
import { APIS } from "../../utils/APIS";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { formatDateTime } from "../../utils/Methods";
import {
  MdPerson, MdEmail, MdPhone, MdCalendarToday, MdVpnKey,
  MdAdminPanelSettings, MdSecurity, MdVisibility, MdVisibilityOff,
  MdEdit, MdSave, MdHistory, MdCircle,
} from "react-icons/md";

const Section = ({ title, icon: Icon, children }) => (
  <div className="bg-white rounded-xl shadow-card p-5 space-y-4">
    <h3 className="text-base font-semibold text-gray-800 border-b border-gray-100 pb-3 flex items-center gap-2">
      <Icon size={18} className="text-primary-600" /> {title}
    </h3>
    {children}
  </div>
);

const InfoRow = ({ label, value, mono }) => (
  <div className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
    <span className="text-sm text-gray-400">{label}</span>
    <span className={`text-sm font-medium text-gray-800 ${mono ? "font-mono" : ""}`}>{value || "—"}</span>
  </div>
);

const MyProfile = () => {
  const dispatch = useDispatch();
  const { data: user } = useSelector((s) => s.auth);

  const [editMode,  setEditMode]  = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [showPwd,   setShowPwd]   = useState({ current: false, new: false, confirm: false });
  const [pwdSaving, setPwdSaving] = useState(false);

  const profileForm = useForm();
  const pwdForm     = useForm();
  const newPwd      = pwdForm.watch("new_password");

  useEffect(() => { dispatch(getAdminDetails()); }, [dispatch]);

  useEffect(() => {
    if (user) {
      profileForm.reset({
        name:       user.name       || "",
        contact_no: user.contact_no || "",
        address:    user.address    || "",
      });
    }
  }, [user]);

  const onProfileSave = async (data) => {
    setSaving(true);
    try {
      await PATCH(`${APIS.Users.ById(user._id)}`, data);
      toast.success("Profile updated!");
      dispatch(getAdminDetails());
      setEditMode(false);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Update failed");
    } finally { setSaving(false); }
  };

  const onPasswordChange = async (data) => {
    if (data.new_password !== data.confirm_password) {
      toast.error("Passwords do not match");
      return;
    }
    setPwdSaving(true);
    try {
      await POST(APIS.Auth.ChangePassword, {
        current_password: data.current_password,
        new_password:     data.new_password,
      });
      toast.success("Password changed successfully!");
      pwdForm.reset();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Password change failed");
    } finally { setPwdSaving(false); }
  };

  const togglePwd = (field) => setShowPwd((p) => ({ ...p, [field]: !p[field] }));

  if (!user) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage your personal information and security settings</p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-xl shadow-card p-6">
        <div className="flex items-center gap-5 flex-wrap">
          {/* Avatar */}
          <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center text-white text-3xl font-black flex-shrink-0 shadow-lg">
            {user.name?.[0]?.toUpperCase() || "A"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
              <span className={`badge ${
                user.role_id?.slug === "super_admin" ? "bg-red-100 text-red-700" :
                user.role_id?.slug === "admin"       ? "bg-purple-100 text-purple-700" :
                "bg-blue-100 text-blue-700"
              }`}>
                {user.role_id?.name || user.role || "Admin"}
              </span>
              <span className="flex items-center gap-1 text-[11px] text-green-600 font-medium">
                <MdCircle size={8} /> Online
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">{user.email}</p>
            {user.contact_no && <p className="text-xs text-gray-400 mt-0.5">{user.contact_no}</p>}
          </div>
          <button
            onClick={() => setEditMode((v) => !v)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${
              editMode ? "border-red-200 text-red-600 hover:bg-red-50" : "border-primary-200 text-primary-700 hover:bg-primary-50"
            }`}
          >
            <MdEdit size={15} /> {editMode ? "Cancel" : "Edit Profile"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Personal Info */}
        <Section title="Personal Information" icon={MdPerson}>
          {editMode ? (
            <form onSubmit={profileForm.handleSubmit(onProfileSave)} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Full Name</label>
                <input className="input-field" {...profileForm.register("name", { required: true })} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Phone Number</label>
                <input className="input-field" placeholder="+91 99999 99999" {...profileForm.register("contact_no")} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Address</label>
                <textarea rows={2} className="input-field resize-none text-sm" {...profileForm.register("address")} />
              </div>
              <button type="submit" disabled={saving}
                className="btn-primary w-full text-sm py-2 flex items-center justify-center gap-2 disabled:opacity-50">
                {saving ? "Saving..." : <><MdSave size={16} /> Save Changes</>}
              </button>
            </form>
          ) : (
            <>
              <InfoRow label="Full Name"   value={user.name} />
              <InfoRow label="Email"       value={user.email} />
              <InfoRow label="Phone"       value={user.contact_no} />
              <InfoRow label="Address"     value={user.address} />
            </>
          )}
        </Section>

        {/* Account Details */}
        <Section title="Account Details" icon={MdAdminPanelSettings}>
          <InfoRow label="Role"         value={user.role_id?.name || user.role || "Admin"} />
          <InfoRow label="User ID"      value={user._id} mono />
          <InfoRow label="Email Status" value={user.is_email_verified ? "✓ Verified" : "Pending"} />
          <InfoRow label="Account Status" value={user.block_status ? "Blocked" : "Active"} />
          <InfoRow label="Joined"       value={user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"} />
          <InfoRow label="Last Login"   value={user.last_login ? formatDateTime(user.last_login) : "—"} />
        </Section>

        {/* Change Password */}
        <Section title="Change Password" icon={MdVpnKey}>
          <form onSubmit={pwdForm.handleSubmit(onPasswordChange)} className="space-y-3">
            {[
              { name: "current_password", label: "Current Password",  key: "current" },
              { name: "new_password",     label: "New Password",      key: "new" },
              { name: "confirm_password", label: "Confirm New Password", key: "confirm" },
            ].map(({ name, label, key }) => (
              <div key={key}>
                <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                <div className="relative">
                  <input
                    type={showPwd[key] ? "text" : "password"}
                    className="input-field pr-10 text-sm"
                    placeholder="••••••••"
                    {...pwdForm.register(name, {
                      required: `${label} is required`,
                      ...(name === "new_password" ? { minLength: { value: 6, message: "Min 6 characters" } } : {}),
                      ...(name === "confirm_password" ? { validate: (v) => v === newPwd || "Passwords do not match" } : {}),
                    })}
                  />
                  <button type="button" onClick={() => togglePwd(key)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPwd[key] ? <MdVisibilityOff size={17} /> : <MdVisibility size={17} />}
                  </button>
                </div>
                {pwdForm.formState.errors[name] && (
                  <p className="text-red-500 text-xs mt-1">{pwdForm.formState.errors[name].message}</p>
                )}
              </div>
            ))}
            <button type="submit" disabled={pwdSaving}
              className="btn-primary w-full text-sm py-2 disabled:opacity-50">
              {pwdSaving ? "Changing..." : "Change Password"}
            </button>
          </form>
        </Section>

        {/* Security Info */}
        <Section title="Security & Activity" icon={MdSecurity}>
          <div className="space-y-3">
            <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-xl p-3">
              <MdSecurity size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-green-800">Account Protected</p>
                <p className="text-xs text-green-600 mt-0.5">Your account has admin-level access controls.</p>
              </div>
            </div>
            <InfoRow label="IP Whitelist"        value="Not configured" />
            <InfoRow label="2FA"                 value="Not enabled" />
            <InfoRow label="Active Sessions"     value="1" />
            <InfoRow label="Email Verified"      value={user.is_email_verified ? "Yes ✓" : "No"} />
            <div className="pt-2">
              <p className="text-xs text-gray-400 flex items-center gap-1.5">
                <MdHistory size={13} />
                Visit <a href="/admin/audit-logs" className="text-primary-600 hover:underline">Audit Logs</a> for full activity history.
              </p>
            </div>
          </div>
        </Section>

      </div>
    </div>
  );
};

export default MyProfile;
