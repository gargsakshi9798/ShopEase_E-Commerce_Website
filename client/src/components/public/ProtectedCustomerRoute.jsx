import { Navigate, useLocation } from "react-router-dom";
import Cookies from "js-cookie";

/**
 * Wraps customer-only pages.
 * If shopease_customer_token cookie is missing → redirect to /login,
 * and after login the user is sent back to the original page.
 */
const ProtectedCustomerRoute = ({ children }) => {
  const location = useLocation();
  const token    = Cookies.get("shopease_customer_token");

  if (!token) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  return children;
};

export default ProtectedCustomerRoute;
