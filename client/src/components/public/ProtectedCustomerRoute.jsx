import { Navigate, useLocation } from "react-router-dom";
import { isTokenValid, getCustomerToken } from "../../utils/tokenUtils";

/**
 * Uses shared tokenUtils — same logic as App.jsx and ApiInstance.js.
 * Expired / missing token → redirect to /login with return path.
 */
const ProtectedCustomerRoute = ({ children }) => {
  const location = useLocation();
  const token    = getCustomerToken();

  if (!isTokenValid(token)) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  return children;
};

export default ProtectedCustomerRoute;
