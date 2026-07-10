import React from "react";
import { useNavigate } from "react-router-dom";

const Page404 = () => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="text-8xl mb-4">🛒</div>
      <h1 className="text-6xl font-bold text-primary-600 mb-2">404</h1>
      <h2 className="text-2xl font-semibold text-gray-700 mb-4">Page Not Found</h2>
      <p className="text-gray-400 mb-8">The page you're looking for doesn't exist.</p>
      <button onClick={() => navigate("/dashboard")} className="btn-primary px-8">
        Back to Dashboard
      </button>
    </div>
  );
};

export default Page404;
