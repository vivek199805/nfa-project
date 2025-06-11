import { configureStore } from '@reduxjs/toolkit';
import featureFormReducer from './featureFormSlice';

export const store = configureStore({
  reducer: {
    featureFilm: featureFormReducer,
  },
//   middleware: (getDefaultMiddleware) =>
//     getDefaultMiddleware({
//       serializableCheck: {
//         ignoredActions: ['featureFilm/fetchFeatureFilm/fulfilled'],
//       },
//     }),
});
