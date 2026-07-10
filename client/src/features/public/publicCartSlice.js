import { createSlice } from "@reduxjs/toolkit";
import Cookies from "js-cookie";

// ── Helpers ───────────────────────────────────────────────────────────────────
// Derive a storage key: if a userId is provided, use "shopease_cart_<id>",
// otherwise fall back to the guest key "shopease_cart_guest".
const cartKey = (userId) =>
  userId ? `shopease_cart_${userId}` : "shopease_cart_guest";

const loadCart = (userId) => {
  try {
    // Try user-specific key first; fall back to legacy key on first run
    const key  = cartKey(userId);
    const data = localStorage.getItem(key) || localStorage.getItem("shopease_cart") || "[]";
    return JSON.parse(data);
  } catch {
    return [];
  }
};

const saveCart = (items, userId) => {
  try {
    localStorage.setItem(cartKey(userId), JSON.stringify(items));
  } catch {
    // storage quota exceeded – silently ignore
  }
};

const calcCount = (items) => items.reduce((s, i) => s + i.qty, 0);

// Determine userId from cookie at slice init (cookie is already set on reload)
const initUserId = (() => {
  try {
    const token = Cookies.get("shopease_customer_token");
    if (!token) return null;
    // JWT payload is the second base64 segment
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload?.id || payload?._id || payload?.sub || null;
  } catch {
    return null;
  }
})();

const initItems = loadCart(initUserId);

const publicCartSlice = createSlice({
  name: "publicCart",
  initialState: {
    items:  initItems,
    count:  calcCount(initItems),
    userId: initUserId,
  },
  reducers: {
    // Called after login — merges guest cart into user cart and switches key
    switchUserCart(state, action) {
      const { userId, guestItems = [] } = action.payload;
      state.userId = userId;

      // Load whatever the user had before (may be empty)
      const existing = loadCart(userId);

      // Merge: guest items are added on top, existing qty is respected
      const merged = [...existing];
      for (const gItem of guestItems) {
        const idx = merged.findIndex((i) => i._id === gItem._id);
        if (idx >= 0) {
          merged[idx].qty += gItem.qty;
        } else {
          merged.push(gItem);
        }
      }

      state.items = merged;
      state.count = calcCount(merged);

      saveCart(merged, userId);
      // Clear the guest cart
      localStorage.removeItem("shopease_cart_guest");
      localStorage.removeItem("shopease_cart"); // legacy key
    },

    // Called on logout — wipe in-memory state (data stays in user-keyed storage)
    clearUserCart(state) {
      state.items  = [];
      state.count  = 0;
      state.userId = null;
    },

    addToCart(state, action) {
      const { product, qty = 1 } = action.payload;
      const existing = state.items.find((i) => i._id === product._id);
      if (existing) {
        existing.qty += qty;
      } else {
        state.items.push({ ...product, qty });
      }
      state.count = calcCount(state.items);
      saveCart(state.items, state.userId);
    },

    removeFromCart(state, action) {
      state.items = state.items.filter((i) => i._id !== action.payload);
      state.count = calcCount(state.items);
      saveCart(state.items, state.userId);
    },

    updateQty(state, action) {
      const { id, qty } = action.payload;
      const item = state.items.find((i) => i._id === id);
      if (item) item.qty = qty;
      state.count = calcCount(state.items);
      saveCart(state.items, state.userId);
    },

    clearCart(state) {
      state.items = [];
      state.count = 0;
      saveCart([], state.userId);
    },
  },
});

export const {
  switchUserCart,
  clearUserCart,
  addToCart,
  removeFromCart,
  updateQty,
  clearCart,
} = publicCartSlice.actions;

export default publicCartSlice.reducer;
