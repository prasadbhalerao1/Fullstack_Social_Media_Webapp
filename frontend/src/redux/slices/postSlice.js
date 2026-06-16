import { createSlice } from "@reduxjs/toolkit";
import toast from "react-hot-toast";
import { axiosInstance } from "../../lib/axios.js";

const initialState = {
  posts: [],
  loading: false,
  error: null,
  hasMore: true,
  nextCursor: null,
};

export const postSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {
    setPosts: (state, action) => {
      state.posts = action.payload;
    },
    appendPosts: (state, action) => {
      // Deduplicate by _id before appending
      const existingIds = new Set(state.posts.map((p) => p._id));
      const newPosts = action.payload.filter((p) => !existingIds.has(p._id));
      state.posts = [...state.posts, ...newPosts];
    },
    setHasMore: (state, action) => {
      state.hasMore = action.payload;
    },
    setNextCursor: (state, action) => {
      state.nextCursor = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    updatePostLike: (state, action) => {
      const { postId, likes } = action.payload;
      const post = state.posts.find((p) => p._id === postId);
      if (post) {
        post.likes = likes;
      }
    },
    updatePostComment: (state, action) => {
      const { postId, comment } = action.payload;
      const post = state.posts.find((p) => p._id === postId);
      if (post) {
        post.comment = comment;
      }
    },
    removePost: (state, action) => {
      state.posts = state.posts.filter((p) => p._id !== action.payload);
    },
  },
});

export const {
  setPosts,
  appendPosts,
  setHasMore,
  setNextCursor,
  setLoading,
  setError,
  updatePostLike,
  updatePostComment,
  removePost,
} = postSlice.actions;

export default postSlice.reducer;

export const getAllPosts =
  (cursor = null) =>
  async (dispatch) => {
    dispatch(setLoading(true));
    try {
      const params = new URLSearchParams({ limit: 10 });
      if (cursor) params.set("cursor", cursor);
      const { data } = await axiosInstance.get(`/post/all?${params}`);
      if (data.success) {
        if (cursor) {
          dispatch(appendPosts(data.posts));
        } else {
          dispatch(setPosts(data.posts));
        }
        dispatch(setHasMore(data.hasMore));
        dispatch(setNextCursor(data.nextCursor));
      }
    } catch (error) {
      dispatch(
        setError(error.response?.data?.message || "Failed to fetch posts."),
      );
    } finally {
      dispatch(setLoading(false));
    }
  };

export const toggleLikePost = (postId) => async (dispatch) => {
  try {
    const { data } = await axiosInstance.put(`/post/${postId}/like`);
    if (data.success) {
      dispatch(updatePostLike({ postId, likes: data.post }));
    }
  } catch (error) {
    console.error("Like error:", error);
    toast.error(error.response?.data?.message || "Failed to like post");
  }
};

export const addCommentToPost = (postId, text) => async (dispatch) => {
  try {
    const { data } = await axiosInstance.post(`/post/${postId}/comment`, {
      text,
    });
    if (data.success) {
      dispatch(updatePostComment({ postId, comment: data.comment }));
    }
  } catch (error) {
    console.error("Comment error:", error);
    toast.error(error.response?.data?.message || "Failed to add comment");
  }
};

export const deletePostById = (postId) => async (dispatch) => {
  try {
    const { data } = await axiosInstance.delete(`/post/${postId}`);
    if (data.success) {
      dispatch(removePost(postId));
      toast.success(data.message || "Post deleted");
    }
  } catch (error) {
    console.error("Delete error:", error);
    toast.error(error.response?.data?.message || "Failed to delete post");
  }
};
