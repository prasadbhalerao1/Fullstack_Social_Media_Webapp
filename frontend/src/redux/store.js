import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slices/userSlice";
import storiesReducer from "./slices/storiesSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    stories: storiesReducer,
  },
});

export default store;
