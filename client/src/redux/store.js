import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import dashboardReducer from "../features/dashboard/dashboardSlice";
import categoryReducer from "../features/masters/categorySlice";
import brandReducer from "../features/masters/brandSlice";
import productReducer from "../features/products/productSlice";
import orderReducer from "../features/orders/orderSlice";
import customerReducer from "../features/users/customerSlice";
import employeeReducer from "../features/users/employeeSlice";
import adminUsersReducer from "../features/users/adminUsersSlice";
import couponReducer from "../features/coupons/couponSlice";
import reviewReducer from "../features/reviews/reviewSlice";
import roleReducer from "../features/roles/roleSlice";
import settingsReducer from "../features/settings/settingsSlice";
import bannerReducer from "../features/cms/bannerSlice";
import supportReducer from "../features/support/supportSlice";
import notificationReducer from "../features/notifications/notificationSlice";
// Public
import publicCartReducer from "../features/public/publicCartSlice";
import publicWishlistReducer from "../features/public/publicWishlistSlice";
import customerAuthReducer from "../features/public/customerAuthSlice";

export const store = configureStore({
  reducer: {
    // Admin
    auth: authReducer,
    dashboard: dashboardReducer,
    category: categoryReducer,
    brand: brandReducer,
    product: productReducer,
    order: orderReducer,
    customer: customerReducer,
    employee: employeeReducer,
    adminUsers: adminUsersReducer,
    coupon: couponReducer,
    review: reviewReducer,
    role: roleReducer,
    settings: settingsReducer,
    banner: bannerReducer,
    support: supportReducer,
    notifications: notificationReducer,
    // Public / Customer
    publicCart: publicCartReducer,
    publicWishlist: publicWishlistReducer,
    customerAuth: customerAuthReducer,
  },
});
