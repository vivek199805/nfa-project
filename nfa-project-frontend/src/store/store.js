import { configureStore } from '@reduxjs/toolkit';
import featureFormReducer from './featureFormSlice';
import loaderReducer from "./loaderSlice";

export const store = configureStore({
  reducer: {
    featureFilm: featureFormReducer,
    loader: loaderReducer,
  },
//   middleware: (getDefaultMiddleware) =>
//     getDefaultMiddleware({
//       serializableCheck: {
//         ignoredActions: ['featureFilm/fetchFeatureFilm/fulfilled'],
//       },
//     }),
});
