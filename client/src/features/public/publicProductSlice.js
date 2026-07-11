import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { GET } from "../../utils/Methods";
import { APIS } from "../../utils/APIS";

// Fetch products list with filters/pagination
export const fetchPublicProducts = createAsyncThunk(
  "publicProduct/fetchAll",
  async (params = {}, { rejectWithValue }) => {
    try {
      return await GET(APIS.Public.Products, params);
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Failed to fetch products" });
    }
  }
);

// Fetch single product by slug
export const fetchProductDetail = createAsyncThunk(
  "publicProduct/fetchDetail",
  async (slug, { rejectWithValue }) => {
    try {
      return await GET(`${APIS.Public.Products}/${slug}`);
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Failed to fetch product" });
    }
  }
);

// Fetch public categories
export const fetchPublicCategories = createAsyncThunk(
  "publicProduct/fetchCategories",
  async (_, { rejectWithValue }) => {
    try {
      return await GET(APIS.Public.Categories);
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Failed to fetch categories" });
    }
  }
);

// Fetch brands list (public)
export const fetchPublicBrands = createAsyncThunk(
  "publicProduct/fetchBrands",
  async (_, { rejectWithValue }) => {
    try {
      return await GET(APIS.Public.Brands || "/public/brands");
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Failed to fetch brands" });
    }
  }
);

const publicProductSlice = createSlice({
  name: "publicProduct",
  initialState: {
    products: [],
    total: 0,
    totalPages: 1,
    currentPage: 1,
    detail: null,
    relatedProducts: [],
    categories: [],
    brands: [],
    status: "idle",        // idle | loading | succeeded | failed
    detailStatus: "idle",
    error: null,
  },
  reducers: {
    clearDetail(state) {
      state.detail = null;
      state.detailStatus = "idle";
      state.relatedProducts = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // List
      .addCase(fetchPublicProducts.pending, (state) => { state.status = "loading"; state.error = null; })
      .addCase(fetchPublicProducts.fulfilled, (state, action) => {
        state.status = "succeeded";
        const d = action.payload?.data;
        state.products    = d?.data     ?? d ?? [];
        state.total       = d?.total    ?? 0;
        state.totalPages  = d?.total_pages ?? 1;
        state.currentPage = d?.current_page ?? 1;
      })
      .addCase(fetchPublicProducts.rejected, (state, action) => { state.status = "failed"; state.error = action.payload; })
      // Detail
      .addCase(fetchProductDetail.pending, (state) => { state.detailStatus = "loading"; })
      .addCase(fetchProductDetail.fulfilled, (state, action) => {
        state.detailStatus = "succeeded";
        // API returns { product, related } or just the product
        const d = action.payload?.data;
        state.detail = d?.product ?? d ?? null;
        state.relatedProducts = d?.related ?? [];
      })
      .addCase(fetchProductDetail.rejected, (state, action) => { state.detailStatus = "failed"; state.error = action.payload; })
      // Categories
      .addCase(fetchPublicCategories.fulfilled, (state, action) => {
        state.categories = action.payload?.data ?? [];
      })
      // Brands
      .addCase(fetchPublicBrands.fulfilled, (state, action) => {
        state.brands = action.payload?.data ?? [];
      });
  },
});

export const { clearDetail } = publicProductSlice.actions;
export default publicProductSlice.reducer;