import mongoose from "mongoose";

const storySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    mediaType: {
      type: String,
      required: true,
      enum: ["image", "video"],
    },
    mediaUrl: {
      type: String,
      required: true,
    },
    viewers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    comment: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        text: String,
        createdAt: Date,
      },
    ],
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // Expires in 24 hours
    },
  },
  { timestamps: true },
);

const Story = mongoose.model("Story", storySchema);

export default Story;
