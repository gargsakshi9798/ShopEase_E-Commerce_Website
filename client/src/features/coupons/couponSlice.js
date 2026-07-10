import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { GET, POST, PUT, DELETE } from "../../utils/Methods";
import { APIS } from "../../utils/APIS";
import { IDS } from "../../utils/IDS";

export const fetchCoupons = createAsyncThunk(
  "coupon/fetchAll",
  async (params = {}, { rejectWithValue }) => {
    try { return await GET(APIS.Coupons, params); }
    catch (e) { return rejectWithValue(e.response?.data); }
  }
);

export const createCoupon = createAsyncThunk(
  "coupon/create",
  async (data, { rejectWithValue }) => {
    try { return await POST(APIS.Coupons, data); }
    catch (e) { return rejectWithValue(e.response?.data); }
  }
);

export const updateCoupon = createAsyncThunk(
  "coupon/update",
  async ({ id, data }, { rejectWithValue }) => {
    try { return await PUT(`${APIS.Coupons}/${id}`, data); }
    catch (e) { return rejectWithValue(e.response?.data); }
  }
);

export const deleteCoupon = createAsyncThunk(
  "coupon/delete",
  async (id, { rejectWithValue }) => {
    try { return await DELETE(`${APIS.Coupons}/${id}`); }
    catch (e) { return rejectWithValue(e.response?.data); }
  }
);

const couponSlice = createSlice({
  name: "coupon",
  initialState: {
    list:     [],
    total:    0,
    status:   IDS.SLICESTATUS.Idle,
    mutating: false,
    error:    null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCoupons.pending,   (s) => { s.status = IDS.SLICESTATUS.Loading; })
      .addCase(fetchCoupons.rejected,  (s, a) => { s.status = IDS.SLICESTATUS.Failed; s.error = a.payload; })
      .addCase(fetchCoupons.fulfilled, (s, a) => {
        s.status = IDS.SLICESTATUS.Succeeded;
        s.list   = a.payload?.data?.data || [];
        s.total  = a.payload?.data?.total || 0;
      })
      .addCase(createCoupon.pending,   (s) => { s.mutating = true; })
      .addCase(createCoupon.fulfilled, (s) => { s.mutating = false; })
      .addCase(createCoupon.rejected,  (s) => { s.mutating = false; })
      .addCase(updateCoupon.pending,   (s) => { s.mutating = true; })
      .addCase(updateCoupon.fulfilled, (s) => { s.mutating = false; })
      .addCase(updateCoupon.rejected,  (s) => { s.mutating = false; })
      .addCase(deleteCoupon.pending,   (s) => { s.mutating = true; })
      .addCase(deleteCoupon.fulfilled, (s) => { s.mutating = false; })
      .addCase(deleteCoupon.rejected,  (s) => { s.mutating = false; });
  },
});

export default couponSlice.reducer;
