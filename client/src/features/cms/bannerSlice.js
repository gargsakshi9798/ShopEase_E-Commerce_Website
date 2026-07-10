import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { GET, POST_FORM, PUT_FORM, DELETE } from "../../utils/Methods";
import { APIS } from "../../utils/APIS";
import { IDS } from "../../utils/IDS";

export const fetchBanners = createAsyncThunk(
  "banner/fetchAll",
  async (params = {}, { rejectWithValue }) => {
    try { return await GET(APIS.CMS.Banners, params); }
    catch (e) { return rejectWithValue(e.response?.data); }
  }
);

export const createBanner = createAsyncThunk(
  "banner/create",
  async (formData, { rejectWithValue }) => {
    try { return await POST_FORM(APIS.CMS.Banners, formData); }
    catch (e) { return rejectWithValue(e.response?.data); }
  }
);

export const updateBanner = createAsyncThunk(
  "banner/update",
  async ({ id, formData }, { rejectWithValue }) => {
    try { return await PUT_FORM(`${APIS.CMS.Banners}/${id}`, formData); }
    catch (e) { return rejectWithValue(e.response?.data); }
  }
);

export const deleteBanner = createAsyncThunk(
  "banner/delete",
  async (id, { rejectWithValue }) => {
    try { return await DELETE(`${APIS.CMS.Banners}/${id}`); }
    catch (e) { return rejectWithValue(e.response?.data); }
  }
);

const bannerSlice = createSlice({
  name: "banner",
  initialState: {
    list:     [],
    total:    0,
    status:   IDS.SLICESTATUS.Idle,
    mutating: false,
    error:    null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBanners.pending,   (s) => { s.status = IDS.SLICESTATUS.Loading; })
      .addCase(fetchBanners.rejected,  (s, a) => { s.status = IDS.SLICESTATUS.Failed; s.error = a.payload; })
      .addCase(fetchBanners.fulfilled, (s, a) => {
        s.status = IDS.SLICESTATUS.Succeeded;
        s.list   = a.payload?.data?.data || [];
        s.total  = a.payload?.data?.total || 0;
      })
      .addCase(createBanner.pending,   (s) => { s.mutating = true; })
      .addCase(createBanner.fulfilled, (s) => { s.mutating = false; })
      .addCase(createBanner.rejected,  (s) => { s.mutating = false; })
      .addCase(updateBanner.pending,   (s) => { s.mutating = true; })
      .addCase(updateBanner.fulfilled, (s) => { s.mutating = false; })
      .addCase(updateBanner.rejected,  (s) => { s.mutating = false; })
      .addCase(deleteBanner.pending,   (s) => { s.mutating = true; })
      .addCase(deleteBanner.fulfilled, (s) => { s.mutating = false; })
      .addCase(deleteBanner.rejected,  (s) => { s.mutating = false; });
  },
});

export default bannerSlice.reducer;
