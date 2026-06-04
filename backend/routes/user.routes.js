import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  profileUser,
  allUsers,
} from "../controllers/user.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/logout", logoutUser);
router.get("/profile", authMiddleware, profileUser);
router.get("/all", allUsers);

export default router;
