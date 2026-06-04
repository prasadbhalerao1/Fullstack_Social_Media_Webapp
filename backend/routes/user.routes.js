import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  profileUser,
  allUsers,
} from "../controllers/user.controller.js";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/logout", logoutUser);
router.get("/profile", profileUser);
router.get("/all", allUsers);

export default router;
