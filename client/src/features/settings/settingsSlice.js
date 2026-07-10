import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { GET, PUT } from "../../utils/Methods";
import { APIS } from "../../utils/APIS";
import { IDS } from "../../utils/IDS";

export const fetchSettings = createAsyncThunk("settings/fetch", async (_, { rejectWithValue }) => {
  try { return await GET(APIS.Settings); } catch (e) { return rejectWithValue(e.response?.data); }
});

export const updateSettings = createAsyncThunk("settings/update", async (data, { rejectWithValue }) => {
  try { return await PUT(APIS.Settings, data); } catch (e) { return rejectWithValue(e.response?.data); }
});

const settingsSlice = createSlice({
  name: "settings",
  initialState: { data: {}, status: IDS.SLICESTATUS.Idle, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSettings.fulfilled, (s, a) => { s.data = a.payload?.data || {}; });
  },
});

export default settingsSlice.reducer;
