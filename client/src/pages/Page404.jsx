import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

const Page404 = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // If the current URL is under /admin, send back to admin dashboard.
  // Otherwise send to the public home page.
  const isAdmin = location.pathname.startsWith("/admin");

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="text-8xl mb-4">🛒</div>
      <h1 className="text-6xl font-bold text-primary-600 mb-2">404</h1>
      <h2 className="text-2xl font-semibold text-gray-700 mb-4">Page Not Found</h2>
      <p className="text-gray-400 mb-8">The page you're looking for doesn't exist or has been moved.</p>
      <button
        onClick={() => navigate(isAdmin ? "/admin/dashboard" : "/")}
        className="btn-primary px-8"
      >
        {isAdmin ? "Back to Dashboard" : "Back to Home"}
      </button>
    </div>
  );
};

export default Page404;
