import { createSlice } from "@reduxjs/toolkit";
import toast from "react-hot-toast";
import { axiosInstance } from "../../lib/axios.js";

const initialState = {
  reels: [],
  loading: false,
  error: null,
  isMutedGlobal: true,
  hasMore: true,
  nextCursor: null,
};

export const reelsSlice = createSlice({
  name: "reels",
  initialState,
  reducers: {
    setReels: (state, action) => {
      state.reels = action.payload;
    },
    appendReels: (state, action) => {
      const existingIds = new Set(state.reels.map((r) => r._id));
      const newReels = action.payload.filter((r) => !existingIds.has(r._id));
      state.reels = [...state.reels, ...newReels];
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
    updateReelLike: (state, action) => {
      const { reelId, likes } = action.payload;
      const reel = state.reels.find((r) => r._id === reelId);
      if (reel) {
        reel.likes = likes;
      }
    },
    updateReelComment: (state, action) => {
      const { reelId, comment } = action.payload;
      const reel = state.reels.find((r) => r._id === reelId);
      if (reel) {
        reel.comment = comment;
      }
    },
    removeReel: (state, action) => {
      state.reels = state.reels.filter((r) => r._id !== action.payload);
    },
    setIsMutedGlobal: (state, action) => {
      state.isMutedGlobal = action.payload;
    },
  },
});

export const {
  setReels,
  appendReels,
  setHasMore,
  setNextCursor,
  setLoading,
  setError,
  updateReelLike,
  updateReelComment,
  removeReel,
  setIsMutedGlobal,
} = reelsSlice.actions;

export default reelsSlice.reducer;

export const getAllReels = (cursor = null) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const params = new URLSearchParams({ limit: 10 });
    if (cursor) params.set("cursor", cursor);
    const { data } = await axiosInstance.get(`/reel/all?${params}`);
    if (data.success) {
      if (cursor) {
        dispatch(appendReels(data.reels));
      } else {
        dispatch(setReels(data.reels));
      }
      dispatch(setHasMore(data.hasMore));
      dispatch(setNextCursor(data.nextCursor));
    }
  } catch (error) {
    dispatch(setError(error.response?.data?.message || "Failed to fetch reels."));
  } finally {
    dispatch(setLoading(false));
  }
};

export const toggleLikeReel = (reelId) => async (dispatch) => {
  try {
    const { data } = await axiosInstance.put(`/reel/${reelId}/like`);
    if (data.success) {
      dispatch(updateReelLike({ reelId, likes: data.reel }));
    }
  } catch (error) {
    console.error("Like reel error:", error);
    toast.error(error.response?.data?.message || "Failed to like reel");
  }
};

export const addCommentToReel = (reelId, text) => async (dispatch) => {
  try {
    const { data } = await axiosInstance.post(`/reel/${reelId}/comment`, { text });
    if (data.success) {
      dispatch(updateReelComment({ reelId, comment: data.comment }));
    }
  } catch (error) {
    console.error("Comment reel error:", error);
    toast.error(error.response?.data?.message || "Failed to add comment to reel");
  }
};

export const deleteReelById = (reelId) => async (dispatch) => {
  try {
    const { data } = await axiosInstance.delete(`/reel/${reelId}`);
    if (data.success) {
      dispatch(removeReel(reelId));
      toast.success(data.message || "Reel deleted");
    }
  } catch (error) {
    console.error("Delete reel error:", error);
    toast.error(error.response?.data?.message || "Failed to delete reel");
  }
};
