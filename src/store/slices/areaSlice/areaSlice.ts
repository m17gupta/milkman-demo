import { createSlice } from "@reduxjs/toolkit";
import {
  fetchAreas,
  fetchArea,
  createArea,
  updateArea,
  deleteArea,
  type AreaRecord,
} from "./areaThunks";

type AreasState = {
  listArea: AreaRecord[];
  selectedArea: AreaRecord | null;
  loading: boolean;
  error: string | null;
  isFetchedArea:boolean
};

const initialState: AreasState = {
  listArea: [],
  selectedArea: null,
  loading: false,
  error: null,
  isFetchedArea: false,
};

const areaSlice = createSlice({
  name: "areas",
  initialState,
  reducers: {
    clearSelectedArea(state) {
      state.selectedArea = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAreas.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAreas.fulfilled, (state, action) => {
        state.loading = false;
        state.listArea = action.payload;
        state.isFetchedArea = true;
      })
      .addCase(fetchAreas.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Something went wrong";
      })
      .addCase(fetchArea.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchArea.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedArea = action.payload;
      })
      .addCase(fetchArea.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Something went wrong";
      })
      .addCase(createArea.fulfilled, (state, action) => {
        state.listArea.push(action.payload);
      })
      .addCase(updateArea.fulfilled, (state, action) => {
        const idx = state.listArea.findIndex((a) => a.code === action.payload.code);
        if (idx !== -1) {
          state.listArea[idx] = action.payload;
        }
        if (state.selectedArea?.code === action.payload.code) {
          state.selectedArea = action.payload;
        }
      })
      .addCase(deleteArea.fulfilled, (state, action) => {
        state.listArea = state.listArea.filter((a) => a.code !== action.payload);
        if (state.selectedArea?.code === action.payload) {
          state.selectedArea = null;
        }
      });
  },
});

export const { clearSelectedArea } = areaSlice.actions;
export default areaSlice.reducer;
