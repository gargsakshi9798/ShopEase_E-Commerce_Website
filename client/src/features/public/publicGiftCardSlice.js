import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosClient from "../../utils/ApiInstance";
import { APIS } from "../../utils/APIS";

// ── 1. Initiate Razorpay payment for gift card purchase ──────────────────────
export const initiateGiftCardPayment = createAsyncThunk(
  "publicGiftCard/initiatePayment",
  async (data, { rejectWithValue }) => {
    try {
      const res = await axiosClient.post(APIS.Customer.GiftCards.InitiatePayment, data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Failed to initiate payment" });
    }
  }
);

// ── 2. Verify payment & create gift card ─────────────────────────────────────
export const verifyGiftCardPayment = createAsyncThunk(
  "publicGiftCard/verifyPayment",
  async (data, { rejectWithValue }) => {
    try {
      const res = await axiosClient.post(APIS.Customer.GiftCards.VerifyPayment, data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Payment verification failed" });
    }
  }
);

// ── 3. Fetch my gift cards ───────────────────────────────────────────────────
export const fetchMyGiftCards = createAsyncThunk(
  "publicGiftCard/fetchMyCards",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosClient.get(APIS.Customer.GiftCards.MyCards);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Failed to fetch gift cards" });
    }
  }
);

// ── 4. Check balance ─────────────────────────────────────────────────────────
export const checkGiftCardBalance = createAsyncThunk(
  "publicGiftCard/checkBalance",
  async (code, { rejectWithValue }) => {
    try {
      const res = await axiosClient.get(APIS.Customer.GiftCards.Balance(code));
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Gift card not found" });
    }
  }
);

const publicGiftCardSlice = createSlice({
  name: "publicGiftCard",
  initialState: {
    myCards:       [],
    checkedCard:   null,
    purchaseResult: null,
    status:        "idle",   // idle | loading | succeeded | failed
    paymentStatus: "idle",
    balanceStatus: "idle",
    error:         null,
  },
  reducers: {
    resetPurchase(state) {
      state.purchaseResult = null;
      state.paymentStatus  = "idle";
      state.error          = null;
    },
    clearCheckedCard(state) {
      state.checkedCard   = null;
      state.balanceStatus = "idle";
    },
  },
  extraReducers: (builder) => {
    builder
      // Initiate payment
      .addCase(initiateGiftCardPayment.pending,   (s) => { s.paymentStatus = "loading"; s.error = null; })
      .addCase(initiateGiftCardPayment.fulfilled, (s, a) => { s.paymentStatus = "initiated"; s.purchaseResult = a.payload?.data ?? null; })
      .addCase(initiateGiftCardPayment.rejected,  (s, a) => { s.paymentStatus = "failed"; s.error = a.payload; })

      // Verify payment
      .addCase(verifyGiftCardPayment.pending,   (s) => { s.paymentStatus = "verifying"; })
      .addCase(verifyGiftCardPayment.fulfilled, (s, a) => { s.paymentStatus = "succeeded"; s.purchaseResult = a.payload?.data ?? null; })
      .addCase(verifyGiftCardPayment.rejected,  (s, a) => { s.paymentStatus = "failed"; s.error = a.payload; })

      // My cards
      .addCase(fetchMyGiftCards.pending,   (s) => { s.status = "loading"; })
      .addCase(fetchMyGiftCards.fulfilled, (s, a) => { s.status = "succeeded"; s.myCards = a.payload?.data ?? []; })
      .addCase(fetchMyGiftCards.rejected,  (s, a) => { s.status = "failed"; s.error = a.payload; })

      // Balance check
      .addCase(checkGiftCardBalance.pending,   (s) => { s.balanceStatus = "loading"; s.checkedCard = null; })
      .addCase(checkGiftCardBalance.fulfilled, (s, a) => { s.balanceStatus = "succeeded"; s.checkedCard = a.payload?.data ?? null; })
      .addCase(checkGiftCardBalance.rejected,  (s, a) => { s.balanceStatus = "failed"; s.checkedCard = null; s.error = a.payload; });
  },
});

export const { resetPurchase, clearCheckedCard } = publicGiftCardSlice.actions;
export default publicGiftCardSlice.reducer;
