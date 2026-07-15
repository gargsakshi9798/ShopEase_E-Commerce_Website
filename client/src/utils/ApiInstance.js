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
const makeExpiredError = (message) =>
  Object.assign(new Error(message), {
    code: "TOKEN_EXPIRED",
    response: {
      status: 401,
      data:   { success: false, message },
    },
  });

// ─── Request Interceptor ──────────────────────────────────────────────────────
// 1. Picks the right token based on URL prefix.
// 2. Validates client-side before attaching — expired tokens are cleared and
//    the request is aborted immediately, saving a round-trip to the server.
axiosClient.interceptors.request.use(
  (config) => {
    const url = config.url || "";

    if (url.includes("/customer/")) {
      const token = Cookies.get(CUSTOMER_COOKIE);
      if (token) {
        if (isTokenValid(token)) {
          config.headers["Authorization"] = `Bearer ${token}`;
        } else {
          // Expired — evict and reject before the request fires
          clearCustomerToken();
          if (_store) {
            _store.dispatch({ type: "customerAuth/logout/fulfilled" });
            _store.dispatch({ type: "publicCart/clearUserCart" });
            _store.dispatch({ type: "publicWishlist/clearUserWishlist" });
          }
          return Promise.reject(
            makeExpiredError("Session expired. Please log in again.")
          );
        }
      }
    } else if (url.includes("/admin/")) {
      const token = Cookies.get(ADMIN_COOKIE);
      if (token) {
        if (isTokenValid(token)) {
          config.headers["Authorization"] = `Bearer ${token}`;
        } else {
          // Expired — evict and reject before the request fires
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
// skipRedirect:true on a request config lets background verify calls fail
// silently without hard-navigating the user to /login.
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const url          = error.config?.url || "";
      const skipRedirect = error.config?.skipRedirect === true;
      const currentPath  = window.location.pathname;

      if (url.includes("/customer/")) {
        clearCustomerToken();
        if (_store) {
          _store.dispatch({ type: "customerAuth/logout/fulfilled" });
          _store.dispatch({ type: "publicCart/clearUserCart" });
          _store.dispatch({ type: "publicWishlist/clearUserWishlist" });
        }
        if (
          !skipRedirect &&
          !currentPath.startsWith("/login") &&
          !currentPath.startsWith("/register")
        ) {
          window.location.href = "/login";
        }
      } else if (url.includes("/admin/")) {
        clearAdminToken();
        if (_store) {
          _store.dispatch({ type: "auth/logout" });
        }
        if (!skipRedirect && currentPath.startsWith("/admin")) {
          window.location.href = "/login";
        }
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
