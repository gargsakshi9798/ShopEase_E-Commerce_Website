import React, { Suspense, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { getAdminDetails } from "./features/auth/authSlice";
import { verifyCustomerToken } from "./features/public/customerAuthSlice";
import useTokenExpiry from "./hooks/useTokenExpiry";
import {
  isTokenValid,
  getAdminToken,
  getCustomerToken,
  clearAdminToken,
  clearCustomerToken,
} from "./utils/tokenUtils";

// Layouts
const AdminLayout  = React.lazy(() => import("./layouts/AdminLayout"));
const PublicLayout = React.lazy(() => import("./layouts/PublicLayout"));

// Auth pages (full-screen, no header/footer)
const Login           = React.lazy(() => import("./pages/auth/Login"));
const Register        = React.lazy(() => import("./pages/auth/Register"));
const ForgotPassword  = React.lazy(() => import("./pages/auth/ForgotPassword"));
const ResetPassword   = React.lazy(() => import("./pages/auth/ResetPassword"));

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
 * AdminRoute — protects /admin/* routes.
 * Uses isTokenValid (not just cookie existence) so an expired admin token
 * is rejected client-side before any server round-trip.
 */
const AdminRoute = ({ children }) => {
  const token = getAdminToken();
  if (!isTokenValid(token)) {
    // Evict stale cookie right here in case it wasn't cleared yet
    if (token) clearAdminToken();
    return <Navigate to="/login" replace />;
  }
  return children;
};

const App = () => {
  const dispatch = useDispatch();

  // Proactive mid-session expiry watcher — warns 60s before expiry,
  // dispatches logout the moment a token expires without needing an API call.
  useTokenExpiry();

  useEffect(() => {
    const adminToken    = getAdminToken();
    const customerToken = getCustomerToken();

    // Only dispatch session-restore if the token actually passes client-side
    // validation — avoids a network call for a cookie we know is expired.
    if (isTokenValid(adminToken)) {
      dispatch(getAdminDetails());
    } else if (adminToken) {
      // Stale cookie not yet evicted by the slice module-load — clean it now
      clearAdminToken();
    }

    if (isTokenValid(customerToken)) {
      dispatch(verifyCustomerToken());
    } else if (customerToken) {
      clearCustomerToken();
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
        <Route path="/login"           element={<Login />} />
        <Route path="/register"        element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password"  element={<ResetPassword />} />

        {/* ── Public storefront (all with header/footer) ── */}
        {/* This catches everything else including /login, /register, / */}
        <Route path="/*" element={<PublicLayout />} />
      </Routes>
    </Suspense>
  );
};

export default App;
