import React from "react";
import { IDS } from "../../utils/IDS";

const StatusBadge = ({ status, type = "order" }) => {
  if (type === "order") {
    const config = IDS.ORDER_STATUS[status];
    return (
      <span className={`badge ${config?.color || "bg-gray-100 text-gray-800"}`}>
        {config?.label || status}
      </span>
    );
  }

  if (type === "boolean") {
    return (
      <span className={`badge ${status ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
        {status ? "Active" : "Inactive"}
      </span>
    );
  }

  return <span className="badge bg-gray-100 text-gray-800">{status}</span>;
};

export default StatusBadge;
