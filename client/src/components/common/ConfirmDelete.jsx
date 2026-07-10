import React from "react";
import Modal from "./Modal";
import { MdWarning } from "react-icons/md";

const ConfirmDelete = ({ isOpen, onClose, onConfirm, title = "Delete Record", message, loading }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <button onClick={onClose} className="btn-secondary text-sm px-4 py-2">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="btn-danger text-sm px-4 py-2 disabled:opacity-50"
          >
            {loading ? "Deleting..." : "Delete"}
          </button>
        </>
      }
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
          <MdWarning className="text-red-600" size={24} />
        </div>
        <div>
          <p className="text-gray-700">
            {message || "Are you sure you want to delete this record? This action cannot be undone."}
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDelete;
