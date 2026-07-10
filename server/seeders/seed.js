const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
require("dotenv").config();

const Role = require("../models/Role");
const Permission = require("../models/Permission");
const User = require("../models/User");
const Settings = require("../models/Settings");

const permissions = [
  { name: "Dashboard View", slug: "dashboard-view", module: "Dashboard", action: "view", permission_id: 1 },
  { name: "Users List", slug: "users-list", module: "Users", action: "list", permission_id: 2 },
  { name: "Users Add", slug: "users-add", module: "Users", action: "add", permission_id: 3 },
  { name: "Users Edit", slug: "users-edit", module: "Users", action: "edit", permission_id: 4 },
  { name: "Users Delete", slug: "users-delete", module: "Users", action: "delete", permission_id: 5 },
  { name: "Employee List", slug: "employee-list", module: "Employee", action: "list", permission_id: 6 },
  { name: "Employee Add", slug: "employee-add", module: "Employee", action: "add", permission_id: 7 },
  { name: "Employee Edit", slug: "employee-edit", module: "Employee", action: "edit", permission_id: 8 },
  { name: "Employee Delete", slug: "employee-delete", module: "Employee", action: "delete", permission_id: 9 },
  { name: "Roles List", slug: "roles-list", module: "Roles", action: "list", permission_id: 10 },
  { name: "Roles Add", slug: "roles-add", module: "Roles", action: "add", permission_id: 11 },
  { name: "Roles Edit", slug: "roles-edit", module: "Roles", action: "edit", permission_id: 12 },
  { name: "Roles Delete", slug: "roles-delete", module: "Roles", action: "delete", permission_id: 13 },
  { name: "Category List", slug: "category-list", module: "Category", action: "list", permission_id: 18 },
  { name: "Category Add", slug: "category-add", module: "Category", action: "add", permission_id: 19 },
  { name: "Category Edit", slug: "category-edit", module: "Category", action: "edit", permission_id: 20 },
  { name: "Category Delete", slug: "category-delete", module: "Category", action: "delete", permission_id: 21 },
  { name: "Brand List", slug: "brand-list", module: "Brand", action: "list", permission_id: 26 },
  { name: "Brand Add", slug: "brand-add", module: "Brand", action: "add", permission_id: 27 },
  { name: "Brand Edit", slug: "brand-edit", module: "Brand", action: "edit", permission_id: 28 },
  { name: "Brand Delete", slug: "brand-delete", module: "Brand", action: "delete", permission_id: 29 },
  { name: "Product List", slug: "product-list", module: "Product", action: "list", permission_id: 30 },
  { name: "Product Add", slug: "product-add", module: "Product", action: "add", permission_id: 31 },
  { name: "Product Edit", slug: "product-edit", module: "Product", action: "edit", permission_id: 32 },
  { name: "Product Delete", slug: "product-delete", module: "Product", action: "delete", permission_id: 33 },
  { name: "Inventory List", slug: "inventory-list", module: "Inventory", action: "list", permission_id: 38 },
  { name: "Inventory Edit", slug: "inventory-edit", module: "Inventory", action: "edit", permission_id: 40 },
  { name: "Orders List", slug: "orders-list", module: "Orders", action: "list", permission_id: 42 },
  { name: "Orders Edit", slug: "orders-edit", module: "Orders", action: "edit", permission_id: 44 },
  { name: "Orders Cancel", slug: "orders-cancel", module: "Orders", action: "cancel", permission_id: 46 },
  { name: "Coupons List", slug: "coupons-list", module: "Coupons", action: "list", permission_id: 47 },
  { name: "Coupons Add", slug: "coupons-add", module: "Coupons", action: "add", permission_id: 48 },
  { name: "Coupons Edit", slug: "coupons-edit", module: "Coupons", action: "edit", permission_id: 49 },
  { name: "Coupons Delete", slug: "coupons-delete", module: "Coupons", action: "delete", permission_id: 50 },
  { name: "Reviews List", slug: "reviews-list", module: "Reviews", action: "list", permission_id: 51 },
  { name: "Reviews Delete", slug: "reviews-delete", module: "Reviews", action: "delete", permission_id: 53 },
  { name: "Banner List", slug: "banner-list", module: "Banner", action: "list", permission_id: 54 },
  { name: "Banner Add", slug: "banner-add", module: "Banner", action: "add", permission_id: 55 },
  { name: "Banner Edit", slug: "banner-edit", module: "Banner", action: "edit", permission_id: 56 },
  { name: "Banner Delete", slug: "banner-delete", module: "Banner", action: "delete", permission_id: 57 },
  { name: "Reports View", slug: "reports-view", module: "Reports", action: "view", permission_id: 66 },
  { name: "Settings View", slug: "settings-view", module: "Settings", action: "view", permission_id: 67 },
  { name: "Settings Edit", slug: "settings-edit", module: "Settings", action: "edit", permission_id: 68 },
  { name: "Audit Logs View", slug: "audit-logs-view", module: "AuditLogs", action: "view", permission_id: 87 },
];

const defaultSettings = [
  { key: "site_name", value: "ShopEase", group: "general", label: "Site Name", type: "string" },
  { key: "site_tagline", value: "Shop Smart, Shop Easy", group: "general", label: "Tagline", type: "string" },
  { key: "contact_email", value: "support@shopease.com", group: "general", label: "Contact Email", type: "string" },
  { key: "contact_phone", value: "+91 9876543210", group: "general", label: "Contact Phone", type: "string" },
  { key: "currency", value: "INR", group: "general", label: "Currency", type: "string" },
  { key: "currency_symbol", value: "₹", group: "general", label: "Currency Symbol", type: "string" },
  { key: "free_shipping_threshold", value: 500, group: "shipping", label: "Free Shipping Above (₹)", type: "number" },
  { key: "default_shipping_charge", value: 50, group: "shipping", label: "Default Shipping Charge", type: "number" },
  { key: "gst_percent", value: 5, group: "tax", label: "GST Percent", type: "number" },
  { key: "razorpay_enabled", value: true, group: "payment", label: "Razorpay Enabled", type: "boolean" },
  { key: "cod_enabled", value: true, group: "payment", label: "COD Enabled", type: "boolean" },
  { key: "maintenance_mode", value: false, group: "general", label: "Maintenance Mode", type: "boolean" },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");

    // ─── Permissions ────────────────────────────────────────────────────────────
    console.log("Seeding permissions...");
    for (const perm of permissions) {
      await Permission.findOneAndUpdate(
        { permission_id: perm.permission_id },
        perm,
        { upsert: true, new: true }
      );
    }
    console.log(`✅ ${permissions.length} permissions seeded`);

    // ─── Roles ──────────────────────────────────────────────────────────────────
    const allPermissions = await Permission.find();
    const allPermissionIds = allPermissions.map((p) => p._id);

    const roleData = [
      {
        name: "Super Admin",
        slug: "super_admin",
        description: "Full system access",
        permissions: allPermissionIds,
      },
      {
        name: "Admin",
        slug: "admin",
        description: "Manage products, orders, customers",
        permissions: allPermissions
          .filter((p) => ![87].includes(p.permission_id))
          .map((p) => p._id),
      },
      {
        name: "Employee",
        slug: "employee",
        description: "Handle assigned orders, inventory",
        permissions: allPermissions
          .filter((p) => [1, 38, 40, 42, 44].includes(p.permission_id))
          .map((p) => p._id),
      },
      {
        name: "Customer",
        slug: "customer",
        description: "Regular customer",
        permissions: [],
      },
    ];

    for (const role of roleData) {
      await Role.findOneAndUpdate({ slug: role.slug }, role, { upsert: true, new: true });
    }
    console.log("✅ 4 roles seeded");

    // ─── Super Admin User ────────────────────────────────────────────────────────
    const superAdminRole = await Role.findOne({ slug: "super_admin" });
    const existing = await User.findOne({ email: "superadmin@shopease.com" });

    if (!existing) {
      // Plain password — pre-save hook in User model will hash it automatically
      await User.create({
        name: "Super Admin",
        email: "superadmin@shopease.com",
        contact_no: "9876543210",
        password: "ShopEase@123",
        role_id: superAdminRole._id,
        is_email_verified: true,
        status: true,
      });
      console.log("✅ Super Admin user created → email: superadmin@shopease.com | password: ShopEase@123");
    } else {
      // Fix existing double-hashed password
      const hashed = await bcrypt.hash("ShopEase@123", 10);
      await User.findByIdAndUpdate(existing._id, { password: hashed });
      console.log("✅ Super Admin password reset (fixed double-hash)");
    }

    // ─── Admin User ─────────────────────────────────────────────────────────────
    const adminRole = await Role.findOne({ slug: "admin" });
    const existingAdmin = await User.findOne({ email: "admin@shopease.com" });

    if (!existingAdmin) {
      // Plain password — pre-save hook in User model will hash it automatically
      await User.create({
        name: "Admin",
        email: "admin@shopease.com",
        contact_no: "9876543211",
        password: "Admin@123",
        role_id: adminRole._id,
        is_email_verified: true,
        status: true,
      });
      console.log("✅ Admin user created → email: admin@shopease.com | password: Admin@123");
    } else {
      const hashed = await bcrypt.hash("Admin@123", 10);
      await User.findByIdAndUpdate(existingAdmin._id, { password: hashed });
      console.log("✅ Admin password reset (fixed double-hash)");
    }

    // ─── Employee User ────────────────────────────────────────────────────────
    const employeeRole = await Role.findOne({ slug: "employee" });
    const existingEmployee = await User.findOne({ email: "employee@shopease.com" });

    if (!existingEmployee) {
      await User.create({
        name: "Employee",
        email: "employee@shopease.com",
        contact_no: "9876543212",
        password: "Employee@123",
        role_id: employeeRole._id,
        is_email_verified: true,
        status: true,
      });
      console.log("✅ Employee user created → email: employee@shopease.com | password: Employee@123");
    } else {
      const hashed = await bcrypt.hash("Employee@123", 10);
      await User.findByIdAndUpdate(existingEmployee._id, { password: hashed });
      console.log("✅ Employee password reset");
    }

    // ─── Default Settings ─────────────────────────────────────────────────────
    console.log("Seeding settings...");
    for (const setting of defaultSettings) {
      await Settings.findOneAndUpdate({ key: setting.key }, setting, { upsert: true });
    }
    console.log(`✅ ${defaultSettings.length} settings seeded`);

    console.log("\n🎉 Seeding complete!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding error:", error);
    process.exit(1);
  }
}

seed();
