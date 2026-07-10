import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { GET, POST, PUT, PATCH, DELETE } from "../../utils/Methods";
import { APIS } from "../../utils/APIS";
import { IDS } from "../../utils/IDS";

// ─── Thunks ──────────────────────────────────────────────────────────────────

// Fetch admins filtered by role_slug (super_admin | admin)
export const fetchAdminUsers = createAsyncThunk(
  "adminUsers/fetchAll",
  async (params = {}, { rejectWithValue }) => {
    try { return await GET(APIS.Users.Admins, params); }
    catch (e) { return rejectWithValue(e.response?.data); }
  }
);

// Dedicated thunk to fetch super_admin count (no pagination needed, per_page=1)
export const fetchSuperAdminCount = createAsyncThunk(
  "adminUsers/fetchSuperAdminCount",
  async (_, { rejectWithValue }) => {
    try { return await GET(APIS.Users.Admins, { role_slug: "super_admin", page: 1, per_page: 1 }); }
    catch (e) { return rejectWithValue(e.response?.data); }
  }
);

// Dedicated thunk to fetch admin count
export const fetchAdminCount = createAsyncThunk(
  "adminUsers/fetchAdminCount",
  async (_, { rejectWithValue }) => {
    try { return await GET(APIS.Users.Admins, { role_slug: "admin", page: 1, per_page: 1 }); }
    catch (e) { return rejectWithValue(e.response?.data); }
  }
);

export const fetchAllEmployees = createAsyncThunk(
  "adminUsers/fetchEmployees",
  async (params = {}, { rejectWithValue }) => {
    try { return await GET(APIS.Users.Employees, params); }
    catch (e) { return rejectWithValue(e.response?.data); }
  }
);

export const fetchAllCustomers = createAsyncThunk(
  "adminUsers/fetchCustomers",
  async (params = {}, { rejectWithValue }) => {
    try { return await GET(APIS.Users.Customers, params); }
    catch (e) { return rejectWithValue(e.response?.data); }
  }
);

export const createAdminUser = createAsyncThunk(
  "adminUsers/createAdmin",
  async (data, { rejectWithValue }) => {
    try { return await POST(APIS.Users.Admin, data); }
    catch (e) { return rejectWithValue(e.response?.data); }
  }
);

export const createEmployeeUser = createAsyncThunk(
  "adminUsers/createEmployee",
  async (data, { rejectWithValue }) => {
    try { return await POST(APIS.Users.Employee, data); }
    catch (e) { return rejectWithValue(e.response?.data); }
  }
);

export const createCustomerUser = createAsyncThunk(
  "adminUsers/createCustomer",
  async (data, { rejectWithValue }) => {
    try { return await POST(APIS.Users.Customer, data); }
    catch (e) { return rejectWithValue(e.response?.data); }
  }
);

export const updateAdminUser = createAsyncThunk(
  "adminUsers/update",
  async ({ id, data }, { rejectWithValue }) => {
    try { return await PUT(APIS.Users.ById(id), data); }
    catch (e) { return rejectWithValue(e.response?.data); }
  }
);

export const toggleBlockUser = createAsyncThunk(
  "adminUsers/toggleBlock",
  async (id, { rejectWithValue }) => {
    try { return await PATCH(APIS.Users.BlockById(id)); }
    catch (e) { return rejectWithValue(e.response?.data); }
  }
);

export const deleteAdminUser = createAsyncThunk(
  "adminUsers/delete",
  async (id, { rejectWithValue }) => {
    try { return await DELETE(APIS.Users.ById(id)); }
    catch (e) { return rejectWithValue(e.response?.data); }
  }
);

export const getUserById = createAsyncThunk(
  "adminUsers/getById",
  async (id, { rejectWithValue }) => {
    try { return await GET(APIS.Users.ById(id)); }
    catch (e) { return rejectWithValue(e.response?.data); }
  }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const makeListState = () => ({ list: [], total: 0, current_page: 1, total_pages: 1 });

const adminUsersSlice = createSlice({
  name: "adminUsers",
  initialState: {
    admins:           makeListState(),
    employees:        makeListState(),
    customers:        makeListState(),
    superAdminCount:  0,   // dedicated total count for stats card
    adminCount:       0,   // dedicated total count for stats card
    selected:         null,
    status:           IDS.SLICESTATUS.Idle,
    mutating:         false,
    error:            null,
  },
  reducers: {
    clearSelected: (s) => { s.selected = null; },
  },
  extraReducers: (builder) => {
    const pending = (s) => { s.status = IDS.SLICESTATUS.Loading; };
    const failed  = (s, a) => { s.status = IDS.SLICESTATUS.Failed; s.error = a.payload; };
    const mapList = (payload) => ({
      list:         payload?.data?.data || [],
      total:        payload?.data?.total || 0,
      current_page: payload?.data?.current_page || 1,
      total_pages:  payload?.data?.total_pages || 1,
    });

    builder
      // fetch admins (tab data)
      .addCase(fetchAdminUsers.pending,   pending)
      .addCase(fetchAdminUsers.rejected,  failed)
      .addCase(fetchAdminUsers.fulfilled, (s, a) => {
        s.status = IDS.SLICESTATUS.Succeeded;
        s.admins = mapList(a.payload);
      })

      // super admin count (stats card only)
      .addCase(fetchSuperAdminCount.fulfilled, (s, a) => {
        s.superAdminCount = a.payload?.data?.total || 0;
      })

      // admin count (stats card only)
      .addCase(fetchAdminCount.fulfilled, (s, a) => {
        s.adminCount = a.payload?.data?.total || 0;
      })

      // fetch employees
      .addCase(fetchAllEmployees.pending,   pending)
      .addCase(fetchAllEmployees.rejected,  failed)
      .addCase(fetchAllEmployees.fulfilled, (s, a) => {
        s.status = IDS.SLICESTATUS.Succeeded;
        s.employees = mapList(a.payload);
      })

      // fetch customers
      .addCase(fetchAllCustomers.pending,   pending)
      .addCase(fetchAllCustomers.rejected,  failed)
      .addCase(fetchAllCustomers.fulfilled, (s, a) => {
        s.status = IDS.SLICESTATUS.Succeeded;
        s.customers = mapList(a.payload);
      })

      // getById
      .addCase(getUserById.fulfilled, (s, a) => {
        s.selected = a.payload?.data || null;
      })

      // mutations — toggle mutating flag
      .addCase(createAdminUser.pending,      (s) => { s.mutating = true; })
      .addCase(createAdminUser.fulfilled,    (s) => { s.mutating = false; })
      .addCase(createAdminUser.rejected,     (s) => { s.mutating = false; })
      .addCase(createEmployeeUser.pending,   (s) => { s.mutating = true; })
      .addCase(createEmployeeUser.fulfilled, (s) => { s.mutating = false; })
      .addCase(createEmployeeUser.rejected,  (s) => { s.mutating = false; })
      .addCase(createCustomerUser.pending,   (s) => { s.mutating = true; })
      .addCase(createCustomerUser.fulfilled, (s) => { s.mutating = false; })
      .addCase(createCustomerUser.rejected,  (s) => { s.mutating = false; })
      .addCase(updateAdminUser.pending,      (s) => { s.mutating = true; })
      .addCase(updateAdminUser.fulfilled,    (s) => { s.mutating = false; })
      .addCase(updateAdminUser.rejected,     (s) => { s.mutating = false; })
      .addCase(toggleBlockUser.pending,      (s) => { s.mutating = true; })
      .addCase(toggleBlockUser.fulfilled,    (s) => { s.mutating = false; })
      .addCase(toggleBlockUser.rejected,     (s) => { s.mutating = false; })
      .addCase(deleteAdminUser.pending,      (s) => { s.mutating = true; })
      .addCase(deleteAdminUser.fulfilled,    (s) => { s.mutating = false; })
      .addCase(deleteAdminUser.rejected,     (s) => { s.mutating = false; });
  },
});

export const { clearSelected } = adminUsersSlice.actions;
export default adminUsersSlice.reducer;
