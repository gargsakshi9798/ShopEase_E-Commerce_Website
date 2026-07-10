import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { GET, POST } from "../../utils/Methods";
import { APIS } from "../../utils/APIS";

// Fetch customer's orders
export const fetchMyOrders = createAsyncThunk(
  "publicOrder/fetchAll",
  async (params = {}, { rejectWithValue }) => {
    try {
      return await GET(APIS.Customer.Orders, params);
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Failed to fetch orders" });
    }
  }
);

// Fetch single order
export const fetchOrderById = createAsyncThunk(
  "publicOrder/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      return await GET(`${APIS.Customer.Orders}/${id}`);
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Failed to fetch order" });
    }
  }
);

// Cancel order
export const cancelOrder = createAsyncThunk(
  "publicOrder/cancel",
  async ({ id, reason }, { rejectWithValue }) => {
    try {
      return await POST(`${APIS.Customer.Orders}/${id}/cancel`, { reason });
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Failed to cancel order" });
    }
  }
);

// Return order item
export const returnOrder = createAsyncThunk(
  "publicOrder/return",
  async ({ id, reason, item_ids }, { rejectWithValue }) => {
    try {
      return await POST(`${APIS.Customer.Orders}/${id}/return`, { reason, item_ids });
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Failed to submit return" });
    }
  }
);

const publicOrderSlice = createSlice({
  name: "publicOrder",
  initialState: {
    orders: [],
    total: 0,
    totalPages: 1,
    currentPage: 1,
    detail: null,
    status: "idle",
    detailStatus: "idle",
    actionStatus: "idle",
    error: null,
  },
  reducers: {
    clearOrderDetail(state) {
      state.detail = null;
      state.detailStatus = "idle";
    },
  },
  extraReducers: (builder) => {
    builder
      // List
      .addCase(fetchMyOrders.pending, (state) => { state.status = "loading"; state.error = null; })
      .addCase(fetchMyOrders.fulfilled, (state, action) => {
        state.status = "succeeded";
        const d = action.payload?.data;
        state.orders      = d?.data        ?? d ?? [];
        state.total       = d?.total       ?? 0;
        state.totalPages  = d?.total_pages ?? 1;
        state.currentPage = d?.current_page ?? 1;
      })
      .addCase(fetchMyOrders.rejected, (state, action) => { state.status = "failed"; state.error = action.payload; })
      // Detail
      .addCase(fetchOrderById.pending, (state) => { state.detailStatus = "loading"; })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.detailStatus = "succeeded";
        state.detail = action.payload?.data ?? null;
      })
      .addCase(fetchOrderById.rejected, (state, action) => { state.detailStatus = "failed"; state.error = action.payload; })
      // Cancel
      .addCase(cancelOrder.pending, (state) => { state.actionStatus = "loading"; })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.actionStatus = "succeeded";
        if (state.detail && action.payload?.data) {
          state.detail = action.payload.data;
        }
      })
      .addCase(cancelOrder.rejected, (state, action) => { state.actionStatus = "failed"; state.error = action.payload; })
      // Return
      .addCase(returnOrder.pending, (state) => { state.actionStatus = "loading"; })
      .addCase(returnOrder.fulfilled, (state, action) => {
        state.actionStatus = "succeeded";
        if (state.detail && action.payload?.data) {
          state.detail = action.payload.data;
        }
      })
      .addCase(returnOrder.rejected, (state, action) => { state.actionStatus = "failed"; state.error = action.payload; });
  },
});

export const { clearOrderDetail } = publicOrderSlice.actions;
export default publicOrderSlice.reducer;
