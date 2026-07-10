import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { POST } from "../../utils/Methods";
import { APIS } from "../../utils/APIS";
import Cookies from "js-cookie";

export const customerLogin = createAsyncThunk(
  "customerAuth/login",
  async (data, { rejectWithValue }) => {
    try {
      const res = await POST(APIS.Auth.Login, data);
      if (res.success) {
        Cookies.set("shopease_customer_token", res.data.token, { expires: 30 });
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

export const customerLogout = createAsyncThunk("customerAuth/logout", async () => {
  Cookies.remove("shopease_customer_token");
  return null;
});

const customerAuthSlice = createSlice({
  name: "customerAuth",
  initialState: {
    user: null,
    token: Cookies.get("shopease_customer_token") || null,
    isLogin: !!Cookies.get("shopease_customer_token"),
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(customerLogin.pending, (state) => { state.status = "loading"; state.error = null; })
      .addCase(customerLogin.fulfilled, (state, action) => {
        state.status = "succeeded";
        if (action.payload?.success) {
          state.token = action.payload.data.token;
          state.user = { name: action.payload.data.name, email: action.payload.data.email, profile_image: action.payload.data.profile_image };
          state.isLogin = true;
        }
      })
      .addCase(customerLogin.rejected, (state, action) => { state.status = "failed"; state.error = action.payload; })
      .addCase(customerLogout.fulfilled, (state) => {
        state.user = null; state.token = null; state.isLogin = false;
      });
  },
});

export default customerAuthSlice.reducer;
