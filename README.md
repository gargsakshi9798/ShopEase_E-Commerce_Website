# ShopEase - Enterprise E-Commerce Platform

**Full-Stack MERN Application** | Node.js + Express + MongoDB + React (Vite) + Tailwind CSS

---

## Project Structure

```
ShopEase/
├── server/          ← Node.js + Express + MongoDB Backend
└── client/          ← React + Vite + Tailwind Frontend (Admin Panel)
```

---

## Quick Start

### 1. Setup Server

```bash
cd server
npm install
```

Create `.env` (already generated - fill in your values):
- Set `MONGO_URI` to your MongoDB connection string
- Set `SECRETKEY` for JWT
- Set Cloudinary, Nodemailer, Razorpay credentials

```bash
# Seed the database (creates roles, permissions, admin user)
npm run seed

# Start development server
npm run dev
```

**Default Admin Credentials (after seeding):**
- Super Admin: `superadmin@shopease.com` / `ShopEase@123`
- Admin: `admin@shopease.com` / `Admin@123`

### 2. Setup Client

```bash
cd client
npm install
npm run dev
```

Client runs on `http://localhost:3000`
Server runs on `http://localhost:5000`

---

## API Overview

Base URL: `http://localhost:5000/api/v1`

| Section | Prefix |
|---|---|
| Public (no auth) | `/public/...` |
| Auth | `/common/auth/...` |
| Admin (JWT required) | `/admin/...` |
| Customer (JWT required) | `/customer/...` |

### Key Endpoints

**Auth**
- `POST /common/auth/admin-login` - Admin/Employee login
- `POST /common/auth/register` - Customer register
- `POST /common/auth/login` - Customer login
- `POST /common/auth/forgot-password` - Send OTP
- `POST /common/auth/reset-password` - Reset password

**Admin**
- `GET /admin/dashboard` - Dashboard stats
- `CRUD /admin/masters/category` - Categories
- `CRUD /admin/masters/brand` - Brands
- `CRUD /admin/product-management` - Products
- `GET/PATCH /admin/order-management` - Orders
- `CRUD /admin/coupon-management` - Coupons
- `GET /admin/user-management/customers` - Customers
- `CRUD /admin/user-management/employee` - Employees
- `GET /admin/reports/sales` - Sales report
- `GET/PUT /admin/settings` - Site settings
- `GET/PUT /admin/roles` - Roles & Permissions

**Customer**
- `GET/POST /customer/cart` - Cart management
- `GET/POST /customer/wishlist` - Wishlist
- `POST /customer/orders/place` - Place order
- `GET /customer/orders` - Order history
- `CRUD /customer/address` - Addresses
- `GET/PUT /customer/profile` - Profile

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, Redux Toolkit |
| Backend | Node.js, Express.js, MongoDB, Mongoose |
| Auth | JWT, bcrypt |
| File Upload | express-fileupload + Cloudinary |
| Email | Nodemailer |
| Real-time | Socket.IO |
| Payment | Razorpay |
| Security | Helmet, CORS, Rate Limiting |

---

## User Roles

| Role | Access |
|---|---|
| Super Admin | Full system access |
| Admin | Products, Orders, Customers, Reports |
| Employee | Assigned orders, Inventory |
| Customer | Shop, Cart, Orders, Profile |
