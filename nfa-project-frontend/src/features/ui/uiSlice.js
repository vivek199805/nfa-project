import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  globalLoader: false,
  sidebarOpen: false,
  modals: {},
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setGlobalLoader: (state, action) => {
      state.globalLoader = Boolean(action.payload);
    },
    openSidebar: (state) => {
      state.sidebarOpen = true;
    },
    closeSidebar: (state) => {
      state.sidebarOpen = false;
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    openModal: (state, action) => {
      state.modals[action.payload] = true;
    },
    closeModal: (state, action) => {
      state.modals[action.payload] = false;
    },
  },
});

export const {
  setGlobalLoader,
  openSidebar,
  closeSidebar,
  toggleSidebar,
  openModal,
  closeModal,
} = uiSlice.actions;

export default uiSlice.reducer;
