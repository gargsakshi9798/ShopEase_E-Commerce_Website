import { useState } from "react";
import toast from "react-hot-toast";
import {
  MdSecurity, MdLock, MdVpnKey, MdBlock, MdCheckCircle,
  MdWarning, MdPeople, MdHistory, MdShield, MdRefresh,
  MdVisibility, MdVisibilityOff,
} from "react-icons/md";
import { formatDateTime } from "../../utils/Methods";

// ── Mock / Static Security Data ───────────────────────────────────────────────
const SECURITY_CHECKS = [
  { id: "ssl",         label: "SSL Certificate",         status: "pass",    detail: "Valid — expires in 89 days" },
  { id: "2fa",         label: "Two-Factor Authentication",status: "warning", detail: "Not enforced for all admins" },
  { id: "password",    label: "Password Policy",          status: "pass",    detail: "Min 8 chars, complexity enforced" },
  { id: "session",     label: "Session Timeout",          status: "pass",    detail: "30 minute inactivity timeout" },
  { id: "cors",        label: "CORS Policy",              status: "pass",    detail: "Restricted to allowed origins" },
  { id: "rate_limit",  label: "API Rate Limiting",        status: "pass",    detail: "100 req/min per IP" },
  { id: "xss",         label: "XSS Protection",           status: "pass",    detail: "Content-Security-Policy headers set" },
  { id: "sql",         label: "SQL / NoSQL Injection",    status: "pass",    detail: "Mongoose ORM + input sanitization" },
];

const RECENT_LOGINS = [
  { user: "Admin User",  role: "super_admin", ip: "192.168.1.1",  device: "Chrome / Windows", time: new Date(Date.now() - 5*60000),    status: "success" },
  { user: "Rohit Kumar", role: "admin",       ip: "103.5.12.44",  device: "Safari / macOS",   time: new Date(Date.now() - 25*60000),   status: "success" },
  { user: "Unknown",     role: "—",           ip: "45.88.192.33", device: "curl / Linux",      time: new Date(Date.now() - 3600000),    status: "failed" },
  { user: "Priya Singh", role: "employee",    ip: "192.168.1.45", device: "Firefox / Windows", time: new Date(Date.now() - 7200000),   status: "success" },
  { user: "Unknown",     role: "—",           ip: "88.214.1.99",  device: "Python requests",   time: new Date(Date.now() - 14400000),  status: "failed" },
];

const BLOCKED_IPS = [
  { ip: "45.88.192.33", reason: "Brute force attempt", blocked_at: new Date(Date.now() - 3600000) },
  { ip: "88.214.1.99",  reason: "Suspicious bot activity", blocked_at: new Date(Date.now() - 14400000) },
];

const StatusIcon = ({ status }) =>
  status === "pass"
    ? <MdCheckCircle size={18} className="text-green-500" />
    : <MdWarning size={18} className="text-yellow-500" />;

const Security = () => {
  const [showNewIp, setShowNewIp]   = useState(false);
  const [newIp, setNewIp]           = useState("");
  const [newIpReason, setNewIpReason] = useState("");
  const [blockedIps, setBlockedIps] = useState(BLOCKED_IPS);
  const [pwdForm, setPwdForm]       = useState({ current: "", new_pwd: "", confirm: "" });
  const [showPwd, setShowPwd]       = useState({ current: false, new_pwd: false, confirm: false });
  const [saving, setSaving]         = useState(false);

  const passScore = (SECURITY_CHECKS.filter((c) => c.status === "pass").length / SECURITY_CHECKS.length) * 100;

  const blockIp = () => {
    if (!newIp.trim()) return;
    setBlockedIps((prev) => [...prev, { ip: newIp.trim(), reason: newIpReason || "Manual block", blocked_at: new Date() }]);
    setNewIp(""); setNewIpReason(""); setShowNewIp(false);
    toast.success(`IP ${newIp} blocked`);
  };
  const unblockIp = (ip) => {
    setBlockedIps((prev) => prev.filter((b) => b.ip !== ip));
    toast.success(`IP ${ip} unblocked`);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (pwdForm.new_pwd !== pwdForm.confirm) { toast.error("Passwords do not match"); return; }
    if (pwdForm.new_pwd.length < 8) { toast.error("Minimum 8 characters"); return; }
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    toast.success("Password changed successfully");
    setPwdForm({ current: "", new_pwd: "", confirm: "" });
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Security Center</h1>
          <p className="text-sm text-gray-500 mt-0.5">Monitor and manage system security</p>
        </div>
        <button onClick={() => toast.success("Security scan complete")}
          className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">
          <MdRefresh size={16} /> Run Security Scan
        </button>
      </div>

      {/* Security Score */}
      <div className="bg-gradient-to-br from-primary-700 to-primary-900 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-primary-200 text-sm font-medium mb-1">Security Score</p>
            <div className="flex items-end gap-3">
              <p className="text-5xl font-black">{Math.round(passScore)}%</p>
              <span className={`badge mb-1 ${passScore >= 80 ? "bg-green-400/20 text-green-200" : "bg-yellow-400/20 text-yellow-200"}`}>
                {passScore >= 90 ? "Excellent" : passScore >= 70 ? "Good" : "Needs Attention"}
              </span>
            </div>
            <p className="text-primary-300 text-xs mt-2">{SECURITY_CHECKS.filter((c) => c.status === "pass").length} of {SECURITY_CHECKS.length} checks passed</p>
          </div>
          <div className="w-28 h-28 relative flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path d="M18 2.0845a15.9155 15.9155 0 0 1 0 31.831" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="3" />
              <path d="M18 2.0845a15.9155 15.9155 0 0 1 0 31.831" fill="none" stroke="white" strokeWidth="3"
                strokeDasharray={`${passScore}, 100`} strokeLinecap="round" />
            </svg>
            <MdShield size={28} className="absolute text-white" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Security Checklist */}
        <div className="bg-white rounded-xl shadow-card p-5">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <MdSecurity size={18} className="text-primary-600" /> Security Checks
          </h3>
          <div className="space-y-2.5">
            {SECURITY_CHECKS.map((c) => (
              <div key={c.id} className={`flex items-start gap-3 p-3 rounded-xl ${c.status === "pass" ? "bg-green-50" : "bg-yellow-50"}`}>
                <StatusIcon status={c.status} />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800">{c.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{c.detail}</p>
                </div>
                <span className={`badge text-[10px] ${c.status === "pass" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                  {c.status === "pass" ? "Pass" : "Warning"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-5">

          {/* Change Password */}
          <div className="bg-white rounded-xl shadow-card p-5">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <MdVpnKey size={18} className="text-primary-600" /> Change Admin Password
            </h3>
            <form onSubmit={handlePasswordChange} className="space-y-3">
              {[
                { key: "current", label: "Current Password" },
                { key: "new_pwd", label: "New Password" },
                { key: "confirm", label: "Confirm New Password" },
              ].map(({ key, label }) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                  <div className="relative">
                    <input
                      type={showPwd[key] ? "text" : "password"}
                      value={pwdForm[key]}
                      onChange={(e) => setPwdForm((p) => ({ ...p, [key]: e.target.value }))}
                      className="input-field pr-10 text-sm"
                      placeholder="••••••••"
                    />
                    <button type="button" onClick={() => setShowPwd((p) => ({ ...p, [key]: !p[key] }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPwd[key] ? <MdVisibilityOff size={17} /> : <MdVisibility size={17} />}
                    </button>
                  </div>
                </div>
              ))}
              <button type="submit" disabled={saving} className="btn-primary w-full text-sm py-2 disabled:opacity-50">
                {saving ? "Changing..." : "Change Password"}
              </button>
            </form>
          </div>

          {/* IP Blocklist */}
          <div className="bg-white rounded-xl shadow-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2"><MdBlock size={18} className="text-red-500" /> IP Blocklist</h3>
              <button onClick={() => setShowNewIp(true)} className="text-xs text-primary-600 hover:underline font-medium">+ Block IP</button>
            </div>
            {showNewIp && (
              <div className="bg-gray-50 rounded-xl p-3 mb-3 space-y-2">
                <input value={newIp} onChange={(e) => setNewIp(e.target.value)} placeholder="IP Address (e.g. 192.168.1.1)" className="input-field text-sm" />
                <input value={newIpReason} onChange={(e) => setNewIpReason(e.target.value)} placeholder="Reason (optional)" className="input-field text-sm" />
                <div className="flex gap-2">
                  <button onClick={blockIp} className="btn-primary flex-1 text-xs py-1.5">Block</button>
                  <button onClick={() => setShowNewIp(false)} className="btn-secondary flex-1 text-xs py-1.5">Cancel</button>
                </div>
              </div>
            )}
            <div className="space-y-2">
              {blockedIps.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-4">No blocked IPs</p>
              ) : (
                blockedIps.map((b) => (
                  <div key={b.ip} className="flex items-center justify-between bg-red-50 rounded-xl px-3 py-2">
                    <div>
                      <p className="text-sm font-mono font-semibold text-red-700">{b.ip}</p>
                      <p className="text-xs text-gray-400">{b.reason} · {formatDateTime(b.blocked_at)}</p>
                    </div>
                    <button onClick={() => unblockIp(b.ip)} className="text-xs text-green-600 hover:text-green-800 font-medium">Unblock</button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Login Attempts */}
      <div className="bg-white rounded-xl shadow-card p-5">
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <MdHistory size={18} className="text-gray-500" /> Recent Login Attempts
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50">
              {["User","Role","IP Address","Device","Time","Status"].map((h) => (
                <th key={h} className="px-4 py-2 text-left text-xs font-semibold text-gray-500">{h}</th>
              ))}
            </tr></thead>
            <tbody className="divide-y divide-gray-100">
              {RECENT_LOGINS.map((l, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{l.user}</td>
                  <td className="px-4 py-3"><span className="badge bg-gray-100 text-gray-600 capitalize">{l.role}</span></td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">{l.ip}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{l.device}</td>
                  <td className="px-4 py-3 text-xs text-gray-400">{formatDateTime(l.time)}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${l.status === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {l.status === "success" ? "✓ Success" : "✗ Failed"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default Security;
