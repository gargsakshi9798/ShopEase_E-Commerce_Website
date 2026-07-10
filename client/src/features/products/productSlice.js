import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { GET, POST_FORM, PUT_FORM, DELETE, PATCH } from "../../utils/Methods";
import { APIS } from "../../utils/APIS";
import { IDS } from "../../utils/IDS";

export const fetchProducts = createAsyncThunk("product/fetchAll", async (params = {}, { rejectWithValue }) => {
  try { return await GET(APIS.Products, params); }
  catch (e) { return rejectWithValue(e.response?.data); }
});

export const fetchProductById = createAsyncThunk("product/fetchById", async (id, { rejectWithValue }) => {
  try { return await GET(`${APIS.Products}/${id}`); }
  catch (e) { return rejectWithValue(e.response?.data); }
});

export const createProduct = createAsyncThunk("product/create", async (formData, { rejectWithValue }) => {
  try { return await POST_FORM(APIS.Products, formData); }
  catch (e) { return rejectWithValue(e.response?.data); }
});

export const updateProduct = createAsyncThunk("product/update", async ({ id, formData }, { rejectWithValue }) => {
  try { return await PUT_FORM(`${APIS.Products}/${id}`, formData); }
  catch (e) { return rejectWithValue(e.response?.data); }
});

export const deleteProduct = createAsyncThunk("product/delete", async (id, { rejectWithValue }) => {
  try { return await DELETE(`${APIS.Products}/${id}`); }
  catch (e) { return rejectWithValue(e.response?.data); }
});

export const updateStock = createAsyncThunk("product/updateStock", async ({ id, stock }, { rejectWithValue }) => {
  try { return await PATCH(`${APIS.Products}/${id}/stock`, { stock }); }
  catch (e) { return rejectWithValue(e.response?.data); }
});

export const fetchLowStock = createAsyncThunk("product/lowStock", async (params = {}, { rejectWithValue }) => {
  try { return await GET(`${APIS.Products}/low-stock`, params); }
  catch (e) { return rejectWithValue(e.response?.data); }
});

const productSlice = createSlice({
  name: "product",
  initialState: {
    list:         [],
    total:        0,
    current_page: 1,
    total_pages:  1,
    selected:     null,
    lowStockList: [],
    status:       IDS.SLICESTATUS.Idle,
    mutating:     false,
    error:        null,
  },
  reducers: {
    clearSelected: (state) => { state.selected = null; },
  },
  extraReducers: (builder) => {
    builder
      // Fetch list
      .addCase(fetchProducts.pending,   (s) => { s.status = IDS.SLICESTATUS.Loading; })
      .addCase(fetchProducts.rejected,  (s, a) => { s.status = IDS.SLICESTATUS.Failed; s.error = a.payload; })
      .addCase(fetchProducts.fulfilled, (s, a) => {
        s.status       = IDS.SLICESTATUS.Succeeded;
        s.list         = a.payload?.data?.data || [];
        s.total        = a.payload?.data?.total || 0;
        s.current_page = a.payload?.data?.current_page || 1;
        s.total_pages  = a.payload?.data?.total_pages  || 1;
      })

      // Fetch single
      .addCase(fetchProductById.fulfilled, (s, a) => { s.selected = a.payload?.data || null; })

      // Low stock list
      .addCase(fetchLowStock.pending,   (s) => { s.status = IDS.SLICESTATUS.Loading; })
      .addCase(fetchLowStock.fulfilled, (s, a) => {
        s.status       = IDS.SLICESTATUS.Succeeded;
        s.lowStockList = a.payload?.data?.data || [];
      })

      // Update stock — optimistically update lowStockList in-place
      .addCase(updateStock.pending,   (s) => { s.mutating = true; })
      .addCase(updateStock.rejected,  (s) => { s.mutating = false; })
      .addCase(updateStock.fulfilled, (s, a) => {
        s.mutating = false;
        const updated = a.payload?.data;
        if (updated) {
          s.lowStockList = s.lowStockList.map((p) =>
            p._id === updated._id ? { ...p, stock: updated.stock } : p
          );
          s.list = s.list.map((p) =>
            p._id === updated._id ? { ...p, stock: updated.stock } : p
          );
        }
      })

      // Create / Update / Delete — mutating flags
      .addCase(createProduct.pending,   (s) => { s.mutating = true; })
      .addCase(createProduct.fulfilled, (s) => { s.mutating = false; })
      .addCase(createProduct.rejected,  (s) => { s.mutating = false; })
      .addCase(updateProduct.pending,   (s) => { s.mutating = true; })
      .addCase(updateProduct.fulfilled, (s) => { s.mutating = false; })
      .addCase(updateProduct.rejected,  (s) => { s.mutating = false; })
      .addCase(deleteProduct.pending,   (s) => { s.mutating = true; })
      .addCase(deleteProduct.fulfilled, (s) => { s.mutating = false; })
      .addCase(deleteProduct.rejected,  (s) => { s.mutating = false; });
  },
});

export const { clearSelected } = productSlice.actions;
export default productSlice.reducer;
