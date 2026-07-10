import { createSlice } from "@reduxjs/toolkit";
import Cookies from "js-cookie";

// ── Helpers ───────────────────────────────────────────────────────────────────
const wishKey = (userId) =>
  userId ? `shopease_wishlist_${userId}` : "shopease_wishlist_guest";

const loadWishlist = (userId) => {
  try {
    const key  = wishKey(userId);
    const data = localStorage.getItem(key) || localStorage.getItem("shopease_wishlist") || "[]";
    return JSON.parse(data);
  } catch {
    return [];
  }
};

const saveWishlist = (items, userId) => {
  try {
    localStorage.setItem(wishKey(userId), JSON.stringify(items));
  } catch {}
};

// Derive userId from cookie at slice init
const initUserId = (() => {
  try {
    const token = Cookies.get("shopease_customer_token");
    if (!token) return null;
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload?.id || payload?._id || payload?.sub || null;
  } catch {
    return null;
  }
})();

const initItems = loadWishlist(initUserId);

const publicWishlistSlice = createSlice({
  name: "publicWishlist",
  initialState: {
    items:  initItems,
    count:  initItems.length,
    userId: initUserId,
  },
  reducers: {
    // Called after login — merges guest wishlist into user wishlist
    switchUserWishlist(state, action) {
      const { userId, guestItems = [] } = action.payload;
      state.userId = userId;

      const existing = loadWishlist(userId);

      // Merge: skip duplicates
      const merged = [...existing];
      for (const gItem of guestItems) {
        if (!merged.find((i) => i._id === gItem._id)) {
          merged.push(gItem);
        }
      }

      state.items = merged;
      state.count = merged.length;

      saveWishlist(merged, userId);
      localStorage.removeItem("shopease_wishlist_guest");
      localStorage.removeItem("shopease_wishlist"); // legacy key
    },

    // Called on logout — wipe in-memory state
    clearUserWishlist(state) {
      state.items  = [];
      state.count  = 0;
      state.userId = null;
    },

    toggleWishlist(state, action) {
      const product = action.payload;
      const idx = state.items.findIndex((i) => i._id === product._id);
      if (idx >= 0) {
        state.items.splice(idx, 1);
      } else {
        state.items.push(product);
      }
      state.count = state.items.length;
      saveWishlist(state.items, state.userId);
    },

    removeFromWishlist(state, action) {
      state.items = state.items.filter((i) => i._id !== action.payload);
      state.count = state.items.length;
      saveWishlist(state.items, state.userId);
    },

    clearWishlist(state) {
      state.items = [];
      state.count = 0;
      saveWishlist([], state.userId);
    },
  },
});

export const {
  switchUserWishlist,
  clearUserWishlist,
  toggleWishlist,
  removeFromWishlist,
  clearWishlist,
} = publicWishlistSlice.actions;

export default publicWishlistSlice.reducer;
