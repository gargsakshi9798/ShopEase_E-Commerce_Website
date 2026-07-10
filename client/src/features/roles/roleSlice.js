import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { GET, POST, PUT, DELETE } from "../../utils/Methods";
import { APIS } from "../../utils/APIS";
import { IDS } from "../../utils/IDS";

export const fetchRoles = createAsyncThunk("role/fetchAll", async (_, { rejectWithValue }) => {
  try { return await GET(APIS.Roles); } catch (e) { return rejectWithValue(e.response?.data); }
});

export const fetchPermissions = createAsyncThunk("role/fetchPermissions", async (_, { rejectWithValue }) => {
  try { return await GET(APIS.Permissions); } catch (e) { return rejectWithValue(e.response?.data); }
});

export const createRole = createAsyncThunk("role/create", async (data, { rejectWithValue }) => {
  try { return await POST(APIS.Roles, data); } catch (e) { return rejectWithValue(e.response?.data); }
});

export const updateRolePermissions = createAsyncThunk("role/updatePermissions", async ({ id, permissions }, { rejectWithValue }) => {
  try { return await PUT(`${APIS.Roles}/${id}/permissions`, { permissions }); }
  catch (e) { return rejectWithValue(e.response?.data); }
});

const roleSlice = createSlice({
  name: "role",
  initialState: { list: [], permissions: [], status: IDS.SLICESTATUS.Idle, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRoles.fulfilled, (s, a) => { s.list = a.payload?.data || []; })
      .addCase(fetchPermissions.fulfilled, (s, a) => { s.permissions = a.payload?.data || []; });
  },
});

export default roleSlice.reducer;
