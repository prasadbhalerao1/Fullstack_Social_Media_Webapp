import Reel from "../models/reel.model.js";
import User from "../models/user.model.js";
import {
  toggleLikeHelper,
  addCommentHelper,
} from "../utils/controller.helpers.js";

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

    await User.findByIdAndUpdate(userId, { $push: { reels: post._id } });

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
    const userId = req.user._id;
    const reelId = req.params.id;

    const result = await toggleLikeHelper(Reel, reelId, userId);
    if (!result.success) {
      return res
        .status(result.statusCode)
        .json({ success: false, message: result.message });
    }

    return res.status(200).json({
      success: true,
      message: result.message,
      reel: result.likes,
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
    const userId = req.user._id;
    const reelId = req.params.id;
    const { text } = req.body || {};

    const result = await addCommentHelper(Reel, reelId, userId, text);
    if (!result.success) {
      return res
        .status(result.statusCode)
        .json({ success: false, message: result.message });
    }

    return res.status(200).json({
      success: true,
      message: result.message,
      comment: result.comments,
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

    await User.findByIdAndUpdate(userId, { $pull: { reels: reel._id } });

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
