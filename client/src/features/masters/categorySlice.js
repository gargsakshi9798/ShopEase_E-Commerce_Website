import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { GET, POST, PUT, DELETE, POST_FORM, PUT_FORM } from "../../utils/Methods";
import { APIS } from "../../utils/APIS";
import { IDS } from "../../utils/IDS";

export const fetchCategories = createAsyncThunk(
  "category/fetchAll",
  async (params = {}, { rejectWithValue }) => {
    try {
      return await GET(APIS.Masters.Category, params);
    } catch (e) {
      return rejectWithValue(e.response?.data);
    }
  }
);

export const createCategory = createAsyncThunk(
  "category/create",
  async (formData, { rejectWithValue }) => {
    try {
      return await POST_FORM(APIS.Masters.Category, formData);
    } catch (e) {
      return rejectWithValue(e.response?.data);
    }
  }
);

export const updateCategory = createAsyncThunk(
  "category/update",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      return await PUT_FORM(`${APIS.Masters.Category}/${id}`, formData);
    } catch (e) {
      return rejectWithValue(e.response?.data);
    }
  }
);

export const deleteCategory = createAsyncThunk(
  "category/delete",
  async (id, { rejectWithValue }) => {
    try {
      return await DELETE(`${APIS.Masters.Category}/${id}`);
    } catch (e) {
      return rejectWithValue(e.response?.data);
    }
  }
);

const categorySlice = createSlice({
  name: "category",
  initialState: {
    list: [],
    total: 0,
    current_page: 1,
    total_pages: 1,
    status: IDS.SLICESTATUS.Idle,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => { state.status = IDS.SLICESTATUS.Loading; })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.status = IDS.SLICESTATUS.Succeeded;
        state.list = action.payload?.data?.data || [];
        state.total = action.payload?.data?.total || 0;
        state.current_page = action.payload?.data?.current_page || 1;
        state.total_pages = action.payload?.data?.total_pages || 1;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.status = IDS.SLICESTATUS.Failed;
        state.error = action.payload;
      });
  },
});

export default categorySlice.reducer;
