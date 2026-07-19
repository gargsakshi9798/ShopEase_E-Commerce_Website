import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { GET, PATCH } from "../../utils/Methods";
import { APIS } from "../../utils/APIS";

// ── Thunks ────────────────────────────────────────────────────────────────────

export const fetchCustomerNotifications = createAsyncThunk(
  "publicNotification/fetchAll",
  async (params = {}, { rejectWithValue }) => {
    try {
      return await GET(APIS.Customer.Notifications, params);
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Failed to fetch notifications" });
    }
  }
);

export const markNotificationRead = createAsyncThunk(
  "publicNotification/markRead",
  async (id, { rejectWithValue }) => {
    try {
      await PATCH(`${APIS.Customer.Notifications}/${id}/read`, {});
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Failed to mark as read" });
    }
  }
);

export const markAllNotificationsRead = createAsyncThunk(
  "publicNotification/markAllRead",
  async (_, { rejectWithValue }) => {
    try {
      return await PATCH(`${APIS.Customer.Notifications}/read-all`, {});
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Failed to mark all as read" });
    }
  }
);

// ── Slice ─────────────────────────────────────────────────────────────────────

const publicNotificationSlice = createSlice({
  name: "publicNotification",
  initialState: {
    notifications: [],
    unread:        0,
    total:         0,
    totalPages:    1,
    currentPage:   1,
    status:        "idle",
    error:         null,
    lastFetched:   null,   // ISO timestamp of last successful fetch
  },
  reducers: {
    // Optimistically mark a single notification as read in the UI
    markOneReadLocal: (state, action) => {
      const n = state.notifications.find((n) => n._id === action.payload);
      if (n && !n.is_read) {
        n.is_read  = true;
        state.unread = Math.max(0, state.unread - 1);
      }
    },
    // Optimistically mark all as read in the UI
    markAllReadLocal: (state) => {
      state.notifications.forEach((n) => { n.is_read = true; });
      state.unread = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      // ── Fetch all ────────────────────────────────────────────────────────
      .addCase(fetchCustomerNotifications.pending, (state) => {
        state.status = "loading";
        state.error  = null;
      })
      .addCase(fetchCustomerNotifications.fulfilled, (state, action) => {
        state.status      = "succeeded";
        const d           = action.payload?.data;
        state.notifications = d?.data         ?? [];
        state.unread        = d?.unread        ?? 0;
        state.total         = d?.total         ?? 0;
        state.totalPages    = d?.total_pages   ?? 1;
        state.currentPage   = d?.current_page  ?? 1;
        state.lastFetched   = new Date().toISOString();
      })
      .addCase(fetchCustomerNotifications.rejected, (state, action) => {
        state.status = "failed";
        state.error  = action.payload;
      })

      // ── Mark single read ─────────────────────────────────────────────────
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        const n = state.notifications.find((n) => n._id === action.payload);
        if (n && !n.is_read) {
          n.is_read    = true;
          state.unread = Math.max(0, state.unread - 1);
        }
      })

      // ── Mark all read ────────────────────────────────────────────────────
      .addCase(markAllNotificationsRead.fulfilled, (state) => {
        state.notifications.forEach((n) => { n.is_read = true; });
        state.unread = 0;
      });
  },
});

export const { markOneReadLocal, markAllReadLocal } = publicNotificationSlice.actions;
export default publicNotificationSlice.reducer;
