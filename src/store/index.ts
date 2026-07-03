import { configureStore } from "@reduxjs/toolkit";
import areaReducer from "./slices/areaSlice/areaSlice";
import vendorReducer from "./slices/vendor/vendorSlice";
import productReducer from "./slices/product/productSlice";
import authReducer from "./slices/auth/authSlice";

export const makeStore = () =>
  configureStore({
    reducer: {
      areas: areaReducer,
      vendors: vendorReducer,
      products: productReducer,
      auth: authReducer,
    },
  });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
