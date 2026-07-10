import { useSelector } from "react-redux";
import React from "react";

// Role-specific dashboards
const SuperAdminDashboard = React.lazy(() => import("./dashboards/SuperAdminDashboard"));
const AdminDashboard      = React.lazy(() => import("./dashboards/AdminDashboard"));
const EmployeeDashboard   = React.lazy(() => import("./dashboards/EmployeeDashboard"));

const Dashboard = () => {
  const { role_slug } = useSelector((s) => s.auth);

  if (role_slug === "super_admin") return <SuperAdminDashboard />;
  if (role_slug === "admin")       return <AdminDashboard />;
  if (role_slug === "employee")    return <EmployeeDashboard />;

  // fallback
  return <AdminDashboard />;
};

export default Dashboard;
