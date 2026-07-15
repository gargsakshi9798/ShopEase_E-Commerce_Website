import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { GET, POST } from "../../utils/Methods";
import { APIS } from "../../utils/APIS";
import { IDS } from "../../utils/IDS";
import {
  isTokenValid,
  decodeToken,
  getAdminToken,
  clearAdminToken,
} from "../../utils/tokenUtils";

// ─── Thunks ───────────────────────────────────────────────────────────────────

export const adminLogin = createAsyncThunk(
  "auth/adminLogin",
  async (data, { rejectWithValue }) => {
    try {
      const res = await POST(APIS.Auth.AdminLogin, data);
      if (res.success) {
        // Import Cookies lazily to avoid circular dep at module-load time
        const { default: Cookies } = await import("js-cookie");
        Cookies.set("shopease_admin_token", res.data.token, { expires: 365 });
      }
      return res;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: "Login failed" });
    }
  }
);

/**
 * getAdminDetails
 * Called on every app reload when the admin cookie is present AND valid.
 * Hydrates the Redux store with fresh profile data from the server.
 * Uses skipRedirect:true so that a 401 (e.g. after a role change or
 * server-side revocation) simply clears state instead of hard-redirecting
 * from a public page that happens to have an admin cookie present.
 */
export const getAdminDetails = createAsyncThunk(
  "auth/getAdminDetails",
  async (_, { rejectWithValue }) => {
    try {
      return await GET(APIS.Auth.AdminDetails);
    } catch (error) {
      // Clear stale cookie on server rejection
      clearAdminToken();
      return rejectWithValue(error.response?.data);
    }
  }
);

export const logout = createAsyncThunk("auth/logout", async () => {
  clearAdminToken();
  return null;
});

// ─── Initial state ────────────────────────────────────────────────────────────
// Validate cookie immediately so the very first render has correct auth state.
// This prevents a flash where isLogin=true for an expired admin token.
const initToken   = getAdminToken();
const initIsValid = isTokenValid(initToken);

// Evict the cookie now if it is already expired
if (initToken && !initIsValid) {
  clearAdminToken();
}

// Pre-populate what we can from the token payload so the UI works even before
// getAdminDetails resolves (avoids a blank header on hard-refresh).
const initPayload = initIsValid ? decodeToken(initToken) : null;

// ─── Slice ────────────────────────────────────────────────────────────────────
const authSlice = createSlice({
  name: "auth",
  initialState: {
    data:        initPayload ? {
      name:      initPayload.name  || "",
      email:     initPayload.email || "",
      role:      initPayload.role_name || initPayload.role || "",
      role_slug: initPayload.role  || "",
    } : {},
    token:       initIsValid ? initToken : null,
    role:        initPayload?.role_name || initPayload?.role || null,
    role_slug:   initPayload?.role      || null,
    permissions: initPayload?.permissions || [],
    isLogin:     initIsValid,
    status:      IDS.SLICESTATUS.Idle,
    error:       null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // ── adminLogin ───────────────────────────────────────────────────────
      .addCase(adminLogin.pending, (state) => {
        state.status = IDS.SLICESTATUS.Loading;
        state.error  = null;
      })
      .addCase(adminLogin.fulfilled, (state, action) => {
        state.status = IDS.SLICESTATUS.Succeeded;
        if (action.payload?.success) {
          const d = action.payload.data;
          state.token       = d.token;
          state.role        = d.role;
          state.role_slug   = d.role_slug;
          state.permissions = d.permissions ?? [];
          state.isLogin     = true;
          state.data        = {
            name:          d.name,
            email:         d.email,
            profile_image: d.profile_image ?? null,
            role:          d.role,
            role_slug:     d.role_slug,
          };
        }
      })
      .addCase(adminLogin.rejected, (state, action) => {
        state.status  = IDS.SLICESTATUS.Failed;
        state.error   = action.payload;
        state.isLogin = false;
      })

      // ── getAdminDetails ──────────────────────────────────────────────────
      .addCase(getAdminDetails.pending, (state) => {
        // Keep current isLogin — don't flicker the UI while loading
        state.status = IDS.SLICESTATUS.Loading;
      })
      .addCase(getAdminDetails.fulfilled, (state, action) => {
        state.status = IDS.SLICESTATUS.Succeeded;
        if (action.payload?.success) {
          const d = action.payload.data;
          state.data        = d;
          state.role        = d.role;
          state.role_slug   = d.role_slug;
          state.permissions = d.permissions ?? [];
          state.isLogin     = true;
        }
      })
      .addCase(getAdminDetails.rejected, (state) => {
        // Server rejected the token — full reset
        state.status      = IDS.SLICESTATUS.Failed;
        state.data        = {};
        state.token       = null;
        state.role        = null;
        state.role_slug   = null;
        state.permissions = [];
        state.isLogin     = false;
      })

      // ── logout ───────────────────────────────────────────────────────────
      .addCase(logout.fulfilled, (state) => {
        state.data        = {};
        state.token       = null;
        state.role        = null;
        state.role_slug   = null;
        state.permissions = [];
        state.isLogin     = false;
        state.status      = IDS.SLICESTATUS.Idle;
      });
  },
});

export default authSlice.reducer;
