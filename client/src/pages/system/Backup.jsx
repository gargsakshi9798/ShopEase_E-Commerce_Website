import { useState } from "react";
import toast from "react-hot-toast";
import {
  MdStorage, MdDownload, MdCloudUpload, MdDeleteForever,
  MdRefresh, MdCheckCircle, MdSchedule, MdWarning,
  MdFolderOpen, MdHistory, MdBackup,
} from "react-icons/md";
import { formatDateTime, formatDate } from "../../utils/Methods";

// ── Mock backup history ────────────────────────────────────────────────────────
const MOCK_BACKUPS = [
  { id: "bk_001", name: "Full Backup",      type: "auto",   size: "124.5 MB", status: "completed", createdAt: new Date(Date.now() - 86400000),    collections: 18, records: 48200 },
  { id: "bk_002", name: "Manual Backup",    type: "manual", size: "119.2 MB", status: "completed", createdAt: new Date(Date.now() - 3*86400000),  collections: 18, records: 47850 },
  { id: "bk_003", name: "Full Backup",      type: "auto",   size: "118.8 MB", status: "completed", createdAt: new Date(Date.now() - 7*86400000),  collections: 18, records: 47200 },
  { id: "bk_004", name: "Full Backup",      type: "auto",   size: "116.1 MB", status: "completed", createdAt: new Date(Date.now() - 14*86400000), collections: 18, records: 46500 },
  { id: "bk_005", name: "Pre-update backup",type: "manual", size: "112.0 MB", status: "completed", createdAt: new Date(Date.now() - 21*86400000), collections: 17, records: 45800 },
];

const COLLECTIONS = [
  { name: "Users",      count: "8,652",  size: "12.4 MB" },
  { name: "Products",   count: "4,218",  size: "38.6 MB" },
  { name: "Orders",     count: "12,450", size: "28.2 MB" },
  { name: "Reviews",    count: "3,840",  size: "8.4 MB"  },
  { name: "Categories", count: "156",    size: "0.3 MB"  },
  { name: "Brands",     count: "245",    size: "0.8 MB"  },
  { name: "Coupons",    count: "85",     size: "0.2 MB"  },
  { name: "Settings",   count: "42",     size: "0.1 MB"  },
];

const Backup = () => {
  const [backups, setBackups]             = useState(MOCK_BACKUPS);
  const [creating, setCreating]           = useState(false);
  const [restoring, setRestoring]         = useState(null);
  const [deleting, setDeleting]           = useState(null);
  const [schedule, setSchedule]           = useState("daily");
  const [retention, setRetention]         = useState("30");
  const [activeTab, setActiveTab]         = useState("backups");
  const [confirmRestore, setConfirmRestore] = useState(null);

  const createBackup = async () => {
    setCreating(true);
    toast.loading("Creating backup...", { id: "backup" });
    await new Promise((r) => setTimeout(r, 2500));
    const newBackup = {
      id: `bk_${Date.now()}`,
      name: "Manual Backup",
      type: "manual",
      size: "124.8 MB",
      status: "completed",
      createdAt: new Date(),
      collections: 18,
      records: 48600,
    };
    setBackups((prev) => [newBackup, ...prev]);
    setCreating(false);
    toast.success("Backup created successfully!", { id: "backup" });
  };

  const deleteBackup = async (id) => {
    setDeleting(id);
    await new Promise((r) => setTimeout(r, 600));
    setBackups((prev) => prev.filter((b) => b.id !== id));
    setDeleting(null);
    toast.success("Backup deleted");
  };

  const restoreBackup = async (backup) => {
    setConfirmRestore(null);
    setRestoring(backup.id);
    toast.loading("Restoring backup...", { id: "restore" });
    await new Promise((r) => setTimeout(r, 3000));
    setRestoring(null);
    toast.success("Backup restored successfully!", { id: "restore" });
  };

  const downloadBackup = (backup) => {
    toast.success(`Downloading ${backup.name} (${backup.size})`);
  };

  const saveSchedule = () => {
    toast.success(`Auto-backup scheduled: ${schedule}, retention: ${retention} days`);
  };

  const totalSize = "124.5 MB";
  const lastBackupTime = backups[0]?.createdAt;

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Backup & Restore</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage database backups and restoration</p>
        </div>
        <button onClick={createBackup} disabled={creating}
          className="btn-primary flex items-center gap-2 text-sm disabled:opacity-50">
          {creating
            ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Creating...</>
            : <><MdBackup size={18} /> Create Backup Now</>}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Backups",    value: backups.length,                          icon: MdStorage,   bg: "bg-primary-50",  color: "text-primary-600" },
          { label: "Latest Backup",    value: lastBackupTime ? formatDate(lastBackupTime) : "—", icon: MdCheckCircle, bg: "bg-green-50", color: "text-green-600" },
          { label: "Storage Used",     value: totalSize,                               icon: MdFolderOpen,bg: "bg-blue-50",     color: "text-blue-600" },
          { label: "Auto Backup",      value: schedule.charAt(0).toUpperCase() + schedule.slice(1), icon: MdSchedule, bg: "bg-purple-50", color: "text-purple-600" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl p-4 shadow-card flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.bg} flex-shrink-0`}><s.icon size={20} className={s.color} /></div>
            <div>
              <p className="text-lg font-bold text-gray-900 leading-tight">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-card overflow-hidden">
        <div className="flex border-b border-gray-100">
          {[
            { id: "backups",     label: "Backup History" },
            { id: "collections", label: "Database Collections" },
            { id: "schedule",    label: "Auto Backup" },
            { id: "restore",     label: "Restore Guide" },
          ].map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-3.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id ? "border-primary-600 text-primary-700" : "border-transparent text-gray-500 hover:text-gray-700"
              }`}>{tab.label}</button>
          ))}
        </div>

        <div className="p-5">

          {/* ── Backup History ────────────────────────────────────────── */}
          {activeTab === "backups" && (
            <div className="space-y-3">
              {backups.length === 0 ? (
                <div className="text-center py-12 text-gray-400"><MdHistory size={40} className="mx-auto mb-2" /><p>No backups yet</p></div>
              ) : (
                backups.map((b) => (
                  <div key={b.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      b.type === "auto" ? "bg-blue-100 text-blue-600" : "bg-purple-100 text-purple-600"
                    }`}>
                      {b.type === "auto" ? <MdSchedule size={20} /> : <MdBackup size={20} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-gray-800">{b.name}</p>
                        <span className={`badge text-[10px] ${b.type === "auto" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"}`}>
                          {b.type}
                        </span>
                        <span className="badge bg-green-100 text-green-700 text-[10px]">✓ {b.status}</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {formatDateTime(b.createdAt)} · {b.size} · {b.collections} collections · {b.records?.toLocaleString()} records
                      </p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button onClick={() => downloadBackup(b)} className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50" title="Download">
                        <MdDownload size={16} />
                      </button>
                      <button onClick={() => setConfirmRestore(b)} disabled={!!restoring}
                        className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 disabled:opacity-40" title="Restore">
                        {restoring === b.id
                          ? <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                          : <MdCloudUpload size={16} />}
                      </button>
                      <button onClick={() => deleteBackup(b.id)} disabled={deleting === b.id}
                        className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 disabled:opacity-40" title="Delete">
                        {deleting === b.id
                          ? <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                          : <MdDeleteForever size={16} />}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* ── Collections ───────────────────────────────────────────── */}
          {activeTab === "collections" && (
            <div>
              <p className="text-sm text-gray-500 mb-4">Overview of all MongoDB collections in the database.</p>
              <table className="w-full text-sm">
                <thead><tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500">Collection</th>
                  <th className="px-4 py-2 text-right text-xs font-semibold text-gray-500">Documents</th>
                  <th className="px-4 py-2 text-right text-xs font-semibold text-gray-500">Est. Size</th>
                </tr></thead>
                <tbody className="divide-y divide-gray-100">
                  {COLLECTIONS.map((c) => (
                    <tr key={c.name} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <MdFolderOpen size={15} className="text-primary-400" />
                          <span className="font-medium text-gray-700">{c.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right text-gray-600">{c.count}</td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-800">{c.size}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ── Schedule ──────────────────────────────────────────────── */}
          {activeTab === "schedule" && (
            <div className="max-w-md space-y-5">
              <p className="text-sm text-gray-500">Configure automatic database backup schedule.</p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Backup Frequency</label>
                <select value={schedule} onChange={(e) => setSchedule(e.target.value)} className="input-field">
                  <option value="hourly">Every Hour</option>
                  <option value="daily">Daily (midnight)</option>
                  <option value="weekly">Weekly (Sunday midnight)</option>
                  <option value="monthly">Monthly (1st of month)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Retention Period (days)</label>
                <select value={retention} onChange={(e) => setRetention(e.target.value)} className="input-field">
                  <option value="7">7 days</option>
                  <option value="14">14 days</option>
                  <option value="30">30 days</option>
                  <option value="60">60 days</option>
                  <option value="90">90 days</option>
                </select>
                <p className="text-xs text-gray-400 mt-1">Backups older than {retention} days will be automatically deleted.</p>
              </div>
              <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl p-3">
                <MdSchedule size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-800">Configured Schedule</p>
                  <p className="text-xs text-blue-600 mt-0.5">Auto backup <strong>{schedule}</strong> · Keep for <strong>{retention} days</strong></p>
                </div>
              </div>
              <button onClick={saveSchedule} className="btn-primary text-sm w-full py-2.5">Save Schedule</button>
            </div>
          )}

          {/* ── Restore Guide ─────────────────────────────────────────── */}
          {activeTab === "restore" && (
            <div className="space-y-4 max-w-xl">
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3">
                <MdWarning size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-yellow-800">Warning — Destructive Action</p>
                  <p className="text-xs text-yellow-700 mt-1">Restoring a backup will <strong>overwrite all current data</strong>. This action is irreversible. Always create a fresh backup before restoring.</p>
                </div>
              </div>
              {[
                { step: 1, title: "Select Backup",       desc: "Go to Backup History and click the restore icon (↑) on the backup you want to restore." },
                { step: 2, title: "Confirm Restore",     desc: "Read the warning carefully. Type CONFIRM in the dialog to proceed with the restoration." },
                { step: 3, title: "Wait for Completion", desc: "The restoration process may take several minutes depending on database size. Do not close the browser." },
                { step: 4, title: "Verify Data",         desc: "After restoration, verify that all data is intact by checking key modules (Orders, Products, Users)." },
              ].map(({ step, title, desc }) => (
                <div key={step} className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">{step}</div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>

      {/* ── Confirm Restore Modal ─────────────────────────────────────── */}
      {confirmRestore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setConfirmRestore(null)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center"><MdWarning size={24} className="text-red-600" /></div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Restore Backup?</h3>
                <p className="text-xs text-gray-400">{confirmRestore.name} · {formatDateTime(confirmRestore.createdAt)}</p>
              </div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-xl p-3">
              <p className="text-sm text-red-700">This will <strong>overwrite all current data</strong> with the backup from <strong>{formatDate(confirmRestore.createdAt)}</strong>. All changes made after this point will be permanently lost.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setConfirmRestore(null)} className="btn-secondary flex-1 text-sm py-2">Cancel</button>
              <button onClick={() => restoreBackup(confirmRestore)} className="flex-1 text-sm py-2 rounded-xl font-semibold bg-red-600 text-white hover:bg-red-700">
                Yes, Restore
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Backup;
