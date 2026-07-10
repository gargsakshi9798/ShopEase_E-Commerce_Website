import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { GET } from "../../utils/Methods";
import { APIS } from "../../utils/APIS";
import { IDS } from "../../utils/IDS";

export const fetchDashboardStats = createAsyncThunk(
  "dashboard/fetchStats",
  async (_, { rejectWithValue }) => {
    try {
      return await GET(APIS.Dashboard);
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState: {
    data: null,
    status: IDS.SLICESTATUS.Idle,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        state.status = IDS.SLICESTATUS.Loading;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.status = IDS.SLICESTATUS.Succeeded;
        state.data = action.payload?.data;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.status = IDS.SLICESTATUS.Failed;
        state.error = action.payload;
      });
  },
});

export default dashboardSlice.reducer;
