import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { GET, POST, POST_FORM, PATCH } from "../../utils/Methods";
import { APIS } from "../../utils/APIS";
import { IDS } from "../../utils/IDS";

const S = APIS.Customer.Support;

// ── Thunks ────────────────────────────────────────────────────────────────────

export const createTicket = createAsyncThunk(
  "publicSupport/create",
  async (data, { rejectWithValue }) => {
    try {
      // data may be FormData (with attachments) or a plain object
      if (data instanceof FormData) {
        return await POST_FORM(S.Tickets, data);
      }
      return await POST(S.Tickets, data);
    }
    catch (e) { return rejectWithValue(e.response?.data); }
  }
);

export const fetchMyTickets = createAsyncThunk(
  "publicSupport/fetchAll",
  async (params = {}, { rejectWithValue }) => {
    try { return await GET(S.Tickets, params); }
    catch (e) { return rejectWithValue(e.response?.data); }
  }
);

export const fetchMyTicketById = createAsyncThunk(
  "publicSupport/fetchById",
  async (id, { rejectWithValue }) => {
    try { return await GET(S.TicketById(id)); }
    catch (e) { return rejectWithValue(e.response?.data); }
  }
);

export const replyToMyTicket = createAsyncThunk(
  "publicSupport/reply",
  async ({ id, message }, { rejectWithValue }) => {
    try { return await POST(S.TicketReply(id), { message }); }
    catch (e) { return rejectWithValue(e.response?.data); }
  }
);

export const closeMyTicket = createAsyncThunk(
  "publicSupport/close",
  async (id, { rejectWithValue }) => {
    try { return await PATCH(S.TicketClose(id)); }
    catch (e) { return rejectWithValue(e.response?.data); }
  }
);

// ── Slice ─────────────────────────────────────────────────────────────────────

const publicSupportSlice = createSlice({
  name: "publicSupport",
  initialState: {
    list:         [],
    total:        0,
    current_page: 1,
    total_pages:  1,
    selected:     null,
    status:       IDS.SLICESTATUS.Idle,
    mutating:     false,
    error:        null,
  },
  reducers: {
    clearSelected: (s) => { s.selected = null; },
  },
  extraReducers: (builder) => {
    builder
      // list
      .addCase(fetchMyTickets.pending,   (s) => { s.status = IDS.SLICESTATUS.Loading; })
      .addCase(fetchMyTickets.rejected,  (s, a) => { s.status = IDS.SLICESTATUS.Failed; s.error = a.payload; })
      .addCase(fetchMyTickets.fulfilled, (s, a) => {
        s.status       = IDS.SLICESTATUS.Succeeded;
        s.list         = a.payload?.data?.data        || [];
        s.total        = a.payload?.data?.total        || 0;
        s.current_page = a.payload?.data?.current_page || 1;
        s.total_pages  = a.payload?.data?.total_pages  || 1;
      })
      // single
      .addCase(fetchMyTicketById.fulfilled, (s, a) => { s.selected = a.payload?.data || null; })
      // create
      .addCase(createTicket.pending,   (s) => { s.mutating = true; })
      .addCase(createTicket.rejected,  (s) => { s.mutating = false; })
      .addCase(createTicket.fulfilled, (s) => { s.mutating = false; })
      // reply
      .addCase(replyToMyTicket.pending,   (s) => { s.mutating = true; })
      .addCase(replyToMyTicket.rejected,  (s) => { s.mutating = false; })
      .addCase(replyToMyTicket.fulfilled, (s, a) => {
        s.mutating = false;
        if (s.selected && a.payload?.data?._id === s.selected._id) {
          s.selected = a.payload.data;
        }
      })
      // close
      .addCase(closeMyTicket.pending,   (s) => { s.mutating = true; })
      .addCase(closeMyTicket.rejected,  (s) => { s.mutating = false; })
      .addCase(closeMyTicket.fulfilled, (s, a) => {
        s.mutating = false;
        if (s.selected && a.payload?.data?._id === s.selected._id) {
          s.selected = a.payload.data;
        }
        // update status in list too
        if (a.payload?.data) {
          s.list = s.list.map((t) =>
            t._id === a.payload.data._id ? { ...t, status: a.payload.data.status } : t
          );
        }
      });
  },
});

export const { clearSelected } = publicSupportSlice.actions;
export default publicSupportSlice.reducer;
