import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  MdPerson, MdEdit, MdSave, MdClose,
  MdPhone, MdEmail, MdCameraAlt,
} from "react-icons/md";
import AccountLayout from "../../components/public/layout/AccountLayout";
import {
  fetchCustomerProfile,
  updateCustomerProfile,
  clearProfileStatus,
} from "../../features/public/publicProfileSlice";
import { getImgUrl } from "../../utils/Methods";

const MyProfile = () => {
  const dispatch     = useDispatch();
  const { profile, status, updateStatus } = useSelector((s) => s.publicProfile);

  const [editing, setEditing] = useState(false);
  const [form, setForm]       = useState({ name: "", contact_no: "" });
  const [preview, setPreview] = useState(null);
  const fileRef               = useRef();

  // Load profile on mount
  useEffect(() => {
    dispatch(fetchCustomerProfile());
  }, [dispatch]);

  // Sync form when profile loads
  useEffect(() => {
    if (profile) {
      setForm({ name: profile.name ?? "", contact_no: profile.contact_no ?? "" });
    }
  }, [profile]);

  // Show toast on update result
  useEffect(() => {
    if (updateStatus === "succeeded") {
      toast.success("Profile updated successfully!");
      setEditing(false);
      setPreview(null);
      dispatch(clearProfileStatus());
    } else if (updateStatus === "failed") {
      toast.error("Failed to update profile. Please try again.");
      dispatch(clearProfileStatus());
    }
  }, [updateStatus, dispatch]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
  };

  const handleCancel = () => {
    if (profile) setForm({ name: profile.name ?? "", contact_no: profile.contact_no ?? "" });
    setPreview(null);
    setEditing(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error("Name is required"); return; }

    const fd = new FormData();
    fd.append("name", form.name.trim());
    fd.append("contact_no", form.contact_no.trim());
    if (fileRef.current?.files[0]) {
      fd.append("profile_image", fileRef.current.files[0]);
    }
    dispatch(updateCustomerProfile(fd));
  };

  const avatarSrc = preview || getImgUrl(profile?.profile_image);
  const initials  = (profile?.name ?? "U")[0].toUpperCase();
  const isSaving  = updateStatus === "loading";

  return (
    <AccountLayout>
      <div className="space-y-4">

        {/* Page header */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary-50 rounded-xl flex items-center justify-center">
              <MdPerson size={20} className="text-primary-600" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">My Profile</h1>
              <p className="text-xs text-gray-400">Manage your personal information</p>
            </div>
          </div>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-1.5 text-sm bg-primary-600 hover:bg-primary-700 text-white font-semibold px-4 py-2 rounded-xl transition-colors"
            >
              <MdEdit size={15} /> Edit Profile
            </button>
          )}
        </div>

        {status === "loading" && !profile ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">

              {/* Avatar */}
              <div className="flex flex-col items-center mb-8">
                <div className="relative">
                  {avatarSrc && avatarSrc !== getImgUrl(null) ? (
                    <img
                      src={avatarSrc}
                      alt="avatar"
                      className="w-24 h-24 rounded-full object-cover border-4 border-primary-100 shadow"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-primary-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow border-4 border-primary-100">
                      {initials}
                    </div>
                  )}
                  {editing && (
                    <>
                      <input
                        type="file"
                        accept="image/*"
                        ref={fileRef}
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileRef.current.click()}
                        className="absolute bottom-0 right-0 w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white shadow hover:bg-primary-700 transition-colors"
                      >
                        <MdCameraAlt size={15} />
                      </button>
                    </>
                  )}
                </div>
                {editing && (
                  <p className="text-xs text-gray-400 mt-2">Click the camera icon to change photo</p>
                )}
              </div>

              {/* Form fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                {/* Name */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1.5 block">
                    Full Name
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                      placeholder="Enter your full name"
                    />
                  ) : (
                    <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 rounded-xl">
                      <MdPerson size={16} className="text-gray-400" />
                      <span className="text-sm text-gray-800 font-medium">{profile?.name || "—"}</span>
                    </div>
                  )}
                </div>

                {/* Email (read-only) */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1.5 block">
                    Email Address
                  </label>
                  <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 rounded-xl">
                    <MdEmail size={16} className="text-gray-400" />
                    <span className="text-sm text-gray-800 font-medium">{profile?.email || "—"}</span>
                    <span className="ml-auto text-[10px] bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full font-semibold">
                      Read only
                    </span>
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1.5 block">
                    Phone Number
                  </label>
                  {editing ? (
                    <input
                      type="tel"
                      value={form.contact_no}
                      onChange={(e) => setForm((f) => ({ ...f, contact_no: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                      placeholder="Enter phone number"
                    />
                  ) : (
                    <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 rounded-xl">
                      <MdPhone size={16} className="text-gray-400" />
                      <span className="text-sm text-gray-800 font-medium">{profile?.contact_no || "Not added"}</span>
                    </div>
                  )}
                </div>

                {/* Role (read-only) */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1.5 block">
                    Account Type
                  </label>
                  <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 rounded-xl">
                    <span className="text-sm text-gray-800 font-medium capitalize">
                      {profile?.role_id?.name ?? "Customer"}
                    </span>
                    <span className="ml-auto w-2 h-2 bg-green-500 rounded-full" />
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              {editing && (
                <div className="flex items-center gap-3 mt-6 pt-5 border-t border-gray-100">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white font-bold px-6 py-2.5 rounded-xl transition-colors"
                  >
                    {isSaving ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <MdSave size={16} />
                    )}
                    {isSaving ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={isSaving}
                    className="flex items-center gap-2 border border-gray-200 hover:border-gray-300 text-gray-700 font-semibold px-6 py-2.5 rounded-xl transition-colors"
                  >
                    <MdClose size={16} /> Cancel
                  </button>
                </div>
              )}
            </div>
          </form>
        )}
      </div>
    </AccountLayout>
  );
};

export default MyProfile;
