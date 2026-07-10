import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { GET, POST } from "../../utils/Methods";
import { APIS } from "../../utils/APIS";

// ── 1. Validate checkout (address + cart + pricing) ───────────────────────────
export const validateCheckout = createAsyncThunk(
  "publicPayment/validateCheckout",
  async (data, { rejectWithValue }) => {
    try {
      return await POST(APIS.Customer.Payment.ValidateCheckout, data);
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Checkout validation failed" });
    }
  }
);

// ── 2. Create Razorpay order ──────────────────────────────────────────────────
export const createRazorpayOrder = createAsyncThunk(
  "publicPayment/createRazorpayOrder",
  async (data, { rejectWithValue }) => {
    try {
      return await POST(APIS.Customer.Payment.RazorpayCreateOrder, data);
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Failed to initiate payment" });
    }
  }
);

// ── 3. Verify Razorpay payment & create order ─────────────────────────────────
export const verifyRazorpayPayment = createAsyncThunk(
  "publicPayment/verifyRazorpay",
  async (data, { rejectWithValue }) => {
    try {
      return await POST(APIS.Customer.Payment.RazorpayVerify, data);
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Payment verification failed" });
    }
  }
);

// ── 4. Place COD order ────────────────────────────────────────────────────────
export const placeCODOrder = createAsyncThunk(
  "publicPayment/placeCOD",
  async (data, { rejectWithValue }) => {
    try {
      return await POST(APIS.Customer.Payment.CODPlaceOrder, data);
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Failed to place COD order" });
    }
  }
);

// ── 5. Fetch invoice ──────────────────────────────────────────────────────────
export const fetchInvoice = createAsyncThunk(
  "publicPayment/fetchInvoice",
  async (orderId, { rejectWithValue }) => {
    try {
      return await GET(APIS.Customer.Payment.Invoice(orderId));
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Failed to fetch invoice" });
    }
  }
);

const publicPaymentSlice = createSlice({
  name: "publicPayment",
  initialState: {
    // Checkout validation
    checkoutSummary: null,
    checkoutStatus: "idle",

    // Razorpay order creation
    razorpayOrder: null,
    razorpayStatus: "idle",

    // Order result (after payment)
    orderResult: null,
    orderStatus: "idle",

    // Invoice
    invoice: null,
    invoiceStatus: "idle",

    error: null,
  },
  reducers: {
    resetPayment(state) {
      state.checkoutSummary = null;
      state.checkoutStatus = "idle";
      state.razorpayOrder = null;
      state.razorpayStatus = "idle";
      state.orderResult = null;
      state.orderStatus = "idle";
      state.error = null;
    },
    clearInvoice(state) {
      state.invoice = null;
      state.invoiceStatus = "idle";
    },
  },
  extraReducers: (builder) => {
    builder
      // Validate checkout
      .addCase(validateCheckout.pending, (state) => {
        state.checkoutStatus = "loading";
        state.error = null;
      })
      .addCase(validateCheckout.fulfilled, (state, action) => {
        state.checkoutStatus = "succeeded";
        state.checkoutSummary = action.payload?.data ?? null;
      })
      .addCase(validateCheckout.rejected, (state, action) => {
        state.checkoutStatus = "failed";
        state.error = action.payload;
      })

      // Create Razorpay order
      .addCase(createRazorpayOrder.pending, (state) => {
        state.razorpayStatus = "loading";
        state.error = null;
      })
      .addCase(createRazorpayOrder.fulfilled, (state, action) => {
        state.razorpayStatus = "succeeded";
        state.razorpayOrder = action.payload?.data ?? null;
      })
      .addCase(createRazorpayOrder.rejected, (state, action) => {
        state.razorpayStatus = "failed";
        state.error = action.payload;
      })

      // Verify Razorpay
      .addCase(verifyRazorpayPayment.pending, (state) => {
        state.orderStatus = "loading";
        state.error = null;
      })
      .addCase(verifyRazorpayPayment.fulfilled, (state, action) => {
        state.orderStatus = "succeeded";
        state.orderResult = action.payload?.data ?? null;
      })
      .addCase(verifyRazorpayPayment.rejected, (state, action) => {
        state.orderStatus = "failed";
        state.error = action.payload;
      })

      // COD order
      .addCase(placeCODOrder.pending, (state) => {
        state.orderStatus = "loading";
        state.error = null;
      })
      .addCase(placeCODOrder.fulfilled, (state, action) => {
        state.orderStatus = "succeeded";
        state.orderResult = action.payload?.data ?? null;
      })
      .addCase(placeCODOrder.rejected, (state, action) => {
        state.orderStatus = "failed";
        state.error = action.payload;
      })

      // Invoice
      .addCase(fetchInvoice.pending, (state) => {
        state.invoiceStatus = "loading";
      })
      .addCase(fetchInvoice.fulfilled, (state, action) => {
        state.invoiceStatus = "succeeded";
        state.invoice = action.payload?.data ?? null;
      })
      .addCase(fetchInvoice.rejected, (state, action) => {
        state.invoiceStatus = "failed";
        state.error = action.payload;
      });
  },
});

export const { resetPayment, clearInvoice } = publicPaymentSlice.actions;
export default publicPaymentSlice.reducer;
