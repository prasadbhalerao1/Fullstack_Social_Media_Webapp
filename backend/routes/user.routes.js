import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  profileUser,
  allUsers,
  uploadProfileImage,
  getProfileById,
  getSuggestedUsers,
  updateUserProfile,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
} from "../controllers/user.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import uploadCloudinary from "../middleware/cloudinaryUpload.js";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/logout", logoutUser);
router.get("/profile", authMiddleware, profileUser);
router.get("/suggested", authMiddleware, getSuggestedUsers);
router.put("/update", authMiddleware, updateUserProfile);
router.post("/follow", authMiddleware, followUser);
router.post("/unfollow", authMiddleware, unfollowUser);
router.get("/:id/followers", authMiddleware, getFollowers);
router.get("/:id/following", authMiddleware, getFollowing);

router.post(
  "/upload-profile",
  authMiddleware,
  uploadCloudinary.single("profileImage"),
  uploadProfileImage,
);

router.get("/all", allUsers);
router.get("/:id", authMiddleware, getProfileById);

export default router;
