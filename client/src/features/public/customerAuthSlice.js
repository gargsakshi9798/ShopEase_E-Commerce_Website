import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { POST } from "../../utils/Methods";
import axiosClient from "../../utils/ApiInstance";
import { APIS } from "../../utils/APIS";
import Cookies from "js-cookie";
import { switchUserCart, clearUserCart } from "./publicCartSlice";
import { switchUserWishlist, clearUserWishlist } from "./publicWishlistSlice";

// ── Helper: decode userId from JWT ────────────────────────────────────────────
const userIdFromToken = (token) => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload?.id || payload?._id || payload?.sub || null;
  } catch {
    return null;
  }
};

// ── Helper: check client-side JWT expiry ─────────────────────────────────────
const isTokenValid = (token) => {
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      Cookies.remove("shopease_customer_token");
      return false;
    }
    return true;
  } catch {
    return false;
  }
};

// ── Thunks ────────────────────────────────────────────────────────────────────

/**
 * verifyCustomerToken — called on every app load when a cookie exists.
 * Makes a real API call to validate the token server-side.
 * On 401 the axios interceptor clears the cookie; here we just reset Redux state.
 */
export const verifyCustomerToken = createAsyncThunk(
  "customerAuth/verify",
  async (_, { rejectWithValue, dispatch }) => {
    try {
      // Use relative path only — axiosClient already has baseURL set.
      // _skipRedirect tells the axios interceptor NOT to redirect to /login
      // if this background verify call fails with 401 — we just silently clear state.
      const res = await axiosClient.get(APIS.Customer.Profile, {
        _skipRedirect: true,
      });
      return res.data;
    } catch (err) {
      // Token rejected by server — clear everything
      Cookies.remove("shopease_customer_token");
      dispatch(clearUserCart());
      dispatch(clearUserWishlist());
      return rejectWithValue(null);
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
        const userId = userIdFromToken(token);

        Cookies.set("shopease_customer_token", token, { expires: 30 });

        // Capture guest cart & wishlist BEFORE switching
        const guestCartItems     = getState().publicCart.items;
        const guestWishlistItems = getState().publicWishlist.items;

        // Switch to user-specific storage and merge guest items
        dispatch(switchUserCart({ userId, guestItems: guestCartItems }));
        dispatch(switchUserWishlist({ userId, guestItems: guestWishlistItems }));
      }
      return res;
    } catch (err) {
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
    Cookies.remove("shopease_customer_token");
    dispatch(clearUserCart());
    dispatch(clearUserWishlist());
    return null;
  }
);

// ── Initial state ─────────────────────────────────────────────────────────────
const initToken   = Cookies.get("shopease_customer_token") || null;
const initIsLogin = isTokenValid(initToken);

// ── Slice ─────────────────────────────────────────────────────────────────────
const customerAuthSlice = createSlice({
  name: "customerAuth",
  initialState: {
    user:    null,
    token:   initIsLogin ? initToken : null,
    isLogin: initIsLogin,
    status:  "idle",
    error:   null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // ── Verify token on app load ──
      .addCase(verifyCustomerToken.pending, (state) => {
        // Keep current isLogin until server responds
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
          };
        }
      })
      .addCase(verifyCustomerToken.rejected, (state) => {
        state.status  = "idle";
        state.user    = null;
        state.token   = null;
        state.isLogin = false;
      })

      // ── Login ──
      .addCase(customerLogin.pending, (state) => {
        state.status = "loading";
        state.error  = null;
      })
      .addCase(customerLogin.fulfilled, (state, action) => {
        state.status = "succeeded";
        if (action.payload?.success) {
          state.token   = action.payload.data.token;
          state.user    = {
            name:          action.payload.data.name,
            email:         action.payload.data.email,
            profile_image: action.payload.data.profile_image,
          };
          state.isLogin = true;
        }
      })
      .addCase(customerLogin.rejected, (state, action) => {
        state.status = "failed";
        state.error  = action.payload;
      })

      // ── Logout ──
      .addCase(customerLogout.fulfilled, (state) => {
        state.user    = null;
        state.token   = null;
        state.isLogin = false;
        state.status  = "idle";
      });
  },
});

export default customerAuthSlice.reducer;
