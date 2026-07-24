import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { GET, PATCH, DELETE } from "../../utils/Methods";
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

export const deleteNotification = createAsyncThunk(
  "publicNotification/deleteOne",
  async (id, { rejectWithValue }) => {
    try {
      await DELETE(`${APIS.Customer.Notifications}/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Failed to delete notification" });
    }
  }
);

export const clearAllNotifications = createAsyncThunk(
  "publicNotification/clearAll",
  async (_, { rejectWithValue }) => {
    try {
      return await DELETE(APIS.Customer.Notifications);
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Failed to clear notifications" });
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
    lastFetched:   null,
  },
  reducers: {
    // Optimistic: mark one read locally before API responds
    markOneReadLocal: (state, action) => {
      const n = state.notifications.find((n) => n._id === action.payload);
      if (n && !n.is_read) {
        n.is_read    = true;
        state.unread = Math.max(0, state.unread - 1);
      }
    },
    // Optimistic: mark all read locally
    markAllReadLocal: (state) => {
      state.notifications.forEach((n) => { n.is_read = true; });
      state.unread = 0;
    },
    // Optimistic: remove one locally before API confirms
    deleteOneLocal: (state, action) => {
      const idx = state.notifications.findIndex((n) => n._id === action.payload);
      if (idx !== -1) {
        if (!state.notifications[idx].is_read) {
          state.unread = Math.max(0, state.unread - 1);
        }
        state.notifications.splice(idx, 1);
        state.total = Math.max(0, state.total - 1);
      }
    },
    // Optimistic: clear all locally
    clearAllLocal: (state) => {
      state.notifications = [];
      state.unread        = 0;
      state.total         = 0;
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
        state.status        = "succeeded";
        const d             = action.payload?.data;
        state.notifications = d?.data        ?? [];
        state.unread        = d?.unread       ?? 0;
        state.total         = d?.total        ?? 0;
        state.totalPages    = d?.total_pages  ?? 1;
        state.currentPage   = d?.current_page ?? 1;
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
      })

      // ── Delete single — confirmed by server ──────────────────────────────
      .addCase(deleteNotification.fulfilled, (state, action) => {
        const idx = state.notifications.findIndex((n) => n._id === action.payload);
        if (idx !== -1) {
          if (!state.notifications[idx].is_read) {
            state.unread = Math.max(0, state.unread - 1);
          }
          state.notifications.splice(idx, 1);
          state.total = Math.max(0, state.total - 1);
        }
      })

      // ── Clear all — confirmed by server ──────────────────────────────────
      .addCase(clearAllNotifications.fulfilled, (state) => {
        state.notifications = [];
        state.unread        = 0;
        state.total         = 0;
      });
  },
});

export const {
  markOneReadLocal,
  markAllReadLocal,
  deleteOneLocal,
  clearAllLocal,
} = publicNotificationSlice.actions;

export default publicNotificationSlice.reducer;
