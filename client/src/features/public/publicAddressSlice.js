import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { GET, POST, PUT, DELETE, PATCH } from "../../utils/Methods";
import { APIS } from "../../utils/APIS";

export const fetchAddresses = createAsyncThunk(
  "publicAddress/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      return await GET(APIS.Customer.Address);
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Failed to fetch addresses" });
    }
  }
);

export const addAddress = createAsyncThunk(
  "publicAddress/add",
  async (data, { rejectWithValue }) => {
    try {
      return await POST(APIS.Customer.Address, data);
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Failed to add address" });
    }
  }
);

export const updateAddress = createAsyncThunk(
  "publicAddress/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await PUT(`${APIS.Customer.Address}/${id}`, data);
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Failed to update address" });
    }
  }
);

export const deleteAddress = createAsyncThunk(
  "publicAddress/delete",
  async (id, { rejectWithValue }) => {
    try {
      await DELETE(`${APIS.Customer.Address}/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Failed to delete address" });
    }
  }
);

export const setDefaultAddress = createAsyncThunk(
  "publicAddress/setDefault",
  async (id, { rejectWithValue }) => {
    try {
      await PATCH(`${APIS.Customer.Address}/${id}/default`, {});
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Failed to set default" });
    }
  }
);

const publicAddressSlice = createSlice({
  name: "publicAddress",
  initialState: {
    addresses: [],
    status: "idle",
    actionStatus: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAddresses.pending, (state) => { state.status = "loading"; state.error = null; })
      .addCase(fetchAddresses.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.addresses = action.payload?.data ?? [];
      })
      .addCase(fetchAddresses.rejected, (state, action) => { state.status = "failed"; state.error = action.payload; })
      // Add
      .addCase(addAddress.fulfilled, (state, action) => {
        if (action.payload?.data) state.addresses.unshift(action.payload.data);
      })
      // Update
      .addCase(updateAddress.fulfilled, (state, action) => {
        const updated = action.payload?.data;
        if (updated) {
          const idx = state.addresses.findIndex((a) => a._id === updated._id);
          if (idx >= 0) state.addresses[idx] = updated;
        }
      })
      // Delete
      .addCase(deleteAddress.fulfilled, (state, action) => {
        state.addresses = state.addresses.filter((a) => a._id !== action.payload);
      })
      // Set Default
      .addCase(setDefaultAddress.fulfilled, (state, action) => {
        state.addresses = state.addresses.map((a) => ({
          ...a,
          is_default: a._id === action.payload,
        }));
      });
  },
});

export default publicAddressSlice.reducer;
