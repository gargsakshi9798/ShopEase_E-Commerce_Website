/**
 * razorpay.config.js
 *
 * Single source of truth for Razorpay SDK instantiation.
 * Validates that real credentials are present before creating the instance
 * so a missing / placeholder key fails loudly at startup rather than at
 * the first payment attempt.
 *
 * Usage:
 *   const { getRazorpayInstance, RAZORPAY_KEY_ID } = require("./razorpay.config");
 *   const rzp = getRazorpayInstance(); // throws if keys are missing
 */

"use strict";

const Razorpay = require("razorpay");

// ─── Placeholder sentinels (values shipped in the sample .env) ────────────────
const PLACEHOLDERS = new Set([
  "your_razorpay_key_id",
  "your_razorpay_key_secret",
  "",
  undefined,
  null,
]);

/**
 * Returns validated key_id and key_secret from environment variables.
 * Throws a descriptive Error if either value is missing or is still a
 * placeholder — this surfaces the configuration problem immediately.
 *
 * @returns {{ keyId: string, keySecret: string }}
 */
const getValidatedKeys = () => {
  const keyId     = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (PLACEHOLDERS.has(keyId)) {
    throw new Error(
      "[RazorpayConfig] RAZORPAY_KEY_ID is not set. " +
      "Add your test/live key from https://dashboard.razorpay.com/app/keys to server/.env"
    );
  }
  if (PLACEHOLDERS.has(keySecret)) {
    throw new Error(
      "[RazorpayConfig] RAZORPAY_KEY_SECRET is not set. " +
      "Add your test/live secret from https://dashboard.razorpay.com/app/keys to server/.env"
    );
  }

  return { keyId, keySecret };
};

/**
 * Creates and returns a fresh Razorpay SDK instance.
 * Always creates a new instance so env-var hot-reloads (e.g. dotenv-vault)
 * are automatically picked up without restarting the server.
 *
 * @returns {Razorpay}
 */
const getRazorpayInstance = () => {
  const { keyId, keySecret } = getValidatedKeys();
  return new Razorpay({ key_id: keyId, key_secret: keySecret });
};

/**
 * Public key ID — safe to send to the frontend as-is.
 * Returns null when keys are not configured (used for guard checks).
 */
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || null;

/**
 * True when both environment variables are present and not placeholders.
 * Use this for health-checks or feature-flag guards.
 */
const isRazorpayConfigured = () => {
  try {
    getValidatedKeys();
    return true;
  } catch {
    return false;
  }
};

module.exports = {
  getRazorpayInstance,
  getValidatedKeys,
  isRazorpayConfigured,
  RAZORPAY_KEY_ID,
};
