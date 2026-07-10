import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { GET, PATCH } from "../../utils/Methods";
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
      });
  },
});

export const { markAllReadLocal } = notificationSlice.actions;
export default notificationSlice.reducer;
