import { createSlice } from "@reduxjs/toolkit";
import toast from "react-hot-toast";
import { axiosInstance } from "../../lib/axios";

const initialState = {
  stories: [],
  loading: false,
  error: null,
};

export const storiesSlice = createSlice({
  name: "stories",
  initialState,
  reducers: {
    setStories: (state, action) => {
      state.stories = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const { setStories, setLoading, setError } = storiesSlice.actions;

export default storiesSlice.reducer;

export const getAllStories = () => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const { data } = await axiosInstance.get("/story/all");
    if (data?.success) {
      dispatch(setStories(data?.stories));
    }
  } catch (error) {
    dispatch(setError(error?.response?.data?.message || error?.message || "Failed to fetch stories."));
  } finally {
    dispatch(setLoading(false));
  }
};

export const createStory = (formData, callback) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const { data } = await axiosInstance.post("/story/create", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    if (data?.success) {
      toast.success(data?.message || "Story created successfully!");
      dispatch(getAllStories());
      if (callback) callback();
    }
  } catch (error) {
    dispatch(setError(error?.response?.data?.message || error?.message || "Failed to create story."));
    toast.error(error?.response?.data?.message || error?.message || "Failed to create story.");
  } finally {
    dispatch(setLoading(false));
  }
};

export const viewStory = (storyId) => async (dispatch) => {
  try {
    const { data } = await axiosInstance.get(`/story/${storyId}/view`);
    if (data?.success) {
      dispatch(getAllStories());
    }
  } catch (error) {
    console.error("Failed to view story:", error);
  }
};

export const toggleLikeStory = (storyId) => async (dispatch) => {
  try {
    const { data } = await axiosInstance.put(`/story/${storyId}/like`);
    if (data?.success) {
      toast.success(data?.message);
      dispatch(getAllStories());
    }
  } catch (error) {
    console.error("Failed to toggle like on story:", error);
  }
};

export const addCommentToStory = (storyId, commentText) => async (dispatch) => {
  try {
    const { data } = await axiosInstance.post(`/story/${storyId}/comment`, { text: commentText });
    if (data?.success) {
      toast.success("Comment added!");
      dispatch(getAllStories());
    }
  } catch (error) {
    console.error("Failed to add comment to story:", error);
  }
};

export const deleteStory = (storyId) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const { data } = await axiosInstance.delete(`/story/${storyId}`);
    if (data?.success) {
      toast.success(data?.message || "Story deleted successfully!");
      dispatch(getAllStories());
    }
  } catch (error) {
    dispatch(setError(error?.response?.data?.message || error?.message || "Failed to delete story."));
    toast.error(error?.response?.data?.message || error?.message || "Failed to delete story.");
  } finally {
    dispatch(setLoading(false));
  }
};
