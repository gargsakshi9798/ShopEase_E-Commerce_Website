import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { GET, POST, PATCH } from "../../utils/Methods";
import { APIS } from "../../utils/APIS";

export const fetchAdminGiftCards = createAsyncThunk(
  "adminGiftCard/fetchAll",
  async (params = {}, { rejectWithValue }) => {
    try { return await GET(APIS.AdminGiftCards.List, params); }
    catch (err) { return rejectWithValue(err.response?.data || { message: "Failed to fetch" }); }
  }
);
export const fetchAdminGiftCardStats = createAsyncThunk(
  "adminGiftCard/fetchStats",
  async (_, { rejectWithValue }) => {
    try { return await GET(APIS.AdminGiftCards.Stats); }
    catch (err) { return rejectWithValue(err.response?.data || {}); }
  }
);
export const fetchAdminGiftCardById = createAsyncThunk(
  "adminGiftCard/fetchById",
  async (id, { rejectWithValue }) => {
    try { return await GET(APIS.AdminGiftCards.ById(id)); }
    catch (err) { return rejectWithValue(err.response?.data || {}); }
  }
);
export const reviewGiftCard = createAsyncThunk(
  "adminGiftCard/review",
  async ({ id, note }, { rejectWithValue }) => {
    try { return await PATCH(APIS.AdminGiftCards.Review(id), { note }); }
    catch (err) { return rejectWithValue(err.response?.data || { message: "Review failed" }); }
  }
);
export const approveGiftCard = createAsyncThunk(
  "adminGiftCard/approve",
  async ({ id, note }, { rejectWithValue }) => {
    try { return await PATCH(APIS.AdminGiftCards.Approve(id), { note }); }
    catch (err) { return rejectWithValue(err.response?.data || { message: "Approve failed" }); }
  }
);
export const rejectGiftCard = createAsyncThunk(
  "adminGiftCard/reject",
  async ({ id, note }, { rejectWithValue }) => {
    try { return await PATCH(APIS.AdminGiftCards.Reject(id), { note }); }
    catch (err) { return rejectWithValue(err.response?.data || { message: "Reject failed" }); }
  }
);
export const issueGiftCard = createAsyncThunk(
  "adminGiftCard/issue",
  async (data, { rejectWithValue }) => {
    try { return await POST(APIS.AdminGiftCards.Issue, data); }
    catch (err) { return rejectWithValue(err.response?.data || { message: "Issue failed" }); }
  }
);
export const cancelGiftCard = createAsyncThunk(
  "adminGiftCard/cancel",
  async (id, { rejectWithValue }) => {
    try { return await PATCH(APIS.AdminGiftCards.Cancel(id), {}); }
    catch (err) { return rejectWithValue(err.response?.data || { message: "Cancel failed" }); }
  }
);

const adminGiftCardSlice = createSlice({
  name: "adminGiftCard",
  initialState: {
    cards: [], total: 0, totalPages: 1, currentPage: 1,
    stats: null, detail: null,
    status: "idle", detailStatus: "idle", actionStatus: "idle",
    error: null,
  },
  reducers: {
    clearDetail(state) { state.detail = null; state.detailStatus = "idle"; },
    resetActionStatus(state) { state.actionStatus = "idle"; state.error = null; },
  },
  extraReducers: (b) => {
    b
      .addCase(fetchAdminGiftCards.pending,   (s) => { s.status = "loading"; })
      .addCase(fetchAdminGiftCards.fulfilled, (s, a) => {
        s.status = "succeeded";
        const d = a.payload?.data;
        s.cards = d?.data ?? []; s.total = d?.total ?? 0;
        s.totalPages = d?.total_pages ?? 1; s.currentPage = d?.current_page ?? 1;
      })
      .addCase(fetchAdminGiftCards.rejected,  (s, a) => { s.status = "failed"; s.error = a.payload; })
      .addCase(fetchAdminGiftCardStats.fulfilled, (s, a) => { s.stats = a.payload?.data ?? null; })
      .addCase(fetchAdminGiftCardById.pending,   (s) => { s.detailStatus = "loading"; })
      .addCase(fetchAdminGiftCardById.fulfilled, (s, a) => { s.detailStatus = "succeeded"; s.detail = a.payload?.data ?? null; })
      .addCase(fetchAdminGiftCardById.rejected,  (s) => { s.detailStatus = "failed"; })
      .addMatcher(
        (action) => ["adminGiftCard/review", "adminGiftCard/approve", "adminGiftCard/reject",
          "adminGiftCard/issue", "adminGiftCard/cancel"].some(t => action.type.startsWith(t)),
        (s, a) => {
          if (a.type.endsWith("/pending"))   { s.actionStatus = "loading"; s.error = null; }
          if (a.type.endsWith("/fulfilled")) { s.actionStatus = "succeeded"; }
          if (a.type.endsWith("/rejected"))  { s.actionStatus = "failed"; s.error = a.payload; }
        }
      );
  },
});

export const { clearDetail, resetActionStatus } = adminGiftCardSlice.actions;
export default adminGiftCardSlice.reducer;
