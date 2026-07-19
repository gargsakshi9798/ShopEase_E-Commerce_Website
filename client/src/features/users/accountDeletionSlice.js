import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosClient from "../../utils/ApiInstance";
import { APIS } from "../../utils/APIS";

// ── Thunks ────────────────────────────────────────────────────────────────────

/** List all deletion requests (admin/employee/superadmin) */
export const fetchDeletionRequests = createAsyncThunk(
  "accountDeletion/fetchAll",
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await axiosClient.get(APIS.AdminAccountDeletion.List, { params });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Failed to fetch requests" });
    }
  }
);

/** Fetch stats (counts by status) */
export const fetchDeletionStats = createAsyncThunk(
  "accountDeletion/fetchStats",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosClient.get(APIS.AdminAccountDeletion.Stats);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Failed to fetch stats" });
    }
  }
);

/** Fetch single request by ID */
export const fetchDeletionRequestById = createAsyncThunk(
  "accountDeletion/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await axiosClient.get(APIS.AdminAccountDeletion.ById(id));
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Failed to fetch request" });
    }
  }
);

/** Employee: review (forward or reject) */
export const reviewDeletionRequest = createAsyncThunk(
  "accountDeletion/review",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await axiosClient.patch(APIS.AdminAccountDeletion.Review(id), data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Review action failed" });
    }
  }
);

/** Admin / SuperAdmin: approve or reject */
export const decideDeletionRequest = createAsyncThunk(
  "accountDeletion/decide",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await axiosClient.patch(APIS.AdminAccountDeletion.Decide(id), data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Decision action failed" });
    }
  }
);

/** SuperAdmin: force hard-delete */
export const forceDeleteAccount = createAsyncThunk(
  "accountDeletion/forceDelete",
  async ({ id, data = {} }, { rejectWithValue }) => {
    try {
      const res = await axiosClient.delete(APIS.AdminAccountDeletion.ForceDelete(id), { data });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Force delete failed" });
    }
  }
);

// ── Slice ─────────────────────────────────────────────────────────────────────

const accountDeletionSlice = createSlice({
  name: "accountDeletion",
  initialState: {
    // List
    list:          [],
    total:         0,
    current_page:  1,
    total_pages:   1,
    listStatus:    "idle",   // idle | loading | succeeded | failed

    // Stats
    stats:         { pending: 0, reviewed: 0, approved: 0, rejected: 0, deleted: 0, total: 0 },
    statsStatus:   "idle",

    // Selected (detail view)
    selected:          null,
    customerSummary:   null,
    selectedStatus:    "idle",

    // Mutation status (review / decide / force-delete)
    mutating:      false,

    error:         null,
  },
  reducers: {
    clearSelected(state) {
      state.selected        = null;
      state.customerSummary = null;
      state.selectedStatus  = "idle";
    },
    clearError(state) { state.error = null; },
  },
  extraReducers: (builder) => {

    // ── fetchDeletionRequests ────────────────────────────────────────────────
    builder
      .addCase(fetchDeletionRequests.pending,   (state) => { state.listStatus = "loading"; state.error = null; })
      .addCase(fetchDeletionRequests.fulfilled, (state, { payload }) => {
        state.listStatus   = "succeeded";
        const d            = payload?.data || {};
        state.list         = d.data        || [];
        state.total        = d.total       || 0;
        state.current_page = d.current_page || 1;
        state.total_pages  = d.total_pages  || 1;
      })
      .addCase(fetchDeletionRequests.rejected,  (state, { payload }) => {
        state.listStatus = "failed";
        state.error      = payload?.message || "Failed";
      });

    // ── fetchDeletionStats ───────────────────────────────────────────────────
    builder
      .addCase(fetchDeletionStats.pending,   (state) => { state.statsStatus = "loading"; })
      .addCase(fetchDeletionStats.fulfilled, (state, { payload }) => {
        state.statsStatus = "succeeded";
        state.stats       = payload?.data || state.stats;
      })
      .addCase(fetchDeletionStats.rejected,  (state) => { state.statsStatus = "failed"; });

    // ── fetchDeletionRequestById ─────────────────────────────────────────────
    builder
      .addCase(fetchDeletionRequestById.pending,   (state) => { state.selectedStatus = "loading"; state.error = null; })
      .addCase(fetchDeletionRequestById.fulfilled, (state, { payload }) => {
        state.selectedStatus  = "succeeded";
        state.selected        = payload?.data?.request        || null;
        state.customerSummary = payload?.data?.customer_summary || null;
      })
      .addCase(fetchDeletionRequestById.rejected,  (state, { payload }) => {
        state.selectedStatus = "failed";
        state.error          = payload?.message || "Failed";
      });

    // ── reviewDeletionRequest ────────────────────────────────────────────────
    builder
      .addCase(reviewDeletionRequest.pending,   (state) => { state.mutating = true; state.error = null; })
      .addCase(reviewDeletionRequest.fulfilled, (state, { payload }) => {
        state.mutating = false;
        // Update in list if present
        const updated = payload?.data;
        if (updated) {
          const idx = state.list.findIndex((r) => r._id === updated._id);
          if (idx !== -1) state.list[idx] = updated;
          if (state.selected?._id === updated._id) state.selected = updated;
        }
      })
      .addCase(reviewDeletionRequest.rejected,  (state, { payload }) => {
        state.mutating = false;
        state.error    = payload?.message || "Failed";
      });

    // ── decideDeletionRequest ────────────────────────────────────────────────
    builder
      .addCase(decideDeletionRequest.pending,   (state) => { state.mutating = true; state.error = null; })
      .addCase(decideDeletionRequest.fulfilled, (state, { payload }) => {
        state.mutating = false;
        const updated  = payload?.data;
        if (updated) {
          const idx = state.list.findIndex((r) => r._id === updated._id);
          if (idx !== -1) state.list[idx] = updated;
          if (state.selected?._id === updated._id) state.selected = updated;
        }
      })
      .addCase(decideDeletionRequest.rejected,  (state, { payload }) => {
        state.mutating = false;
        state.error    = payload?.message || "Failed";
      });

    // ── forceDeleteAccount ───────────────────────────────────────────────────
    builder
      .addCase(forceDeleteAccount.pending,   (state) => { state.mutating = true; state.error = null; })
      .addCase(forceDeleteAccount.fulfilled, (state, { meta }) => {
        state.mutating = false;
        // Remove from list
        state.list     = state.list.filter((r) => r._id !== meta.arg.id);
        state.selected = null;
      })
      .addCase(forceDeleteAccount.rejected,  (state, { payload }) => {
        state.mutating = false;
        state.error    = payload?.message || "Failed";
      });
  },
});

export const { clearSelected, clearError } = accountDeletionSlice.actions;
export default accountDeletionSlice.reducer;
