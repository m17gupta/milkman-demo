import { createSlice } from "@reduxjs/toolkit";
import {
  fetchVendors,
  fetchVendor,
  createVendor,
  updateVendor,
  deleteVendor,
  type VendorRecord,
} from "./vendorThunks";

type VendorsState = {
  listVendor: VendorRecord[];
  selectedVendor: VendorRecord | null;
  loading: boolean;
  error: string | null;
  isFetchedVendor: boolean;
};

const initialState: VendorsState = {
  listVendor: [],
  selectedVendor: null,
  loading: false,
  error: null,
  isFetchedVendor: false,
};

const vendorSlice = createSlice({
  name: "vendors",
  initialState,
  reducers: {
    clearSelectedVendor(state) {
      state.selectedVendor = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVendors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVendors.fulfilled, (state, action) => {
        state.loading = false;
        state.listVendor = action.payload;
        state.isFetchedVendor = true;
      })
      .addCase(fetchVendors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Something went wrong";
      })
      .addCase(fetchVendor.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVendor.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedVendor = action.payload;
      })
      .addCase(fetchVendor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Something went wrong";
      })
      .addCase(createVendor.fulfilled, (state, action) => {
        state.listVendor.push(action.payload);
      })
      .addCase(updateVendor.fulfilled, (state, action) => {
        const idx = state.listVendor.findIndex((v) => v.code === action.payload.code);
        if (idx !== -1) {
          state.listVendor[idx] = action.payload;
        }
        if (state.selectedVendor?.code === action.payload.code) {
          state.selectedVendor = action.payload;
        }
      })
      .addCase(deleteVendor.fulfilled, (state, action) => {
        state.listVendor = state.listVendor.filter((v) => v.code !== action.payload);
        if (state.selectedVendor?.code === action.payload) {
          state.selectedVendor = null;
        }
      });
  },
});

export const { clearSelectedVendor } = vendorSlice.actions;
export default vendorSlice.reducer;
