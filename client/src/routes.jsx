import React from "react";
import { Navigate } from "react-router-dom";

// Root redirect — /admin/ → /admin/dashboard
const RootRedirect = () => <Navigate to="/admin/dashboard" replace />;

// Dashboard
const Dashboard = React.lazy(() => import("./pages/dashboard/Dashboard"));

// Masters
const Categories = React.lazy(() => import("./pages/masters/Categories"));
const Brands     = React.lazy(() => import("./pages/masters/Brands"));

// Products
const Products    = React.lazy(() => import("./pages/products/Products"));
const ProductForm = React.lazy(() => import("./pages/products/ProductForm"));
const Inventory   = React.lazy(() => import("./pages/products/Inventory"));

// Orders
const Orders      = React.lazy(() => import("./pages/orders/Orders"));
const OrderDetail = React.lazy(() => import("./pages/orders/OrderDetail"));

// Users
const Customers              = React.lazy(() => import("./pages/users/Customers"));
const Employees              = React.lazy(() => import("./pages/users/Employees"));
const AdminUsers             = React.lazy(() => import("./pages/users/AdminUsers"));
const AccountDeletionRequests = React.lazy(() => import("./pages/users/AccountDeletionRequests"));

// Coupons
const Coupons = React.lazy(() => import("./pages/coupons/Coupons"));

// Reviews
const Reviews = React.lazy(() => import("./pages/reviews/Reviews"));

// CMS
const Banners = React.lazy(() => import("./pages/cms/Banners"));
const FAQs    = React.lazy(() => import("./pages/cms/FAQs"));

// Reports
const Reports = React.lazy(() => import("./pages/reports/Reports"));

// Roles & Permissions
const Roles = React.lazy(() => import("./pages/roles/Roles"));

// Settings
const Settings = React.lazy(() => import("./pages/settings/Settings"));

// System Management
const AuditLogs    = React.lazy(() => import("./pages/system/AuditLogs"));
const Security     = React.lazy(() => import("./pages/system/Security"));
const Backup       = React.lazy(() => import("./pages/system/Backup"));

// Support
const SupportTickets  = React.lazy(() => import("./pages/support/SupportTickets"));
const ContactMessages = React.lazy(() => import("./pages/support/ContactMessages"));

// Profile
const MyProfile = React.lazy(() => import("./pages/profile/MyProfile"));

// Notifications
const Notifications = React.lazy(() => import("./pages/notifications/Notifications"));

// 404
const Page404 = React.lazy(() => import("./pages/Page404"));

/**
 * IMPORTANT: These paths are RELATIVE — they are rendered inside AdminLayout
 * which is mounted at /admin/*. So "dashboard" matches /admin/dashboard.
 * Do NOT add leading slashes here.
 */
const routes = [
  { path: "",                    element: RootRedirect },
  { path: "dashboard",           element: Dashboard },

  // Masters
  { path: "masters/categories",  element: Categories },
  { path: "masters/brands",      element: Brands },

  // Products
  { path: "products",            element: Products },
  { path: "products/create",     element: ProductForm },
  { path: "products/edit/:id",   element: ProductForm },
  { path: "inventory",           element: Inventory },

  // Orders
  { path: "orders",              element: Orders },
  { path: "orders/:id",          element: OrderDetail },

  // Users
  { path: "customers",                element: Customers },
  { path: "employees",                element: Employees },
  { path: "admin-users",              element: AdminUsers },
  { path: "account-deletion",         element: AccountDeletionRequests },

  // Coupons
  { path: "coupons",             element: Coupons },

  // Reviews
  { path: "reviews",             element: Reviews },

  // CMS
  { path: "cms/banners",         element: Banners },
  { path: "cms/faqs",            element: FAQs },

  // Reports
  { path: "reports",             element: Reports },

  // Roles
  { path: "roles",               element: Roles },

  // Settings
  { path: "settings",            element: Settings },

  // System Management (Super Admin)
  { path: "audit-logs",          element: AuditLogs },
  { path: "security",            element: Security },
  { path: "backup",              element: Backup },

  // Support
  { path: "support",             element: SupportTickets },
  { path: "messages",            element: ContactMessages },

  // Profile
  { path: "profile",             element: MyProfile },

  // Notifications
  { path: "notifications",       element: Notifications },

  // 404
  { path: "*",                   element: Page404 },
];

export default routes;
