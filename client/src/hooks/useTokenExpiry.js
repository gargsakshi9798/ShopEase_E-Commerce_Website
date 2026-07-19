import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { showError, showWarn, dismissToast } from "../utils/toast";
import { customerLogout } from "../features/public/customerAuthSlice";
import { logout as adminLogout } from "../features/auth/authSlice";
import {
  getCustomerToken,
  getAdminToken,
  tokenExpiresInSecs,
  isTokenValid,
} from "../utils/tokenUtils";

// How many seconds before actual expiry to warn the user
const WARN_BEFORE_SECS = 60;
// Poll interval — check every 30 s (light-weight, just reads a cookie + does math)
const POLL_INTERVAL_MS = 30_000;

/**
 * useTokenExpiry
 *
 * Mounts a polling watcher that:
 *  1. Fires a toast warning 60 s before either token expires.
 *  2. Dispatches the appropriate logout action the moment a token expires,
 *     clearing Redux state and the cookie without waiting for the next API call.
 *
 * Usage — drop once inside App or a top-level layout component:
 *   useTokenExpiry();
 *
 * The hook is a no-op when no token is present, so it is safe to call
 * unconditionally regardless of auth state.
 */
const useTokenExpiry = () => {
  const dispatch = useDispatch();

  // Refs track whether we have already shown the warning for the current
  // token so we don't toast repeatedly on every poll tick.
  const warnedCustomer = useRef(false);
  const warnedAdmin    = useRef(false);

  useEffect(() => {
    const check = () => {
      // ── Customer token ──────────────────────────────────────────────────
      const customerToken = getCustomerToken();

      if (customerToken) {
        if (!isTokenValid(customerToken)) {
          // Expired mid-session — but don't interrupt an active payment flow
          const onCheckout = window.location.pathname.startsWith("/checkout");
          dismissToast("customer-expiry-warn");
          if (!onCheckout) {
            dispatch(customerLogout());
            showError("Your session has expired. Please log in again.", {
              id:       "customer-expired",
              duration: 5000,
            });
          }
          warnedCustomer.current = false; // reset for next login
        } else {
          const secsLeft = tokenExpiresInSecs(customerToken);
          if (
            secsLeft !== null &&
            secsLeft <= WARN_BEFORE_SECS &&
            !warnedCustomer.current
          ) {
            warnedCustomer.current = true;
            showWarn(
              `Your session expires in ${Math.ceil(secsLeft / 60)} minute${secsLeft > 60 ? "s" : ""}. Save your work.`,
              { id: "customer-expiry-warn" }
            );
          }
        }
      } else {
        // Token removed externally (another tab logged out, cookie cleared)
        warnedCustomer.current = false;
      }

      // ── Admin token ─────────────────────────────────────────────────────
      const adminToken = getAdminToken();

      if (adminToken) {
        if (!isTokenValid(adminToken)) {
          // Dismiss any pending warning before showing the expiry error
          dismissToast("admin-expiry-warn");
          dispatch(adminLogout());
          showError("Admin session expired. Please log in again.", {
            id:       "admin-expired",
            duration: 5000,
          });
          warnedAdmin.current = false;
        } else {
          const secsLeft = tokenExpiresInSecs(adminToken);
          if (
            secsLeft !== null &&
            secsLeft <= WARN_BEFORE_SECS &&
            !warnedAdmin.current
          ) {
            warnedAdmin.current = true;
            showWarn(
              `Admin session expires in ${Math.ceil(secsLeft / 60)} minute${secsLeft > 60 ? "s" : ""}. Please save your work.`,
              { id: "admin-expiry-warn" }
            );
          }
        }
      } else {
        warnedAdmin.current = false;
      }
    };

    // Run immediately on mount, then on every interval tick
    check();
    const id = setInterval(check, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [dispatch]);
};

export default useTokenExpiry;
