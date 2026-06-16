import { createSlice } from "@reduxjs/toolkit";
import toast from "react-hot-toast";
import { axiosInstance } from "../../lib/axios.js";
import { connectSocket, disconnectSocket } from "../../lib/socket.js";

const initialState = {
  user: null,
  selectedUser: null,
  loading: false,
  error: null,
  isAuthenticated: false,
  socket: null, // Track socket connection globally
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    setSelectedUser: (state, action) => {
      state.selectedUser = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setSocket: (state, action) => {
      state.socket = action.payload;
    },
    setSavedPost: (state, action) => {
      if (state.user) {
        state.user.savedPosts = action.payload;
      }
    },
  },
});

export const { setUser, setSelectedUser, setLoading, setError, setSocket, setSavedPost } = userSlice.actions;

export default userSlice.reducer;

// Socket Thunks
export const connectSocketThunk = (userId) => (dispatch) => {
  const s = connectSocket(userId);
  if (s) {
    dispatch(setSocket("connected"));
  }
};

export const disconnectSocketThunk = () => (dispatch) => {
  disconnectSocket();
  dispatch(setSocket(null));
};

export const registerUser = (userData, navigate) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const { data } = await axiosInstance.post("/user/register", userData);
    if (data.success) {
      dispatch(setUser(data?.user));
      dispatch(connectSocketThunk(data.user._id));
      toast.success(data?.message || "Registered successfully!");
      if (navigate) navigate("/");
    }
  } catch (error) {
    dispatch(setError(error.response?.data?.message || "Registration failed."));
  } finally {
    dispatch(setLoading(false));
  }
};

export const loginUser = (userData, navigate) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const { data } = await axiosInstance.post("/user/login", userData);
    if (data.success) {
      dispatch(setUser(data?.user));
      dispatch(connectSocketThunk(data.user._id));
      toast.success(data?.message || "Logged in successfully!");
      if (navigate) navigate("/");
    }
  } catch (error) {
    dispatch(setError(error.response?.data?.message || "Login failed."));
  } finally {
    dispatch(setLoading(false));
  }
};

export const getCurrentUser = () => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const { data } = await axiosInstance.get("/user/profile");
    if (data.success) {
      dispatch(setUser(data?.user));
      dispatch(connectSocketThunk(data.user._id));
    }
  } catch (error) {
    dispatch(
      setError(
        error.response?.data?.message || "Failed to fetch user profile.",
      ),
    );
  } finally {
    dispatch(setLoading(false));
  }
};

export const logoutUser = (navigate) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const { data } = await axiosInstance.get("/user/logout");
    if (data.success) {
      dispatch(setUser(null));
      dispatch(disconnectSocketThunk());
      toast.success(data?.message || "Logged out successfully!");
      if (navigate) navigate("/");
    }
  } catch (error) {
    dispatch(setError(error.response?.data?.message || "Logout failed."));
  } finally {
    dispatch(setLoading(false));
  }
};

export const updateProfileImage = (userData) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const { data } = await axiosInstance.post("/user/upload-profile", userData);
    if (data.success) {
      dispatch(setUser(data?.user));
      toast.success(data?.message || "Profile image updated successfully!");
    }
  } catch (error) {
    dispatch(
      setError(
        error.response?.data?.message || "Failed to update profile image.",
      ),
    );
    // toast.error(error.response?.data?.message || "Failed to update profile image.");
  } finally {
    dispatch(setLoading(false));
  }
};

export const followUser = (userId) => async (dispatch) => {
  try {
    const { data } = await axiosInstance.post(`/user/${userId}/follow`);
    if (data.success) {
      // Re-fetch current user to get updated following array
      dispatch(getCurrentUser());
    }
  } catch (error) {
    console.error("Follow error:", error);
    toast.error(error.response?.data?.message || "Failed to follow user");
  }
};

export const toggleSavePost = (postId) => async (dispatch) => {
  try {
    const { data } = await axiosInstance.put(`/post/${postId}/bookmark`);
    if (data.success) {
      dispatch(setSavedPost(data.savedPosts));
      toast.success(data.message);
    }
  } catch (error) {
    console.error("Save post error:", error);
    toast.error(error.response?.data?.message || "Failed to save post");
  }
};

export const getProfileById = (userId) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const { data } = await axiosInstance.get(`/user/${userId}`);
    if (data.success) {
      dispatch(setSelectedUser(data.user));
    }
  } catch (error) {
    console.error("Get profile by id error:", error);
    dispatch(setError(error.response?.data?.message || "Failed to fetch profile"));
  } finally {
    dispatch(setLoading(false));
  }
};

export const getSuggestedUsers = () => async (dispatch) => {
  try {
    const { data } = await axiosInstance.get("/user/suggested");
    if (data.success) {
      return data.users;
    }
  } catch (error) {
    console.error("Get suggested users error:", error);
    return [];
  }
};

export const updateUserProfile = (profileData, callback) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const { data } = await axiosInstance.put("/user/update", profileData);
    if (data.success) {
      dispatch(setUser(data.user));
      toast.success(data.message || "Profile updated successfully!");
      if (callback) callback();
    }
  } catch (error) {
    console.error("Update profile error:", error);
    toast.error(error.response?.data?.message || "Failed to update profile");
    dispatch(setError(error.response?.data?.message || "Failed to update profile"));
  } finally {
    dispatch(setLoading(false));
  }
};
