import { useEffect, useState } from "react";
import { GET } from "../../utils/Methods";
import { APIS } from "../../utils/APIS";
import { formatDateTime } from "../../utils/Methods";
import toast from "react-hot-toast";
import {
  MdSearch, MdRefresh, MdDownload, MdFilterList,
  MdInfo, MdClose, MdHistory, MdPerson, MdDateRange,
} from "react-icons/md";

const ACTION_COLORS = {
  CREATE: "bg-green-100 text-green-700",
  UPDATE: "bg-blue-100 text-blue-700",
  DELETE: "bg-red-100 text-red-700",
  LOGIN:  "bg-purple-100 text-purple-700",
  LOGOUT: "bg-gray-100 text-gray-600",
  VIEW:   "bg-yellow-100 text-yellow-700",
};

const APIS_AUDIT = APIS.AuditLogs;

const AuditLogs = () => {
  const [logs, setLogs]             = useState([]);
  const [total, setTotal]           = useState(0);
  const [loading, setLoading]       = useState(false);
  const [page, setPage]             = useState(1);
  const [search, setSearch]         = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [moduleFilter, setModuleFilter] = useState("");
  const [startDate, setStartDate]   = useState("");
  const [endDate, setEndDate]       = useState("");
  const [viewLog, setViewLog]       = useState(null);
  const PER_PAGE = 15;

  const load = async (p = page) => {
    setLoading(true);
    try {
      const params = { page: p, per_page: PER_PAGE };
      if (search)       params.search  = search;
      if (actionFilter) params.action  = actionFilter;
      if (moduleFilter) params.module  = moduleFilter;
      if (startDate)    params.start_date = startDate;
      if (endDate)      params.end_date   = endDate;
      const res = await GET(APIS_AUDIT, params);
      setLogs(res?.data?.data || []);
      setTotal(res?.data?.total || 0);
    } catch { toast.error("Failed to load audit logs"); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(page); }, [page, actionFilter, moduleFilter, startDate, endDate]);
  useEffect(() => { const t = setTimeout(() => { setPage(1); load(1); }, 350); return () => clearTimeout(t); }, [search]);

  const totalPages = Math.ceil(total / PER_PAGE);

  const exportCSV = () => {
    const rows = [["Time","User","Action","Module","Description","IP"],
      ...logs.map((l) => [formatDateTime(l.createdAt), l.user_id?.name || "System", l.action, l.module, l.description, l.ip_address || ""])
    ];
    const csv  = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a"); a.href = url; a.download = "audit_logs.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
          <p className="text-sm text-gray-500 mt-0.5">Track all admin actions and system events</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => load(page)} className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50"><MdRefresh size={18} /></button>
          <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">
            <MdDownload size={16} /> Export
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Logs",  value: total, bg: "bg-primary-50", color: "text-primary-600" },
          { label: "Creates",     value: logs.filter((l) => l.action === "CREATE").length, bg: "bg-green-50", color: "text-green-600", sub: "this page" },
          { label: "Updates",     value: logs.filter((l) => l.action === "UPDATE").length, bg: "bg-blue-50",  color: "text-blue-600",  sub: "this page" },
          { label: "Deletes",     value: logs.filter((l) => l.action === "DELETE").length, bg: "bg-red-50",   color: "text-red-600",   sub: "this page" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl p-4 shadow-card flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.bg} flex-shrink-0`}><MdHistory size={20} className={s.color} /></div>
            <div>
              <p className="text-xl font-bold text-gray-900">{s.value ?? 0}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
              {s.sub && <p className="text-[10px] text-gray-400">{s.sub}</p>}
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-card overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex flex-wrap items-center gap-3">
          <div className="relative">
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search logs..." className="input-field pl-9 w-52 text-sm py-2" />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <MdFilterList size={16} className="text-gray-400" />
            <select value={actionFilter} onChange={(e) => { setActionFilter(e.target.value); setPage(1); }} className="input-field text-sm py-1.5 w-32">
              <option value="">All Actions</option>
              {["CREATE","UPDATE","DELETE","LOGIN","LOGOUT","VIEW"].map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
            <input className="input-field text-sm py-1.5 w-32" placeholder="Module..." value={moduleFilter} onChange={(e) => { setModuleFilter(e.target.value); setPage(1); }} />
            <div className="flex items-center gap-1">
              <MdDateRange size={14} className="text-gray-400" />
              <input type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); setPage(1); }} className="input-field text-sm py-1.5 w-32" />
              <span className="text-gray-400 text-xs">-</span>
              <input type="date" value={endDate} onChange={(e) => { setEndDate(e.target.value); setPage(1); }} className="input-field text-sm py-1.5 w-32" />
            </div>
            {(search || actionFilter || moduleFilter || startDate || endDate) && (
              <button onClick={() => { setSearch(""); setActionFilter(""); setModuleFilter(""); setStartDate(""); setEndDate(""); setPage(1); }}
                className="text-xs text-primary-600 hover:underline">Clear</button>
            )}
          </div>
          <div className="ml-auto text-xs text-gray-400">Total: <span className="font-semibold text-gray-700">{total}</span></div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-primary-400 border-t-transparent rounded-full animate-spin" /></div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-gray-400 gap-2"><MdHistory size={40} /><p className="text-sm">No audit logs found</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="bg-gray-50 border-b border-gray-200">
                {["Time","User","Action","Module","Description","IP",""].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 whitespace-nowrap">{h}</th>
                ))}
              </tr></thead>
              <tbody className="divide-y divide-gray-100">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">{formatDateTime(log.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 text-xs font-bold flex-shrink-0">
                          {log.user_id?.name?.[0]?.toUpperCase() || "S"}
                        </div>
                        <span className="text-sm text-gray-700">{log.user_id?.name || "System"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge text-[11px] ${ACTION_COLORS[log.action] || "bg-gray-100 text-gray-600"}`}>{log.action}</span>
                    </td>
                    <td className="px-4 py-3"><span className="badge bg-gray-100 text-gray-600 text-[11px]">{log.module}</span></td>
                    <td className="px-4 py-3 text-xs text-gray-600 max-w-[240px] truncate">{log.description}</td>
                    <td className="px-4 py-3 text-xs text-gray-400 font-mono">{log.ip_address || "—"}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => setViewLog(log)} className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50"><MdInfo size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-500">Page {page} of {totalPages}</p>
            <div className="flex gap-1">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40">Prev</button>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40">Next</button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Drawer */}
      {viewLog && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black bg-opacity-40" onClick={() => setViewLog(null)} />
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl overflow-y-auto flex flex-col animate-slide-in-right">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h3 className="text-lg font-semibold text-gray-800">Log Details</h3>
              <button onClick={() => setViewLog(null)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"><MdClose size={20} /></button>
            </div>
            <div className="flex-1 px-6 py-5 space-y-4">
              <div className="flex items-center gap-3">
                <span className={`badge ${ACTION_COLORS[viewLog.action] || "bg-gray-100"}`}>{viewLog.action}</span>
                <span className="badge bg-gray-100 text-gray-600">{viewLog.module}</span>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 space-y-2.5">
                {[
                  { label: "Time",        value: formatDateTime(viewLog.createdAt) },
                  { label: "User",        value: viewLog.user_id?.name || "System" },
                  { label: "IP Address",  value: viewLog.ip_address || "—", mono: true },
                  { label: "Description", value: viewLog.description },
                ].map(({ label, value, mono }) => (
                  <div key={label}>
                    <p className="text-xs text-gray-400">{label}</p>
                    <p className={`text-sm text-gray-800 font-medium ${mono ? "font-mono" : ""}`}>{value}</p>
                  </div>
                ))}
              </div>
              {viewLog.old_data && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-2">Before Change</p>
                  <pre className="bg-red-50 border border-red-100 rounded-xl p-3 text-xs overflow-auto max-h-48 text-red-800">{JSON.stringify(viewLog.old_data, null, 2)}</pre>
                </div>
              )}
              {viewLog.new_data && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-2">After Change</p>
                  <pre className="bg-green-50 border border-green-100 rounded-xl p-3 text-xs overflow-auto max-h-48 text-green-800">{JSON.stringify(viewLog.new_data, null, 2)}</pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLogs;
