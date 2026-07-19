import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { GET, POST, PATCH, DELETE } from "../../utils/Methods";
import { APIS } from "../../utils/APIS";
import { IDS } from "../../utils/IDS";

const S = APIS.Support;

// ── Tickets ───────────────────────────────────────────────────────────────────

/**
 * fetchTickets
 * - Employee: server already scopes to assigned_to=their ID via the JWT role.
 *   No extra param needed — the server reads req.user.user for employees.
 * - Admin / SuperAdmin: pass any filters the UI provides.
 */
export const fetchTickets = createAsyncThunk(
  "support/fetchTickets",
  async (params = {}, { rejectWithValue }) => {
    try { return await GET(S.Tickets, params); }
    catch (e) { return rejectWithValue(e.response?.data); }
  }
);

export const fetchTicketStats = createAsyncThunk(
  "support/fetchTicketStats",
  async (_, { rejectWithValue }) => {
    try { return await GET(S.TicketStats); }
    catch (e) { return rejectWithValue(e.response?.data); }
  }
);

export const fetchTicketById = createAsyncThunk(
  "support/fetchTicketById",
  async (id, { rejectWithValue }) => {
    try { return await GET(S.TicketById(id)); }
    catch (e) { return rejectWithValue(e.response?.data); }
  }
);

export const updateTicketStatus = createAsyncThunk(
  "support/updateTicketStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try { return await PATCH(S.TicketStatus(id), { status }); }
    catch (e) { return rejectWithValue(e.response?.data); }
  }
);

export const updateTicketPriority = createAsyncThunk(
  "support/updateTicketPriority",
  async ({ id, priority }, { rejectWithValue }) => {
    try { return await PATCH(S.TicketPriority(id), { priority }); }
    catch (e) { return rejectWithValue(e.response?.data); }
  }
);

/**
 * assignTicket
 * Admin/SuperAdmin only — server enforces this; slice just calls the endpoint.
 */
export const assignTicket = createAsyncThunk(
  "support/assignTicket",
  async ({ id, employee_id }, { rejectWithValue }) => {
    try { return await PATCH(S.TicketAssign(id), { employee_id }); }
    catch (e) { return rejectWithValue(e.response?.data); }
  }
);

export const replyToTicket = createAsyncThunk(
  "support/replyToTicket",
  async ({ id, message }, { rejectWithValue }) => {
    try { return await POST(S.TicketReply(id), { message }); }
    catch (e) { return rejectWithValue(e.response?.data); }
  }
);

/**
 * deleteTicket
 * SuperAdmin only — server enforces; slice calls the endpoint.
 */
export const deleteTicket = createAsyncThunk(
  "support/deleteTicket",
  async (id, { rejectWithValue }) => {
    try { return await DELETE(S.TicketById(id)); }
    catch (e) { return rejectWithValue(e.response?.data); }
  }
);

// ── Contact Messages ──────────────────────────────────────────────────────────
export const fetchMessages = createAsyncThunk("support/fetchMessages", async (params = {}, { rejectWithValue }) => {
  try { return await GET(S.Messages, params); } catch (e) { return rejectWithValue(e.response?.data); }
});

export const fetchMessageById = createAsyncThunk("support/fetchMessageById", async (id, { rejectWithValue }) => {
  try { return await GET(S.MessageById(id)); } catch (e) { return rejectWithValue(e.response?.data); }
});

export const replyToMessage = createAsyncThunk("support/replyToMessage", async ({ id, reply_message, admin_notes }, { rejectWithValue }) => {
  try { return await POST(S.MessageReply(id), { reply_message, admin_notes }); } catch (e) { return rejectWithValue(e.response?.data); }
});

export const archiveMessage = createAsyncThunk("support/archiveMessage", async (id, { rejectWithValue }) => {
  try { return await PATCH(S.MessageArchive(id)); } catch (e) { return rejectWithValue(e.response?.data); }
});

export const deleteMessage = createAsyncThunk("support/deleteMessage", async (id, { rejectWithValue }) => {
  try { return await DELETE(S.MessageById(id)); } catch (e) { return rejectWithValue(e.response?.data); }
});

// ── Slice ─────────────────────────────────────────────────────────────────────
const makeList = () => ({ list: [], total: 0, current_page: 1, total_pages: 1 });

const supportSlice = createSlice({
  name: "support",
  initialState: {
    tickets:         makeList(),
    messages:        makeList(),
    ticketStats:     { byStatus: [], byPriority: [] },
    selectedTicket:  null,
    selectedMessage: null,
    status:          IDS.SLICESTATUS.Idle,
    mutating:        false,
    // Permission-denied errors (403) stored separately so UI can show
    // a specific "access denied" message instead of a generic error toast
    permissionError: null,
    error:           null,
  },
  reducers: {
    clearSelectedTicket:  (s) => { s.selectedTicket  = null; },
    clearSelectedMessage: (s) => { s.selectedMessage = null; },
    clearPermissionError: (s) => { s.permissionError = null; },
  },
  extraReducers: (builder) => {
    const loading = (s) => { s.status = IDS.SLICESTATUS.Loading; s.permissionError = null; };
    const failed  = (s, a) => {
      s.status   = IDS.SLICESTATUS.Failed;
      // Surface 403 Forbidden separately
      if (a.payload?.statusCode === 403 || a.payload?.status === 403) {
        s.permissionError = a.payload?.message || "Access denied";
      } else {
        s.error = a.payload;
      }
    };
    const mapList = (p) => ({
      list:         p?.data?.data        || [],
      total:        p?.data?.total        || 0,
      current_page: p?.data?.current_page || 1,
      total_pages:  p?.data?.total_pages  || 1,
    });

    builder
      .addCase(fetchTickets.pending,    loading)
      .addCase(fetchTickets.rejected,   failed)
      .addCase(fetchTickets.fulfilled,  (s, a) => { s.status = IDS.SLICESTATUS.Succeeded; s.tickets  = mapList(a.payload); })
      .addCase(fetchMessages.pending,   loading)
      .addCase(fetchMessages.rejected,  failed)
      .addCase(fetchMessages.fulfilled, (s, a) => { s.status = IDS.SLICESTATUS.Succeeded; s.messages = mapList(a.payload); })
      .addCase(fetchTicketStats.fulfilled, (s, a) => { s.ticketStats = a.payload?.data || { byStatus: [], byPriority: [] }; })
      .addCase(fetchTicketById.fulfilled,  (s, a) => { s.selectedTicket  = a.payload?.data || null; })
      .addCase(fetchMessageById.fulfilled, (s, a) => { s.selectedMessage = a.payload?.data || null; })
      // Ticket mutations — track mutating + update selected in-place
      .addCase(updateTicketStatus.pending,   (s) => { s.mutating = true; })
      .addCase(updateTicketStatus.fulfilled, (s, a) => {
        s.mutating = false;
        const d = a.payload?.data;
        if (d) {
          if (s.selectedTicket?._id === d._id) s.selectedTicket = d;
          s.tickets.list = s.tickets.list.map((t) => t._id === d._id ? { ...t, status: d.status } : t);
        }
      })
      .addCase(updateTicketStatus.rejected,  (s, a) => { s.mutating = false; s.permissionError = a.payload?.message || null; })
      .addCase(updateTicketPriority.pending,   (s) => { s.mutating = true; })
      .addCase(updateTicketPriority.fulfilled, (s, a) => {
        s.mutating = false;
        const d = a.payload?.data;
        if (d) {
          if (s.selectedTicket?._id === d._id) s.selectedTicket = d;
          s.tickets.list = s.tickets.list.map((t) => t._id === d._id ? { ...t, priority: d.priority } : t);
        }
      })
      .addCase(updateTicketPriority.rejected,  (s, a) => { s.mutating = false; s.permissionError = a.payload?.message || null; })
      .addCase(assignTicket.pending,   (s) => { s.mutating = true; })
      .addCase(assignTicket.fulfilled, (s, a) => {
        s.mutating = false;
        const d = a.payload?.data;
        if (d && s.selectedTicket?._id === d._id) s.selectedTicket = d;
      })
      .addCase(assignTicket.rejected,  (s, a) => { s.mutating = false; s.permissionError = a.payload?.message || null; })
      .addCase(replyToTicket.pending,   (s) => { s.mutating = true; })
      .addCase(replyToTicket.fulfilled, (s, a) => {
        s.mutating = false;
        const d = a.payload?.data;
        if (d && s.selectedTicket?._id === d._id) s.selectedTicket = d;
      })
      .addCase(replyToTicket.rejected,  (s, a) => { s.mutating = false; s.permissionError = a.payload?.message || null; })
      .addCase(deleteTicket.pending,    (s) => { s.mutating = true; })
      .addCase(deleteTicket.fulfilled,  (s, a) => {
        s.mutating = false;
        // Remove from list optimistically
        if (a.meta?.arg) s.tickets.list = s.tickets.list.filter((t) => t._id !== a.meta.arg);
      })
      .addCase(deleteTicket.rejected,   (s, a) => { s.mutating = false; s.permissionError = a.payload?.message || null; })
      // Message mutations
      .addCase(replyToMessage.pending,   (s) => { s.mutating = true; })
      .addCase(replyToMessage.fulfilled, (s, a) => {
        s.mutating = false;
        const d = a.payload?.data;
        if (d && s.selectedMessage?._id === d._id) s.selectedMessage = d;
      })
      .addCase(replyToMessage.rejected,  (s) => { s.mutating = false; })
      .addCase(archiveMessage.pending,   (s) => { s.mutating = true; })
      .addCase(archiveMessage.fulfilled, (s, a) => {
        s.mutating = false;
        const d = a.payload?.data;
        if (d) {
          if (s.selectedMessage?._id === d._id) s.selectedMessage = d;
          s.messages.list = s.messages.list.map((m) => m._id === d._id ? { ...m, status: "archived" } : m);
        }
      })
      .addCase(archiveMessage.rejected,  (s) => { s.mutating = false; })
      .addCase(deleteMessage.pending,    (s) => { s.mutating = true; })
      .addCase(deleteMessage.fulfilled,  (s, a) => {
        s.mutating = false;
        if (a.meta?.arg) s.messages.list = s.messages.list.filter((m) => m._id !== a.meta.arg);
      })
      .addCase(deleteMessage.rejected,   (s, a) => { s.mutating = false; s.permissionError = a.payload?.message || null; });
  },
});

export const { clearSelectedTicket, clearSelectedMessage, clearPermissionError } = supportSlice.actions;
export default supportSlice.reducer;
