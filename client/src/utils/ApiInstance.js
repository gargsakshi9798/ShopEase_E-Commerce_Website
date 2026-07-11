import axios from "axios";
import Cookies from "js-cookie";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { Accept: "application/json" },
});

// Store reference — injected after Redux store is created to avoid circular deps.
// Call injectStore(store) from main.jsx once the store is ready.
let _store = null;
export const injectStore = (store) => { _store = store; };

// Request interceptor - attach the correct token based on the URL
axiosClient.interceptors.request.use(
  (config) => {
    const url = config.url || "";

    if (url.includes("/customer/")) {
      const customerToken = Cookies.get("shopease_customer_token");
      if (customerToken) config.headers["Authorization"] = `Bearer ${customerToken}`;
    } else {
      const adminToken = Cookies.get("shopease_admin_token");
      if (adminToken) config.headers["Authorization"] = `Bearer ${adminToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle 401
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only act on true 401 Unauthorized — ignore network errors, 404s, etc.
    if (error.response?.status === 401) {
      const url = error.config?.url || "";
      const currentPath = window.location.pathname;

      if (url.includes("/customer/")) {
        // Clear customer cookie
        Cookies.remove("shopease_customer_token");

        // Reset Redux state if store is available
        if (_store) {
          _store.dispatch({ type: "customerAuth/logout/fulfilled" });
          _store.dispatch({ type: "publicCart/clearUserCart" });
          _store.dispatch({ type: "publicWishlist/clearUserWishlist" });
        }

        // _skipRedirect flag means this was a silent background verify call —
        // do NOT hard-redirect, just let the thunk handle state cleanup.
        const skipRedirect = error.config?._skipRedirect;
        if (
          !skipRedirect &&
          !currentPath.startsWith("/login") &&
          !currentPath.startsWith("/register")
        ) {
          window.location.href = "/login";
        }
      } else if (url.includes("/admin/")) {
        // Admin 401 — only redirect if we are actually inside the admin panel
        Cookies.remove("shopease_admin_token");
        if (_store) {
          _store.dispatch({ type: "auth/logout" });
        }
        if (currentPath.startsWith("/admin")) {
          window.location.href = "/login";
        }
        // If we are on a public page (e.g. PublicLayout calling /admin/settings
        // before this fix), do NOT redirect — just silently fail.
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
