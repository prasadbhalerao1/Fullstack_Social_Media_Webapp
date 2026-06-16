import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import { getIO, isUserOnline } from "../socket/socket.js";

const MSG_LIMIT = 30;

// Populate a message with sender/receiver/reactions user info
const populateMessage = (msgDoc) =>
  msgDoc.populate([
    { path: "sender", select: "username profileImage" },
    { path: "receiver", select: "username profileImage" },
    { path: "reactions.user", select: "username profileImage" },
  ]);

// Get an existing 1-on-1 conversation or create a new one
export const getOrCreateConversation = async (req, res) => {
  try {
    const senderId = req.user._id;
    const { userId: receiverId } = req.params;

    if (senderId.toString() === receiverId) {
      return res
        .status(400)
        .json({ success: false, message: "Cannot message yourself" });
    }

    const [sender, receiver] = await Promise.all([
      User.findById(senderId).select("blocked"),
      User.findById(receiverId).select(
        "blocked username profileImage lastSeen",
      ),
    ]);

    if (!receiver) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const isBlockedBySender = sender.blocked
      .map(String)
      .includes(receiverId.toString());
    const isBlockedByReceiver = receiver.blocked
      .map(String)
      .includes(senderId.toString());

    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId], $size: 2 },
    }).populate("lastMessage");

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
      });
    }

    return res.status(200).json({
      success: true,
      conversation: {
        ...conversation.toObject(),
        otherUser: receiver,
        isBlockedBySender,
        isBlockedByReceiver,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// List all conversations for the logged-in user
export const getConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    const conversations = await Conversation.find({
      participants: userId,
    })
      .populate({
        path: "lastMessage",
        populate: { path: "sender", select: "username profileImage" },
      })
      .populate("participants", "username profileImage lastSeen blocked")
      .sort({ updatedAt: -1 });

    const shaped = await Promise.all(
      conversations.map(async (conv) => {
        const otherUser = conv.participants.find(
          (p) => p._id.toString() !== userId.toString(),
        );

        const unreadCount = await Message.countDocuments({
          conversationId: conv._id,
          receiver: userId,
          status: { $ne: "read" },
        });

        const isBlockedBySender = req.user.blocked
          ?.map(String)
          .includes(otherUser?._id?.toString());
        const isBlockedByReceiver = otherUser?.blocked
          ?.map(String)
          .includes(userId.toString());

        return {
          ...conv.toObject(),
          otherUser,
          unreadCount,
          isBlockedBySender,
          isBlockedByReceiver,
          isOnline: isUserOnline(otherUser?._id),
        };
      }),
    );

    return res.status(200).json({ success: true, conversations: shaped });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Paginated message history using cursor (message _id)
// Pass ?cursor=lastMessageId to load older messages
export const getMessages = async (req, res) => {
  try {
    const userId = req.user._id;
    const { conversationId } = req.params;
    const { cursor } = req.query;

    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId,
    });
    if (!conversation) {
      return res
        .status(403)
        .json({ success: false, message: "Not a participant" });
    }

    const query = {
      conversationId,
      deletedFor: { $ne: userId },
    };

    if (cursor) {
      query._id = { $lt: cursor };
    }

    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(MSG_LIMIT + 1)
      .populate("sender", "username profileImage")
      .populate("receiver", "username profileImage")
      .populate("reactions.user", "username profileImage");

    const hasMore = messages.length > MSG_LIMIT;
    if (hasMore) messages.pop();

    // Return chronological order (oldest first)
    messages.reverse();

    return res.status(200).json({
      success: true,
      messages,
      hasMore,
      nextCursor: hasMore ? messages[0]._id : null,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Send a message. Supports text, media, or both.
// Uses tempId for idempotency (retry safe).
export const sendMessage = async (req, res) => {
  try {
    const senderId = req.user._id;
    const { conversationId, receiverId, text, tempId } = req.body;
    const mediaUrl = req.file?.path || null;
    const mediaType = req.file
      ? req.file.mimetype.startsWith("video")
        ? "video"
        : "image"
      : null;

    if (!receiverId) {
      return res
        .status(400)
        .json({ success: false, message: "receiverId is required" });
    }
    if (!text?.trim() && !mediaUrl) {
      return res
        .status(400)
        .json({ success: false, message: "Message must have text or media" });
    }

    // Already processed this tempId? Return the existing message
    if (tempId) {
      const existing = await Message.findOne({ tempId }).populate(
        "sender receiver",
        "username profileImage",
      );
      if (existing) {
        return res.status(200).json({ success: true, message: existing });
      }
    }

    const [sender, receiver] = await Promise.all([
      User.findById(senderId).select("blocked"),
      User.findById(receiverId).select("blocked"),
    ]);

    const isBlocked =
      sender.blocked.map(String).includes(receiverId.toString()) ||
      receiver.blocked.map(String).includes(senderId.toString());

    let conv = await Conversation.findOne({
      _id: conversationId || undefined,
      participants: { $all: [senderId, receiverId] },
    });

    if (!conv) {
      conv = await Conversation.create({
        participants: [senderId, receiverId],
      });
    }

    const receiverOnline = isUserOnline(receiverId);
    const initialStatus = receiverOnline ? "delivered" : "sent";

    const message = await Message.create({
      conversationId: conv._id,
      sender: senderId,
      receiver: receiverId,
      text: text?.trim() || "",
      mediaUrl,
      mediaType,
      tempId: tempId || undefined,
      status: initialStatus,
    });

    conv.lastMessage = message._id;
    conv.updatedAt = new Date();
    await conv.save();

    const populated = await populateMessage(Message.findById(message._id));

    const io = getIO();

    if (!isBlocked) {
      if (receiverOnline) {
        io.to(receiverId.toString()).emit("receive_message", populated);
      }
      io.to(senderId.toString()).emit("message_sent_ack", {
        tempId,
        message: populated,
      });
    }

    return res.status(201).json({ success: true, message: populated });
  } catch (err) {
    // Duplicate tempId on concurrent retry
    if (err.code === 11000 && err.keyPattern?.tempId) {
      const existing = await Message.findOne({
        tempId: req.body.tempId,
      }).populate("sender receiver", "username profileImage");
      return res.status(200).json({ success: true, message: existing });
    }
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Toggle block/unblock a user
export const toggleBlockUser = async (req, res) => {
  try {
    const userId = req.user._id;
    const { userId: targetId } = req.params;

    if (userId.toString() === targetId) {
      return res
        .status(400)
        .json({ success: false, message: "Cannot block yourself" });
    }

    const user = await User.findById(userId);
    const isBlocked = user.blocked.map(String).includes(targetId);

    if (isBlocked) {
      user.blocked = user.blocked.filter((id) => id.toString() !== targetId);
    } else {
      user.blocked.push(targetId);
    }

    await user.save();

    const io = getIO();
    if (!isBlocked) {
      io.to(targetId).emit("user_blocked", { userId: userId.toString() });
    }

    return res.status(200).json({
      success: true,
      message: isBlocked ? "User unblocked" : "User blocked",
      blocked: user.blocked,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Delete a message (HTTP fallback — socket handles the real-time part)
export const deleteMessage = async (req, res) => {
  try {
    const userId = req.user._id;
    const { messageId } = req.params;
    const { deleteFor = "me" } = req.body;

    const msg = await Message.findById(messageId);
    if (!msg) {
      return res
        .status(404)
        .json({ success: false, message: "Message not found" });
    }

    if (
      deleteFor === "everyone" &&
      msg.sender.toString() !== userId.toString()
    ) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    if (deleteFor === "everyone") {
      msg.text = "";
      msg.mediaUrl = null;
      msg.mediaType = null;
      msg.deletedFor = [msg.sender, msg.receiver];
    } else {
      if (!msg.deletedFor.map(String).includes(userId.toString())) {
        msg.deletedFor.push(userId);
      }
    }

    await msg.save();

    return res.status(200).json({
      success: true,
      message: `Message deleted for ${deleteFor}`,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
