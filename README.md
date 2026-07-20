# ShopEase — Full-Stack E-Commerce Platform

> A production-ready, full-stack e-commerce platform built with the MERN stack. ShopEase covers the complete shopping lifecycle — from product discovery and checkout to order tracking, returns, and customer support — alongside a fully featured admin panel with role-based access control.

---

## Live Demo

| Panel | URL |
|---|---|
| Customer Storefront | `http://localhost:3000` |
| Admin / Employee Panel | `http://localhost:3000/admin` |
| Backend API | `http://localhost:5000/api/v1` |

---

## Table of Contents

1. [Features](#features)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Getting Started](#getting-started)
5. [Environment Variables](#environment-variables)
6. [API Overview](#api-overview)
7. [Role-Based Access Control](#role-based-access-control)
8. [Key Modules](#key-modules)
9. [Screenshots](#screenshots)
10. [Author](#author)

---

## Features

### Customer Storefront
- **Authentication** — Register, Login, Forgot/Reset Password with OTP via email
- **Product Catalog** — Browse by category (Fashion, Electronics, Mobiles, Home & Kitchen, Appliances, Beauty, Sports, Books, Toys, Grocery, Automotive), search, filter, sort
- **Product Detail** — Image gallery, ratings & reviews, size/colour variants, stock status
- **Cart & Wishlist** — Persistent cart, saved wishlist, quantity management
- **Checkout** — Multi-address support, coupon codes, gift card redemption
- **Payments** — Razorpay (UPI, Cards, Net Banking, EMI), Cash on Delivery
- **Order Management** — Real-time order tracking, invoice PDF download, cancellation & return requests
- **Account Dashboard** — Profile management, address book, order history, reviews, gift cards
- **Customer Support** — Raise support tickets, reply to conversations, view ticket status
- **Notifications** — In-app notification centre with read/unread status
- **Account Deletion** — Self-service account deletion request workflow

### Admin Panel
- **Dashboard** — Revenue stats, order counts, recent activity, charts (Chart.js)
- **Product Management** — Create/edit/delete products with Cloudinary image uploads, bulk inventory management
- **Order Management** — View, update status, assign orders to employees, download invoices
- **User Management** — Customers, Employees, Admin users — block/unblock, full CRUD
- **Masters** — Categories and Brands management
- **Coupons** — Create discount coupons (flat/percentage), usage limits, date ranges
- **Gift Cards** — Issue, manage and track gift card redemptions
- **Reviews Moderation** — Approve, hide, or delete customer reviews
- **CMS** — Homepage banner management, FAQ editor
- **Support Tickets** — View, reply, update status, assign to employees
- **Contact Messages** — View and respond to customer contact form submissions
- **Account Deletion Requests** — Employee review + admin approval/rejection workflow
- **Notifications** — Admin broadcast notifications
- **Reports** — Sales, orders, revenue charts and exports
- **Roles & Permissions** — Granular permission management per role
- **Settings** — Site-wide configuration (name, logo, social links, payment settings)
- **System Tools (Super Admin only)** — Audit Logs, Security settings, Backup management

### Real-Time
- **Socket.IO** — Live order status updates, admin notifications

---

## Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 18 | UI framework |
| Vite | Build tool & dev server |
| Redux Toolkit | Global state management |
| React Router v6 | Client-side routing |
| Tailwind CSS v3 | Utility-first styling |
| Axios | HTTP client |
| React Hook Form | Form state & validation |
| Chart.js + react-chartjs-2 | Data visualisation |
| Framer Motion | Animations |
| Socket.io-client | Real-time communication |
| React Hot Toast | Notifications |
| React Icons | Icon library |
| React Select | Enhanced select inputs |
| js-cookie | Cookie management |

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express | REST API server |
| MongoDB + Mongoose | Database & ODM |
| JWT | Authentication |
| Bcrypt | Password hashing |
| Cloudinary | Image storage & CDN |
| Razorpay | Payment gateway |
| Nodemailer | Transactional email |
| Socket.IO | Real-time events |
| Helmet | HTTP security headers |
| Express Rate Limit | API rate limiting |
| Node-cron | Scheduled tasks |
| Puppeteer | Invoice PDF generation |
| Express Validator | Input validation |
| Multer + Cloudinary Storage | File uploads |

---

## Project Structure

```
ShopEase/
├── client/                        # React frontend (Vite)
│   └── src/
│       ├── components/
│       │   ├── admin/layout/      # AdminHeader, Sidebar
│       │   ├── common/            # DataTable, Modal, EmptyState,
│       │   │                      # Loaders, ErrorBoundary, ConfirmDelete...
│       │   └── public/layout/     # PublicHeader, PublicFooter, TopBar
│       ├── features/              # Redux slices
│       │   ├── auth/              # Admin auth
│       │   ├── public/            # Customer auth, cart, orders...
│       │   ├── products/
│       │   ├── orders/
│       │   ├── users/
│       │   ├── support/
│       │   └── ...
│       ├── hooks/                 # useDebounce, useLocalStorage,
│       │                          # useTokenExpiry, useRazorpay, useSettings
│       ├── layouts/               # AdminLayout, PublicLayout
│       ├── pages/
│       │   ├── auth/              # Login, Register, ForgotPassword, ResetPassword
│       │   ├── public/            # Home, Cart, Checkout, Orders, Profile...
│       │   ├── dashboard/         # Admin Dashboard
│       │   ├── products/          # Products, ProductForm, Inventory
│       │   ├── orders/            # Orders list, OrderDetail
│       │   ├── users/             # Customers, Employees, AdminUsers,
│       │   │                      # AccountDeletionRequests
│       │   ├── support/           # SupportTickets, ContactMessages
│       │   ├── cms/               # Banners, FAQs
│       │   ├── coupons/
│       │   ├── giftcards/
│       │   ├── reports/
│       │   ├── roles/
│       │   ├── settings/
│       │   └── system/            # AuditLogs, Security, Backup
│       ├── redux/store.js
│       └── utils/                 # APIS.js, Methods.js, toast.js,
│                                  # ApiInstance.js, tokenUtils.js
│
└── server/                        # Express backend
    ├── config/                    # DB connection, Cloudinary config
    ├── controllers/api/v1/
    │   ├── admin/                 # product, order, user, support...
    │   ├── common/auth/           # login, register, forgot password
    │   └── customer/              # cart, orders, payment, support...
    ├── middleware/                # auth.middleware.js (JWT verification)
    ├── models/                    # 23 Mongoose models
    ├── routes/api/v1/
    │   ├── admin/                 # All admin routes
    │   ├── common/                # Shared auth routes
    │   ├── customer/              # Customer-facing routes
    │   └── webhook/               # Razorpay webhook
    ├── services/                  # Email templates, PDF generation
    ├── helper/                    # Exception handling, HTTP codes, utils
    └── seeders/                   # Category, product & user seed scripts
```

---

## Getting Started

### Prerequisites
- Node.js >= 18
- MongoDB (local or Atlas)
- Cloudinary account
- Razorpay account (test keys work)
- Gmail account (for Nodemailer SMTP)

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/shopease.git
cd shopease
```

### 2. Setup the Server

```bash
cd server
npm install
cp .env.example .env   # fill in your values (see Environment Variables)
npm run seed:all       # optional: seed products & categories
npm run dev            # starts on http://localhost:5000
```

### 3. Setup the Client

```bash
cd client
npm install
cp .env.example .env   # fill in your values
npm run dev            # starts on http://localhost:3000
```

---

## Environment Variables

### Server (`server/.env`)

```env
PORT=5000
NODE_ENV=development

# MongoDB
MONGO_URI=mongodb://localhost:27017/shopease

# JWT
SECRETKEY=your_jwt_secret_key
JWT_EXPIRE=365d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Nodemailer (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=noreply@shopease.com

# Razorpay
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# App URLs
CLIENT_URL=http://localhost:3000
ADMIN_URL=http://localhost:3001
```

### Client (`client/.env`)

```env
VITE_API_URL=http://localhost:5000
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
```

---

## API Overview

All endpoints are prefixed with `/api/v1`.

### Auth (Common)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/common/auth/admin-login` | Admin / Employee login |
| POST | `/common/auth/login` | Customer login |
| POST | `/common/auth/register` | Customer registration |
| POST | `/common/auth/forgot-password` | Send OTP email |
| POST | `/common/auth/reset-password` | Reset password with OTP |
| GET | `/common/auth/admin-details` | Get logged-in admin details |

### Admin Routes (JWT required — admin/super_admin/employee)
| Prefix | Description |
|--------|-------------|
| `/admin/products` | Product CRUD, image upload |
| `/admin/orders` | Order listing, status update, assign |
| `/admin/user-management/customers` | Customer listing, block/unblock |
| `/admin/user-management/employees` | Employee CRUD |
| `/admin/support/tickets` | Support ticket management |
| `/admin/support/messages` | Contact message management |
| `/admin/coupons` | Coupon CRUD |
| `/admin/gift-cards` | Gift card management |
| `/admin/cms/banners` | Banner CRUD |
| `/admin/cms/faqs` | FAQ CRUD |
| `/admin/account-deletion` | Deletion request workflow |
| `/admin/notifications` | Notification management |
| `/admin/reports` | Sales & order reports |
| `/admin/roles` | Role & permission management |
| `/admin/settings` | Site settings |
| `/admin/audit-logs` | Audit trail (super_admin) |

### Customer Routes (JWT required)
| Prefix | Description |
|--------|-------------|
| `/customer/cart` | Cart CRUD |
| `/customer/wishlist` | Wishlist management |
| `/customer/orders` | Order placement & tracking |
| `/customer/payment` | Razorpay order creation & verification |
| `/customer/address` | Address book |
| `/customer/profile` | Profile update, avatar upload |
| `/customer/support/tickets` | Raise & reply to tickets |
| `/customer/notifications` | Customer notifications |
| `/customer/account-deletion` | Submit deletion request |

### Webhook
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/webhook/razorpay` | Razorpay payment events |

---

## Role-Based Access Control

ShopEase implements three admin roles with distinct permissions:

| Feature | Super Admin | Admin | Employee |
|---------|:-----------:|:-----:|:--------:|
| Full product & order management | ✅ | ✅ | ✅ (view) |
| Delete tickets / messages | ✅ | ❌ | ❌ |
| Close / resolve tickets | ✅ | ✅ | ❌ |
| Reply & update ticket status | ✅ | ✅ | ✅ (assigned only) |
| Approve account deletion | ✅ | ✅ | ❌ |
| Review & forward deletion requests | ✅ | ✅ | ✅ |
| Force delete accounts | ✅ | ❌ | ❌ |
| Manage roles & permissions | ✅ | ❌ | ❌ |
| Audit logs, security, backup | ✅ | ❌ | ❌ |
| CMS, coupons, gift cards | ✅ | ✅ | ❌ |

JWT tokens carry `user_type` and `role` fields. Every protected route validates both at the middleware level before reaching the controller.

---

## Key Modules

### Payment Flow (Razorpay)
1. Customer places order → `POST /customer/payment/razorpay/create-order` creates a Razorpay order
2. Frontend opens Razorpay checkout modal
3. On success → `POST /customer/payment/razorpay/verify` validates HMAC signature
4. Webhook at `/webhook/razorpay` handles async `payment.captured` / `payment.failed` events
5. Invoice PDF generated via Puppeteer and emailed via Nodemailer

### Support Ticket Workflow
1. Customer raises ticket → `POST /customer/support/tickets`
2. Auto-generates ticket number (`TKT-00001`) via `pre("validate")` hook
3. Admin/Employee replies → conversation thread stored in `replies[]` array
4. Status transitions: `open → in_progress → waiting_customer → resolved → closed`
5. Employee restricted to assigned tickets; cannot close or delete

### Account Deletion Workflow
1. Customer submits request → `POST /customer/account-deletion`
2. Employee reviews, runs checklist, forwards to admin → `PATCH .../review`
3. Admin approves (deactivates account) or rejects → `PATCH .../decide`
4. Super Admin can force hard-delete → `DELETE .../force-delete`

### Real-Time (Socket.IO)
- Clients join user-specific rooms on login
- Order status changes emit `order:updated` events
- Admin panel receives live support ticket and notification events

---

## Screenshots

> Add screenshots here after deployment. Suggested sections:
> - Home page / storefront
> - Product listing with filters
> - Product detail page
> - Cart & Checkout
> - Order tracking
> - Admin Dashboard
> - Support Tickets panel

---

## Author

**Sakshi Garg**
- Email: gargsakshi9798@gmail.com
- GitHub: [github.com/yourusername](https://github.com/yourusername)
- LinkedIn: [linkedin.com/in/yourprofile](https://linkedin.com/in/yourprofile)

---

## License

This project is for portfolio and educational purposes.
