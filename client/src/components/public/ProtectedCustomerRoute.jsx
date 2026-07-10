import { Navigate, useLocation } from "react-router-dom";
import Cookies from "js-cookie";

/**
 * Checks both cookie existence AND JWT expiry.
 * Expired / missing token → redirect to /login with return path.
 */
const isTokenValid = (token) => {
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      Cookies.remove("shopease_customer_token");
      return false;
    }
    return true;
  } catch {
    return false;
  }
};

const ProtectedCustomerRoute = ({ children }) => {
  const location = useLocation();
  const token    = Cookies.get("shopease_customer_token");

  if (!isTokenValid(token)) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  return children;
};

export default ProtectedCustomerRoute;
