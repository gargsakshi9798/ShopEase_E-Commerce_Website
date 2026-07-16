import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import Cookies from "js-cookie";
import axiosClient from "../../utils/ApiInstance";
import { APIS } from "../../utils/APIS";

// ─── localStorage helpers (guest cart) ───────────────────────────────────────
const cartKey  = (userId) => userId ? `shopease_cart_${userId}` : "shopease_cart_guest";

const loadLocalCart = (userId) => {
  try {
    const data = localStorage.getItem(cartKey(userId))
      || localStorage.getItem("shopease_cart")
      || "[]";
    return JSON.parse(data);
  } catch { return []; }
};

const saveLocalCart = (items, userId) => {
  try { localStorage.setItem(cartKey(userId), JSON.stringify(items)); } catch {}
};

const calcCount = (items) => items.reduce((s, i) => s + (i.qty ?? i.quantity ?? 1), 0);

// ─── Derive userId from cookie at module load ─────────────────────────────────
const initUserId = (() => {
  try {
    const token = Cookies.get("shopease_customer_token");
    if (!token) return null;
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload?.id || payload?._id || payload?.sub || null;
  } catch { return null; }
})();

// ─── Normalise a server cart item → Redux shape ───────────────────────────────
// Server stores product_id as an object after populate, item._id is the cart-item id
const normaliseServerItem = (item) => ({
  _id:             item.product_id?._id  ?? item.product_id,
  cartItemId:      item._id,                        // server-side cart item _id
  name:            item.product_id?.name ?? "",
  img:             item.product_id?.thumbnail ?? "",
  brand:           item.product_id?.brand_name ?? "",
  price:           item.price,
  mrp:             item.mrp,
  qty:             item.quantity,
  saved_for_later: item.saved_for_later ?? false,
  variant_id:      item.variant_id ?? null,
  // ── Security fields ──────────────────────────────────────────────────────
  stock:           item.product_id?.stock  ?? 999,  // stock from populated product
  status:          item.product_id?.status ?? true, // false = deleted / inactive product
});

// ─── Thunks ───────────────────────────────────────────────────────────────────

/**
 * #2 Load Server Cart after Login + Merge Guest Cart
 * Fetches the server cart, merges any guest items into it (POST /add for each),
 * then returns the final server cart as the source of truth.
 */
export const loadServerCart = createAsyncThunk(
  "publicCart/loadServerCart",
  async (guestItems = [], { rejectWithValue }) => {
    try {
      // 1. Merge each guest item into the server cart
      for (const item of guestItems) {
        if (!item._id) continue;
        await axiosClient.post(`${APIS.Customer.Cart}/add`, {
          product_id: item._id,
          variant_id: item.variant_id ?? null,
          quantity:   item.qty ?? 1,
        }).catch(() => {}); // non-blocking — skip items that fail (e.g. out of stock)
      }

      // 2. Fetch the final merged server cart
      const res = await axiosClient.get(APIS.Customer.Cart);
      return res.data?.data ?? res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Failed to load cart" });
    }
  }
);

/**
 * #4 Update Quantity API
 */
export const updateQtyApi = createAsyncThunk(
  "publicCart/updateQtyApi",
  async ({ cartItemId, qty }, { rejectWithValue }) => {
    try {
      const res = await axiosClient.put(`${APIS.Customer.Cart}/update`, {
        item_id:  cartItemId,
        quantity: qty,
      });
      return res.data?.data ?? res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Failed to update quantity" });
    }
  }
);

/**
 * #5 Remove Item API
 */
export const removeItemApi = createAsyncThunk(
  "publicCart/removeItemApi",
  async (cartItemId, { rejectWithValue }) => {
    try {
      const res = await axiosClient.delete(`${APIS.Customer.Cart}/item/${cartItemId}`);
      return res.data?.data ?? res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Failed to remove item" });
    }
  }
);

/**
 * #6 Save For Later API — toggles saved_for_later on a cart item
 */
export const saveForLaterApi = createAsyncThunk(
  "publicCart/saveForLaterApi",
  async (cartItemId, { rejectWithValue }) => {
    try {
      const res = await axiosClient.patch(`${APIS.Customer.Cart}/save-later/${cartItemId}`);
      return res.data?.data ?? res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Failed to save for later" });
    }
  }
);

/**
 * #7 Clear Cart API
 */
export const clearCartApi = createAsyncThunk(
  "publicCart/clearCartApi",
  async (_, { rejectWithValue }) => {
    try {
      await axiosClient.delete(`${APIS.Customer.Cart}/clear`);
      return null;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Failed to clear cart" });
    }
  }
);

// ─── Slice ────────────────────────────────────────────────────────────────────
const initItems = loadLocalCart(initUserId);

const publicCartSlice = createSlice({
  name: "publicCart",
  initialState: {
    items:   initItems,
    count:   calcCount(initItems),
    userId:  initUserId,
    syncing: false,   // true while any API call is in-flight
    error:   null,
  },

  reducers: {
    // ── Guest / local-only operations ─────────────────────────────────────────

    // Called after login success — guest items are already merged by loadServerCart
    // thunk; we just need to update userId and clear guest storage
    switchUserCart(state, action) {
      const { userId } = action.payload;
      state.userId = userId;
      localStorage.removeItem("shopease_cart_guest");
      localStorage.removeItem("shopease_cart");
    },

    // Called on logout — wipe in-memory state
    clearUserCart(state) {
      state.items  = [];
      state.count  = 0;
      state.userId = null;
      state.error  = null;
    },

    // Guest add (no auth) — localStorage only
    // Validate product before add (#1), prevent duplicates by variant (#2),
    // and enforce stock > 0 (#3).
    addToCart(state, action) {
      const { product, qty = 1 } = action.payload;

      // #1 Validate product exists and is active
      if (!product || !product._id) return;

      // #3 Stock validation — only check if stock field is present
      if (product.stock !== undefined && product.stock <= 0) return;

      const variantId = product.variant_id ?? null;

      // #2 Prevent duplicates — match by both _id AND variant_id
      const existing = state.items.find(
        (i) => i._id === product._id && (i.variant_id ?? null) === variantId
      );

      if (existing) {
        // Cap qty at available stock if stock is known
        const maxQty = product.stock ?? Infinity;
        existing.qty = Math.min((existing.qty ?? 1) + qty, maxQty);
      } else {
        state.items.push({
          ...product,
          qty,
          saved_for_later: false,
          stock:  product.stock  ?? 999,
          status: product.status ?? true,
        });
      }
      state.count = calcCount(state.items);
      saveLocalCart(state.items, state.userId);
    },

    // Local-only qty change (guest) — also used as optimistic update for logged-in
    updateQty(state, action) {
      const { id, qty } = action.payload;
      const item = state.items.find((i) => i._id === id);
      if (item) item.qty = qty;
      state.count = calcCount(state.items);
      saveLocalCart(state.items, state.userId);
    },

    // Local-only remove (guest) — also used as optimistic update for logged-in
    removeFromCart(state, action) {
      state.items = state.items.filter((i) => i._id !== action.payload);
      state.count = calcCount(state.items);
      saveLocalCart(state.items, state.userId);
    },

    // Local-only clear (guest)
    clearCart(state) {
      state.items = [];
      state.count = 0;
      saveLocalCart([], state.userId);
    },
  },

  extraReducers: (builder) => {
    // ── #2 loadServerCart ─────────────────────────────────────────────────────
    builder
      .addCase(loadServerCart.pending, (state) => { state.syncing = true; })
      .addCase(loadServerCart.fulfilled, (state, action) => {
        state.syncing = false;
        const serverCart = action.payload;
        if (serverCart?.items) {
          state.items = serverCart.items.map(normaliseServerItem);
          state.count = calcCount(state.items);
          // Persist locally as a cache (helps on offline / re-render)
          saveLocalCart(state.items, state.userId);
        }
      })
      .addCase(loadServerCart.rejected, (state, action) => {
        state.syncing = false;
        state.error   = action.payload;
        // Keep whatever localStorage had — don't wipe
      });

    // ── #4 updateQtyApi ───────────────────────────────────────────────────────
    builder
      .addCase(updateQtyApi.pending, (state) => { state.syncing = true; })
      .addCase(updateQtyApi.fulfilled, (state, action) => {
        state.syncing = false;
        const serverCart = action.payload;
        if (serverCart?.items) {
          state.items = serverCart.items.map(normaliseServerItem);
          state.count = calcCount(state.items);
          saveLocalCart(state.items, state.userId);
        }
      })
      .addCase(updateQtyApi.rejected, (state, action) => {
        state.syncing = false;
        state.error   = action.payload;
      });

    // ── #5 removeItemApi ──────────────────────────────────────────────────────
    builder
      .addCase(removeItemApi.pending, (state) => { state.syncing = true; })
      .addCase(removeItemApi.fulfilled, (state, action) => {
        state.syncing = false;
        const serverCart = action.payload;
        if (serverCart?.items) {
          state.items = serverCart.items.map(normaliseServerItem);
          state.count = calcCount(state.items);
          saveLocalCart(state.items, state.userId);
        }
      })
      .addCase(removeItemApi.rejected, (state, action) => {
        state.syncing = false;
        state.error   = action.payload;
      });

    // ── #6 saveForLaterApi ────────────────────────────────────────────────────
    builder
      .addCase(saveForLaterApi.pending, (state) => { state.syncing = true; })
      .addCase(saveForLaterApi.fulfilled, (state, action) => {
        state.syncing = false;
        const serverCart = action.payload;
        if (serverCart?.items) {
          state.items = serverCart.items.map(normaliseServerItem);
          state.count = calcCount(state.items);
          saveLocalCart(state.items, state.userId);
        }
      })
      .addCase(saveForLaterApi.rejected, (state, action) => {
        state.syncing = false;
        state.error   = action.payload;
      });

    // ── #7 clearCartApi ───────────────────────────────────────────────────────
    builder
      .addCase(clearCartApi.pending, (state) => { state.syncing = true; })
      .addCase(clearCartApi.fulfilled, (state) => {
        state.syncing = false;
        state.items   = [];
        state.count   = 0;
        saveLocalCart([], state.userId);
      })
      .addCase(clearCartApi.rejected, (state, action) => {
        state.syncing = false;
        state.error   = action.payload;
      });
  },
});

export const {
  switchUserCart,
  clearUserCart,
  addToCart,
  updateQty,
  removeFromCart,
  clearCart,
} = publicCartSlice.actions;

export default publicCartSlice.reducer;
