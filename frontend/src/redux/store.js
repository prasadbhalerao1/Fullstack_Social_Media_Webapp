import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slices/userSlice.js";
import storiesReducer from "./slices/storiesSlice.js";
import postReducer from "./slices/postSlice.js";

export const store = configureStore({
  reducer: {
    user: userReducer,
    stories: storiesReducer,
    posts: postReducer,
  },
});

export default store;
