import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { GET, PATCH, DELETE } from "../../utils/Methods";
import { APIS } from "../../utils/APIS";
import { IDS } from "../../utils/IDS";

export const fetchCustomers = createAsyncThunk(
  "customer/fetchAll",
  async (params = {}, { rejectWithValue }) => {
    try { return await GET(APIS.Users.Customers, params); }
    catch (e) { return rejectWithValue(e.response?.data); }
  }
);

export const getCustomerById = createAsyncThunk(
  "customer/getById",
  async (id, { rejectWithValue }) => {
    try { return await GET(APIS.Users.ById(id)); }
    catch (e) { return rejectWithValue(e.response?.data); }
  }
);

export const toggleBlockCustomer = createAsyncThunk(
  "customer/toggleBlock",
  async (id, { rejectWithValue }) => {
    try { return await PATCH(APIS.Users.BlockById(id)); }
    catch (e) { return rejectWithValue(e.response?.data); }
  }
);

export const deleteCustomer = createAsyncThunk(
  "customer/delete",
  async (id, { rejectWithValue }) => {
    try { return await DELETE(APIS.Users.ById(id)); }
    catch (e) { return rejectWithValue(e.response?.data); }
  }
);

const customerSlice = createSlice({
  name: "customer",
  initialState: {
    list:         [],
    total:        0,
    current_page: 1,
    total_pages:  1,
    selected:     null,
    status:       IDS.SLICESTATUS.Idle,
    mutating:     false,
    error:        null,
  },
  reducers: {
    clearSelectedCustomer: (s) => { s.selected = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCustomers.pending,  (s) => { s.status = IDS.SLICESTATUS.Loading; })
      .addCase(fetchCustomers.rejected, (s, a) => { s.status = IDS.SLICESTATUS.Failed; s.error = a.payload; })
      .addCase(fetchCustomers.fulfilled, (s, a) => {
        s.status       = IDS.SLICESTATUS.Succeeded;
        s.list         = a.payload?.data?.data || [];
        s.total        = a.payload?.data?.total || 0;
        s.current_page = a.payload?.data?.current_page || 1;
        s.total_pages  = a.payload?.data?.total_pages  || 1;
      })

      .addCase(getCustomerById.fulfilled, (s, a) => {
        s.selected = a.payload?.data || null;
      })

      .addCase(toggleBlockCustomer.pending,   (s) => { s.mutating = true; })
      .addCase(toggleBlockCustomer.fulfilled, (s) => { s.mutating = false; })
      .addCase(toggleBlockCustomer.rejected,  (s) => { s.mutating = false; })

      .addCase(deleteCustomer.pending,   (s) => { s.mutating = true; })
      .addCase(deleteCustomer.fulfilled, (s) => { s.mutating = false; })
      .addCase(deleteCustomer.rejected,  (s) => { s.mutating = false; });
  },
});

export const { clearSelectedCustomer } = customerSlice.actions;
export default customerSlice.reducer;
