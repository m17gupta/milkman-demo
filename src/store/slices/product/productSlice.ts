import { createSlice } from "@reduxjs/toolkit";
import {
  fetchProducts,
  fetchProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  type ProductRecord,
} from "./productThunks";

type ProductsState = {
  listProduct: ProductRecord[];
  selectedProduct: ProductRecord | null;
  loading: boolean;
  error: string | null;
  isFetchedProduct: boolean;
};

const initialState: ProductsState = {
  listProduct: [],
  selectedProduct: null,
  loading: false,
  error: null,
  isFetchedProduct: false,
};

const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    clearSelectedProduct(state) {
      state.selectedProduct = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.listProduct = action.payload;
        state.isFetchedProduct = true;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Something went wrong";
      })
      .addCase(fetchProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedProduct = action.payload;
      })
      .addCase(fetchProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Something went wrong";
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.listProduct.push(action.payload);
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        const idx = state.listProduct.findIndex((p) => p.code === action.payload.code);
        if (idx !== -1) {
          state.listProduct[idx] = action.payload;
        }
        if (state.selectedProduct?.code === action.payload.code) {
          state.selectedProduct = action.payload;
        }
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.listProduct = state.listProduct.filter((p) => p.code !== action.payload);
        if (state.selectedProduct?.code === action.payload) {
          state.selectedProduct = null;
        }
      });
  },
});

export const { clearSelectedProduct } = productSlice.actions;
export default productSlice.reducer;
