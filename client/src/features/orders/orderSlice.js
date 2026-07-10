import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { GET, PATCH } from "../../utils/Methods";
import { APIS } from "../../utils/APIS";
import { IDS } from "../../utils/IDS";

export const fetchOrders = createAsyncThunk(
  "order/fetchAll",
  async (params = {}, { rejectWithValue }) => {
    try { return await GET(APIS.Orders, params); }
    catch (e) { return rejectWithValue(e.response?.data); }
  }
);

export const fetchOrderById = createAsyncThunk(
  "order/fetchById",
  async (id, { rejectWithValue }) => {
    try { return await GET(`${APIS.Orders}/${id}`); }
    catch (e) { return rejectWithValue(e.response?.data); }
  }
);

export const updateOrderStatus = createAsyncThunk(
  "order/updateStatus",
  async ({ id, data }, { rejectWithValue }) => {
    try { return await PATCH(`${APIS.Orders}/${id}/status`, data); }
    catch (e) { return rejectWithValue(e.response?.data); }
  }
);

export const assignEmployee = createAsyncThunk(
  "order/assignEmployee",
  async ({ id, employee_id }, { rejectWithValue }) => {
    try { return await PATCH(`${APIS.Orders}/${id}/assign`, { employee_id }); }
    catch (e) { return rejectWithValue(e.response?.data); }
  }
);

export const fetchOrderStats = createAsyncThunk(
  "order/fetchStats",
  async (_, { rejectWithValue }) => {
    try { return await GET(`${APIS.Orders}/stats`); }
    catch (e) { return rejectWithValue(e.response?.data); }
  }
);

const orderSlice = createSlice({
  name: "order",
  initialState: {
    list:         [],
    total:        0,
    current_page: 1,
    total_pages:  1,
    selected:     null,
    stats:        [],
    status:       IDS.SLICESTATUS.Idle,
    mutating:     false,
    error:        null,
  },
  reducers: {
    clearSelected: (s) => { s.selected = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending,   (s) => { s.status = IDS.SLICESTATUS.Loading; })
      .addCase(fetchOrders.rejected,  (s, a) => { s.status = IDS.SLICESTATUS.Failed; s.error = a.payload; })
      .addCase(fetchOrders.fulfilled, (s, a) => {
        s.status       = IDS.SLICESTATUS.Succeeded;
        s.list         = a.payload?.data?.data || [];
        s.total        = a.payload?.data?.total || 0;
        s.current_page = a.payload?.data?.current_page || 1;
        s.total_pages  = a.payload?.data?.total_pages  || 1;
      })

      .addCase(fetchOrderById.fulfilled, (s, a) => { s.selected = a.payload?.data || null; })
      .addCase(fetchOrderStats.fulfilled, (s, a) => { s.stats = a.payload?.data || []; })

      .addCase(updateOrderStatus.pending,   (s) => { s.mutating = true; })
      .addCase(updateOrderStatus.fulfilled, (s, a) => {
        s.mutating = false;
        if (s.selected && a.payload?.data) s.selected = a.payload.data;
      })
      .addCase(updateOrderStatus.rejected,  (s) => { s.mutating = false; })

      .addCase(assignEmployee.pending,   (s) => { s.mutating = true; })
      .addCase(assignEmployee.fulfilled, (s) => { s.mutating = false; })
      .addCase(assignEmployee.rejected,  (s) => { s.mutating = false; });
  },
});

export const { clearSelected } = orderSlice.actions;
export default orderSlice.reducer;
