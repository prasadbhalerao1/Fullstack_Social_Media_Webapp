import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slices/userSlice.js";
import storiesReducer from "./slices/storiesSlice.js";
import postReducer from "./slices/postSlice.js";
import reelsReducer from "./slices/reelsSlice.js";
import messagesReducer from "./slices/messageSlice.js";

export const store = configureStore({
  reducer: {
    user: userReducer,
    stories: storiesReducer,
    posts: postReducer,
    reels: reelsReducer,
    messages: messagesReducer,
  },
});

export default store;
