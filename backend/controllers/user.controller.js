import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { getIO } from "../socket/socket.js";
import { sendEmail } from "../utils/mailer.js";
import { getPasswordResetTemplate } from "../utils/emailTemplates.js";

const isProduction = process.env.NODE_ENV === "production";

const cookieOptions = {
  httpOnly: true,
  maxAge: 30 * 24 * 60 * 60 * 1000,
  secure: isProduction,
  // Required for cross-origin auth cookies in production (Vercel <-> Render)
  sameSite: isProduction ? "none" : "lax",
};

const generateToken = (userId) => {
  return jwt.sign({ _id: userId }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

export const registerUser = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    if (!username || !email || !password) {
      return res.status(422).json({ message: "All fields are required" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const normalizedUsername = username.toLowerCase().trim();

    if (/\s/.test(username)) {
      return res.status(400).json({ message: "Username cannot contain spaces" });
    }

    const existingEmail = await User.findOne({
      email: normalizedEmail,
    });
    if (existingEmail) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const existingUsername = await User.findOne({
      username: normalizedUsername,
    });
    if (existingUsername) {
      return res.status(400).json({ message: "Username already taken" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username: normalizedUsername,
      email: normalizedEmail,
      password: hashedPassword,
    });
    const savedUser = await newUser.save();

    const token = generateToken(savedUser._id);

    const { password: _, ...userData } = savedUser._doc; // Exclude password from the response

    return res.status(201).cookie("token", token, cookieOptions).json({
      success: true,
      message: "User registered successfully",
      user: userData,
      token,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Registration error : " + error.message,
    });
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(422).json({ message: "All fields are required" });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({
      email: normalizedEmail,
    });
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    const token = generateToken(user._id);

    const { password: _, ...userData } = user._doc; // Exclude password from the response

    return res.status(200).cookie("token", token, cookieOptions).json({
      success: true,
      message: "User logged in successfully",
      user: userData,
      token,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Login error : " + error.message });
  }
};

export const logoutUser = async (req, res) => {
  try {
    return res.status(200).clearCookie("token", cookieOptions).json({
      success: true,
      message: "User logged out successfully",
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Logout error : " + error.message });
  }
};

export const profileUser = async (req, res) => {
  try {
    const userId = req.user?._id;
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Profile error : " + error.message });
  }
};

export const uploadProfileImage = async (req, res) => {
  try {
    const userId = req.user._id;
    const profileImageUrl = req.file.path;
    if (!profileImageUrl) {
      return res
        .status(400)
        .json({ success: false, message: "No image uploaded" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profileImage: profileImageUrl },
      { new: true },
    ).select("-password");

    return res.status(200).json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Profile Image upload error : " + error.message,
    });
  }
};

export const allUsers = async (req, res) => {
  try {
    const users = await User.find();
    return res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching users : " + error.message,
    });
  }
};

export const getProfileById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password")
      .populate({
        path: "posts",
        select: "mediaUrl mediaType caption likes comment createdAt",
        options: { sort: { createdAt: -1 } },
      })
      .populate("followers", "username profileImage")
      .populate("following", "username profileImage");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching user profile: " + error.message,
    });
  }
};

export const getSuggestedUsers = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    const currentUser = await User.findById(currentUserId);
    if (!currentUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const suggestedUsers = await User.find({
      _id: { $ne: currentUserId, $nin: currentUser.following },
    })
      .select("username profileImage bio")
      .limit(5);

    return res.status(200).json({
      success: true,
      users: suggestedUsers,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching suggested users: " + error.message,
    });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { username, bio } = req.body;

    if (!username) {
      return res
        .status(400)
        .json({ success: false, message: "Username is required" });
    }

    const normalizedUsername = username.toLowerCase().trim();

    if (/\s/.test(username)) {
      return res
        .status(400)
        .json({ success: false, message: "Username cannot contain spaces" });
    }

    const existingUser = await User.findOne({ username: normalizedUsername });
    if (existingUser && existingUser._id.toString() !== userId.toString()) {
      return res
        .status(400)
        .json({ success: false, message: "Username is already taken" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { username: normalizedUsername, bio },
      { new: true },
    ).select("-password");

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error updating profile: " + error.message,
    });
  }
};

export const followUser = async (req, res) => {
  try {
    const targetUserId = req.body.targetUserId || req.params.id;
    const currentUserId = req.user._id;

    if (targetUserId === currentUserId.toString()) {
      return res
        .status(400)
        .json({ success: false, message: "You cannot follow yourself" });
    }

    const targetUser = await User.findById(targetUserId);
    const currentUser = await User.findById(currentUserId);

    if (!targetUser || !currentUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (currentUser.following.includes(targetUserId)) {
      return res
        .status(400)
        .json({ success: false, message: "You already follow this user" });
    }

    await User.findByIdAndUpdate(currentUserId, {
      $push: { following: targetUserId },
    });
    await User.findByIdAndUpdate(targetUserId, {
      $push: { followers: currentUserId },
    });

    return res
      .status(200)
      .json({ success: true, message: "User followed successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({
        success: false,
        message: "Error following user: " + error.message,
      });
  }
};

export const unfollowUser = async (req, res) => {
  try {
    const targetUserId = req.body.targetUserId || req.params.id;
    const currentUserId = req.user._id;

    if (targetUserId === currentUserId.toString()) {
      return res
        .status(400)
        .json({ success: false, message: "You cannot unfollow yourself" });
    }

    const targetUser = await User.findById(targetUserId);
    const currentUser = await User.findById(currentUserId);

    if (!targetUser || !currentUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (!currentUser.following.includes(targetUserId)) {
      return res
        .status(400)
        .json({ success: false, message: "You do not follow this user" });
    }

    // Filter array to remove target user's ID
    currentUser.following = currentUser.following.filter(
      (id) => id.toString() !== targetUserId.toString(),
    );
    await currentUser.save();

    targetUser.followers = targetUser.followers.filter(
      (id) => id.toString() !== currentUserId.toString(),
    );
    await targetUser.save();

    return res
      .status(200)
      .json({ success: true, message: "User unfollowed successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({
        success: false,
        message: "Error unfollowing user: " + error.message,
      });
  }
};

export const getFollowers = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate(
      "followers",
      "username profileImage",
    );
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    return res.status(200).json({ success: true, followers: user.followers });
  } catch (error) {
    return res
      .status(500)
      .json({
        success: false,
        message: "Error fetching followers: " + error.message,
      });
  }
};

export const getFollowing = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate(
      "following",
      "username profileImage",
    );
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    return res.status(200).json({ success: true, following: user.following });
  } catch (error) {
    return res
      .status(500)
      .json({
        success: false,
        message: "Error fetching following: " + error.message,
      });
  }
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      // Standard security: don't reveal if user doesn't exist
      return res.status(200).json({
        success: true,
        message: "If that email exists in our system, we have sent a reset link.",
      });
    }

    // Generate token
    const token = crypto.randomBytes(20).toString("hex");
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour expiration
    await user.save();

    // Reset Link URL
    const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173";
    const resetUrl = `${clientOrigin}/login?token=${token}`;

    const htmlContent = getPasswordResetTemplate(resetUrl);

    await sendEmail({
      to: user.email,
      subject: "RUNTIME Password Reset Request",
      html: htmlContent,
    });

    return res.status(200).json({
      success: true,
      message: "If that email exists in our system, we have sent a reset link.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error sending password reset link: " + error.message,
    });
  }
};

export const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  try {
    if (!token || !newPassword) {
      return res.status(400).json({ success: false, message: "Token and password are required" });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Password reset token is invalid or has expired.",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters.",
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password has been reset successfully. You can now log in.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error resetting password: " + error.message,
    });
  }
};
