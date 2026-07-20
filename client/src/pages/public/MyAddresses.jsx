import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "../../utils/toast";
import {
  MdLocationOn, MdAdd, MdEdit, MdDelete,
  MdHome, MdWork, MdPlace, MdCheckCircle, MdClose, MdSave,
} from "react-icons/md";
import AccountLayout from "../../components/public/layout/AccountLayout";
import {
  fetchAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from "../../features/public/publicAddressSlice";

// ── Address type icon helper ──────────────────────────────────────────────────
const TypeIcon = ({ type }) => {
  if (type === "work")  return <MdWork   size={14} className="text-blue-500" />;
  if (type === "other") return <MdPlace  size={14} className="text-purple-500" />;
  return <MdHome size={14} className="text-green-500" />;
};

// ── Address Form ──────────────────────────────────────────────────────────────
const EMPTY_FORM = {
  full_name: "", contact_no: "", address_line1: "", address_line2: "",
  landmark: "", city: "", state: "", pincode: "", country: "India",
  address_type: "home", is_default: false,
};

const AddressForm = ({ initial, onSave, onCancel, saving }) => {
  const [form, setForm] = useState(initial ?? EMPTY_FORM);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const required = ["full_name", "contact_no", "address_line1", "city", "state", "pincode"];
    for (const k of required) {
      if (!form[k]?.trim()) { toast.error(`${k.replace(/_/g, " ")} is required`); return; }
    }
    if (!/^[6-9]\d{9}$/.test(form.contact_no)) {
      toast.error("Enter a valid 10-digit mobile number starting with 6-9");
      return;
    }
    if (!/^[1-9][0-9]{5}$/.test(form.pincode)) {
      toast.error("Enter a valid 6-digit pincode");
      return;
    }
    onSave(form);
  };

  const field = (label, key, placeholder, type = "text", half = false) => (
    <div className={half ? "" : "md:col-span-2"}>
      <label className="text-xs font-semibold text-gray-500 mb-1 block">{label}</label>
      <input
        type={type}
        value={form[key]}
        onChange={(e) => set(key, e.target.value)}
        placeholder={placeholder}
        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
      />
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {field("Full Name *",        "full_name",     "Recipient name",    "text", true)}
        {field("Phone Number *",     "contact_no",    "10-digit number",   "tel",  true)}
        {field("Address Line 1 *",   "address_line1", "House / Flat / Street")}
        {field("Address Line 2",     "address_line2", "Apartment, area (optional)")}
        {field("Landmark",           "landmark",      "Near school, mall (optional)")}
        {field("City *",             "city",          "City",              "text", true)}
        {field("State *",            "state",         "State",             "text", true)}
        {field("Pincode *",          "pincode",       "6-digit pincode",   "text", true)}
        {field("Country",            "country",       "India",             "text", true)}
      </div>

      {/* Address type */}
      <div>
        <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Address Type</label>
        <div className="flex gap-2 flex-wrap">
          {["home", "work", "other"].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => set("address_type", t)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize border transition-colors ${
                form.address_type === t
                  ? "bg-primary-600 border-primary-600 text-white"
                  : "border-gray-200 text-gray-600 hover:border-primary-400"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Default toggle */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={form.is_default}
          onChange={(e) => set("is_default", e.target.checked)}
          className="w-4 h-4 rounded accent-primary-600"
        />
        <span className="text-sm text-gray-700 font-medium">Set as default address</span>
      </label>

      {/* Buttons */}
      <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white font-bold px-5 py-2.5 rounded-xl transition-colors"
        >
          {saving ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <MdSave size={16} />
          )}
          {saving ? "Saving..." : "Save Address"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="flex items-center gap-2 border border-gray-200 hover:border-gray-300 text-gray-700 font-semibold px-5 py-2.5 rounded-xl transition-colors"
        >
          <MdClose size={16} /> Cancel
        </button>
      </div>
    </form>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const MyAddresses = () => {
  const dispatch = useDispatch();
  const { addresses, status, actionStatus } = useSelector((s) => s.publicAddress);

  const [showForm, setShowForm] = useState(false);
  const [editId,   setEditId]   = useState(null);

  const saving = actionStatus === "loading";

  useEffect(() => {
    dispatch(fetchAddresses());
  }, [dispatch]);

  const handleAdd = (data) => {
    dispatch(addAddress(data)).then((res) => {
      if (res.meta.requestStatus === "fulfilled") {
        toast.success("Address added!");
        setShowForm(false);
      } else {
        toast.error("Failed to add address");
      }
    });
  };

  const handleUpdate = (data) => {
    dispatch(updateAddress({ id: editId, data })).then((res) => {
      if (res.meta.requestStatus === "fulfilled") {
        toast.success("Address updated!");
        setEditId(null);
      } else {
        toast.error("Failed to update address");
      }
    });
  };

  const handleDelete = (id) => {
    if (!window.confirm("Delete this address?")) return;
    dispatch(deleteAddress(id)).then((res) => {
      if (res.meta.requestStatus === "fulfilled") toast.success("Address deleted");
      else toast.error("Failed to delete address");
    });
  };

  const handleSetDefault = (id) => {
    dispatch(setDefaultAddress(id)).then((res) => {
      if (res.meta.requestStatus === "fulfilled") toast.success("Default address updated!");
      else toast.error("Failed to set default");
    });
  };

  return (
    <AccountLayout>
      <div className="space-y-4">

        {/* Header */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center">
              <MdLocationOn size={20} className="text-green-600" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">My Addresses</h1>
              <p className="text-xs text-gray-400">Manage your saved delivery addresses</p>
            </div>
          </div>
          {!showForm && !editId && (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-1.5 text-sm bg-primary-600 hover:bg-primary-700 text-white font-semibold px-4 py-2 rounded-xl transition-colors"
            >
              <MdAdd size={16} /> Add New
            </button>
          )}
        </div>

        {/* Add form */}
        {showForm && (
          <div className="bg-white rounded-2xl border border-primary-100 shadow-sm p-5">
            <p className="font-bold text-gray-800 mb-1">Add New Address</p>
            <AddressForm
              onSave={handleAdd}
              onCancel={() => setShowForm(false)}
              saving={saving}
            />
          </div>
        )}

        {/* Loading */}
        {status === "loading" && addresses.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Empty state */}
        {status !== "loading" && addresses.length === 0 && !showForm && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 flex flex-col items-center gap-3 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
              <MdLocationOn size={32} className="text-gray-300" />
            </div>
            <p className="text-gray-600 font-semibold">No addresses saved yet</p>
            <p className="text-sm text-gray-400">Add a delivery address to get started</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-1 flex items-center gap-1.5 text-sm bg-primary-600 hover:bg-primary-700 text-white font-semibold px-4 py-2 rounded-xl transition-colors"
            >
              <MdAdd size={16} /> Add Address
            </button>
          </div>
        )}

        {/* Address cards */}
        {addresses.map((addr) => (
          <div
            key={addr._id}
            className={`bg-white rounded-2xl border shadow-sm p-5 transition-all ${
              addr.is_default ? "border-primary-200 ring-1 ring-primary-100" : "border-gray-100"
            }`}
          >
            {editId === addr._id ? (
              <>
                <p className="font-bold text-gray-800 mb-1">Edit Address</p>
                <AddressForm
                  initial={{
                    full_name: addr.full_name,   contact_no: addr.contact_no,
                    address_line1: addr.address_line1, address_line2: addr.address_line2 ?? "",
                    landmark: addr.landmark ?? "", city: addr.city, state: addr.state,
                    pincode: addr.pincode, country: addr.country ?? "India",
                    address_type: addr.address_type ?? "home", is_default: addr.is_default ?? false,
                  }}
                  onSave={handleUpdate}
                  onCancel={() => setEditId(null)}
                  saving={saving}
                />
              </>
            ) : (
              <div className="flex items-start justify-between gap-3">
                <div className="flex gap-3">
                  <div className="w-9 h-9 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                    <TypeIcon type={addr.address_type} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-gray-900">{addr.full_name}</p>
                      <span className="text-[10px] font-bold capitalize bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                        {addr.address_type}
                      </span>
                      {addr.is_default && (
                        <span className="text-[10px] font-bold bg-primary-50 text-primary-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <MdCheckCircle size={10} /> Default
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                      {addr.address_line1}
                      {addr.address_line2 ? `, ${addr.address_line2}` : ""}
                      {addr.landmark ? ` (Near ${addr.landmark})` : ""}
                      <br />
                      {addr.city}, {addr.state} — {addr.pincode}
                      <br />
                      {addr.country}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">📞 {addr.contact_no}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {!addr.is_default && (
                    <button
                      onClick={() => handleSetDefault(addr._id)}
                      className="text-xs text-primary-600 font-semibold border border-primary-200 hover:bg-primary-50 px-3 py-1.5 rounded-xl transition-colors"
                    >
                      Set Default
                    </button>
                  )}
                  <button
                    onClick={() => setEditId(addr._id)}
                    className="w-8 h-8 flex items-center justify-center border border-gray-200 hover:border-blue-300 hover:bg-blue-50 rounded-xl transition-colors"
                  >
                    <MdEdit size={14} className="text-gray-500" />
                  </button>
                  <button
                    onClick={() => handleDelete(addr._id)}
                    className="w-8 h-8 flex items-center justify-center border border-gray-200 hover:border-red-300 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    <MdDelete size={14} className="text-gray-500" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </AccountLayout>
  );
};

export default MyAddresses;
