import { useEffect } from "react";
import { useForm } from "react-hook-form";
import Modal from "./Modal";
import { MdVisibility, MdVisibilityOff } from "react-icons/md";
import { useState } from "react";

/**
 * Reusable full-field user form modal for Admin, Employee and Customer creation/edit.
 *
 * Props:
 *  isOpen      — boolean
 *  onClose     — fn
 *  onSubmit    — fn(data) — receives validated form data
 *  editUser    — user object (null = create mode)
 *  roleLabel   — "Admin" | "Employee" | "Customer"
 *  roleBadge   — tailwind classes for the role info badge
 *  roleIcon    — React icon component
 *  isMutating  — boolean (loading state)
 */
const UserFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  editUser = null,
  roleLabel = "User",
  roleBadge = "bg-primary-50 border-primary-200 text-primary-700",
  roleIcon: RoleIcon = null,
  isMutating = false,
}) => {
  const [showPwd, setShowPwd]     = useState(false);
  const [showCPwd, setShowCPwd]   = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm();

  const pwd = watch("password");

  // Populate on edit
  useEffect(() => {
    if (isOpen) {
      if (editUser) {
        reset({
          first_name: editUser.first_name || "",
          last_name:  editUser.last_name  || "",
          contact_no: editUser.contact_no || "",
          address:    editUser.address    || "",
          govt_id:    editUser.govt_id    || "",
        });
      } else {
        reset({});
      }
      setShowPwd(false);
      setShowCPwd(false);
    }
  }, [isOpen, editUser]);

  const handleFormSubmit = (data) => {
    // Remove confirm_password before sending
    const { confirm_password, ...payload } = data;
    onSubmit(payload);
  };

  const isCreate = !editUser;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isCreate ? `Add ${roleLabel}` : `Edit ${roleLabel}`}
      size="lg"
      footer={
        <>
          <button type="button" onClick={onClose} className="btn-secondary text-sm px-5 py-2">
            Cancel
          </button>
          <button
            form="user-form-modal"
            type="submit"
            disabled={isSubmitting || isMutating}
            className="btn-primary text-sm px-6 py-2 disabled:opacity-50"
          >
            {isSubmitting || isMutating
              ? isCreate ? "Creating..." : "Saving..."
              : isCreate ? `Create ${roleLabel}` : "Save Changes"}
          </button>
        </>
      }
    >
      <form id="user-form-modal" onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">

        {/* Role badge — create only */}
        {isCreate && (
          <div className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-xs font-medium ${roleBadge}`}>
            {RoleIcon && <RoleIcon size={15} />}
            Role auto-assigned: <span className="font-bold">{roleLabel}</span>
          </div>
        )}

        {/* ── Row 1: First Name + Last Name ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              First Name <span className="text-red-500">*</span>
            </label>
            <input
              className="input-field"
              placeholder="Enter first name"
              {...register("first_name", {
                required: "First name is required",
                minLength: { value: 2, message: "Min 2 characters" },
              })}
            />
            {errors.first_name && (
              <p className="text-red-500 text-xs mt-1">{errors.first_name.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Name <span className="text-red-500">*</span>
            </label>
            <input
              className="input-field"
              placeholder="Enter last name"
              {...register("last_name", {
                required: "Last name is required",
                minLength: { value: 2, message: "Min 2 characters" },
              })}
            />
            {errors.last_name && (
              <p className="text-red-500 text-xs mt-1">{errors.last_name.message}</p>
            )}
          </div>
        </div>

        {/* ── Row 2: Email + Phone ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email ID <span className="text-red-500">*</span>
              {!isCreate && (
                <span className="ml-1 text-xs text-gray-400 font-normal">(cannot change)</span>
              )}
            </label>
            {isCreate ? (
              <>
                <input
                  type="email"
                  className="input-field"
                  placeholder="Enter email address"
                  {...register("email", {
                    required: "Email is required",
                    pattern: { value: /^\S+@\S+\.\S+$/, message: "Invalid email address" },
                  })}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                )}
              </>
            ) : (
              <input
                type="email"
                className="input-field bg-gray-50 cursor-not-allowed"
                value={editUser?.email || ""}
                readOnly
                disabled
              />
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input
              type="tel"
              className="input-field"
              placeholder="e.g. +91 98765 43210"
              {...register("contact_no", {
                pattern: { value: /^[0-9+\s\-()]{7,15}$/, message: "Invalid phone number" },
              })}
            />
            {errors.contact_no && (
              <p className="text-red-500 text-xs mt-1">{errors.contact_no.message}</p>
            )}
          </div>
        </div>

        {/* ── Row 3: Address (full width) ── */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
          <textarea
            className="input-field resize-none"
            placeholder="Enter full address"
            rows={2}
            {...register("address")}
          />
        </div>

        {/* ── Row 4: Govt ID ── */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Aadhar Number / Govt. ID
          </label>
          <input
            className="input-field"
            placeholder="e.g. Aadhar, Passport, Voter ID, Driving Licence No."
            {...register("govt_id")}
          />
          <p className="text-[11px] text-gray-400 mt-1">Optional — stored securely</p>
        </div>

        {/* ── Passwords — create only ── */}
        {isCreate && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPwd ? "text" : "password"}
                  className="input-field pr-10"
                  placeholder="Min. 6 characters"
                  {...register("password", {
                    required: "Password is required",
                    minLength: { value: 6, message: "Minimum 6 characters required" },
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPwd ? <MdVisibilityOff size={18} /> : <MdVisibility size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showCPwd ? "text" : "password"}
                  className="input-field pr-10"
                  placeholder="Re-enter password"
                  {...register("confirm_password", {
                    required: "Please confirm password",
                    validate: (val) => val === pwd || "Passwords do not match",
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowCPwd((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showCPwd ? <MdVisibilityOff size={18} /> : <MdVisibility size={18} />}
                </button>
              </div>
              {errors.confirm_password && (
                <p className="text-red-500 text-xs mt-1">{errors.confirm_password.message}</p>
              )}
            </div>
          </div>
        )}

      </form>
    </Modal>
  );
};

export default UserFormModal;
