import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchRoles, fetchPermissions, updateRolePermissions, createRole } from "../../features/roles/roleSlice";
import Modal from "../../components/common/Modal";
import toast from "react-hot-toast";
import { MdAdd, MdSecurity, MdCheckCircle, MdSearch } from "react-icons/md";

const roleColors = {
  super_admin: "bg-red-100 text-red-700 border-red-200",
  admin:       "bg-purple-100 text-purple-700 border-purple-200",
  employee:    "bg-blue-100 text-blue-700 border-blue-200",
  customer:    "bg-green-100 text-green-700 border-green-200",
};

const Roles = () => {
  const dispatch = useDispatch();
  const { list: roles, permissions } = useSelector((s) => s.role);
  const { role_slug } = useSelector((s) => s.auth);
  const isSuperAdmin = role_slug === "super_admin";

  const [selectedRole,  setSelectedRole]  = useState(null);
  const [selectedPerms, setSelectedPerms] = useState([]);
  const [saving,        setSaving]        = useState(false);
  const [search,        setSearch]        = useState("");
  const [createOpen,    setCreateOpen]    = useState(false);
  const [newRole,       setNewRole]       = useState({ name: "", slug: "", description: "" });
  const [creating,      setCreating]      = useState(false);

  useEffect(() => {
    dispatch(fetchRoles());
    dispatch(fetchPermissions());
  }, [dispatch]);

  const selectRole = (role) => {
    setSelectedRole(role);
    setSelectedPerms(role.permissions?.map((p) => p._id || p) || []);
    setSearch("");
  };

  const togglePerm = (id) => {
    setSelectedPerms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const toggleModule = (perms) => {
    const ids = perms.map((p) => p._id);
    const allSelected = ids.every((id) => selectedPerms.includes(id));
    if (allSelected) {
      setSelectedPerms((prev) => prev.filter((p) => !ids.includes(p)));
    } else {
      setSelectedPerms((prev) => [...new Set([...prev, ...ids])]);
    }
  };

  const selectAll = () => setSelectedPerms(permissions.map((p) => p._id));
  const clearAll  = () => setSelectedPerms([]);

  const save = async () => {
    if (!selectedRole) return;
    setSaving(true);
    try {
      const res = await dispatch(updateRolePermissions({ id: selectedRole._id, permissions: selectedPerms }));
      if (res.payload?.success) {
        toast.success("Permissions updated successfully");
        dispatch(fetchRoles());
      } else toast.error("Update failed");
    } catch { toast.error("Something went wrong"); }
    finally { setSaving(false); }
  };

  const handleCreate = async () => {
    if (!newRole.name.trim() || !newRole.slug.trim()) {
      toast.error("Name and slug are required");
      return;
    }
    setCreating(true);
    try {
      const res = await dispatch(createRole({ ...newRole, slug: newRole.slug.toLowerCase().replace(/\s+/g, "_") }));
      if (res.payload?.success) {
        toast.success("Role created successfully");
        setCreateOpen(false);
        setNewRole({ name: "", slug: "", description: "" });
        dispatch(fetchRoles());
      } else toast.error("Failed to create role");
    } catch { toast.error("Something went wrong"); }
    finally { setCreating(false); }
  };

  // Group & filter permissions
  const grouped = permissions
    .filter((p) => !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.module.toLowerCase().includes(search.toLowerCase()))
    .reduce((acc, p) => {
      if (!acc[p.module]) acc[p.module] = [];
      acc[p.module].push(p);
      return acc;
    }, {});

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Roles & Permissions</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage user roles and their access permissions</p>
        </div>
        {isSuperAdmin && (
          <button onClick={() => setCreateOpen(true)} className="btn-primary flex items-center gap-2 text-sm">
            <MdAdd size={18} /> Create Role
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Roles",       value: roles.length,       color: "bg-purple-50 text-purple-600" },
          { label: "Total Permissions", value: permissions.length, color: "bg-blue-50 text-blue-600" },
          { label: "Active Roles",      value: roles.filter((r) => r.status !== false).length, color: "bg-green-50 text-green-600" },
          { label: "Permission Modules",value: [...new Set(permissions.map((p) => p.module))].length, color: "bg-orange-50 text-orange-600" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl p-4 shadow-card flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.color}`}>
              <MdSecurity size={20} />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Roles List */}
        <div className="bg-white rounded-xl shadow-card p-5">
          <h3 className="font-semibold text-gray-800 mb-4 text-sm uppercase tracking-wide">All Roles</h3>
          <div className="space-y-2">
            {roles.map((role) => {
              const colorCls = roleColors[role.slug] || "bg-gray-100 text-gray-700 border-gray-200";
              const isSelected = selectedRole?._id === role._id;
              return (
                <button
                  key={role._id}
                  onClick={() => selectRole(role)}
                  className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${
                    isSelected
                      ? "bg-primary-600 text-white border-primary-600 shadow-md"
                      : "hover:bg-gray-50 border-gray-100 text-gray-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-sm">{role.name}</p>
                    {isSelected && <MdCheckCircle size={16} className="text-white flex-shrink-0" />}
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${isSelected ? "bg-primary-500 text-white border-primary-400" : colorCls}`}>
                      {role.slug}
                    </span>
                    <span className={`text-xs ${isSelected ? "text-primary-200" : "text-gray-400"}`}>
                      {role.permissions?.length || 0} perms
                    </span>
                  </div>
                  {role.description && (
                    <p className={`text-[11px] mt-1 truncate ${isSelected ? "text-primary-200" : "text-gray-400"}`}>
                      {role.description}
                    </p>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Permissions Panel */}
        <div className="lg:col-span-3 bg-white rounded-xl shadow-card p-5">
          {selectedRole ? (
            <>
              {/* Panel Header */}
              <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                <div>
                  <h3 className="font-semibold text-gray-800">
                    Permissions for: <span className="text-primary-600">{selectedRole.name}</span>
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {selectedPerms.length} of {permissions.length} permissions selected
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {isSuperAdmin && (
                    <>
                      <button onClick={selectAll} className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">
                        Select All
                      </button>
                      <button onClick={clearAll} className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">
                        Clear All
                      </button>
                      <button
                        onClick={save}
                        disabled={saving}
                        className="btn-primary text-sm flex items-center gap-2"
                      >
                        {saving ? (
                          <span className="flex items-center gap-1.5">
                            <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Saving...
                          </span>
                        ) : "Save Changes"}
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Progress bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                  <span>Permission coverage</span>
                  <span>{permissions.length ? Math.round((selectedPerms.length / permissions.length) * 100) : 0}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-600 rounded-full transition-all duration-300"
                    style={{ width: `${permissions.length ? (selectedPerms.length / permissions.length) * 100 : 0}%` }}
                  />
                </div>
              </div>

              {/* Search */}
              <div className="relative mb-4">
                <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search permissions..."
                  className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                />
              </div>

              {/* Permission Groups */}
              <div className="space-y-4 max-h-[52vh] overflow-y-auto pr-1">
                {Object.entries(grouped).map(([module, perms]) => {
                  const allSelected = perms.every((p) => selectedPerms.includes(p._id));
                  const someSelected = perms.some((p) => selectedPerms.includes(p._id));
                  return (
                    <div key={module} className="border border-gray-100 rounded-xl p-4">
                      {/* Module header */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={allSelected}
                            ref={(el) => { if (el) el.indeterminate = someSelected && !allSelected; }}
                            onChange={() => isSuperAdmin && toggleModule(perms)}
                            disabled={!isSuperAdmin}
                            className="w-4 h-4 rounded accent-primary-600 cursor-pointer"
                          />
                          <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">{module}</p>
                        </div>
                        <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                          {perms.filter((p) => selectedPerms.includes(p._id)).length}/{perms.length} selected
                        </span>
                      </div>
                      {/* Permissions grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                        {perms.map((perm) => {
                          const checked = selectedPerms.includes(perm._id);
                          return (
                            <label
                              key={perm._id}
                              className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all ${
                                checked ? "bg-primary-50 border border-primary-200" : "hover:bg-gray-50 border border-transparent"
                              } ${!isSuperAdmin ? "cursor-default" : ""}`}
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => isSuperAdmin && togglePerm(perm._id)}
                                disabled={!isSuperAdmin}
                                className="w-3.5 h-3.5 rounded accent-primary-600"
                              />
                              <div className="min-w-0">
                                <span className={`text-xs font-medium capitalize block truncate ${checked ? "text-primary-700" : "text-gray-700"}`}>
                                  {perm.action}
                                </span>
                                <span className="text-[9px] text-gray-400">#{perm.permission_id}</span>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-3">
                <MdSecurity size={30} className="text-gray-300" />
              </div>
              <p className="font-medium text-gray-500">Select a role to manage permissions</p>
              <p className="text-sm text-gray-400 mt-1">Click any role from the left panel</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Role Modal */}
      <Modal
        isOpen={createOpen}
        onClose={() => { setCreateOpen(false); setNewRole({ name: "", slug: "", description: "" }); }}
        title="Create New Role"
        size="sm"
        footer={
          <>
            <button onClick={() => setCreateOpen(false)} className="btn-secondary text-sm">Cancel</button>
            <button onClick={handleCreate} disabled={creating} className="btn-primary text-sm flex items-center gap-2">
              {creating ? (
                <><span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />Creating...</>
              ) : "Create Role"}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Role Name *</label>
            <input
              type="text"
              value={newRole.name}
              onChange={(e) => setNewRole((p) => ({
                ...p,
                name: e.target.value,
                slug: e.target.value.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, ""),
              }))}
              placeholder="e.g. Inventory Manager"
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Slug *</label>
            <input
              type="text"
              value={newRole.slug}
              onChange={(e) => setNewRole((p) => ({ ...p, slug: e.target.value.toLowerCase().replace(/\s+/g, "_") }))}
              placeholder="e.g. inventory_manager"
              className="input-field"
            />
            <p className="text-xs text-gray-400 mt-1">Auto-generated from name. Lowercase, no spaces.</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
            <textarea
              value={newRole.description}
              onChange={(e) => setNewRole((p) => ({ ...p, description: e.target.value }))}
              placeholder="Brief description of this role..."
              rows={3}
              className="input-field resize-none"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Roles;
