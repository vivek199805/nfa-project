import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  selectedEntryType: null,
  activeWorkspaceId: null,
};

const sharedSlice = createSlice({
  name: "shared",
  initialState,
  reducers: {
    setSelectedEntryType: (state, action) => {
      state.selectedEntryType = action.payload;
    },
    setActiveWorkspaceId: (state, action) => {
      state.activeWorkspaceId = action.payload;
    },
  },
});

export const { setSelectedEntryType, setActiveWorkspaceId } = sharedSlice.actions;
export default sharedSlice.reducer;
