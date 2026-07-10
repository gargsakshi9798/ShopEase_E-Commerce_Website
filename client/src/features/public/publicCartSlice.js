import { createSlice } from "@reduxjs/toolkit";

const saved = (() => {
  try { return JSON.parse(localStorage.getItem("shopease_cart") || "[]"); }
  catch { return []; }
})();

const calcCount = (items) => items.reduce((s, i) => s + i.qty, 0);

const publicCartSlice = createSlice({
  name: "publicCart",
  initialState: {
    items: saved,
    count: calcCount(saved),
  },
  reducers: {
    addToCart(state, action) {
      const { product, qty = 1 } = action.payload;
      const existing = state.items.find((i) => i._id === product._id);
      if (existing) {
        existing.qty += qty;
      } else {
        state.items.push({ ...product, qty });
      }
      state.count = calcCount(state.items);
      localStorage.setItem("shopease_cart", JSON.stringify(state.items));
    },
    removeFromCart(state, action) {
      state.items = state.items.filter((i) => i._id !== action.payload);
      state.count = calcCount(state.items);
      localStorage.setItem("shopease_cart", JSON.stringify(state.items));
    },
    updateQty(state, action) {
      const { id, qty } = action.payload;
      const item = state.items.find((i) => i._id === id);
      if (item) item.qty = qty;
      state.count = calcCount(state.items);
      localStorage.setItem("shopease_cart", JSON.stringify(state.items));
    },
    clearCart(state) {
      state.items = [];
      state.count = 0;
      localStorage.removeItem("shopease_cart");
    },
  },
});

export const { addToCart, removeFromCart, updateQty, clearCart } = publicCartSlice.actions;
export default publicCartSlice.reducer;
