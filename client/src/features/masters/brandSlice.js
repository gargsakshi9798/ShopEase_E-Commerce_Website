import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { GET, POST_FORM, PUT_FORM, DELETE } from "../../utils/Methods";
import { APIS } from "../../utils/APIS";
import { IDS } from "../../utils/IDS";

export const fetchBrands = createAsyncThunk("brand/fetchAll", async (params = {}, { rejectWithValue }) => {
  try { return await GET(APIS.Masters.Brand, params); }
  catch (e) { return rejectWithValue(e.response?.data); }
});

export const createBrand = createAsyncThunk("brand/create", async (formData, { rejectWithValue }) => {
  try { return await POST_FORM(APIS.Masters.Brand, formData); }
  catch (e) { return rejectWithValue(e.response?.data); }
});

export const updateBrand = createAsyncThunk("brand/update", async ({ id, formData }, { rejectWithValue }) => {
  try { return await PUT_FORM(`${APIS.Masters.Brand}/${id}`, formData); }
  catch (e) { return rejectWithValue(e.response?.data); }
});

export const deleteBrand = createAsyncThunk("brand/delete", async (id, { rejectWithValue }) => {
  try { return await DELETE(`${APIS.Masters.Brand}/${id}`); }
  catch (e) { return rejectWithValue(e.response?.data); }
});

const brandSlice = createSlice({
  name: "brand",
  initialState: { list: [], total: 0, status: IDS.SLICESTATUS.Idle, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBrands.pending, (s) => { s.status = IDS.SLICESTATUS.Loading; })
      .addCase(fetchBrands.fulfilled, (s, a) => {
        s.status = IDS.SLICESTATUS.Succeeded;
        s.list = a.payload?.data?.data || [];
        s.total = a.payload?.data?.total || 0;
      })
      .addCase(fetchBrands.rejected, (s, a) => { s.status = IDS.SLICESTATUS.Failed; s.error = a.payload; });
  },
});

export default brandSlice.reducer;
