// redux/featureFormSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  data: {},
};

const featureFormSlice = createSlice({
  name: "featureForm",
  initialState,
  reducers: {
    setFormData: (state, action) => {
     console.log("yyyyyyyyyyyyyyyyyyyy", action?.payload);
     
       state.data = action.payload;
    },
    updateFormField: (state, action) => {
      const { field, value } = action.payload;
      state[field] = value;
    },
  },
});

export const { setFormData, updateFormField } = featureFormSlice.actions;
export default featureFormSlice.reducer;
