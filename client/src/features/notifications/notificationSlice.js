import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { GET, PATCH, DELETE } from "../../utils/Methods";
import { APIS } from "../../utils/APIS";
import { IDS } from "../../utils/IDS";

export const fetchNotifications = createAsyncThunk(
  "notifications/fetchAll",
  async (params = {}, { rejectWithValue }) => {
    try { return await GET(APIS.Notifications, params); }
    catch (e) { return rejectWithValue(e.response?.data); }
  }
);

export const markAllRead = createAsyncThunk(
  "notifications/markAllRead",
  async (_, { rejectWithValue }) => {
    try { return await PATCH(`${APIS.Notifications}/mark-all-read`); }
    catch (e) { return rejectWithValue(e.response?.data); }
  }
);

export const markOneRead = createAsyncThunk(
  "notifications/markOneRead",
  async (id, { rejectWithValue }) => {
    try { return await PATCH(`${APIS.Notifications}/${id}/read`); }
    catch (e) { return rejectWithValue(e.response?.data); }
  }
);

export const deleteNotification = createAsyncThunk(
  "notifications/deleteOne",
  async (id, { rejectWithValue }) => {
    try { return await DELETE(`${APIS.Notifications}/${id}`); }
    catch (e) { return rejectWithValue(e.response?.data); }
  }
);

const notificationSlice = createSlice({
  name: "notifications",
  initialState: {
    list:          [],
    total:         0,
    total_unread:  0,
    status:        IDS.SLICESTATUS.Idle,
    error:         null,
  },
  reducers: {
    // Optimistically mark all as read in UI immediately
    markAllReadLocal: (s) => {
      s.list         = s.list.map((n) => ({ ...n, is_read: true }));
      s.total_unread = 0;
    },
    // Optimistically mark one as read
    markOneReadLocal: (s, a) => {
      const n = s.list.find((n) => n._id === a.payload);
      if (n && !n.is_read) {
        n.is_read      = true;
        s.total_unread = Math.max(0, s.total_unread - 1);
      }
    },
    // Optimistically remove one from the list
    deleteNotificationLocal: (s, a) => {
      const target = s.list.find((n) => n._id === a.payload);
      if (target && !target.is_read) s.total_unread = Math.max(0, s.total_unread - 1);
      s.list  = s.list.filter((n) => n._id !== a.payload);
      s.total = Math.max(0, s.total - 1);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending,  (s) => { s.status = IDS.SLICESTATUS.Loading; })
      .addCase(fetchNotifications.rejected, (s, a) => { s.status = IDS.SLICESTATUS.Failed; s.error = a.payload; })
      .addCase(fetchNotifications.fulfilled, (s, a) => {
        s.status       = IDS.SLICESTATUS.Succeeded;
        s.list         = a.payload?.data?.notifications || [];
        s.total        = a.payload?.data?.total         || 0;
        s.total_unread = a.payload?.data?.total_unread  || 0;
      })
      .addCase(markAllRead.fulfilled, (s) => {
        s.list         = s.list.map((n) => ({ ...n, is_read: true }));
        s.total_unread = 0;
      })
      .addCase(markOneRead.fulfilled, (s, a) => {
        const id = a.meta.arg;
        const n  = s.list.find((n) => n._id === id);
        if (n && !n.is_read) {
          n.is_read      = true;
          s.total_unread = Math.max(0, s.total_unread - 1);
        }
      });
  },
});

export const { markAllReadLocal, markOneReadLocal, deleteNotificationLocal } = notificationSlice.actions;
export default notificationSlice.reducer;
