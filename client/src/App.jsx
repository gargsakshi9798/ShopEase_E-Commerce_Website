import React, { Suspense, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { getAdminDetails } from "./features/auth/authSlice";
import { verifyCustomerToken } from "./features/public/customerAuthSlice";
import Cookies from "js-cookie";

// Layouts
const AdminLayout  = React.lazy(() => import("./layouts/AdminLayout"));
const PublicLayout = React.lazy(() => import("./layouts/PublicLayout"));

// Auth pages (full-screen, no header/footer)
const Login    = React.lazy(() => import("./pages/auth/Login"));
const Register = React.lazy(() => import("./pages/auth/Register"));

// Full-screen loader
const Loader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      <p className="text-gray-500 text-sm">Loading ShopEase...</p>
    </div>
  </div>
);

/**
 * Guard: admin panel requires shopease_admin_token cookie.
 * If missing → redirect to /login (inside PublicLayout with header/footer).
 */
const AdminRoute = ({ children }) => {
  const token = Cookies.get("shopease_admin_token");
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

const App = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    // Restore admin session on page reload
    if (Cookies.get("shopease_admin_token")) {
      dispatch(getAdminDetails());
    }
    // Verify customer token on app load — clears stale/expired cookie automatically
    if (Cookies.get("shopease_customer_token")) {
      dispatch(verifyCustomerToken());
    }
  }, [dispatch]);

  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        {/* ── Protected admin panel (super_admin / admin / employee) ── */}
        {/* Mounted at /admin/* — uses relative child routes */}
        <Route
          path="/admin/*"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        />

        {/* ── Legacy aliases → /login ── */}
        <Route path="/admin/login"       element={<Navigate to="/login" replace />} />
        <Route path="/super-admin/login" element={<Navigate to="/login" replace />} />
        <Route path="/employee/login"    element={<Navigate to="/login" replace />} />
        <Route path="/customer/login"    element={<Navigate to="/login" replace />} />
        <Route path="/customer/register" element={<Navigate to="/register" replace />} />

        {/* ── Auth pages — full screen, no header/footer ── */}
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ── Public storefront (all with header/footer) ── */}
        {/* This catches everything else including /login, /register, / */}
        <Route path="/*" element={<PublicLayout />} />
      </Routes>
    </Suspense>
  );
};

export default App;
