import React, { Suspense, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
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
 * Checks both token validity AND that the role is one of the allowed admin
 * roles decoded from the JWT. A customer token that happens to be valid will
 * be rejected here before any admin page renders.
 */
const ADMIN_ROLES = ["super_admin", "admin", "employee"];

const AdminRoute = ({ children }) => {
  // Read from Redux so the guard reacts immediately to logout dispatches
  const { isLogin, role_slug } = useSelector((s) => s.auth);
  const token = getAdminToken();

  // 1. Token must exist and pass client-side expiry check
  if (!isTokenValid(token)) {
    if (token) clearAdminToken();
    return <Navigate to="/login" replace />;
  }

  // 2. Redux must confirm login AND the role must be an admin role.
  //    This blocks a customer JWT from reaching the admin panel.
  if (!isLogin || !ADMIN_ROLES.includes(role_slug)) {
    clearAdminToken();
    return <Navigate to="/login" replace />;
  }

  return children;
};

const App = () => {
  const dispatch = useDispatch();

  // Proactive mid-session expiry watcher — warns 60s before expiry,
  // dispatches logout the moment a token expires without needing an API call.
  useTokenExpiry();

  // Redux auth state — used to redirect already-authenticated users away from
  // auth pages (/login, /register, /forgot-password, /reset-password)
  const adminAuth    = useSelector((s) => s.auth);
  const customerAuth = useSelector((s) => s.customerAuth);

  const isAdminLoggedIn    = adminAuth.isLogin    && ADMIN_ROLES.includes(adminAuth.role_slug);
  const isCustomerLoggedIn = customerAuth.isLogin;

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

  // Redirect an already-authenticated user away from auth pages
  // Admin users go to their dashboard; customers go home
  const authRedirect = isAdminLoggedIn
    ? <Navigate to="/admin/dashboard" replace />
    : isCustomerLoggedIn
      ? <Navigate to="/" replace />
      : null;

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

        {/* ── Auth pages — redirect away if already logged in ── */}
        <Route path="/login"           element={authRedirect ?? <Login />} />
        <Route path="/register"        element={authRedirect ?? <Register />} />
        <Route path="/forgot-password" element={authRedirect ?? <ForgotPassword />} />
        <Route path="/reset-password"  element={authRedirect ?? <ResetPassword />} />

        {/* ── Public storefront (all with header/footer) ── */}
        {/* This catches everything else including / */}
        <Route path="/*" element={<PublicLayout />} />
      </Routes>
    </Suspense>
  );
};

export default App;
