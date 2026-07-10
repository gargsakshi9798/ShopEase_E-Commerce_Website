import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { GET, POST, PUT, PATCH, DELETE } from "../../utils/Methods";
import { APIS } from "../../utils/APIS";
import { IDS } from "../../utils/IDS";

export const fetchEmployees = createAsyncThunk(
  "employee/fetchAll",
  async (params = {}, { rejectWithValue }) => {
    try { return await GET(APIS.Users.Employees, params); }
    catch (e) { return rejectWithValue(e.response?.data); }
  }
);

export const getEmployeeById = createAsyncThunk(
  "employee/getById",
  async (id, { rejectWithValue }) => {
    try { return await GET(APIS.Users.ById(id)); }
    catch (e) { return rejectWithValue(e.response?.data); }
  }
);

export const createEmployee = createAsyncThunk(
  "employee/create",
  async (data, { rejectWithValue }) => {
    try { return await POST(APIS.Users.Employee, data); }
    catch (e) { return rejectWithValue(e.response?.data); }
  }
);

export const updateEmployee = createAsyncThunk(
  "employee/update",
  async ({ id, data }, { rejectWithValue }) => {
    try { return await PUT(APIS.Users.ById(id), data); }
    catch (e) { return rejectWithValue(e.response?.data); }
  }
);

export const toggleBlockEmployee = createAsyncThunk(
  "employee/toggleBlock",
  async (id, { rejectWithValue }) => {
    try { return await PATCH(APIS.Users.BlockById(id)); }
    catch (e) { return rejectWithValue(e.response?.data); }
  }
);

export const deleteEmployee = createAsyncThunk(
  "employee/delete",
  async (id, { rejectWithValue }) => {
    try { return await DELETE(APIS.Users.ById(id)); }
    catch (e) { return rejectWithValue(e.response?.data); }
  }
);

const employeeSlice = createSlice({
  name: "employee",
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
    clearSelectedEmployee: (s) => { s.selected = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmployees.pending,   (s) => { s.status = IDS.SLICESTATUS.Loading; })
      .addCase(fetchEmployees.rejected,  (s, a) => { s.status = IDS.SLICESTATUS.Failed; s.error = a.payload; })
      .addCase(fetchEmployees.fulfilled, (s, a) => {
        s.status       = IDS.SLICESTATUS.Succeeded;
        s.list         = a.payload?.data?.data || [];
        s.total        = a.payload?.data?.total || 0;
        s.current_page = a.payload?.data?.current_page || 1;
        s.total_pages  = a.payload?.data?.total_pages  || 1;
      })

      .addCase(getEmployeeById.fulfilled, (s, a) => {
        s.selected = a.payload?.data || null;
      })

      .addCase(createEmployee.pending,   (s) => { s.mutating = true; })
      .addCase(createEmployee.fulfilled, (s) => { s.mutating = false; })
      .addCase(createEmployee.rejected,  (s) => { s.mutating = false; })

      .addCase(updateEmployee.pending,   (s) => { s.mutating = true; })
      .addCase(updateEmployee.fulfilled, (s) => { s.mutating = false; })
      .addCase(updateEmployee.rejected,  (s) => { s.mutating = false; })

      .addCase(toggleBlockEmployee.pending,   (s) => { s.mutating = true; })
      .addCase(toggleBlockEmployee.fulfilled, (s) => { s.mutating = false; })
      .addCase(toggleBlockEmployee.rejected,  (s) => { s.mutating = false; })

      .addCase(deleteEmployee.pending,   (s) => { s.mutating = true; })
      .addCase(deleteEmployee.fulfilled, (s) => { s.mutating = false; })
      .addCase(deleteEmployee.rejected,  (s) => { s.mutating = false; });
  },
});

export const { clearSelectedEmployee } = employeeSlice.actions;
export default employeeSlice.reducer;
