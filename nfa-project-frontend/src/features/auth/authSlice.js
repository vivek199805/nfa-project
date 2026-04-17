import { createSlice } from "@reduxjs/toolkit";
import { authStorage } from "./authStorage";

const persisted = authStorage.get();

const initialState = {
  user: persisted?.user || persisted?.data || null,
  token: persisted?.token || null,
  isAuthenticated: Boolean(persisted?.token),
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const payload = action.payload || {};
      state.user = payload.user || payload.data || null;
      state.token = payload.token || null;
      state.isAuthenticated = Boolean(state.token);
    },
    clearCredentials: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setCredentials, clearCredentials } = authSlice.actions;
export default authSlice.reducer;
