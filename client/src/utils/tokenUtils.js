import Cookies from "js-cookie";

const CUSTOMER_COOKIE = "shopease_customer_token";
const ADMIN_COOKIE    = "shopease_admin_token";

// ─── Decode a JWT without a library ──────────────────────────────────────────
// Returns the payload object or null if the token is malformed.
export const decodeToken = (token) => {
  if (!token || typeof token !== "string") return null;
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    // atob needs standard base64; JWT uses base64url — pad + replace chars
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded  = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
};

// ─── Check whether a decoded payload (or raw token) is expired ───────────────
// Accepts either a payload object or a raw token string.
// bufferSecs: treat tokens expiring within this many seconds as already expired.
export const isTokenExpired = (tokenOrPayload, bufferSecs = 10) => {
  const payload =
    typeof tokenOrPayload === "string"
      ? decodeToken(tokenOrPayload)
      : tokenOrPayload;

  if (!payload) return true;
  if (!payload.exp) return false; // no expiry claim — treat as valid
  return payload.exp * 1000 < Date.now() + bufferSecs * 1000;
};

// ─── Get the user _id from either token type ─────────────────────────────────
// Backend signs with { user: _id } for both admin and customer tokens.
// Falls back to common alternatives so we stay forward-compatible.
export const getUserIdFromToken = (token) => {
  const payload = decodeToken(token);
  if (!payload) return null;
  // Backend: jwt.sign({ user: user._id, ... })
  return payload.user || payload.id || payload._id || payload.sub || null;
};

// ─── Get role/user_type from token payload ───────────────────────────────────
export const getRoleFromToken = (token) => {
  const payload = decodeToken(token);
  return payload?.role || payload?.user_type || null;
};

// ─── Full validation: token exists, decodes, and is not expired ──────────────
export const isTokenValid = (token) => {
  if (!token) return false;
  const payload = decodeToken(token);
  if (!payload) return false;
  return !isTokenExpired(payload);
};

// ─── Cookie helpers ───────────────────────────────────────────────────────────
export const getCustomerToken = () => Cookies.get(CUSTOMER_COOKIE) || null;
export const getAdminToken    = () => Cookies.get(ADMIN_COOKIE)    || null;

export const clearCustomerToken = () => Cookies.remove(CUSTOMER_COOKIE);
export const clearAdminToken    = () => Cookies.remove(ADMIN_COOKIE);

export const isCustomerLoggedIn = () => isTokenValid(getCustomerToken());
export const isAdminLoggedIn    = () => isTokenValid(getAdminToken());

// ─── Return remaining seconds until expiry (0 if already expired) ────────────
export const tokenExpiresInSecs = (token) => {
  const payload = decodeToken(token);
  if (!payload?.exp) return null;
  return Math.max(0, Math.floor((payload.exp * 1000 - Date.now()) / 1000));
};
