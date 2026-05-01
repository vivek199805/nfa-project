import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import uiReducer from "../features/ui/uiSlice";
import sharedReducer from "../features/shared/sharedSlice";
import featureFormReducer from "../features/forms/featureFormSlice";
import loaderCompatReducer from "../features/ui/loaderCompatSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    shared: sharedReducer,
    featureFilm: featureFormReducer,
    loader: loaderCompatReducer,
  },
});
