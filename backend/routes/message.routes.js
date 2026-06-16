import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import uploadCloudinary from "../middleware/cloudinaryUpload.js";
import {
  getOrCreateConversation,
  getConversations,
  getMessages,
  sendMessage,
  toggleBlockUser,
  deleteMessage,
} from "../controllers/message.controller.js";

const router = Router();

router.use(authMiddleware);

// Conversations
router.get("/conversations", getConversations);
router.post("/conversation/:userId", getOrCreateConversation);

// Messages — GET uses cursor-based pagination (?cursor=lastMessageId)
router.get("/:conversationId", getMessages);
router.post("/send", uploadCloudinary.single("media"), sendMessage);
router.delete("/:messageId", deleteMessage);

// Block / unblock
router.post("/block/:userId", toggleBlockUser);

export default router;
