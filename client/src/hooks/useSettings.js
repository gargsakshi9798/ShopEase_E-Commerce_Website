/**
 * useSettings — reads admin Settings from Redux store.
 * Returns a helper `s(key, fallback)` function.
 *
 * Usage:
 *   const { s } = useSettings();
 *   const siteName = s("site_name", "ShopEase");
 */
import { useSelector } from "react-redux";

export const useSettings = () => {
  const settings = useSelector((state) => state.settings?.data ?? {});

  /**
   * Get a settings value by key with a fallback default.
   * @param {string} key   — settings key (e.g. "site_name")
   * @param {*} fallback   — value to use when key is absent / empty
   */
  const s = (key, fallback = "") => {
    const val = settings[key];
    if (val === null || val === undefined || val === "") return fallback;
    return val;
  };

  /**
   * Parse a pipe-separated value into an array.
   * e.g. "Free Delivery|On orders above ₹499" → ["Free Delivery", "On orders above ₹499"]
   */
  const pipe = (key, fallback = []) => {
    const raw = s(key, "");
    if (!raw) return fallback;
    return raw.split("|").map((v) => v.trim());
  };

  return { s, pipe, settings };
};
