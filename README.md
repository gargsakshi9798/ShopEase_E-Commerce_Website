# ShopEase — Full-Stack E-Commerce Platform

> A production-ready, full-stack e-commerce platform built with the MERN stack. ShopEase covers the complete shopping lifecycle — from product discovery and checkout to order tracking, returns, and customer support — alongside a fully featured admin panel with role-based access control, a real-time AI chatbot assistant (Aria), and Socket.IO powered live updates.

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
4. [Database Models](#database-models)
5. [Getting Started](#getting-started)
6. [Environment Variables](#environment-variables)
7. [Seed Data](#seed-data)
8. [API Overview](#api-overview)
9. [Role-Based Access Control](#role-based-access-control)
10. [Key Modules](#key-modules)
11. [Author](#author)

---

## Features

### Customer Storefront
- **Authentication** — Register, Login, Forgot/Reset Password with OTP via email
- **Product Catalog** — Browse by category (Fashion, Electronics, Mobiles, Home & Kitchen, Appliances, Beauty, Sports, Books, Toys, Grocery, Automotive), search, filter, sort
- **Product Detail** — Image gallery, ratings & reviews, size/colour variants, stock status
- **Cart & Wishlist** — Persistent cart, saved-for-later, wishlist management, quantity controls
- **Checkout** — Multi-address support, coupon code redemption, gift card balance usage
- **Payments** — Razorpay (UPI, Cards, Net Banking, EMI), Cash on Delivery
- **Order Management** — Real-time order tracking, invoice PDF download, cancellation & return requests
- **Account Dashboard** — Profile management, avatar upload, address book, order history, reviews, coupons, gift cards, support tickets, notifications
- **Customer Support** — Raise support tickets, reply to conversations, track ticket status
- **Notifications** — In-app notification centre with read/unread status
- **Account Deletion** — Self-service account deletion request workflow
- **Help Center** — Searchable FAQ with topic categories
- **Contact Us** — Contact form with message submission
- **Aria AI Chatbot** — Floating AI assistant with animated 3D avatar (speaking/idle states), real-time order tracking, ticket creation with validation, sentiment detection, session persistence, feedback system, and 24/7 availability

### Admin Panel
- **Dashboard** — Revenue stats, order counts, recent activity, trend charts (Chart.js)
- **Product Management** — Full CRUD with Cloudinary image uploads, bulk inventory management, variant support
- **Order Management** — View, update status, assign to employees, download invoices, filter by status
- **User Management** — Customers, Employees, Admin users — full CRUD, block/unblock, role assignment
- **Masters** — Categories and Brands management
- **Coupons** — Create discount coupons (flat/percentage), usage limits, expiry dates
- **Gift Cards** — Issue, manage and track gift card redemptions and balances
- **Reviews Moderation** — Approve, hide, or delete customer reviews
- **CMS** — Homepage banner management
- **Support Tickets** — View, reply, update status, assign to employees, conversation threads
- **Contact Messages** — View and respond to customer contact form submissions
- **Account Deletion Requests** — Employee review + admin approval/rejection workflow with checklist
- **Notifications** — Admin broadcast and targeted notifications
- **Reports** — Sales, orders, revenue charts with date range filters
- **Roles & Permissions** — Granular permission creation and assignment per role
- **Settings** — Site-wide configuration (name, logo, tagline, social links, payment settings, app store links, footer content)
- **System Tools (Super Admin only)** — Audit Logs, Security settings, Backup management

### Real-Time Features
- **Socket.IO** — Live order status updates pushed to customers, admin dashboard live counters
- **Employee View Store** — Employees can browse the public store while staying authenticated in the admin session

---

## Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 18.3.1 | UI framework |
| Vite | 5.4.11 | Build tool & dev server |
| Redux Toolkit | 2.3.0 | Global state management |
| React Router v6 | 6.28.0 | Client-side routing with future flags |
| Tailwind CSS | 3.4.17 | Utility-first styling |
| Axios | 1.7.9 | HTTP client with interceptors |
| React Hook Form | 7.54.2 | Form state & validation |
| Chart.js + react-chartjs-2 | 4.4.7 | Data visualisation |
| Framer Motion | 11.15.0 | Animations |
| Socket.io-client | 4.8.1 | Real-time communication |
| React Hot Toast | 2.5.2 | Toast notifications |
| React Icons | 5.4.0 | Icon library |
| React Select | 5.10.0 | Enhanced select inputs |
| js-cookie | 3.0.5 | Cookie management |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Node.js + Express | 4.21.1 | REST API server |
| MongoDB + Mongoose | 8.9.5 | Database & ODM |
| JWT (jsonwebtoken) | 9.0.2 | Authentication tokens |
| Bcrypt | 5.1.1 | Password hashing |
| Cloudinary | 2.5.1 | Image storage & CDN |
| Razorpay | 2.9.5 | Payment gateway |
| Nodemailer | 6.9.16 | Transactional email (Gmail SMTP) |
| Socket.IO | 4.8.1 | Real-time events |
| Helmet | 8.0.0 | HTTP security headers |
| Express Rate Limit | 7.4.1 | API rate limiting (500 req / 15 min) |
| Node-cron | 3.0.3 | Scheduled tasks |
| Puppeteer | 24.1.0 | Invoice PDF generation |
| Express Validator | 7.2.0 | Input validation |
| Multer + Cloudinary Storage | 1.4.5 | File uploads |
| Compression | 1.7.5 | Gzip response compression |
| XSS-Clean | 0.1.4 | XSS attack prevention |

---

## Project Structure

```
ShopEase/
├── client/                             # React frontend (Vite)
│   ├── public/
│   ├── scripts/
│   │   └── clear-cache.js
│   └── src/
│       ├── assets/images/              # Login, register background images
│       ├── components/
│       │   ├── admin/layout/           # Header.jsx, Sidebar.jsx
│       │   ├── common/                 # DataTable, Modal, EmptyState, Loaders,
│       │   │   │                       # ErrorBoundary, ConfirmDelete,
│       │   │   │                       # PasswordStrengthIndicator, ScrollToTop,
│       │   │   │                       # RazorpayButton, UserFormModal
│       │   │   └── ChatBot/
│       │   │       └── ChatBotWidget.jsx   # Aria AI Assistant
│       │   └── public/layout/          # PublicHeader, PublicFooter, TopBar,
│       │                               # AccountLayout
│       ├── data/                       # Static product seed data (11 categories)
│       ├── features/                   # Redux Toolkit slices
│       │   ├── auth/                   # Admin auth (authSlice)
│       │   ├── cms/                    # bannerSlice
│       │   ├── coupons/                # couponSlice
│       │   ├── dashboard/              # dashboardSlice
│       │   ├── giftcards/              # adminGiftCardSlice
│       │   ├── masters/                # brandSlice, categorySlice
│       │   ├── notifications/          # notificationSlice
│       │   ├── orders/                 # orderSlice
│       │   ├── products/               # productSlice
│       │   ├── public/                 # customerAuthSlice, publicCartSlice,
│       │   │                           # publicOrderSlice, publicAddressSlice,
│       │   │                           # publicProfileSlice, publicHomeSlice,
│       │   │                           # publicNotificationSlice, publicGiftCardSlice,
│       │   │                           # publicAccountDeletionSlice, publicPaymentSlice
│       │   ├── reviews/                # reviewSlice
│       │   ├── roles/                  # roleSlice
│       │   ├── settings/               # settingsSlice
│       │   ├── support/                # supportSlice (admin), publicSupportSlice
│       │   └── users/                  # userSlice
│       ├── hooks/                      # useDebounce, useLocalStorage,
│       │                               # useTokenExpiry, useRazorpay, useSettings
│       ├── layouts/
│       │   ├── AdminLayout.jsx
│       │   └── PublicLayout.jsx
│       ├── pages/
│       │   ├── auth/                   # Login, Register, ForgotPassword, ResetPassword
│       │   ├── public/                 # Home, Products, ProductDetail, Cart, Checkout,
│       │   │                           # MyAccount, MyProfile, MyOrders, OrderDetail,
│       │   │                           # MyAddresses, MyCoupons, MyReviews, MyTickets,
│       │   │                           # Notifications, MySettings, OrderSuccess,
│       │   │                           # HelpCenter, TrackOrder, Returns,
│       │   │                           # ShippingPolicy, CancellationPolicy,
│       │   │                           # ContactUs, AboutUs, Careers, BecomeSeller,
│       │   │                           # Affiliate, TermsConditions, PrivacyPolicy,
│       │   │                           # GiftCards, BulkOrders, AllCategories,
│       │   │                           # CategoryPage, Fashion, Electronics,
│       │   │                           # Mobiles, HomeKitchen, Appliances, Beauty,
│       │   │                           # Sports, Books, Toys, Grocery, Automotive
│       │   ├── dashboard/              # AdminDashboard
│       │   ├── products/               # Products, ProductForm, Inventory
│       │   ├── orders/                 # Orders, OrderDetail (admin)
│       │   ├── users/                  # Customers, Employees, AdminUsers,
│       │   │                           # AccountDeletionRequests
│       │   ├── support/                # SupportTickets, ContactMessages
│       │   ├── cms/                    # Banners
│       │   ├── coupons/                # Coupons
│       │   ├── giftcards/              # GiftCards (admin)
│       │   ├── reports/                # Reports
│       │   ├── roles/                  # Roles, Permissions
│       │   ├── settings/               # Settings
│       │   └── system/                 # AuditLogs, Security, Backup
│       ├── redux/
│       │   └── store.js
│       └── utils/
│           ├── APIS.js                 # All API endpoint constants
│           ├── ApiInstance.js          # Axios instance with request/response interceptors
│           ├── IDS.js                  # App-wide ID/status constants
│           ├── Methods.js              # GET, POST, PUT, PATCH, DELETE helpers
│           ├── toast.js                # Configured toast helper
│           └── tokenUtils.js          # JWT decode, validate, get/clear helpers
│
└── server/                             # Express backend
    ├── config/
    │   ├── db.js                       # MongoDB connection
    │   └── cloudinary.js               # Cloudinary configuration
    ├── controllers/api/v1/
    │   ├── admin/                      # product, order, user, coupon, giftcard,
    │   │                               # support, cms, reports, roles, settings,
    │   │                               # notifications, account_deletion, audit_logs
    │   ├── common/auth/                # login, register, forgot/reset password,
    │   │                               # admin-details, change-password
    │   └── customer/                   # cart, wishlist, orders, payment (Razorpay),
    │                                   # address, profile, support, notifications,
    │                                   # reviews, giftcard, account_deletion
    ├── middleware/
    │   └── auth.middleware.js          # JWT verification + role check
    ├── models/                         # 23 Mongoose models (see below)
    ├── routes/api/v1/
    │   ├── admin/                      # All protected admin routes
    │   ├── common/                     # Shared auth routes
    │   ├── customer/                   # Customer-facing protected routes
    │   ├── public/                     # Public unauthenticated routes
    │   └── webhook/                    # Razorpay webhook (raw body)
    ├── services/
    │   ├── email/                      # Nodemailer templates (OTP, order confirmation,
    │   │                               # ticket updates, invoice)
    │   └── pdf/                        # Puppeteer invoice generation
    ├── helper/
    │   ├── ExceptionHandler.js
    │   ├── HttpCodes.js
    │   └── NodeMailer.js
    └── seeders/                        # Seed scripts for all 11 product categories
        ├── seed.js                     # Core users, roles, categories, brands seeder
        ├── runAllSeeders.js
        ├── seedFashion.js
        ├── seedElectronics.js
        ├── seedMobiles.js
        ├── seedHomeKitchen.js
        ├── seedAppliances.js
        ├── seedBeauty.js
        ├── seedSports.js
        ├── seedBooks.js
        ├── seedToys.js
        ├── seedGrocery.js
        └── seedAutomotive.js
```

---

## Database Models

ShopEase uses **23 Mongoose models**:

| Model | Description |
|---|---|
| `User` | Customers, admins, employees — unified user model with role reference |
| `Role` | Role definitions (super_admin, admin, employee) |
| `Permission` | Granular permission flags assigned to roles |
| `Product` | Full product model with variants, images, stock, ratings |
| `Category` | Product categories with slug, image, parent support |
| `Brand` | Product brands |
| `Order` | Customer orders with items, status timeline, address snapshot |
| `Cart` | Persistent customer cart with saved-for-later support |
| `Wishlist` | Customer wishlists |
| `Address` | Customer delivery address book |
| `Payment` | Payment records linked to orders (Razorpay / COD) |
| `Invoice` | Invoice metadata + PDF path per order |
| `Coupon` | Discount coupons (flat/percentage, usage limits, date ranges) |
| `GiftCard` | Gift card issuance, balance tracking, redemption history |
| `Review` | Product reviews with rating, text, moderation status |
| `SupportTicket` | Customer support tickets with conversation thread |
| `ContactMessage` | Contact form submissions |
| `Notification` | In-app notifications for customers and admins |
| `Banner` | CMS homepage banners |
| `FAQ` | Frequently asked questions |
| `Settings` | Site-wide configuration key-value store |
| `AuditLog` | Admin action audit trail |
| `AccountDeletionRequest` | Customer account deletion request + review workflow |

---

## Getting Started

### Prerequisites
- Node.js >= 18
- MongoDB (local or [Atlas](https://www.mongodb.com/atlas))
- Cloudinary account — [Sign up free](https://cloudinary.com)
- Razorpay account — [Test keys](https://razorpay.com) work fine
- Gmail account with an [App Password](https://myaccount.google.com/apppasswords) for SMTP

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/shopease.git
cd ShopEase
```

### 2. Setup the Server

```bash
cd server
npm install
# Create .env from the template below and fill in your values
npm run dev            # starts on http://localhost:5000
```

### 3. Setup the Client

```bash
cd client
npm install
# Create .env from the template below and fill in your values
npm run dev            # starts on http://localhost:3000
```

### 4. Open in browser

- **Customer storefront:** http://localhost:3000
- **Admin panel:** http://localhost:3000/admin
- **API health check:** http://localhost:5000

---

## Environment Variables

### Server (`server/.env`)

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGO_URI=mongodb://localhost:27017/shopease
MONGO_URI_ATLAS=mongodb+srv://<user>:<pass>@cluster.mongodb.net/shopease

# JWT
SECRETKEY=your_jwt_secret_key_here
JWT_EXPIRE=365d
REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRE=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Nodemailer (Gmail SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=your_16_char_app_password
SMTP_FROM=noreply@shopease.com

# Razorpay
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# App URLs
CLIENT_URL=http://localhost:3000
ADMIN_URL=http://localhost:3001
```

### Client (`client/.env`)

```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
VITE_IMG_URL=http://localhost:5000
VITE_APP_NAME=ShopEase
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
```

---

## Seed Data

The server includes seeders for all 11 product categories and core system data.

```bash
# Seed everything at once (users, roles, categories, brands + all products)
cd server
npm run seed:all

# Or seed individually
npm run seed           # core data (users, roles, categories, brands)
npm run seed:fashion
npm run seed:electronics
npm run seed:mobiles
npm run seed:home
npm run seed:appliances
npm run seed:beauty
npm run seed:sports
npm run seed:books
npm run seed:toys
npm run seed:grocery
npm run seed:automotive
```

After running `npm run seed`, the following default accounts are created:

| Role | Email | Password |
|---|---|---|
| Super Admin | superadmin@shopease.com | `Admin@123` |
| Admin | admin@shopease.com | `Admin@123` |
| Employee | employee@shopease.com | `Admin@123` |

---

## API Overview

All endpoints are prefixed with `/api/v1`. Protected routes require a `Bearer` JWT token in the `Authorization` header (set automatically by the Axios interceptor via cookie).

### Auth — Common
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/common/auth/admin-login` | Admin / Employee login |
| POST | `/common/auth/login` | Customer login |
| POST | `/common/auth/register` | Customer registration |
| POST | `/common/auth/forgot-password` | Send OTP to email |
| POST | `/common/auth/reset-password` | Reset password with OTP |
| POST | `/common/auth/change-password` | Change password (authenticated) |
| GET  | `/common/auth/admin-details` | Get logged-in admin/employee profile |
| POST | `/common/auth/verify-token` | Verify customer session token |

### Admin Routes _(JWT required — super\_admin / admin / employee)_
| Prefix | Description |
|--------|-------------|
| `/admin/dashboard` | Stats, revenue, recent orders, charts |
| `/admin/product-management` | Product CRUD, image uploads, inventory |
| `/admin/order-management` | List, update status, assign, download invoice |
| `/admin/user-management/customers` | Customer list, profile, block/unblock |
| `/admin/user-management/employees` | Employee CRUD, role assignment |
| `/admin/user-management/admin-users` | Admin user management (super\_admin) |
| `/admin/masters/categories` | Category CRUD |
| `/admin/masters/brands` | Brand CRUD |
| `/admin/coupon-management` | Coupon CRUD, usage tracking |
| `/admin/gift-card-management` | Gift card issuance and management |
| `/admin/review-management` | Review approval, hiding, deletion |
| `/admin/cms/banners` | Homepage banner CRUD |
| `/admin/support/tickets` | Support ticket listing, reply, status update |
| `/admin/support/messages` | Contact message listing and response |
| `/admin/account-deletion` | Deletion request review + approval workflow |
| `/admin/notifications` | Send and manage notifications |
| `/admin/reports` | Sales, revenue, order analytics |
| `/admin/roles` | Role and permission management |
| `/admin/settings` | Site-wide settings CRUD |
| `/admin/audit-logs` | Admin action audit trail (super\_admin) |

### Customer Routes _(JWT required)_
| Prefix | Description |
|--------|-------------|
| `/customer/cart` | Cart CRUD, saved-for-later |
| `/customer/wishlist` | Wishlist add/remove/list |
| `/customer/orders` | Place order, list orders, track, cancel, return |
| `/customer/payment/razorpay` | Create Razorpay order, verify payment |
| `/customer/address` | Address book CRUD |
| `/customer/profile` | Profile view and update, avatar upload |
| `/customer/support/tickets` | Raise ticket, reply, list tickets |
| `/customer/notifications` | List, mark read, unread count |
| `/customer/reviews` | Submit and manage product reviews |
| `/customer/giftcard` | Check balance, redeem gift cards |
| `/customer/account-deletion` | Submit and track deletion requests |

### Public Routes _(No auth required)_
| Prefix | Description |
|--------|-------------|
| `/public/products` | Browse products, categories, search, filter |
| `/public/banners` | Homepage banners |
| `/public/settings` | Public site settings (name, logo, contact info) |
| `/public/contact` | Submit contact form |

### Webhook
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/webhook/razorpay` | Razorpay `payment.captured` / `payment.failed` events |

---

## Role-Based Access Control

ShopEase implements three admin roles decoded directly from JWT tokens. Every protected route validates both token validity and role at the middleware level.

| Feature | Super Admin | Admin | Employee |
|---------|:-----------:|:-----:|:--------:|
| All product & order management | ✅ | ✅ | ✅ (view/update) |
| Dashboard & reports | ✅ | ✅ | Limited |
| Customer management | ✅ | ✅ | View only |
| Employee management | ✅ | ✅ | ❌ |
| CMS, coupons, gift cards | ✅ | ✅ | ❌ |
| Reply to support tickets | ✅ | ✅ | ✅ (assigned) |
| Close / delete tickets | ✅ | ✅ | ❌ |
| Review deletion requests | ✅ | ✅ | ✅ |
| Approve / reject deletion | ✅ | ✅ | ❌ |
| Force-delete accounts | ✅ | ❌ | ❌ |
| Roles & permissions | ✅ | ❌ | ❌ |
| Audit logs, security, backup | ✅ | ❌ | ❌ |
| Site settings | ✅ | ✅ | ❌ |
| View public store | ✅ | ✅ | ✅ |

**Client-side guard (`AdminRoute`):** Checks cookie validity + Redux `isLogin` + `role_slug` on every render. An expired or customer token is rejected before any admin page loads.

**Store browsing:** Employees and admins can visit the public storefront (`/`) from the sidebar "View Store" button. Their profile appears in the public header with role badge and a "Back to Dashboard" option instead of customer account links.

---

## Key Modules

### Aria — AI Chatbot Assistant
The floating chatbot (`ChatBotWidget.jsx`) provides 24/7 customer support:

- **3D animated avatar** — SVG-rendered professional girl character with speaking/idle states, glow rings, and floating FAB animation
- **Smart NLP** — Pattern-matched intent detection for orders, tracking, returns, payments, account, coupons, tickets, and more
- **Sentiment detection** — Detects frustrated/urgent keywords and auto-escalates to priority support
- **Live data integration** — Pulls real order data, profile info, addresses, cart summary, and support tickets from Redux + API
- **Ticket form validation** — Category required, min 10-char subject, min 20-char / 5-word description, spam pattern detection
- **Session persistence** — Last 50 messages saved to `localStorage`, restored on page reload
- **Feedback system** — Users can rate each conversation (👍 Helpful / 😐 Okay / 👎 Not Helpful)
- **Race-condition safe** — Generation counter (`genRef`) ensures only the latest `botSay()` call commits state; stale async API callbacks bail out automatically

### Payment Flow (Razorpay)
1. Customer places order → `POST /customer/payment/razorpay/create-order` creates a Razorpay order
2. Frontend opens the Razorpay checkout modal
3. On success → `POST /customer/payment/razorpay/verify` validates HMAC-SHA256 signature
4. Webhook at `/webhook/razorpay` handles async `payment.captured` / `payment.failed` events (raw body preserved before `express.json()`)
5. Invoice PDF generated via Puppeteer and emailed via Nodemailer

### Auth — Token Strategy
- **Admin/Employee:** `shopease_admin_token` cookie — JWT with `role_slug` and `permissions` payload. Validated client-side on every route render; server-side on every API call.
- **Customer:** `shopease_customer_token` cookie — JWT with customer ID.
- **Proactive expiry watcher (`useTokenExpiry`):** Fires a warning toast 60 seconds before expiry; dispatches logout the instant the token expires without waiting for a server 401.
- **Axios interceptors:** Attach correct token per URL prefix (`/admin/`, `/customer/`, `/common/auth/admin`). On 401, clear token and reset Redux state; redirect to `/login` only when inside `/admin/`.

### Support Ticket Workflow
1. Customer raises ticket → `POST /customer/support/tickets`
2. Auto-generates ticket number (`TKT-XXXXX`) via Mongoose `pre("validate")` hook
3. Admin/Employee replies → conversation thread stored in `replies[]` array on the ticket document
4. Status transitions: `open → in_progress → waiting_customer → resolved → closed`
5. Employees can only view and reply to assigned tickets; cannot close or delete

### Account Deletion Workflow
1. Customer submits deletion request → `POST /customer/account-deletion`
2. Employee reviews request, runs through checklist, forwards to admin → `PATCH .../review`
3. Admin approves (account deactivated) or rejects with reason → `PATCH .../decide`
4. Customer notified by email at each stage

### Real-Time (Socket.IO)
- Server exposes `io` via `app.set("io", io)` — controllers emit events directly
- Customers join a personal room (`user_<id>`) on connection
- Events: `order_status_update`, `new_notification`, `ticket_reply`
- Admin dashboard subscribes to aggregate events for live counter updates

---

## Author

**Profcyma**

Built with the MERN stack. Contributions and feedback welcome.
