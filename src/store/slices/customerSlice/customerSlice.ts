import { createSlice } from "@reduxjs/toolkit";
import {
  fetchCustomers,
  fetchCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  type CustomerRecord,
} from "./customerThunks";

type CustomersState = {
  listCustomer: CustomerRecord[];
  selectedCustomer: CustomerRecord | null;
  loading: boolean;
  error: string | null;
  isFetchedCustomer: boolean;
};

const initialState: CustomersState = {
  listCustomer: [],
  selectedCustomer: null,
  loading: false,
  error: null,
  isFetchedCustomer: false,
};

const customerSlice = createSlice({
  name: "customers",
  initialState,
  reducers: {
    clearSelectedCustomer(state) {
      state.selectedCustomer = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCustomers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.loading = false;
        state.listCustomer = action.payload;
        state.isFetchedCustomer = true;
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Something went wrong";
      })
      .addCase(fetchCustomer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomer.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedCustomer = action.payload;
      })
      .addCase(fetchCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Something went wrong";
      })
      .addCase(createCustomer.fulfilled, (state, action) => {
        state.listCustomer.push(action.payload);
      })
      .addCase(updateCustomer.fulfilled, (state, action) => {
        const idx = state.listCustomer.findIndex((c) => c.customerCode === action.payload.customerCode);
        if (idx !== -1) {
          state.listCustomer[idx] = action.payload;
        }
        if (state.selectedCustomer?.customerCode === action.payload.customerCode) {
          state.selectedCustomer = action.payload;
        }
      })
      .addCase(deleteCustomer.fulfilled, (state, action) => {
        state.listCustomer = state.listCustomer.filter((c) => c.customerCode !== action.payload);
        if (state.selectedCustomer?.customerCode === action.payload) {
          state.selectedCustomer = null;
        }
      });
  },
});

export const { clearSelectedCustomer } = customerSlice.actions;
export default customerSlice.reducer;
