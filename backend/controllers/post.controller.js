import express from "express";
import Post from "../models/post.model.js";
import User from "../models/user.model.js";

export const createPost = async (req, res) => {
  try {
    const { caption, mediaType } = req.body;
    const userId = req.user._id;

    if (!req.file || !req.file.path) {
      return res
        .status(400)
        .json({ success: false, message: "No media file uploaded" });
    }

    const mediaUrl = req.file?.path;
    const post = await Post.create({
      user: userId,
      mediaType,
      mediaUrl,
      caption,
    });

    const user = await User.findById(userId)
    if (user){
      user.posts.push(post?._id);
      await user.save();
    }

    return res.status(201).json({
      success: true,
      message: "Post created successfully",
      post,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error creating post : " + error.message,
    });
  }
};

export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("user", "username profileImage")
      .populate("comment.user", "username profileImage")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      posts,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching posts : " + error.message,
    });
  }
};

export const getPostsById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("user", "username profileImage")
      .populate("comment.user", "username profileImage");

    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }

    return res.status(200).json({
      success: true,
      post,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching post by ID : " + error.message,
    });
  }
};

export const deletePostsById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    const userId = req.user._id;

    if (!post || post.user.toString() !== userId.toString()) {
      return res
        .status(404)
        .json({ success: false, message: "Unauthorized Or Post not found" });
    }

    await post.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Post deleted successfully",
      post,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error deleting post by ID : " + error.message,
    });
  }
};

export const toggleLikePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    const userId = req.user._id;

    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }

    const index = post.likes.indexOf(userId);
    if (index === -1) {
      post.likes.push(userId);
    } else {
      post.likes.splice(index, 1);
    }

    await post.save();

    return res.status(200).json({
      success: true,
      message: index === -1 ? "Post liked" : "Post unliked",
      post: post.likes,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error toggling like for post : " + error.message,
    });
  }
};

export const addCommentToPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    const userId = req.user._id;

    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }

    const { text } = req.body || {};
    if (!text) {
      return res
        .status(400)
        .json({ success: false, message: "Comment text is required" });
    }

    const comment = {
      user: userId,
      text,
      createdAt: new Date(),
    };

    post.comment.push(comment);
    await post.save();

    const updatedPost = await Post.findById(post._id).populate(
      "comment.user",
      "username profileImage",
    );

    return res.status(200).json({
      success: true,
      message: "Comment added successfully",
      comment: updatedPost.comment,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error adding comment to post : " + error.message,
    });
  }
};

export const toggleSavePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    const userId = req.user._id;

    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const index = user.savedPosts.indexOf(post._id);
    if (index === -1) {
      user.savedPosts.push(post._id);
    } else {
      user.savedPosts.splice(index, 1);
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: index === -1 ? "Post saved to bookmarks" : "Post removed from bookmarks",
      savedPosts: user.savedPosts,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error toggling bookmark for post : " + error.message,
    });
  }
};


