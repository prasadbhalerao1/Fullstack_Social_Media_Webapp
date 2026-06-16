import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import uploadCloudinary from "../middleware/cloudinaryUpload.js";
import {
  addCommentToPost,
  createPost,
  deletePostsById,
  getAllPosts,
  getPostsById,
  toggleLikePost,
  toggleSavePost,
} from "../controllers/post.controller.js";

const router = Router();

router.post(
  "/create",
  authMiddleware,
  uploadCloudinary.single("media"),
  createPost,
);

router.get("/all", authMiddleware, getAllPosts);
router.get("/:id", authMiddleware, getPostsById);
router.delete("/:id", authMiddleware, deletePostsById);
router.put("/:id/like", authMiddleware, toggleLikePost);
router.put("/:id/bookmark", authMiddleware, toggleSavePost);
router.post("/:id/comment", authMiddleware, addCommentToPost);

export default router;
