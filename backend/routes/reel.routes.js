import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import uploadCloudinary from "../middleware/cloudinaryUpload.js";
import {
  addCommentToReel,
  createReel,
  deleteReelsById,
  getAllReels,
  getReelsById,
  toggleLikeReel,
} from "../controllers/reel.controller.js";

const router = Router();

router.post(
  "/create",
  authMiddleware,
  uploadCloudinary.single("media"),
  createReel,
);

router.get("/all", authMiddleware, getAllReels);
router.get("/:id", authMiddleware, getReelsById);
router.delete("/:id", authMiddleware, deleteReelsById);
router.put("/:id/like", authMiddleware, toggleLikeReel);
router.post("/:id/comment", authMiddleware, addCommentToReel);

export default router;
