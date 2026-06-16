import { createSlice } from "@reduxjs/toolkit";
import toast from "react-hot-toast";
import { axiosInstance } from "../../lib/axios.js";

const initialState = {
  user: null,
  loading: false,
  error: null,
  isAuthenticated: false,
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const { setUser, setLoading, setError } = userSlice.actions;

export default userSlice.reducer;

export const registerUser = (userData, navigate) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const { data } = await axiosInstance.post("/user/register", userData);
    if (data.success) {
      dispatch(setUser(data?.user));
      toast.success(data?.message || "Registered successfully!");
      if (navigate) navigate("/");
    }
  } catch (error) {
    dispatch(setError(error.response?.data?.message || "Registration failed."));
    // toast.error(error.response?.data?.message || "Registration failed.");
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
      toast.success(data?.message || "Logged in successfully!");
      if (navigate) navigate("/");
    }
  } catch (error) {
    dispatch(setError(error.response?.data?.message || "Login failed."));
    // toast.error(error.response?.data?.message || "Login failed.");
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
