import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { GET, POST, PATCH, DELETE } from "../../utils/Methods";
import { APIS } from "../../utils/APIS";
import { IDS } from "../../utils/IDS";

const S = APIS.Support;

// ── Tickets ───────────────────────────────────────────────────────────────────
export const fetchTickets = createAsyncThunk("support/fetchTickets", async (params = {}, { rejectWithValue }) => {
  try { return await GET(S.Tickets, params); } catch (e) { return rejectWithValue(e.response?.data); }
});

export const fetchTicketStats = createAsyncThunk("support/fetchTicketStats", async (_, { rejectWithValue }) => {
  try { return await GET(S.TicketStats); } catch (e) { return rejectWithValue(e.response?.data); }
});

export const fetchTicketById = createAsyncThunk("support/fetchTicketById", async (id, { rejectWithValue }) => {
  try { return await GET(S.TicketById(id)); } catch (e) { return rejectWithValue(e.response?.data); }
});

export const updateTicketStatus = createAsyncThunk("support/updateTicketStatus", async ({ id, status }, { rejectWithValue }) => {
  try { return await PATCH(S.TicketStatus(id), { status }); } catch (e) { return rejectWithValue(e.response?.data); }
});

export const updateTicketPriority = createAsyncThunk("support/updateTicketPriority", async ({ id, priority }, { rejectWithValue }) => {
  try { return await PATCH(S.TicketPriority(id), { priority }); } catch (e) { return rejectWithValue(e.response?.data); }
});

export const assignTicket = createAsyncThunk("support/assignTicket", async ({ id, employee_id }, { rejectWithValue }) => {
  try { return await PATCH(S.TicketAssign(id), { employee_id }); } catch (e) { return rejectWithValue(e.response?.data); }
});

export const replyToTicket = createAsyncThunk("support/replyToTicket", async ({ id, message }, { rejectWithValue }) => {
  try { return await POST(S.TicketReply(id), { message }); } catch (e) { return rejectWithValue(e.response?.data); }
});

export const deleteTicket = createAsyncThunk("support/deleteTicket", async (id, { rejectWithValue }) => {
  try { return await DELETE(S.TicketById(id)); } catch (e) { return rejectWithValue(e.response?.data); }
});

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
    tickets:        makeList(),
    messages:       makeList(),
    ticketStats:    { byStatus: [], byPriority: [] },
    selectedTicket: null,
    selectedMessage:null,
    status:         IDS.SLICESTATUS.Idle,
    mutating:       false,
    error:          null,
  },
  reducers: {
    clearSelectedTicket:  (s) => { s.selectedTicket  = null; },
    clearSelectedMessage: (s) => { s.selectedMessage = null; },
  },
  extraReducers: (builder) => {
    const loading = (s) => { s.status = IDS.SLICESTATUS.Loading; };
    const failed  = (s, a) => { s.status = IDS.SLICESTATUS.Failed; s.error = a.payload; };
    const mapList = (p) => ({ list: p?.data?.data || [], total: p?.data?.total || 0, current_page: p?.data?.current_page || 1, total_pages: p?.data?.total_pages || 1 });

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
      // Ticket mutations
      .addCase(updateTicketStatus.pending,   (s) => { s.mutating = true; })
      .addCase(updateTicketStatus.fulfilled, (s, a) => { s.mutating = false; if (s.selectedTicket && a.payload?.data?._id === s.selectedTicket._id) s.selectedTicket = a.payload.data; })
      .addCase(updateTicketStatus.rejected,  (s) => { s.mutating = false; })
      .addCase(updateTicketPriority.pending,   (s) => { s.mutating = true; })
      .addCase(updateTicketPriority.fulfilled, (s, a) => { s.mutating = false; if (s.selectedTicket && a.payload?.data?._id === s.selectedTicket._id) s.selectedTicket = a.payload.data; })
      .addCase(updateTicketPriority.rejected,  (s) => { s.mutating = false; })
      .addCase(assignTicket.pending,   (s) => { s.mutating = true; })
      .addCase(assignTicket.fulfilled, (s, a) => { s.mutating = false; if (s.selectedTicket && a.payload?.data?._id === s.selectedTicket._id) s.selectedTicket = a.payload.data; })
      .addCase(assignTicket.rejected,  (s) => { s.mutating = false; })
      .addCase(replyToTicket.pending,   (s) => { s.mutating = true; })
      .addCase(replyToTicket.fulfilled, (s, a) => { s.mutating = false; if (s.selectedTicket && a.payload?.data?._id === s.selectedTicket._id) s.selectedTicket = a.payload.data; })
      .addCase(replyToTicket.rejected,  (s) => { s.mutating = false; })
      .addCase(deleteTicket.pending,    (s) => { s.mutating = true; })
      .addCase(deleteTicket.fulfilled,  (s) => { s.mutating = false; })
      .addCase(deleteTicket.rejected,   (s) => { s.mutating = false; })
      // Message mutations
      .addCase(replyToMessage.pending,   (s) => { s.mutating = true; })
      .addCase(replyToMessage.fulfilled, (s, a) => { s.mutating = false; if (s.selectedMessage && a.payload?.data?._id === s.selectedMessage._id) s.selectedMessage = a.payload.data; })
      .addCase(replyToMessage.rejected,  (s) => { s.mutating = false; })
      .addCase(archiveMessage.pending,   (s) => { s.mutating = true; })
      .addCase(archiveMessage.fulfilled, (s, a) => { s.mutating = false; if (s.selectedMessage && a.payload?.data?._id === s.selectedMessage._id) s.selectedMessage = a.payload.data; })
      .addCase(archiveMessage.rejected,  (s) => { s.mutating = false; })
      .addCase(deleteMessage.pending,    (s) => { s.mutating = true; })
      .addCase(deleteMessage.fulfilled,  (s) => { s.mutating = false; })
      .addCase(deleteMessage.rejected,   (s) => { s.mutating = false; });
  },
});

export const { clearSelectedTicket, clearSelectedMessage } = supportSlice.actions;
export default supportSlice.reducer;
