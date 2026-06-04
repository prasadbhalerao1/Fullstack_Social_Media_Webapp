import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
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
    caption: {
      type: String,
    },
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
  },
  { timestamps: true },
);

const Post = mongoose.model("Post", postSchema);

export default Post;
