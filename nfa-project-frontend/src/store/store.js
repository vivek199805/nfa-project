// previous code
// import { configureStore } from '@reduxjs/toolkit';
// import featureFormReducer from './featureFormSlice';
// import loaderReducer from "./loaderSlice";

// export const store = configureStore({
//   reducer: {
//     featureFilm: featureFormReducer,
//     loader: loaderReducer,
//   },
// });

// Canonical store location: src/app/store.js
// Keep this file only to avoid breaking older imports.

export { store } from "../app/store";
