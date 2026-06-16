import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: { type: String, default: "" },
    mediaUrl: { type: String, default: null },
    mediaType: {
      type: String,
      enum: ["image", "video", null],
      default: null,
    },

    // WhatsApp-style delivery status
    // sent      → 1 grey tick  (server accepted)
    // delivered → 2 grey ticks (delivered to recipient's device/socket)
    // read      → 2 blue ticks (recipient opened the conversation)
    status: {
      type: String,
      enum: ["sent", "delivered", "read"],
      default: "sent",
      index: true,
    },

    // Idempotency key — client-generated UUID to prevent duplicate on retry
    tempId: { type: String, unique: true, sparse: true },

    // Edit support
    isEdited: { type: Boolean, default: false },
    editedAt: { type: Date, default: null },

    // Deletion — array of userIds for whom the message is deleted
    // If it contains both sender + receiver → message is deleted for everyone
    deletedFor: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // Emoji reactions — one per user, last wins
    reactions: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        emoji: { type: String },
      },
    ],
  },
  { timestamps: true },
);

// Index for paginated message history (cursor-based)
messageSchema.index({ conversationId: 1, createdAt: -1 });

const Message = mongoose.model("Message", messageSchema);
export default Message;
