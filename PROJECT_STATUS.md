# ShopEase — Complete Project Status
> Last Updated: July 14, 2026 | Deep-verified from actual source files

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite, Redux Toolkit, React Router v6, Tailwind CSS |
| Backend | Node.js + Express.js, MongoDB + Mongoose |
| Auth | JWT via cookies (`shopease_admin_token`, `shopease_customer_token`) |
| Payments | Razorpay + COD |
| Real-time | Socket.IO |
| File Upload | express-fileupload |

---

## ✅ BUGS FIXED (This Session)

### Bug 1 — Double BaseURL → Auto-logout after login
**Root Cause:** `axiosClient` already has `VITE_API_BASE_URL` as `baseURL`. But both
`Methods.js` and `customerAuthSlice.js` were also manually prepending `BASE + url`, producing:
`http://localhost:5000/api/v1/http://localhost:5000/api/v1/customer/profile`
Server returned error → interceptor deleted cookie → auto-logout.

**Files Fixed:**
- `client/src/utils/Methods.js` — removed `const BASE` and all `BASE + url` occurrences
- `client/src/features/public/customerAuthSlice.js` — `verifyCustomerToken` now uses `APIS.Customer.Profile` (relative)

### Bug 2 — Public pages redirect to /login on load
**Root Cause:** `PublicLayout` called `fetchSettings()` which hits `/admin/settings`.
Without admin token → server returns 401 → axios interceptor fired `window.location.href = "/login"`.
This happened on EVERY public page load, even Home.

**Files Fixed:**
- `server/routes/api/v1/public/index.js` — added `GET /public/settings` (no auth)
- `client/src/utils/APIS.js` — added `Public.Settings = "/public/settings"`
- `client/src/features/settings/settingsSlice.js` — added `fetchPublicSettings` thunk
- `client/src/layouts/PublicLayout.jsx` — now calls `fetchPublicSettings()` instead of `fetchSettings()`
- `client/src/utils/ApiInstance.js` — admin 401 now only redirects when `pathname.startsWith("/admin")`


---

## 📁 File Structure (Actual — Verified)

```
client/src/
├── pages/
│   ├── auth/          Login.jsx, Register.jsx
│   ├── public/        59 files (see full list below)
│   ├── dashboard/     Dashboard.jsx + dashboards/ (Admin/Employee/SuperAdmin)
│   ├── masters/       Categories.jsx, Brands.jsx
│   ├── products/      Products.jsx, ProductForm.jsx, Inventory.jsx
│   ├── orders/        Orders.jsx, OrderDetail.jsx
│   ├── users/         Customers.jsx, Employees.jsx, AdminUsers.jsx
│   ├── coupons/       Coupons.jsx
│   ├── reviews/       Reviews.jsx
│   ├── cms/           Banners.jsx, FAQs.jsx
│   ├── reports/       Reports.jsx
│   ├── roles/         Roles.jsx
│   ├── settings/      Settings.jsx
│   ├── system/        AuditLogs.jsx, Security.jsx, Backup.jsx
│   ├── support/       SupportTickets.jsx, ContactMessages.jsx
│   ├── profile/       MyProfile.jsx (admin)
│   └── Page404.jsx
├── features/
│   ├── auth/          authSlice.js
│   ├── cms/           bannerSlice.js
│   ├── coupons/       couponSlice.js
│   ├── dashboard/     dashboardSlice.js
│   ├── masters/       categorySlice.js, brandSlice.js
│   ├── notifications/ notificationSlice.js (admin)
│   ├── orders/        orderSlice.js (admin)
│   ├── products/      productSlice.js (admin)
│   ├── reviews/       reviewSlice.js (admin)
│   ├── roles/         roleSlice.js
│   ├── settings/      settingsSlice.js ← FIXED: added fetchPublicSettings
│   ├── support/       supportSlice.js
│   ├── users/         customerSlice.js, employeeSlice.js, adminUsersSlice.js
│   └── public/        customerAuthSlice.js, publicCartSlice.js,
│                      publicWishlistSlice.js, publicProductSlice.js,
│                      publicOrderSlice.js, publicAddressSlice.js,
│                      publicProfileSlice.js, publicNotificationSlice.js,
│                      publicPaymentSlice.js
├── layouts/           AdminLayout.jsx, PublicLayout.jsx ← FIXED
├── utils/             ApiInstance.js ← FIXED, Methods.js ← FIXED, APIS.js ← FIXED
└── hooks/             useSettings.js
```


---

## 🌐 PUBLIC STOREFRONT — Page-by-Page Status

### Auth Pages (`/pages/auth/`)
| Page | Route | Status | Notes |
|---|---|---|---|
| Login | `/login` | ✅ Complete | Admin + Customer unified login |
| Register | `/register` | ✅ Complete | Customer registration with validation |
| ForgotPassword | `/forgot-password` | ❌ MISSING | Link in Login.jsx → no page file, no route |
| ResetPassword | `/reset-password` | ❌ MISSING | APIS.Auth.ResetPassword exists but no page |

### Core Public Pages
| Page | Route | File Status | Functionality |
|---|---|---|---|
| Home | `/` `/home` | ✅ Exists | Hero slider, categories, trending, deal of the day, feature strip — fully implemented |
| All Categories | `/categories` | ✅ Exists | Lists all categories |
| More | `/more` | ✅ Exists | Extended category listing |
| Products | `/products` | ✅ Exists — NOT IN ROUTES | `Products.jsx` exists in public/ but has NO route in routes.public.jsx |
| Product Detail | `/product/:slug` | ✅ Exists | Dynamic, used by all categories |

### Category Pages (all ✅ exist and routed)
Fashion, Electronics, Mobiles, Home & Kitchen, Appliances, Beauty, Sports, Books, Toys, Grocery, Automotive
— All 11 category pages + 11 legacy product-detail redirect pages exist and are routed.

### Shopping Pages
| Page | Route | Status | Notes |
|---|---|---|---|
| Wishlist | `/wishlist` | ✅ Complete | localStorage-based (no server sync — see issues) |
| Cart | `/cart` | ✅ Complete | localStorage-based with guest→user merge on login |
| Checkout | `/checkout` | ✅ Complete (Protected) | Razorpay + COD, address selection, coupon apply |

### Customer Account Pages (all Protected)
| Page | Route | Status | Notes |
|---|---|---|---|
| My Account | `/account` | ✅ Complete | Dashboard with order/address/coupon overview |
| My Profile | `/my-profile` | ✅ Complete | Update name, photo via PUT /customer/profile |
| My Orders | `/my-orders` | ✅ Complete | List with status filters, cancel/return |
| Order Detail | `/my-orders/:id` | ✅ Complete | Full order timeline, invoice download |
| My Addresses | `/my-addresses` | ✅ Complete | CRUD with set-default |
| My Coupons | `/my-coupons` | ✅ Complete | Fetches via GET /customer/coupons (direct, not Redux) |
| Notifications | `/notifications` | ✅ Complete | Mark read, mark all read |
| My Settings | `/my-settings` | ✅ Complete | Password change, account preferences |
| My Reviews | `/my-reviews` | ✅ Complete | View/edit/delete own reviews |
| Order Success | `/order-success/:id` | ✅ Complete | Post-checkout confirmation |
| Track Order | `/track-order` | ⚠️ Partial | Page complete + Redux `trackOrder` thunk exists. BUT: `APIS.Customer.TrackOrder` → `/customer/orders/track/:order_number` requires login. Unauthenticated tracking NOT supported — page redirects unauth users to /login. |


### Info / Static Pages (all ✅ exist and routed)
| Page | Route | Status |
|---|---|---|
| Help Center | `/help-center` | ✅ Static UI |
| Contact Us | `/contact-us` | ⚠️ Frontend form is LOCAL only — `submit()` calls `setSubmit(true)`, NO API call to backend. ContactMessage model exists on server but no `POST /public/contact` endpoint. |
| About Us | `/about-us` | ✅ Static |
| Returns | `/returns` | ✅ Static |
| Shipping Policy | `/shipping-policy` | ✅ Static |
| Cancellation Policy | `/cancellation-policy` | ✅ Static |
| Careers | `/careers` | ✅ Static |
| Press & Media | `/press-media` | ✅ Static |
| Become Seller | `/become-seller` | ✅ Static |
| Affiliate | `/affiliate` | ✅ Static |
| Terms & Conditions | `/terms-conditions` | ✅ Static |
| Privacy Policy | `/privacy-policy` | ✅ Static |
| Gift Cards | `/gift-cards` | ✅ Static |
| Bulk Orders | `/bulk-orders` | ✅ Static |
| Store Locator | `/store-locator` | ✅ Static |
| Sitemap | `/sitemap` | ✅ Static |

---

## 🛠️ ADMIN PANEL — Page-by-Page Status

### Admin Routes (`routes.jsx`) — all confirmed file-verified
| Page | Admin Route | File | Status |
|---|---|---|---|
| Dashboard | `/admin/dashboard` | `dashboard/Dashboard.jsx` | ✅ Complete — 3 role-based dashboards (SuperAdmin, Admin, Employee) |
| Categories | `/admin/masters/categories` | `masters/Categories.jsx` | ✅ Complete — CRUD |
| Brands | `/admin/masters/brands` | `masters/Brands.jsx` | ✅ Complete — CRUD |
| Products | `/admin/products` | `products/Products.jsx` | ✅ Complete — list, filter, search |
| Product Form | `/admin/products/create` + `/edit/:id` | `products/ProductForm.jsx` | ✅ Complete — create + edit |
| Inventory | `/admin/inventory` | `products/Inventory.jsx` | ✅ Complete — stock management |
| Orders | `/admin/orders` | `orders/Orders.jsx` | ✅ Complete |
| Order Detail | `/admin/orders/:id` | `orders/OrderDetail.jsx` | ✅ Complete |
| Customers | `/admin/customers` | `users/Customers.jsx` | ✅ Complete |
| Employees | `/admin/employees` | `users/Employees.jsx` | ✅ Complete |
| Admin Users | `/admin/admin-users` | `users/AdminUsers.jsx` | ✅ Complete |
| Coupons | `/admin/coupons` | `coupons/Coupons.jsx` | ✅ Complete — CRUD |
| Reviews | `/admin/reviews` | `reviews/Reviews.jsx` | ✅ Complete — approve/reject/reply |
| Banners | `/admin/cms/banners` | `cms/Banners.jsx` | ✅ Complete — CRUD with image upload |
| FAQs | `/admin/cms/faqs` | `cms/FAQs.jsx` | ✅ Complete — CRUD (no Redux slice, uses direct fetch) |
| Reports | `/admin/reports` | `reports/Reports.jsx` | ✅ Complete — sales/revenue/top-products/customers |
| Roles | `/admin/roles` | `roles/Roles.jsx` | ✅ Complete — RBAC roles + permissions |
| Settings | `/admin/settings` | `settings/Settings.jsx` | ✅ Complete — site-wide settings |
| Audit Logs | `/admin/audit-logs` | `system/AuditLogs.jsx` | ✅ Complete — filterable, paginated |
| Security | `/admin/security` | `system/Security.jsx` | ⚠️ Page exists — likely stub (no Redux slice, no dedicated controller) |
| Backup | `/admin/backup` | `system/Backup.jsx` | ⚠️ Page exists — likely stub (no Redux slice, no dedicated controller) |
| Support Tickets | `/admin/support` | `support/SupportTickets.jsx` | ✅ Complete — full ticket management |
| Contact Messages | `/admin/messages` | `support/ContactMessages.jsx` | ✅ Complete — read/reply/archive |
| Admin Profile | `/admin/profile` | `profile/MyProfile.jsx` | ✅ Complete |
| **Notifications** | `/admin/notifications` | **❌ MISSING** | Server route fully implemented. Frontend page does NOT exist. Not in `routes.jsx`. |


---

## 🗄️ SERVER API — Endpoint-by-Endpoint Status

### Common Auth (`/api/v1/common/auth/`)
| Method | Endpoint | Controller | Status |
|---|---|---|---|
| POST | `/admin-login` | auth.controller | ✅ Implemented |
| GET | `/admin-details` | auth.controller | ✅ Implemented |
| POST | `/register` | auth.controller | ✅ Implemented |
| POST | `/verify-email` | auth.controller | ✅ Implemented |
| POST | `/login` | auth.controller | ✅ Implemented |
| POST | `/forgot-password` | auth.controller | ✅ Server route exists — frontend page missing |
| POST | `/reset-password` | auth.controller | ✅ Server route exists — frontend page missing |
| POST | `/change-password` | auth.controller | ✅ Implemented |

### Public API (`/api/v1/public/`) — No auth required
| Method | Endpoint | Status |
|---|---|---|
| GET | `/home` | ✅ Implemented — banners, featured, bestsellers, flash sale |
| GET | `/products` | ✅ Implemented — filter, search, pagination |
| GET | `/products/:slug` | ✅ Implemented — product + related |
| GET | `/categories` | ✅ Implemented |
| GET | `/faqs` | ✅ Implemented |
| GET | `/settings` | ✅ Implemented (ADDED THIS SESSION) |
| POST | `/contact` | ❌ MISSING — ContactUs.jsx form does NOT submit to backend |
| GET | `/brands` | ❌ MISSING — route not in public/index.js (APIS.Public.Brands defined but endpoint missing) |

### Customer API (`/api/v1/customer/`) — All require CustomerMiddleware
| Group | Methods | Endpoints | Status |
|---|---|---|---|
| Profile | GET, PUT | `/profile` | ✅ Implemented |
| Cart | GET, POST, PUT, DELETE, PATCH | `/cart`, `/cart/add`, `/cart/update`, `/cart/item/:id`, `/cart/clear`, `/cart/apply-coupon`, `/cart/remove-coupon`, `/cart/save-later/:id` | ✅ Full server implementation exists — BUT client cart is localStorage-only (not synced with server!) |
| Wishlist | GET, POST, DELETE, POST | `/wishlist`, `/wishlist/toggle`, `/wishlist/:id`, `/wishlist/:id/move-to-cart` | ✅ Full server implementation — BUT client wishlist is localStorage-only (not synced!) |
| Orders | POST, GET, GET, POST, POST | `/orders/place`, `/orders`, `/orders/:id`, `/orders/:id/cancel`, `/orders/:id/return` | ✅ Implemented |
| Track Order | GET | `/orders/track/:order_number` | ✅ Implemented — requires login (no public tracking) |
| Address | GET, POST, PUT, PATCH, DELETE | `/address`, `/address`, `/address/:id`, `/address/:id/default`, `/address/:id` | ✅ Full inline implementation |
| Reviews | GET, GET, POST, PUT, DELETE, PATCH | `/reviews/product/:id`, `/reviews/my`, `/reviews`, `/reviews/:id`, `/reviews/:id`, `/reviews/:id/helpful` | ✅ Implemented |
| Notifications | GET, PATCH, PATCH | `/notifications`, `/notifications/:id/read`, `/notifications/read-all` | ✅ Implemented |
| Coupons | GET | `/coupons` | ✅ Implemented inline |
| Payment | POST, POST, POST, POST, GET | `/payment/validate-checkout`, `/payment/razorpay/create-order`, `/payment/razorpay/verify`, `/payment/cod/place-order`, `/payment/invoice/:id` | ✅ Full Razorpay + COD + Invoice |

### Admin API (`/api/v1/admin/`) — All require AuthMiddleware
| Group | Endpoints | Controller | Status |
|---|---|---|---|
| Dashboard | `/dashboard` | dashboard.controller.js | ✅ Dedicated controller |
| Masters | `/masters/category`, `/masters/brand` | category/brand controllers | ✅ Dedicated controllers |
| Product Mgmt | `/product-management` | product.controller.js | ✅ Dedicated controller |
| Order Mgmt | `/order-management` | order.controller.js | ✅ Dedicated controller |
| User Mgmt | `/user-management` | user.controller.js | ✅ Dedicated controller |
| Coupon Mgmt | `/coupon-management` | coupon.controller.js | ✅ Dedicated controller |
| Review Mgmt | `/review-management` | — (inline in route) | ✅ Inline implementation |
| CMS | `/cms/banners`, `/cms/faqs` | — (inline in route) | ✅ Inline implementation |
| Settings | `/settings` | — (inline in route) | ✅ Inline implementation |
| Reports | `/reports/sales`, `/revenue`, `/top-products`, `/customers` | — (inline) | ✅ Inline with aggregation |
| Roles | `/roles`, `/roles/permissions` | — (inline) | ✅ Inline implementation |
| Audit Logs | `/audit-logs`, `/:id`, `/clear` | — (inline) | ✅ Inline implementation |
| Support | `/support/tickets/*`, `/support/messages/*` | — (inline) | ✅ Full tickets + messages |
| Notifications | `/notifications`, `/mark-all-read`, `/:id/read` | — (inline) | ✅ Implemented — but frontend page missing |


---

## 🗃️ Redux Slices — Complete Status

### Admin Slices (all in store.js, all files exist)
| Slice File | Store Key | Status |
|---|---|---|
| `auth/authSlice.js` | `auth` | ✅ |
| `dashboard/dashboardSlice.js` | `dashboard` | ✅ |
| `masters/categorySlice.js` | `category` | ✅ |
| `masters/brandSlice.js` | `brand` | ✅ |
| `products/productSlice.js` | `product` | ✅ |
| `orders/orderSlice.js` | `order` | ✅ |
| `users/customerSlice.js` | `customer` | ✅ |
| `users/employeeSlice.js` | `employee` | ✅ |
| `users/adminUsersSlice.js` | `adminUsers` | ✅ |
| `coupons/couponSlice.js` | `coupon` | ✅ |
| `reviews/reviewSlice.js` | `review` | ✅ |
| `roles/roleSlice.js` | `role` | ✅ |
| `settings/settingsSlice.js` | `settings` | ✅ FIXED: added `fetchPublicSettings` |
| `cms/bannerSlice.js` | `banner` | ✅ |
| `support/supportSlice.js` | `support` | ✅ |
| `notifications/notificationSlice.js` | `notifications` (admin) | ✅ |

### Public/Customer Slices (all in store.js, all files exist)
| Slice File | Store Key | Status |
|---|---|---|
| `public/customerAuthSlice.js` | `customerAuth` | ✅ FIXED: relative URL |
| `public/publicCartSlice.js` | `publicCart` | ⚠️ localStorage ONLY — not synced with server `/customer/cart` |
| `public/publicWishlistSlice.js` | `publicWishlist` | ⚠️ localStorage ONLY — not synced with server `/customer/wishlist` |
| `public/publicProductSlice.js` | `publicProduct` | ✅ |
| `public/publicOrderSlice.js` | `publicOrder` | ✅ includes trackOrder thunk |
| `public/publicAddressSlice.js` | `publicAddress` | ✅ |
| `public/publicProfileSlice.js` | `publicProfile` | ✅ |
| `public/publicNotificationSlice.js` | `publicNotification` | ✅ |
| `public/publicPaymentSlice.js` | `publicPayment` | ✅ Razorpay + COD |

---

## 🗄️ Server Models (21 total — all present)

| Model | Used In | Status |
|---|---|---|
| User.js | Auth, Profile, Admin users | ✅ |
| Product.js | Products, Orders, Cart | ✅ |
| Category.js | Categories, Products | ✅ |
| Brand.js | Brands, Products | ✅ |
| Order.js | Orders, Payment, Tracking | ✅ |
| Cart.js | Customer cart (server) | ✅ — Server routes exist but client doesn't sync |
| Wishlist.js | Customer wishlist (server) | ✅ — Server routes exist but client doesn't sync |
| Coupon.js | Admin coupons, Customer coupons | ✅ |
| Review.js | Admin reviews, Customer reviews | ✅ |
| Address.js | Customer addresses | ✅ |
| Payment.js | Razorpay/COD orders | ✅ |
| Invoice.js | Order invoices | ✅ — Model + GET endpoint exists |
| Banner.js | CMS banners | ✅ |
| FAQ.js | CMS FAQs | ✅ |
| Settings.js | Site settings | ✅ |
| Notification.js | Admin + Customer notifications | ✅ |
| SupportTicket.js | Support tickets | ✅ |
| ContactMessage.js | Contact Us form | ✅ Model + admin view exists — public POST endpoint missing |
| AuditLog.js | Admin audit logs | ✅ |
| Role.js | RBAC | ✅ |
| Permission.js | RBAC permissions | ✅ |


---

## ⚠️ ALL KNOWN PROBLEMS & ISSUES

### 🔴 CRITICAL — Broken / Non-functional

| # | Problem | Location | Impact |
|---|---|---|---|
| 1 | **Auto-logout after login** | `Methods.js`, `customerAuthSlice.js` | 🟢 **FIXED THIS SESSION** |
| 2 | **Public pages redirect to /login** | `PublicLayout.jsx` calling `/admin/settings` | 🟢 **FIXED THIS SESSION** |
| 3 | **Forgot Password page missing** | — | Clicking "Forgot Password?" in Login.jsx goes to `/forgot-password` which has NO page, NO route → React 404 |
| 4 | **Reset Password page missing** | — | Password reset flow is dead even though server endpoints exist (`POST /common/auth/forgot-password`, `POST /common/auth/reset-password`) |

### 🟡 MEDIUM — Feature Incomplete / Data Loss Risk

| # | Problem | Location | Impact |
|---|---|---|---|
| 5 | **Cart NOT synced with server** | `publicCartSlice.js` | Cart lives only in localStorage. Full cart API exists on server (`/customer/cart/*`) but client never calls it. Cart lost if user clears browser storage. No cross-device cart. |
| 6 | **Wishlist NOT synced with server** | `publicWishlistSlice.js` | Same as cart. Server wishlist routes exist (`/customer/wishlist/*`) but client uses only localStorage. |
| 7 | **ContactUs form does nothing** | `ContactUs.jsx` | `submit()` sets local state to `true` only. NO API call. Messages never reach server even though `ContactMessage` model and admin view exist. |
| 8 | **`/public/brands` endpoint missing** | `server/routes/api/v1/public/index.js` | `APIS.Public.Brands = "/public/brands"` is defined in APIS.js and `fetchPublicBrands` thunk calls it, but server has no such route. Will cause 404. |
| 9 | **Admin Notifications page missing** | `routes.jsx` | Server has full `/admin/notifications` implementation (new orders, low stock alerts, stored notifications, mark-all-read). Frontend page file and route entry both missing. |
| 10 | **Track Order requires login** | `TrackOrder.jsx` | Page shows login prompt for unauthenticated users. Server endpoint also requires CustomerMiddleware. If guest order tracking is desired, a public endpoint is needed. |

### 🟢 LOW — Cleanup / Consistency

| # | Problem | Location | Fix |
|---|---|---|---|
| 11 | **`MyNotifications.jsx` orphaned** | `src/pages/public/MyNotifications.jsx` | This file exists, is fully implemented, but is NOT in `routes.public.jsx`. The route uses `Notifications.jsx` instead. Either replace `Notifications.jsx` with this or delete `MyNotifications.jsx`. |
| 12 | **`Products.jsx` orphaned** | `src/pages/public/Products.jsx` | File exists but has NO route in `routes.public.jsx`. The `/products` URL is unrouted from public nav. |
| 13 | **`guard` helper unused** | `routes.public.jsx` line ~85 | `const guard = (Component) => ...` is defined but never used. All protected routes use the `protected: true` pattern instead. Dead code. |
| 14 | **MyCoupons bypasses Redux** | `MyCoupons.jsx` | Uses direct `GET()` call instead of a Redux slice. Works fine but inconsistent with the rest of the pattern. |
| 15 | **Security.jsx likely stub** | `pages/system/Security.jsx` | Page exists, no dedicated controller or Redux slice. Probably shows placeholder UI. |
| 16 | **Backup.jsx likely stub** | `pages/system/Backup.jsx` | Same as Security — no backend implementation. |
| 17 | **No shared hooks** | `client/src/hooks/` | Only `useSettings.js` exists. No `useDebounce`, `usePagination`, `useAuth` hooks. |
| 18 | **Admin Notifications Redux missing** | — | `notificationSlice.js` exists for admin but may not handle the new smart-notification format from the admin notifications route. |


---

## 📋 REMAINING IMPLEMENTATION CHECKLIST

### 🔴 HIGH PRIORITY (Blocking features)

- [ ] **ForgotPassword.jsx** — Create page at `pages/auth/ForgotPassword.jsx`
  - Form: email input → calls `POST /common/auth/forgot-password`
  - Add route in `App.jsx`: `<Route path="/forgot-password" element={<ForgotPassword />} />`

- [ ] **ResetPassword.jsx** — Create page at `pages/auth/ResetPassword.jsx`
  - Reads `?token=` from URL → calls `POST /common/auth/reset-password`
  - Add route in `App.jsx`: `<Route path="/reset-password" element={<ResetPassword />} />`

- [ ] **ContactUs form → wire to backend**
  - Add `POST /api/v1/public/contact` server endpoint → saves to `ContactMessage` model
  - Update `ContactUs.jsx` → replace `setSubmit(true)` with actual `POST()` API call

- [ ] **`/public/brands` server endpoint**
  - Add `GET /api/v1/public/brands` in `server/routes/api/v1/public/index.js`
  - Without this, `fetchPublicBrands` thunk in `publicProductSlice` will always 404

### 🟡 MEDIUM PRIORITY (Important UX)

- [ ] **Admin Notifications page**
  - Create `pages/notifications/Notifications.jsx` (admin) with data from `GET /admin/notifications`
  - Add to `routes.jsx`: `{ path: "notifications", element: Notifications }`

- [ ] **Cart server sync** (optional but important for cross-device)
  - On login: call `GET /customer/cart` to load server cart, merge with localStorage
  - On add/remove/update: call corresponding server endpoint in addition to localStorage
  - On logout: call `DELETE /customer/cart/clear` or just leave server cart

- [ ] **Wishlist server sync** (same as cart)
  - On login: call `GET /customer/wishlist`, merge with localStorage
  - On toggle: call `POST /customer/wishlist/toggle`

- [ ] **`Products.jsx` (public)** — Either:
  - Add route `/products` in `routes.public.jsx`, OR
  - Delete the file if it's unused

- [ ] **`MyNotifications.jsx` vs `Notifications.jsx`** — Decide:
  - `MyNotifications.jsx` is more complete (uses AccountLayout + Redux). Use it as route for `/notifications`
  - Delete or merge `Notifications.jsx`

### 🟢 LOW PRIORITY (Polish)

- [ ] Remove dead code: `const guard = ...` in `routes.public.jsx`
- [ ] Add `useDebounce` hook for search inputs across the app
- [ ] Add `usePagination` hook to avoid duplicating pagination logic
- [ ] Security.jsx and Backup.jsx — implement or mark as "Coming Soon"
- [ ] Add `publicCouponSlice` for consistency with rest of Redux pattern

---

## 🔌 Environment Variables

```env
# client/.env
VITE_API_BASE_URL=http://localhost:5000/api/v1
VITE_IMG_URL=http://localhost:5000
VITE_APP_NAME=ShopEase
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id

# server/.env (expected)
PORT=5000
MONGO_URI=mongodb://...
SECRETKEY=your_jwt_secret
CLIENT_URL=http://localhost:5173
ADMIN_URL=http://localhost:5173
```

---

## 📊 Overall Completion Summary

| Area | Done | Partial | Missing |
|---|---|---|---|
| Public Storefront Pages | 54 | 2 (Contact, Track) | 2 (ForgotPwd, ResetPwd) |
| Admin Panel Pages | 24 | 2 (Security, Backup) | 1 (Notifications) |
| Server — Public API | 5 | 0 | 2 (Contact, Brands) |
| Server — Customer API | 10 | 0 | 0 |
| Server — Admin API | 15 | 0 | 0 |
| Redux Slices | 23 | 2 (Cart, Wishlist no server sync) | 0 |
| Auth Flow | Login, Register | — | ForgotPwd, ResetPwd |
| **Overall** | **~85%** | **~8%** | **~7%** | |

