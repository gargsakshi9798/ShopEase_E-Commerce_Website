import { useNavigate, useLocation } from "react-router-dom";
import Cookies from "js-cookie";
import { showError } from "../utils/toast";

/**
 * Returns a requireLogin function.
 * Call requireLogin(callback) — if the customer is logged in it runs the
 * callback immediately; otherwise it shows a toast and redirects to /login
 * with state.from set to the current pathname so Login.jsx can bounce the
 * user back after a successful sign-in.
 *
 * Usage in any component:
 *   const requireLogin = useAuthGuard();
 *   const handleBuyNow = () => requireLogin(() => { addToCart(...); navigate("/checkout"); });
 */
const useAuthGuard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const requireLogin = (callback) => {
    const token = Cookies.get("shopease_customer_token");
    if (!token) {
      showError("Please login to continue");
      navigate("/login", { state: { from: location.pathname } });
      return;
    }
    callback();
  };

  return requireLogin;
};

export default useAuthGuard;
