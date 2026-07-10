import axios from "axios";
import Cookies from "js-cookie";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { Accept: "application/json" },
});

// Request interceptor - attach the correct token based on the URL
axiosClient.interceptors.request.use(
  (config) => {
    const url = config.url || "";

    // Customer routes need the customer token
    if (url.includes("/customer/")) {
      const customerToken = Cookies.get("shopease_customer_token");
      if (customerToken) {
        config.headers["Authorization"] = `Bearer ${customerToken}`;
      }
    } else {
      // Admin / common routes use the admin token
      const adminToken = Cookies.get("shopease_admin_token");
      if (adminToken) {
        config.headers["Authorization"] = `Bearer ${adminToken}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle 401
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const url = error.config?.url || "";

      if (url.includes("/customer/")) {
        // Customer session expired → clear customer token only
        Cookies.remove("shopease_customer_token");
        window.location.href = "/login";
      } else {
        // Admin session expired → clear admin token only
        Cookies.remove("shopease_admin_token");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
