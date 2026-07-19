import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosClient from "../../utils/ApiInstance";
import { APIS } from "../../utils/APIS";

// ── Thunks ────────────────────────────────────────────────────────────────────

/** Customer submits a new deletion request */
export const submitDeletionRequest = createAsyncThunk(
  "publicAccountDeletion/submit",
  async (data, { rejectWithValue }) => {
    try {
      const res = await axiosClient.post(APIS.AccountDeletion.Submit, data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Failed to submit request" });
    }
  }
);

/** Customer fetches their own active request status */
export const fetchMyDeletionRequest = createAsyncThunk(
  "publicAccountDeletion/fetchMy",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosClient.get(APIS.AccountDeletion.MyRequest);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Failed to fetch request" });
    }
  }
);

/** Customer cancels their own pending request */
export const cancelDeletionRequest = createAsyncThunk(
  "publicAccountDeletion/cancel",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosClient.delete(APIS.AccountDeletion.Cancel);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Failed to cancel request" });
    }
  }
);

// ── Slice ─────────────────────────────────────────────────────────────────────

const publicAccountDeletionSlice = createSlice({
  name: "publicAccountDeletion",
  initialState: {
    // The customer's active request (null = none)
    myRequest:      null,
    fetchStatus:    "idle",   // idle | loading | succeeded | failed
    submitStatus:   "idle",   // idle | loading | succeeded | failed
    cancelStatus:   "idle",   // idle | loading | succeeded | failed
    error:          null,
  },
  reducers: {
    resetSubmitStatus(state) {
      state.submitStatus = "idle";
      state.error        = null;
    },
    clearMyRequest(state) {
      state.myRequest   = null;
      state.fetchStatus = "idle";
    },
  },
  extraReducers: (builder) => {
    // ── fetchMyDeletionRequest ──────────────────────────────────────────────
    builder
      .addCase(fetchMyDeletionRequest.pending,   (state) => { state.fetchStatus = "loading"; state.error = null; })
      .addCase(fetchMyDeletionRequest.fulfilled, (state, { payload }) => {
        state.fetchStatus = "succeeded";
        state.myRequest   = payload?.data ?? null;
      })
      .addCase(fetchMyDeletionRequest.rejected,  (state, { payload }) => {
        state.fetchStatus = "failed";
        state.error       = payload?.message || "Failed";
      });

    // ── submitDeletionRequest ──────────────────────────────────────────────
    builder
      .addCase(submitDeletionRequest.pending,   (state) => { state.submitStatus = "loading"; state.error = null; })
      .addCase(submitDeletionRequest.fulfilled, (state, { payload }) => {
        state.submitStatus = "succeeded";
        // We don't have the full request doc here, just request_id
        // trigger a re-fetch from the component after success
      })
      .addCase(submitDeletionRequest.rejected,  (state, { payload }) => {
        state.submitStatus = "failed";
        state.error        = payload?.message || "Failed";
      });

    // ── cancelDeletionRequest ──────────────────────────────────────────────
    builder
      .addCase(cancelDeletionRequest.pending,   (state) => { state.cancelStatus = "loading"; state.error = null; })
      .addCase(cancelDeletionRequest.fulfilled, (state) => {
        state.cancelStatus = "succeeded";
        state.myRequest    = null;
      })
      .addCase(cancelDeletionRequest.rejected,  (state, { payload }) => {
        state.cancelStatus = "failed";
        state.error        = payload?.message || "Failed";
      });
  },
});

export const { resetSubmitStatus, clearMyRequest } = publicAccountDeletionSlice.actions;
export default publicAccountDeletionSlice.reducer;
