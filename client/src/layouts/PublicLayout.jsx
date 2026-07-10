import { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import TopBar from "../components/public/layout/TopBar";
import PublicHeader from "../components/public/layout/PublicHeader";
import PublicFooter from "../components/public/layout/PublicFooter";
import ScrollToTop from "../components/common/ScrollToTop";
import ProtectedCustomerRoute from "../components/public/ProtectedCustomerRoute";
import publicRoutes from "../routes.public.jsx";

const PublicLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <ScrollToTop />
      <TopBar />
      <PublicHeader />
      <main className="flex-1">
        <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center"><div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" /></div>}>
          <Routes>
            {publicRoutes.map((route, idx) => {
              if (!route.element) return null;
              const element = route.protected
                ? <ProtectedCustomerRoute><route.element /></ProtectedCustomerRoute>
                : <route.element />;
              return <Route key={idx} path={route.path} element={element} />;
            })}
          </Routes>
        </Suspense>
      </main>
      <PublicFooter />
    </div>
  );
};

export default PublicLayout;
