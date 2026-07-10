exports.IDS = {
  // App Setup ID
  appsetup: 1,

  // User Types
  users_type: {
    admin: "admin",
    customer: "customer",
    employee: "employee",
    super_admin: "super_admin",
  },

  // Roles
  roles: {
    super_admin: "super_admin",
    admin: "admin",
    employee: "employee",
    customer: "customer",
  },

  // Order Statuses
  order_status: {
    Pending: "pending",
    Confirmed: "confirmed",
    Processing: "processing",
    Packed: "packed",
    Shipped: "shipped",
    OutForDelivery: "out_for_delivery",
    Delivered: "delivered",
    Cancelled: "cancelled",
    ReturnRequested: "return_requested",
    Returned: "returned",
    Refunded: "refunded",
  },

  // Payment Statuses
  payment_status: {
    Pending: "pending",
    Paid: "paid",
    Failed: "failed",
    Refunded: "refunded",
    COD: "cod",
  },

  // Permission IDs (matching seeded permissions)
  permissions: {
    // Dashboard
    Dashboard: { View: 1 },

    // User Management
    Users: { List: 2, Add: 3, Edit: 4, Delete: 5 },

    // Employee Management
    Employee: { List: 6, Add: 7, Edit: 8, Delete: 9 },

    // Role & Permission Management
    Roles: { List: 10, Add: 11, Edit: 12, Delete: 13 },
    Permissions: { List: 14, Add: 15, Edit: 16, Delete: 17 },

    // Category Management
    Category: { List: 18, Add: 19, Edit: 20, Delete: 21 },
    SubCategory: { List: 22, Add: 23, Edit: 24, Delete: 25 },

    // Brand Management
    Brand: { List: 26, Add: 27, Edit: 28, Delete: 29 },

    // Product Management
    Product: { List: 30, Add: 31, Edit: 32, Delete: 33 },
    ProductVariant: { List: 34, Add: 35, Edit: 36, Delete: 37 },

    // Inventory
    Inventory: { List: 38, Add: 39, Edit: 40, Delete: 41 },

    // Order Management
    Orders: { List: 42, Add: 43, Edit: 44, Delete: 45, Cancel: 46 },

    // Coupon Management
    Coupons: { List: 47, Add: 48, Edit: 49, Delete: 50 },

    // Review & Rating
    Reviews: { List: 51, Edit: 52, Delete: 53 },

    // CMS
    Banner: { List: 54, Add: 55, Edit: 56, Delete: 57 },
    Blog: { List: 58, Add: 59, Edit: 60, Delete: 61 },
    FAQ: { List: 62, Add: 63, Edit: 64, Delete: 65 },

    // Reports
    Reports: { View: 66 },

    // Settings
    Settings: { View: 67, Edit: 68 },

    // Masters
    Country: { List: 69, Add: 70, Edit: 71, Delete: 72 },
    State: { List: 73, Add: 74, Edit: 75, Delete: 76 },
    City: { List: 77, Add: 78, Edit: 79, Delete: 80 },
    Pincode: { List: 81, Add: 82, Edit: 83, Delete: 84 },

    // Notifications
    Notifications: { List: 85, Send: 86 },

    // Audit Logs
    AuditLogs: { View: 87 },
  },
};
