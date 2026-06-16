import express from "express";
import Reel from "../models/reel.model.js";

export const createReel = async (req, res) => {
  try {
    const { caption } = req.body;
    const userId = req.user._id;

    if (!req.file || !req.file.path) {
      return res
        .status(400)
        .json({ success: false, message: "No media file uploaded" });
    }

    const mediaUrl = req.file?.path;
    const post = await Reel.create({
      user: userId,
      mediaUrl,
      caption,
    });

    return res.status(201).json({
      success: true,
      message: "Reel created successfully",
      post,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error creating reel : " + error.message,
    });
  }
};

export const getAllReels = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const cursor = req.query.cursor;

    const query = cursor ? { _id: { $lt: cursor } } : {};

    const reels = await Reel.find(query)
      .populate("user", "username profileImage")
      .populate("comment.user", "username profileImage")
      .sort({ createdAt: -1 })
      .limit(limit + 1);

    const hasMore = reels.length > limit;
    if (hasMore) reels.pop();

    return res.status(200).json({
      success: true,
      reels,
      hasMore,
      nextCursor: hasMore ? reels[reels.length - 1]._id : null,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching reels : " + error.message,
    });
  }
};

export const getReelsById = async (req, res) => {
  try {
    const reel = await Reel.findById(req.params.id)
      .populate("user", "username profileImage")
      .populate("comment.user", "username profileImage");

    if (!reel) {
      return res
        .status(404)
        .json({ success: false, message: "Reel not found" });
    }

    return res.status(200).json({
      success: true,
      reel,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching reel by ID : " + error.message,
    });
  }
};

export const toggleLikeReel = async (req, res) => {
  try {
    const reel = await Reel.findById(req.params.id);
    const userId = req.user._id;

    if (!reel) {
      return res
        .status(404)
        .json({ success: false, message: "Reel not found" });
    }

    const index = reel.likes.indexOf(userId);
    if (index === -1) {
      reel.likes.push(userId);
    } else {
      reel.likes.splice(index, 1);
    }

    await reel.save();

    return res.status(200).json({
      success: true,
      message: index === -1 ? "Reel liked" : "Reel unliked",
      reel: reel.likes,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error toggling like for reel : " + error.message,
    });
  }
};

export const addCommentToReel = async (req, res) => {
  try {
    const reel = await Reel.findById(req.params.id);
    const userId = req.user._id;

    if (!reel) {
      return res
        .status(404)
        .json({ success: false, message: "Reel not found" });
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

    reel.comment.push(comment);
    await reel.save();

    const updatedReel = await Reel.findById(reel._id).populate(
      "comment.user",
      "username profileImage",
    );

    return res.status(200).json({
      success: true,
      message: "Comment added successfully",
      comment: updatedReel.comment,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error adding comment to reel : " + error.message,
    });
  }
};

export const deleteReelsById = async (req, res) => {
  try {
    const reel = await Reel.findById(req.params.id);
    const userId = req.user._id;

    if (!reel || reel.user.toString() !== userId.toString()) {
      return res
        .status(404)
        .json({ success: false, message: "Unauthorized Or Reel not found" });
    }

    await reel.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Reel deleted successfully",
      reel,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error deleting reel by ID : " + error.message,
    });
  }
};
