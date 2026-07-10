import { Suspense, useState } from "react";
import { Routes, Route } from "react-router-dom";
import Sidebar from "../components/admin/layout/Sidebar";
import Header  from "../components/admin/layout/Header";
import routes  from "../routes.jsx";

const Loader = () => (
  <div className="flex-1 flex items-center justify-center h-full">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      <p className="text-xs text-gray-400">Loading...</p>
    </div>
  </div>
);

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar — fixed, 256px wide */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/*
        Main content area.
        - On lg+: shift right by 256px when sidebar is open.
        - On mobile: always full width (sidebar overlays).
      */}
      <div
        className={`flex flex-col flex-1 min-w-0 overflow-hidden transition-all duration-300 ${
          sidebarOpen ? "lg:ml-64" : "lg:ml-0"
        }`}
      >
        <Header onMenuClick={() => setSidebarOpen((v) => !v)} sidebarOpen={sidebarOpen} />

        <main className="flex-1 overflow-auto p-4 md:p-6">
          <Suspense fallback={<Loader />}>
            <Routes>
              {routes.map((route, idx) =>
                route.element ? (
                  <Route key={idx} path={route.path} element={<route.element />} />
                ) : null
              )}
            </Routes>
          </Suspense>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
