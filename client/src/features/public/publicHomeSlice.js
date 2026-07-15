import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { GET } from "../../utils/Methods";
import { APIS } from "../../utils/APIS";

export const fetchHomeData = createAsyncThunk(
  "publicHome/fetchHomeData",
  async (_, { rejectWithValue }) => {
    try {
      return await GET(APIS.Public.Home);
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Failed to fetch home data" });
    }
  }
);

const publicHomeSlice = createSlice({
  name: "publicHome",
  initialState: {
    banners:           [],
    featured_categories: [],
    featured_products: [],
    best_sellers:      [],
    new_arrivals:      [],
    flash_sale:        [],
    trending:          [],
    brands:            [],
    status:            "idle",  // idle | loading | succeeded | failed
    error:             null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchHomeData.pending, (state) => {
        state.status = "loading";
        state.error  = null;
      })
      .addCase(fetchHomeData.fulfilled, (state, action) => {
        state.status = "succeeded";
        const d = action.payload?.data ?? {};
        state.banners              = d.banners              ?? [];
        state.featured_categories  = d.featured_categories  ?? [];
        state.featured_products    = d.featured_products    ?? [];
        state.best_sellers         = d.best_sellers         ?? [];
        state.new_arrivals         = d.new_arrivals         ?? [];
        state.flash_sale           = d.flash_sale           ?? [];
        state.trending             = d.trending             ?? [];
        state.brands               = d.brands               ?? [];
      })
      .addCase(fetchHomeData.rejected, (state, action) => {
        state.status = "failed";
        state.error  = action.payload;
      });
  },
});

export default publicHomeSlice.reducer;
