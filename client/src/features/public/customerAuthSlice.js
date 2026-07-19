import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { POST } from "../../utils/Methods";
import axiosClient from "../../utils/ApiInstance";
import { APIS } from "../../utils/APIS";
import Cookies from "js-cookie";
import {
  isTokenValid,
  getUserIdFromToken,
  getCustomerToken,
  clearCustomerToken,
} from "../../utils/tokenUtils";
import { loadServerCart, switchUserCart, clearUserCart } from "./publicCartSlice";
import { loadServerWishlist, switchUserWishlist, clearUserWishlist } from "./publicWishlistSlice";

// ─── Thunks ───────────────────────────────────────────────────────────────────

/**
 * verifyCustomerToken
 * Called on every app load when a customer cookie exists.
 * 1. Client-side expiry check first — avoids a network round-trip for dead tokens.
 * 2. If token looks valid, hits the server to confirm and refresh user profile data.
 * 3. Uses `skipRedirect: true` so the response interceptor does NOT hard-navigate
 *    to /login when this background call fails with 401 — the thunk handles cleanup.
 */
export const verifyCustomerToken = createAsyncThunk(
  "customerAuth/verify",
  async (_, { rejectWithValue, dispatch }) => {
    const token = getCustomerToken();

    // ── Step 1: fast client-side check ──
    if (!isTokenValid(token)) {
      clearCustomerToken();
      dispatch(clearUserCart());
      dispatch(clearUserWishlist());
      return rejectWithValue("Token missing or expired");
    }

    // ── Step 2: server-side confirmation ──
    try {
      const res = await axiosClient.get(APIS.Customer.Profile, {
        skipRedirect: true,   // tell response interceptor: don't redirect on 401
      });
      return res.data;
    } catch (err) {
      // Server rejected the token (tampered / blacklisted / truly expired)
      clearCustomerToken();
      dispatch(clearUserCart());
      dispatch(clearUserWishlist());
      return rejectWithValue(
        err?.response?.data?.message || "Session verification failed"
      );
    }
  }
);

export const customerLogin = createAsyncThunk(
  "customerAuth/login",
  async (data, { rejectWithValue, dispatch, getState }) => {
    try {
      const res = await POST(APIS.Auth.Login, data);

      if (res.success) {
        const token  = res.data.token;
        const userId = getUserIdFromToken(token);

        // Set cookie synchronously before dispatching any thunks
        Cookies.set("shopease_customer_token", token, { expires: 30 });

        // Capture guest items before switching context
        const guestCartItems     = getState().publicCart.items;
        const guestWishlistItems = getState().publicWishlist.items;

        // Update cart userId in Redux so the local cache key changes,
        // then fetch the server cart and merge guest items into it
        dispatch(switchUserCart({ userId }));
        dispatch(loadServerCart(guestCartItems));

        // Update wishlist userId, then fetch server wishlist and merge guest items
        dispatch(switchUserWishlist({ userId }));
        dispatch(loadServerWishlist(guestWishlistItems));
      }

      return res;
    } catch (err) {
      // Normalise TOKEN_EXPIRED errors thrown by the request interceptor.
      // Those errors have no .response, so err.response?.data would be undefined
      // and callers would silently swallow the failure.
      if (err.code === "TOKEN_EXPIRED") {
        return rejectWithValue({ message: "Session expired. Please log in again." });
      }
      return rejectWithValue(err.response?.data || { message: "Login failed" });
    }
  }
);

export const customerRegister = createAsyncThunk(
  "customerAuth/register",
  async (data, { rejectWithValue }) => {
    try {
      return await POST(APIS.Auth.Register, data);
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Registration failed" });
    }
  }
);

export const customerLogout = createAsyncThunk(
  "customerAuth/logout",
  async (_, { dispatch }) => {
    clearCustomerToken();
    dispatch(clearUserCart());
    dispatch(clearUserWishlist());
    return null;
  }
);

// ─── Initial state ────────────────────────────────────────────────────────────
// Validate the cookie immediately on module load so Redux state is correct
// before the first render — no flash of "logged-in" for expired tokens.
const initToken   = getCustomerToken();
const initIsValid = isTokenValid(initToken);

// If the stored token is already expired, evict the cookie right away
if (initToken && !initIsValid) {
  clearCustomerToken();
}

// ─── Slice ────────────────────────────────────────────────────────────────────
const customerAuthSlice = createSlice({
  name: "customerAuth",
  initialState: {
    user:    null,
    token:   initIsValid ? initToken : null,
    isLogin: initIsValid,
    status:  "idle",
    error:   null,
  },
  reducers: {
    // Allows components to imperatively clear auth (e.g. after token error)
    resetCustomerAuth(state) {
      state.user    = null;
      state.token   = null;
      state.isLogin = false;
      state.status  = "idle";
      state.error   = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ── verifyCustomerToken ──────────────────────────────────────────────
      .addCase(verifyCustomerToken.pending, (state) => {
        state.status = "loading";
      })
      .addCase(verifyCustomerToken.fulfilled, (state, action) => {
        state.status  = "succeeded";
        state.isLogin = true;
        const data = action.payload?.data;
        if (data) {
          state.user = {
            name:          data.name,
            email:         data.email,
            profile_image: data.profile_image,
            contact_no:    data.contact_no ?? null,
          };
        }
      })
      .addCase(verifyCustomerToken.rejected, (state) => {
        // Server rejected the token — the token is genuinely invalid/expired.
        // Clear everything and force re-login.
        state.status  = "idle";
        state.user    = null;
        state.token   = null;
        state.isLogin = false;
      })

      // ── customerLogin ────────────────────────────────────────────────────
      .addCase(customerLogin.pending, (state) => {
        state.status = "loading";
        state.error  = null;
      })
      .addCase(customerLogin.fulfilled, (state, action) => {
        state.status = "succeeded";
        if (action.payload?.success) {
          state.token   = action.payload.data.token;
          state.isLogin = true;
          state.user    = {
            name:          action.payload.data.name,
            email:         action.payload.data.email,
            profile_image: action.payload.data.profile_image ?? null,
          };
        }
      })
      .addCase(customerLogin.rejected, (state, action) => {
        state.status = "failed";
        state.error  = action.payload;
      })

      // ── customerLogout ───────────────────────────────────────────────────
      .addCase(customerLogout.fulfilled, (state) => {
        state.user    = null;
        state.token   = null;
        state.isLogin = false;
        state.status  = "idle";
      });
  },
});

export const { resetCustomerAuth } = customerAuthSlice.actions;
export default customerAuthSlice.reducer;
