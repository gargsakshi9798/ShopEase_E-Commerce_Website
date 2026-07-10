export const APIS = {
  // Auth
  Auth: {
    AdminLogin: "/common/auth/admin-login",
    AdminDetails: "/common/auth/admin-details",
    Register: "/common/auth/register",
    Login: "/common/auth/login",
    ForgotPassword: "/common/auth/forgot-password",
    ResetPassword: "/common/auth/reset-password",
    ChangePassword: "/common/auth/change-password",
    VerifyEmail: "/common/auth/verify-email",
  },

  // Dashboard
  Dashboard: "/admin/dashboard",

  // Masters
  Masters: {
    Category: "/admin/masters/category",
    Brand: "/admin/masters/brand",
  },

  // Product Management
  Products: "/admin/product-management",

  // Order Management
  Orders: "/admin/order-management",

  // User Management
  Users: {
    Customers:  "/admin/user-management/customers",
    Employees:  "/admin/user-management/employees",
    Admins:     "/admin/user-management/admins",
    Employee:   "/admin/user-management/employee",
    Admin:      "/admin/user-management/admin",
    Customer:   "/admin/user-management/customer",
    ById:       (id) => `/admin/user-management/${id}`,
    BlockById:  (id) => `/admin/user-management/${id}/block`,
  },

  // Coupon Management
  Coupons: "/admin/coupon-management",

  // Review Management
  Reviews: "/admin/review-management",

  // CMS
  CMS: {
    Banners: "/admin/cms/banners",
    FAQs: "/admin/cms/faqs",
  },

  // Settings
  Settings: "/admin/settings",

  // Reports
  Reports: {
    Sales: "/admin/reports/sales",
    Revenue: "/admin/reports/revenue",
    TopProducts: "/admin/reports/top-products",
    Customers: "/admin/reports/customers",
  },

  // Roles & Permissions
  Roles: "/admin/roles",
  Permissions: "/admin/roles/permissions",

  // System
  AuditLogs:     "/admin/audit-logs",
  Notifications: "/admin/notifications",

  // Support
  Support: {
    Tickets:          "/admin/support/tickets",
    TicketStats:      "/admin/support/tickets/stats",
    TicketById:       (id) => `/admin/support/tickets/${id}`,
    TicketStatus:     (id) => `/admin/support/tickets/${id}/status`,
    TicketAssign:     (id) => `/admin/support/tickets/${id}/assign`,
    TicketPriority:   (id) => `/admin/support/tickets/${id}/priority`,
    TicketReply:      (id) => `/admin/support/tickets/${id}/reply`,
    Messages:         "/admin/support/messages",
    MessageById:      (id) => `/admin/support/messages/${id}`,
    MessageReply:     (id) => `/admin/support/messages/${id}/reply`,
    MessageArchive:   (id) => `/admin/support/messages/${id}/archive`,
  },

  // Public (unauthenticated storefront)
  Public: {
    Home:       "/public/home",
    Products:   "/public/products",
    ProductDetail: (slug) => `/public/products/${slug}`,
    Categories: "/public/categories",
    FAQs:       "/public/faqs",
  },

  // Customer (authenticated — requires shopease_customer_token)
  Customer: {
    Profile:       "/customer/profile",
    Address:       "/customer/address",
    Cart:          "/customer/cart",
    Orders:        "/customer/orders",
    Reviews:       "/customer/reviews",
    Notifications: "/customer/notifications",
  },
};
