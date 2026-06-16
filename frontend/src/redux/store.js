import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slices/userSlice.js";
import storiesReducer from "./slices/storiesSlice.js";

export const store = configureStore({
  reducer: {
    user: userReducer,
    stories: storiesReducer,
  },
});

export default store;
