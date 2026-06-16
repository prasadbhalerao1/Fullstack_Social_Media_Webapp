// Socket server for real-time messaging, delivery status, and online presence

import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import Message from "../models/message.model.js";

/** @type {Server} */
let io;

// Map to track active socket IDs per user (handles multiple tabs)
const onlineUsers = new Map();

const getOnlineUsersMap = () => {
  const map = {};
  for (const [userId, sockets] of onlineUsers.entries()) {
    if (sockets.size > 0) {
      map[userId] = Array.from(sockets)[0];
    }
  }
  return map;
};

// Parse the JWT from the cookie header
const parseCookieToken = (cookieHeader = "") => {
  const match = cookieHeader.match(/(?:^|;\s*)token=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
};

export const initSocket = (httpServer) => {
  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",")
    : [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
      ];

  io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins,
      credentials: true,
    },
    connectionStateRecovery: {
      maxDisconnectionDuration: 2 * 60 * 1000,
    },
  });

  // Authenticate socket connections using JWT
  io.use(async (socket, next) => {
    try {
      const userId = socket.handshake.query.userId;
      if (!userId) {
        return next(new Error("UNAUTHORIZED: userId query param is required"));
      }

      const token =
        parseCookieToken(socket.handshake.headers.cookie) ||
        socket.handshake.auth?.token;

      if (!token) return next(new Error("UNAUTHORIZED: token not found"));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded._id.toString() !== userId.toString()) {
        return next(new Error("UNAUTHORIZED: userId mismatch with token"));
      }

      const user = await User.findById(userId).select("-password");
      if (!user) return next(new Error("USER_NOT_FOUND"));

      socket.user = user;
      next();
    } catch (err) {
      next(new Error("AUTH_FAILED: " + err.message));
    }
  });

  io.on("connection", async (socket) => {
    const userId = socket.user._id.toString();

    // Track this socket connection
    if (!onlineUsers.has(userId)) onlineUsers.set(userId, new Set());
    onlineUsers.get(userId).add(socket.id);

    // Personal room for targeted messages
    socket.join(userId);

    // Clear lastSeen timestamp to mark user as online
    await User.findByIdAndUpdate(userId, { lastSeen: null });

    broadcastOnlineUsers();

    // Deliver messages that arrived while user was offline
    await deliverPendingMessages(userId);

    // Rooms to target specific chats
    socket.on("join_conversation", ({ conversationId }) => {
      if (conversationId) socket.join(`conv_${conversationId}`);
    });

    socket.on("leave_conversation", ({ conversationId }) => {
      if (conversationId) socket.leave(`conv_${conversationId}`);
    });

    // Typing indicators
    socket.on("typing_start", ({ conversationId, receiverId }) => {
      if (!receiverId) return;
      socket.to(receiverId).emit("typing_indicator", {
        conversationId,
        userId,
        isTyping: true,
      });
    });

    socket.on("typing_stop", ({ conversationId, receiverId }) => {
      if (!receiverId) return;
      socket.to(receiverId).emit("typing_indicator", {
        conversationId,
        userId,
        isTyping: false,
      });
    });

    // Mark messages as read when the user opens a conversation
    socket.on("messages_seen", async ({ conversationId }) => {
      try {
        const msgs = await Message.find({
          conversationId,
          receiver: userId,
          status: { $ne: "read" },
        }).select("_id sender");

        if (!msgs.length) return;

        const messageIds = msgs.map((m) => m._id.toString());

        await Message.updateMany(
          { _id: { $in: messageIds } },
          { status: "read" },
        );

        // Tell each sender their messages were read
        const senderIds = [...new Set(msgs.map((m) => m.sender.toString()))];
        senderIds.forEach((senderId) => {
          io.to(senderId).emit("message_status_update", {
            conversationId,
            messageIds,
            status: "read",
          });
        });
      } catch (err) {
        console.error("[Socket] messages_seen error:", err.message);
      }
    });

    // Delete message (for me or for everyone)
    socket.on("delete_message", async ({ messageId, deleteFor }) => {
      try {
        const msg = await Message.findById(messageId);
        if (!msg) return;

        // Only the sender can delete for everyone
        if (deleteFor === "everyone" && msg.sender.toString() !== userId)
          return;

        if (deleteFor === "everyone") {
          msg.text = "";
          msg.mediaUrl = null;
          msg.mediaType = null;
          msg.deletedFor = [msg.sender, msg.receiver];
          await msg.save();

          [msg.sender.toString(), msg.receiver.toString()].forEach((uid) => {
            io.to(uid).emit("message_deleted", {
              messageId,
              conversationId: msg.conversationId,
              deleteFor: "everyone",
            });
          });
        } else {
          if (!msg.deletedFor.map(String).includes(userId)) {
            msg.deletedFor.push(userId);
            await msg.save();
          }
          socket.emit("message_deleted", {
            messageId,
            conversationId: msg.conversationId,
            deleteFor: "me",
          });
        }
      } catch (err) {
        console.error("[Socket] delete_message error:", err.message);
      }
    });

    // Edit a message (sender only)
    socket.on("edit_message", async ({ messageId, text }) => {
      try {
        if (!text?.trim()) return;
        const msg = await Message.findById(messageId);
        if (!msg || msg.sender.toString() !== userId) return;

        msg.text = text.trim();
        msg.isEdited = true;
        msg.editedAt = new Date();
        await msg.save();

        const payload = {
          messageId,
          conversationId: msg.conversationId,
          text: msg.text,
          editedAt: msg.editedAt,
        };

        io.to(msg.receiver.toString()).emit("message_edited", payload);
        socket.emit("message_edited", payload);
      } catch (err) {
        console.error("[Socket] edit_message error:", err.message);
      }
    });

    // Emoji reactions (toggle same emoji off, change emoji)
    socket.on("react_message", async ({ messageId, emoji }) => {
      try {
        const msg = await Message.findById(messageId);
        if (!msg) return;

        const idx = msg.reactions.findIndex(
          (r) => r.user.toString() === userId,
        );

        if (idx !== -1) {
          if (msg.reactions[idx].emoji === emoji) {
            msg.reactions.splice(idx, 1); // same emoji → remove
          } else {
            msg.reactions[idx].emoji = emoji; // different emoji → update
          }
        } else {
          msg.reactions.push({ user: userId, emoji });
        }

        await msg.save();

        const payload = {
          messageId,
          conversationId: msg.conversationId,
          reactions: msg.reactions,
        };

        const otherUserId =
          msg.sender.toString() === userId
            ? msg.receiver.toString()
            : msg.sender.toString();

        io.to(otherUserId).emit("message_reaction", payload);
        socket.emit("message_reaction", payload);
      } catch (err) {
        console.error("[Socket] react_message error:", err.message);
      }
    });

    // Clean up on disconnect
    socket.on("disconnect", async () => {
      await handleDisconnected(socket);
    });
  });

  return io;
};

const handleDisconnected = async (socket) => {
  const userId = socket.user?._id?.toString();
  if (!userId) return;

  if (onlineUsers.has(userId)) {
    const sockets = onlineUsers.get(userId);
    sockets.delete(socket.id);
    if (sockets.size === 0) {
      onlineUsers.delete(userId);
      const lastSeen = new Date();
      await User.findByIdAndUpdate(userId, { lastSeen });
      io.emit("user_last_seen", { userId, lastSeen });
    }
  }
  broadcastOnlineUsers();
};

const broadcastOnlineUsers = () => {
  io.emit("online_users", Array.from(onlineUsers.keys()));
  io.emit("getOnlineUsers", getOnlineUsersMap());
};

// Update pending "sent" messages to "delivered" when user reconnects
const deliverPendingMessages = async (userId) => {
  try {
    const msgs = await Message.find({
      receiver: userId,
      status: "sent",
    }).select("_id sender conversationId");

    if (!msgs.length) return;

    const ids = msgs.map((m) => m._id);
    await Message.updateMany({ _id: { $in: ids } }, { status: "delivered" });

    // Group by sender to send fewer socket events
    const bySender = {};
    msgs.forEach((m) => {
      const sid = m.sender.toString();
      if (!bySender[sid]) bySender[sid] = [];
      bySender[sid].push({
        messageId: m._id,
        conversationId: m.conversationId,
      });
    });

    Object.entries(bySender).forEach(([senderId, updates]) => {
      io.to(senderId).emit("message_status_bulk_update", {
        updates: updates.map((u) => ({ ...u, status: "delivered" })),
      });
    });
  } catch (err) {
    console.error("[Socket] deliverPendingMessages error:", err.message);
  }
};

export const getIO = () => io;
export const getOnlineUsers = () => onlineUsers;
export const isUserOnline = (userId) => onlineUsers.has(userId.toString());
