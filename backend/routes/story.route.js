import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import uploadCloudinary from "../middleware/cloudinaryUpload.js";
import {
  addCommentToStory,
  createStory,
  deleteStoriesById,
  getAllStories,
  toggleLikeStory,
  viewStory
} from "../controllers/story.controller.js";

const router = Router();

router.post(
  "/create",
  authMiddleware,
  uploadCloudinary.single("media"),
  createStory,
);

router.get("/all", authMiddleware, getAllStories);
router.get("/:id/view", authMiddleware, viewStory);
router.get("/:id", authMiddleware, getAllStories);
router.delete("/:id", authMiddleware, deleteStoriesById);
router.put("/:id/like", authMiddleware, toggleLikeStory);
router.post("/:id/comment", authMiddleware, addCommentToStory);

export default router;
