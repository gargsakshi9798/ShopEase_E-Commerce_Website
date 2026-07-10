import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { GET, PUT_FORM } from "../../utils/Methods";
import { APIS } from "../../utils/APIS";

export const fetchCustomerProfile = createAsyncThunk(
  "publicProfile/fetch",
  async (_, { rejectWithValue }) => {
    try {
      return await GET(APIS.Customer.Profile);
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Failed to fetch profile" });
    }
  }
);

export const updateCustomerProfile = createAsyncThunk(
  "publicProfile/update",
  async (formData, { rejectWithValue }) => {
    try {
      return await PUT_FORM(APIS.Customer.Profile, formData);
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Failed to update profile" });
    }
  }
);

const publicProfileSlice = createSlice({
  name: "publicProfile",
  initialState: {
    profile: null,
    status: "idle",
    updateStatus: "idle",
    error: null,
  },
  reducers: {
    clearProfileStatus(state) {
      state.updateStatus = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCustomerProfile.pending, (state) => { state.status = "loading"; })
      .addCase(fetchCustomerProfile.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.profile = action.payload?.data ?? null;
      })
      .addCase(fetchCustomerProfile.rejected, (state, action) => { state.status = "failed"; state.error = action.payload; })
      .addCase(updateCustomerProfile.pending, (state) => { state.updateStatus = "loading"; })
      .addCase(updateCustomerProfile.fulfilled, (state, action) => {
        state.updateStatus = "succeeded";
        if (action.payload?.data) state.profile = action.payload.data;
      })
      .addCase(updateCustomerProfile.rejected, (state, action) => { state.updateStatus = "failed"; state.error = action.payload; });
  },
});

export const { clearProfileStatus } = publicProfileSlice.actions;
export default publicProfileSlice.reducer;
