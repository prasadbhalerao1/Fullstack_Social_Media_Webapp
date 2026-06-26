import { createSlice } from "@reduxjs/toolkit";
import toast from "react-hot-toast";
import { axiosInstance } from "../../lib/axios.js";
import { connectSocket, disconnectSocket } from "../../lib/socket.js";

const initialState = {
  user: null,
  selectedUser: null,
  loading: false,
  profileLoading: false,
  error: null,
  isAuthenticated: false,
  socket: null, // Track socket connection globally
  isCheckingAuth: true, // Track the initial authentication check
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
    setProfileLoading: (state, action) => {
      state.profileLoading = action.payload;
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
    updateFollowState: (state, action) => {
      const { currentUserId, targetUserId } = action.payload;

      // Update currentUser's following list
      if (state.user) {
        if (!state.user.following) state.user.following = [];
        const index = state.user.following.indexOf(targetUserId);
        if (index === -1) {
          state.user.following.push(targetUserId);
        } else {
          state.user.following.splice(index, 1);
        }
      }

      // Update selectedUser's followers list if we are viewing the target profile page
      if (state.selectedUser && state.selectedUser._id === targetUserId) {
        if (!state.selectedUser.followers) state.selectedUser.followers = [];
        const isFollowerPresent = state.selectedUser.followers.some(
          (f) => (f._id || f) === currentUserId,
        );
        if (isFollowerPresent) {
          state.selectedUser.followers = state.selectedUser.followers.filter(
            (f) => (f._id || f) !== currentUserId,
          );
        } else {
          const currentMockUser = state.user
            ? {
                _id: state.user._id,
                username: state.user.username,
                profileImage: state.user.profileImage,
              }
            : currentUserId;
          state.selectedUser.followers.push(currentMockUser);
        }
      }
    },
    setCheckingAuth: (state, action) => {
      state.isCheckingAuth = action.payload;
    },
  },
});

export const {
  setUser,
  setSelectedUser,
  setLoading,
  setProfileLoading,
  setError,
  setSocket,
  setSavedPost,
  updateFollowState,
  setCheckingAuth,
} = userSlice.actions;

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
    const errorMsg = error.response?.data?.message || "Registration failed.";
    dispatch(setError(errorMsg));
    toast.error(errorMsg);
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
    const errorMsg = error.response?.data?.message || "Login failed.";
    dispatch(setError(errorMsg));
    toast.error(errorMsg);
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
    dispatch(setCheckingAuth(false));
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

export const followUser = (userId) => async (dispatch, getState) => {
  try {
    const { user: currentUser } = getState().user;
    const isFollowing = currentUser?.following?.includes(userId);
    const endpoint = isFollowing ? "/user/unfollow" : "/user/follow";

    const { data } = await axiosInstance.post(endpoint, {
      targetUserId: userId,
    });
    if (data.success) {
      if (currentUser) {
        dispatch(
          updateFollowState({
            currentUserId: currentUser._id,
            targetUserId: userId,
          }),
        );
      }
      toast.success(data.message);
    }
  } catch (error) {
    console.error("Follow error:", error);
    toast.error(error.response?.data?.message || "Failed to follow user");
  }
};

export const fetchFollowers = (userId) => async () => {
  try {
    const { data } = await axiosInstance.get(`/user/${userId}/followers`);
    if (data.success) {
      return data.followers;
    }
  } catch (error) {
    console.error("Fetch followers error:", error);
    toast.error(error.response?.data?.message || "Failed to fetch followers");
  }
};

export const fetchFollowing = (userId) => async () => {
  try {
    const { data } = await axiosInstance.get(`/user/${userId}/following`);
    if (data.success) {
      return data.following;
    }
  } catch (error) {
    console.error("Fetch following error:", error);
    toast.error(error.response?.data?.message || "Failed to fetch following");
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
  dispatch(setProfileLoading(true));
  try {
    const { data } = await axiosInstance.get(`/user/${userId}`);
    if (data.success) {
      dispatch(setSelectedUser(data.user));
    }
  } catch (error) {
    console.error("Get profile by id error:", error);
    dispatch(
      setError(error.response?.data?.message || "Failed to fetch profile"),
    );
  } finally {
    dispatch(setProfileLoading(false));
  }
};

export const getSuggestedUsers = () => async () => {
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

export const updateUserProfile =
  (profileData, callback) => async (dispatch) => {
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
      dispatch(
        setError(error.response?.data?.message || "Failed to update profile"),
      );
    } finally {
      dispatch(setLoading(false));
    }
  };

export const forgotPassword = (emailData, callback) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const { data } = await axiosInstance.post("/user/forgot-password", emailData);
    if (data.success) {
      toast.success(data.message || "Reset instructions sent!");
      if (callback) callback();
    }
  } catch (error) {
    toast.error(error.response?.data?.message || "Failed to request reset link.");
  } finally {
    dispatch(setLoading(false));
  }
};

export const passwordChange = (resetData, callback) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const { data } = await axiosInstance.post("/user/reset-password", resetData);
    if (data.success) {
      toast.success(data.message || "Password changed successfully!");
      if (callback) callback();
    }
  } catch (error) {
    toast.error(error.response?.data?.message || "Failed to change password.");
  } finally {
    dispatch(setLoading(false));
  }
};
