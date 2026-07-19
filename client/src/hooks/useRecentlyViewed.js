/**
 * useRecentlyViewed
 *
 * Persists a capped list (MAX_ITEMS) of recently viewed products in
 * localStorage under the key "shopease_recently_viewed".
 *
 * Each entry shape:
 *   { _id, name, slug, thumbnail, price, mrp, brand_name, viewedAt }
 *
 * Usage — record a view (call once when a product detail loads):
 *   const { record } = useRecentlyViewed();
 *   record({ _id, name, slug, thumbnail, price, mrp, brand_name });
 *
 * Usage — read the list (e.g. on the dashboard):
 *   const { items } = useRecentlyViewed();
 */

import { useState, useCallback } from "react";

const STORAGE_KEY = "shopease_recently_viewed";
const MAX_ITEMS   = 10;

const readStorage = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
};

const useRecentlyViewed = () => {
  const [items, setItems] = useState(readStorage);

  /**
   * Record a product view.
   * Moves the item to the front if already present, then trims to MAX_ITEMS.
   */
  const record = useCallback((product) => {
    if (!product?._id) return;

    const entry = {
      _id:        product._id,
      name:       product.name       || "",
      slug:       product.slug       || "",
      thumbnail:  product.thumbnail  || product.img || "",
      price:      product.price      ?? 0,
      mrp:        product.mrp        ?? product.price ?? 0,
      brand_name: product.brand_name || product.brand || "",
      viewedAt:   new Date().toISOString(),
    };

    setItems((prev) => {
      // Remove any existing entry for this product
      const filtered = prev.filter((p) => p._id !== entry._id);
      // Push to front, cap at MAX_ITEMS
      const updated = [entry, ...filtered].slice(0, MAX_ITEMS);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch { /* storage full — ignore */ }
      return updated;
    });
  }, []);

  /** Clear the entire list */
  const clear = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setItems([]);
  }, []);

  return { items, record, clear };
};

export default useRecentlyViewed;
