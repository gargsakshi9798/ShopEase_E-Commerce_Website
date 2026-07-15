/**
 * toast.js
 *
 * Thin wrapper around react-hot-toast that enforces consistent options across
 * the entire app:
 *
 *  - Standardised durations per severity level
 *  - Optional `id` deduplication (prevents stacking identical toasts)
 *  - Convenience helpers: success, error, info, warn, loading, dismiss
 *  - toast.promise() pass-through for async operations
 *
 * Usage:
 *   import { showSuccess, showError, showInfo, showWarn,
 *            showLoading, dismissToast, toastPromise } from "../utils/toast";
 *
 *   showSuccess("Profile updated!");
 *   showError("Something went wrong");
 *   showWarn("Session expires in 1 minute. Save your work.", { id: "session-warn" });
 *   const id = showLoading("Saving…");  dismissToast(id);
 */

import toast from "react-hot-toast";

// ─── Default durations (ms) ───────────────────────────────────────────────────
const DURATION = {
  success: 3000,
  error:   4500,
  info:    3500,
  warn:    8000,
  loading: Infinity, // caller must dismiss manually
};

// ─── Success ──────────────────────────────────────────────────────────────────
export const showSuccess = (message, options = {}) =>
  toast.success(message, {
    duration: DURATION.success,
    ...options,
  });

// ─── Error ────────────────────────────────────────────────────────────────────
export const showError = (message, options = {}) =>
  toast.error(message, {
    duration: DURATION.error,
    ...options,
  });

// ─── Info (neutral, no icon override — uses default dark style) ───────────────
export const showInfo = (message, options = {}) =>
  toast(message, {
    duration: DURATION.info,
    icon: "ℹ️",
    ...options,
  });

// ─── Warning ──────────────────────────────────────────────────────────────────
export const showWarn = (message, options = {}) =>
  toast(message, {
    duration: DURATION.warn,
    icon: "⚠️",
    ...options,
  });

// ─── Loading (returns the toast id so the caller can dismiss it) ──────────────
export const showLoading = (message = "Loading…", options = {}) =>
  toast.loading(message, {
    duration: DURATION.loading,
    ...options,
  });

// ─── Dismiss (one or all) ─────────────────────────────────────────────────────
export const dismissToast = (id) => toast.dismiss(id);

// ─── Promise helper ───────────────────────────────────────────────────────────
// Wraps an async operation with loading → success/error states.
// msgs: { loading, success, error }
export const toastPromise = (promise, msgs, options = {}) =>
  toast.promise(promise, msgs, options);

// ─── Re-export bare toast for the rare cases that need full control ───────────
export default toast;
