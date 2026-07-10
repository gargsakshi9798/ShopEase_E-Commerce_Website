import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { GET, POST } from "../../utils/Methods";
import { APIS } from "../../utils/APIS";
import { IDS } from "../../utils/IDS";
import Cookies from "js-cookie";

// Admin Login
export const adminLogin = createAsyncThunk(
  "auth/adminLogin",
  async (data, { rejectWithValue }) => {
    try {
      const res = await POST(APIS.Auth.AdminLogin, data);
      if (res.success) {
        Cookies.set("shopease_admin_token", res.data.token, { expires: 365 });
      }
      return res;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: "Login failed" });
    }
  }
);

// Get Admin Details
export const getAdminDetails = createAsyncThunk(
  "auth/getAdminDetails",
  async (_, { rejectWithValue }) => {
    try {
      return await GET(APIS.Auth.AdminDetails);
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

// Logout
export const logout = createAsyncThunk("auth/logout", async () => {
  Cookies.remove("shopease_admin_token");
  return null;
});

const authSlice = createSlice({
  name: "auth",
  initialState: {
    data: {},
    token: Cookies.get("shopease_admin_token") || null,
    role: null,
    role_slug: null,
    permissions: [],
    isLogin: !!Cookies.get("shopease_admin_token"),
    status: IDS.SLICESTATUS.Idle,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Admin Login
      .addCase(adminLogin.pending, (state) => {
        state.status = IDS.SLICESTATUS.Loading;
        state.error = null;
      })
      .addCase(adminLogin.fulfilled, (state, action) => {
        state.status = IDS.SLICESTATUS.Succeeded;
        if (action.payload.success) {
          state.token = action.payload.data.token;
          state.role = action.payload.data.role;
          state.role_slug = action.payload.data.role_slug;
          state.permissions = action.payload.data.permissions;
          state.isLogin = true;
        }
      })
      .addCase(adminLogin.rejected, (state, action) => {
        state.status = IDS.SLICESTATUS.Failed;
        state.error = action.payload;
        state.isLogin = false;
      })
      // Get Details
      .addCase(getAdminDetails.fulfilled, (state, action) => {
        if (action.payload?.success) {
          state.data = action.payload.data;
          state.role = action.payload.data.role;
          state.role_slug = action.payload.data.role_slug;
          state.permissions = action.payload.data.permissions;
          state.isLogin = true;
        }
      })
      .addCase(getAdminDetails.rejected, (state) => {
        state.isLogin = false;
        state.token = null;
        Cookies.remove("shopease_admin_token");
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.data = {};
        state.token = null;
        state.role = null;
        state.role_slug = null;
        state.permissions = [];
        state.isLogin = false;
      });
  },
});

export default authSlice.reducer;
