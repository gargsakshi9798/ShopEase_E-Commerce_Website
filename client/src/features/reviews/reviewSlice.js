import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { GET, PATCH, DELETE } from "../../utils/Methods";
import { APIS } from "../../utils/APIS";
import { IDS } from "../../utils/IDS";

export const fetchReviews = createAsyncThunk("review/fetchAll", async (params = {}, { rejectWithValue }) => {
  try { return await GET(APIS.Reviews, params); }
  catch (e) { return rejectWithValue(e.response?.data); }
});

export const approveReview = createAsyncThunk("review/approve", async ({ id, is_approved }, { rejectWithValue }) => {
  try { return await PATCH(`${APIS.Reviews}/${id}/approve`, { is_approved }); }
  catch (e) { return rejectWithValue(e.response?.data); }
});

export const deleteReview = createAsyncThunk("review/delete", async (id, { rejectWithValue }) => {
  try { return await DELETE(`${APIS.Reviews}/${id}`); }
  catch (e) { return rejectWithValue(e.response?.data); }
});

const reviewSlice = createSlice({
  name: "review",
  initialState: { list: [], total: 0, status: IDS.SLICESTATUS.Idle, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchReviews.pending, (s) => { s.status = IDS.SLICESTATUS.Loading; })
      .addCase(fetchReviews.fulfilled, (s, a) => {
        s.status = IDS.SLICESTATUS.Succeeded;
        s.list = a.payload?.data?.data || [];
        s.total = a.payload?.data?.total || 0;
      })
      .addCase(fetchReviews.rejected, (s, a) => { s.status = IDS.SLICESTATUS.Failed; s.error = a.payload; });
  },
});

export default reviewSlice.reducer;
