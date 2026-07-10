import { createSlice } from "@reduxjs/toolkit";

const saved = (() => {
  try { return JSON.parse(localStorage.getItem("shopease_wishlist") || "[]"); }
  catch { return []; }
})();

const publicWishlistSlice = createSlice({
  name: "publicWishlist",
  initialState: {
    items: saved,
    count: saved.length,
  },
  reducers: {
    toggleWishlist(state, action) {
      const product = action.payload;
      const idx = state.items.findIndex((i) => i._id === product._id);
      if (idx >= 0) {
        state.items.splice(idx, 1);
      } else {
        state.items.push(product);
      }
      state.count = state.items.length;
      localStorage.setItem("shopease_wishlist", JSON.stringify(state.items));
    },
    removeFromWishlist(state, action) {
      state.items = state.items.filter((i) => i._id !== action.payload);
      state.count = state.items.length;
      localStorage.setItem("shopease_wishlist", JSON.stringify(state.items));
    },
    clearWishlist(state) {
      state.items = [];
      state.count = 0;
      localStorage.removeItem("shopease_wishlist");
    },
  },
});

export const { toggleWishlist, removeFromWishlist, clearWishlist } = publicWishlistSlice.actions;
export default publicWishlistSlice.reducer;
