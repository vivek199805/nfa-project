import { createSlice } from "@reduxjs/toolkit";

const loaderCompatSlice = createSlice({
  name: "loaderCompat",
  initialState: { visible: false },
  reducers: {
    showLoader: (state) => {
      state.visible = true;
    },
    hideLoader: (state) => {
      state.visible = false;
    },
  },
});

export const { showLoader, hideLoader } = loaderCompatSlice.actions;
export const selectLegacyLoader = (state) => state.ui?.globalLoader ?? state.loader?.visible ?? false;
export default loaderCompatSlice.reducer;
