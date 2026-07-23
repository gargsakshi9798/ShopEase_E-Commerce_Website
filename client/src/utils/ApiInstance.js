import axios from "axios";
import Cookies from "js-cookie";
import {
  isTokenValid,
  clearCustomerToken,
  clearAdminToken,
} from "./tokenUtils";

const CUSTOMER_COOKIE = "shopease_customer_token";
const ADMIN_COOKIE    = "shopease_admin_token";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { Accept: "application/json" },
});

// Store reference — injected after Redux store is created to avoid circular deps.
// Call injectStore(store) from main.jsx once the store is ready.
let _store = null;
export const injectStore = (store) => { _store = store; };

// ─── Helper: build a uniform TOKEN_EXPIRED rejection ─────────────────────────
// Gives every catch block both err.code === "TOKEN_EXPIRED" AND
// err.response?.data?.message so handlers don't need special-casing.
// skipResponseInterceptor: true tells the response interceptor to ignore this
// error (it was already handled in the request interceptor).
const makeExpiredError = (message, skipResponseInterceptor = false) =>
  Object.assign(new Error(message), {
    code: "TOKEN_EXPIRED",
    // Only include a fake response for non-payment paths so the response
    // interceptor can recognise the 401. For payment paths we set a flag
    // instead, so the response interceptor skips it entirely.
    ...(skipResponseInterceptor
      ? { _skipResponseInterceptor: true }
      : {
          response: {
            status: 401,
            data:   { success: false, message },
          },
        }),
  });

// URL segments where a token issue should NEVER trigger logout + redirect.
// The thunk's own error handler will show a toast and keep the user in place.
const SILENT_FAIL_SEGMENTS = ["/payment/", "/checkout"];

const isPaymentRequest = (url = "") =>
  SILENT_FAIL_SEGMENTS.some((seg) => url.includes(seg));

// ─── Request Interceptor ──────────────────────────────────────────────────────
// 1. Picks the right token based on URL prefix.
// 2. For normal routes: expired tokens are cleared, Redux is reset, and the
//    request is aborted before it fires.
// 3. For payment/checkout routes: if the token is expired the request is still
//    aborted (can't make an authed API call without a valid token), but we do NOT
//    dispatch logout or redirect — the thunk's rejectWithValue path handles it.
axiosClient.interceptors.request.use(
  (config) => {
    const url = config.url || "";
    const isPayment = isPaymentRequest(url);

    if (url.includes("/customer/")) {
      const token = Cookies.get(CUSTOMER_COOKIE);
      if (token) {
        if (isTokenValid(token)) {
          config.headers["Authorization"] = `Bearer ${token}`;
        } else {
          clearCustomerToken();
          // Only wipe Redux state + redirect on non-payment routes
          if (!isPayment && _store) {
            _store.dispatch({ type: "customerAuth/logout/fulfilled" });
            _store.dispatch({ type: "publicCart/clearUserCart" });
            _store.dispatch({ type: "publicWishlist/clearUserWishlist" });
          }
          // For payment routes: pass skipResponseInterceptor=true so the
          // response interceptor won't also try to handle this error and
          // won't dispatch logout (the thunk handles it with a user-visible toast).
          return Promise.reject(
            makeExpiredError("Session expired. Please log in again.", isPayment)
          );
        }
      }
    } else if (url.includes("/admin/") || url.includes("/common/auth/admin")) {
      const token = Cookies.get(ADMIN_COOKIE);
      if (token) {
        if (isTokenValid(token)) {
          config.headers["Authorization"] = `Bearer ${token}`;
        } else {
          clearAdminToken();
          if (_store) {
            _store.dispatch({ type: "auth/logout" });
          }
          return Promise.reject(
            makeExpiredError("Admin session expired. Please log in again.")
          );
        }
      }
    }
    // /common/ and /public/ routes need no token

    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor ─────────────────────────────────────────────────────
// Handles true server-side 401s (tampered / blacklisted token).
// - skipRedirect:true  → never redirect (used by background verify calls)
// - payment/checkout URLs → let the thunk handle toast + redirect; we only
//   clear the cookie here and do NOT dispatch Redux logout (which would flip
//   isLogin=false synchronously and cause React's <Navigate> to fire before
//   the thunk's toast can render).
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Errors already fully handled in the request interceptor (client-side
    // token expiry on payment routes) — skip all processing here.
    if (error._skipResponseInterceptor) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401) {
      const url          = error.config?.url || "";
      const skipRedirect = error.config?.skipRedirect === true;
      const currentPath  = window.location.pathname;
      const isPayment    = isPaymentRequest(url);

      if (url.includes("/customer/")) {
        clearCustomerToken();

        if (isPayment || skipRedirect) {
          // For payment/checkout routes: only clear the cookie.
          // The thunk catches the 401, sets sessionExpired:true, shows a
          // toast, dispatches logout and redirects after a short delay.
          // Dispatching logout here would flip isLogin=false in Redux
          // synchronously, causing <Navigate to="/login"> to render before
          // the toast appears and before the thunk can finish.
        } else {
          if (_store) {
            _store.dispatch({ type: "customerAuth/logout/fulfilled" });
            _store.dispatch({ type: "publicCart/clearUserCart" });
            _store.dispatch({ type: "publicWishlist/clearUserWishlist" });
          }
          if (
            !currentPath.startsWith("/login") &&
            !currentPath.startsWith("/register") &&
            !currentPath.startsWith("/checkout")
          ) {
            window.location.href = "/login";
          }
        }
      } else if (url.includes("/admin/") || url.includes("/common/auth/admin")) {
        clearAdminToken();
        if (_store) {
          _store.dispatch({ type: "auth/logout" });
        }
        // Only redirect to login if currently inside the admin panel
        if (!skipRedirect && currentPath.startsWith("/admin")) {
          window.location.href = "/login";
        }
        // If on public store (/), just clear state silently — no redirect
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
