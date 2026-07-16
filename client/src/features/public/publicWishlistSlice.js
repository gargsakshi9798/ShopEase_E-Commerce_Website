import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import Cookies from "js-cookie";
import axiosClient from "../../utils/ApiInstance";
import { APIS } from "../../utils/APIS";

// ─── localStorage helpers (guest wishlist cache) ──────────────────────────────
const wishKey = (userId) =>
  userId ? `shopease_wishlist_${userId}` : "shopease_wishlist_guest";

const loadLocalWishlist = (userId) => {
  try {
    const data =
      localStorage.getItem(wishKey(userId)) ||
      localStorage.getItem("shopease_wishlist") ||
      "[]";
    return JSON.parse(data);
  } catch { return []; }
};

const saveLocalWishlist = (items, userId) => {
  try { localStorage.setItem(wishKey(userId), JSON.stringify(items)); } catch {}
};

// ─── Derive userId from cookie at module load ─────────────────────────────────
const initUserId = (() => {
  try {
    const token = Cookies.get("shopease_customer_token");
    if (!token) return null;
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload?.id || payload?._id || payload?.sub || null;
  } catch { return null; }
})();

// ─── Normalise a server wishlist item → Redux shape ───────────────────────────
// Server returns: { _id (wishlist doc id), product_id: { _id, name, thumbnail, price, mrp, ... } }
const normaliseServerItem = (item) => ({
  wishlistId:      item._id,                          // wishlist-doc _id for DELETE / move-to-cart
  _id:             item.product_id?._id ?? item.product_id,
  name:            item.product_id?.name    ?? "",
  img:             item.product_id?.thumbnail ?? "",
  price:           item.product_id?.price   ?? 0,
  mrp:             item.product_id?.mrp     ?? 0,
  discount_percent: item.product_id?.discount_percent ?? 0,
  rating_avg:      item.product_id?.rating_avg ?? 0,
  status:          item.product_id?.status  ?? true,
});

// ─── Thunks ───────────────────────────────────────────────────────────────────

/**
 * #1 Load Server Wishlist after Login
 * #5 Merge Guest Wishlist — toggles each guest item into the server wishlist
 * Fetches the final server wishlist as the source of truth.
 */
export const loadServerWishlist = createAsyncThunk(
  "publicWishlist/loadServerWishlist",
  async (guestItems = [], { rejectWithValue }) => {
    try {
      // Merge each guest item by toggling it on the server (idempotent)
      for (const item of guestItems) {
        if (!item._id) continue;
        await axiosClient
          .post(`${APIS.Customer.Wishlist}/toggle`, { product_id: item._id })
          .catch(() => {}); // skip failures (product deleted, etc.)
      }

      // Fetch the merged server wishlist
      const res = await axiosClient.get(APIS.Customer.Wishlist);
      return res.data?.data ?? res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Failed to load wishlist" });
    }
  }
);

/**
 * #2 Sync Wishlist — toggle a product on/off the server wishlist
 * Used on every heart-button click when logged in.
 */
export const toggleWishlistApi = createAsyncThunk(
  "publicWishlist/toggleWishlistApi",
  async (product, { rejectWithValue }) => {
    try {
      const res = await axiosClient.post(`${APIS.Customer.Wishlist}/toggle`, {
        product_id: product._id,
      });
      // Server responds with { added: true/false }
      return { added: res.data?.data?.added ?? true, product };
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Failed to update wishlist" });
    }
  }
);

/**
 * #4 Remove Wishlist Item — hard-delete a single item by wishlist doc id
 */
export const removeWishlistItemApi = createAsyncThunk(
  "publicWishlist/removeWishlistItemApi",
  async (wishlistId, { rejectWithValue }) => {
    try {
      await axiosClient.delete(`${APIS.Customer.Wishlist}/${wishlistId}`);
      return wishlistId;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Failed to remove item" });
    }
  }
);

/**
 * #3 Move Wishlist Item to Cart — server handles the cart upsert + wishlist delete
 */
export const moveToCartApi = createAsyncThunk(
  "publicWishlist/moveToCartApi",
  async (wishlistId, { rejectWithValue }) => {
    try {
      await axiosClient.post(`${APIS.Customer.Wishlist}/${wishlistId}/move-to-cart`);
      return wishlistId;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Failed to move to cart" });
    }
  }
);

// ─── Slice ────────────────────────────────────────────────────────────────────
const initItems = loadLocalWishlist(initUserId);

const publicWishlistSlice = createSlice({
  name: "publicWishlist",
  initialState: {
    items:   initItems,
    count:   initItems.length,
    userId:  initUserId,
    syncing: false,
    error:   null,
  },

  reducers: {
    // Called right after login — update userId key so the next
    // loadServerWishlist result is stored under the right key.
    // Guest items are merged by the loadServerWishlist thunk itself.
    switchUserWishlist(state, action) {
      const { userId } = action.payload;
      state.userId = userId;
      localStorage.removeItem("shopease_wishlist_guest");
      localStorage.removeItem("shopease_wishlist"); // legacy key
    },

    // Called on logout
    clearUserWishlist(state) {
      state.items  = [];
      state.count  = 0;
      state.userId = null;
      state.error  = null;
    },

    // Guest-only local toggle (no auth)
    toggleWishlist(state, action) {
      const product = action.payload;
      const idx = state.items.findIndex((i) => i._id === product._id);
      if (idx >= 0) {
        state.items.splice(idx, 1);
      } else {
        state.items.push(product);
      }
      state.count = state.items.length;
      saveLocalWishlist(state.items, state.userId);
    },

    // Guest-only local remove
    removeFromWishlist(state, action) {
      state.items = state.items.filter((i) => i._id !== action.payload);
      state.count = state.items.length;
      saveLocalWishlist(state.items, state.userId);
    },

    // Guest-only local clear
    clearWishlist(state) {
      state.items = [];
      state.count = 0;
      saveLocalWishlist([], state.userId);
    },
  },

  extraReducers: (builder) => {
    // ── loadServerWishlist (#1 + #5) ──────────────────────────────────────────
    builder
      .addCase(loadServerWishlist.pending, (state) => { state.syncing = true; })
      .addCase(loadServerWishlist.fulfilled, (state, action) => {
        state.syncing = false;
        const payload = action.payload;
        // Paginate helper returns { docs, ... }; plain GET returns array
        const docs = payload?.docs ?? payload?.items ?? (Array.isArray(payload) ? payload : []);
        state.items = docs.map(normaliseServerItem);
        state.count = state.items.length;
        saveLocalWishlist(state.items, state.userId);
      })
      .addCase(loadServerWishlist.rejected, (state, action) => {
        state.syncing = false;
        state.error   = action.payload;
      });

    // ── toggleWishlistApi (#2 Sync) ───────────────────────────────────────────
    builder
      .addCase(toggleWishlistApi.pending, (state) => { state.syncing = true; })
      .addCase(toggleWishlistApi.fulfilled, (state, action) => {
        state.syncing = false;
        const { added, product } = action.payload;
        if (added) {
          // Add only if not already present (guard against double-fire)
          if (!state.items.find((i) => i._id === product._id)) {
            state.items.push({ ...product, wishlistId: null }); // id filled on next load
          }
        } else {
          state.items = state.items.filter((i) => i._id !== product._id);
        }
        state.count = state.items.length;
        saveLocalWishlist(state.items, state.userId);
      })
      .addCase(toggleWishlistApi.rejected, (state, action) => {
        state.syncing = false;
        state.error   = action.payload;
      });

    // ── removeWishlistItemApi (#4) ────────────────────────────────────────────
    builder
      .addCase(removeWishlistItemApi.pending, (state) => { state.syncing = true; })
      .addCase(removeWishlistItemApi.fulfilled, (state, action) => {
        state.syncing = false;
        state.items = state.items.filter((i) => i.wishlistId !== action.payload);
        state.count = state.items.length;
        saveLocalWishlist(state.items, state.userId);
      })
      .addCase(removeWishlistItemApi.rejected, (state, action) => {
        state.syncing = false;
        state.error   = action.payload;
      });

    // ── moveToCartApi (#3) ────────────────────────────────────────────────────
    builder
      .addCase(moveToCartApi.pending, (state) => { state.syncing = true; })
      .addCase(moveToCartApi.fulfilled, (state, action) => {
        state.syncing = false;
        // Remove from wishlist — cart will be refreshed by the caller
        state.items = state.items.filter((i) => i.wishlistId !== action.payload);
        state.count = state.items.length;
        saveLocalWishlist(state.items, state.userId);
      })
      .addCase(moveToCartApi.rejected, (state, action) => {
        state.syncing = false;
        state.error   = action.payload;
      });
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
