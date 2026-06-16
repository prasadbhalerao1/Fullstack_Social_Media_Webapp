import Story from "../models/story.model.js";
import User from "../models/user.model.js";
import {
  toggleLikeHelper,
  addCommentHelper,
} from "../utils/controller.helpers.js";

export const createStory = async (req, res) => {
  try {
    const { mediaType } = req.body;
    const userId = req.user._id;

    if (!req.file || !req.file.path) {
      return res
        .status(400)
        .json({ success: false, message: "No media file uploaded" });
    }

    const mediaUrl = req.file?.path;
    const story = await Story.create({
      user: userId,
      mediaType,
      mediaUrl,
    });

    await User.findByIdAndUpdate(userId, { $push: { story: story._id } });

    return res.status(201).json({
      success: true,
      message: "Story created successfully",
      story,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error creating story : " + error.message,
    });
  }
};

export const getAllStories = async (req, res) => {
  try {
    const now = new Date();
    const userId = req.user._id;
    const stories = await Story.find({
      user: { $ne: userId },
      expiresAt: { $gt: now },
    })
      .populate("user", "username profileImage")
      .populate({ path: "comment.user", select: "username profileImage" })
      .populate("viewers", "username profileImage")
      .sort({ createdAt: -1 });

    const storiesByUser = stories.reduce((acc, story) => {
      const creatorId = story.user._id;
      if (!acc[creatorId]) {
        acc[creatorId] = {
          user: story.user,
          stories: [],
          hasUnViewed: false,
        };
      }
      const hasViewed = story?.viewers?.some(
        (viewer) => viewer._id.toString() === userId.toString(),
      );
      if (!hasViewed) {
        acc[creatorId].hasUnViewed = true;
      }
      acc[creatorId].stories.push(story);
      return acc;
    }, {});

    const userStories = await Story.find({
      user: userId,
      expiresAt: { $gt: now },
    })
      .populate("user", "username profileImage")
      .populate({ path: "comment.user", select: "username profileImage" })
      .populate("viewers", "username profileImage")
      .sort({ createdAt: -1 });

    if (userStories.length > 0) {
      storiesByUser[userId] = {
        user: userStories[0].user,
        stories: userStories,
        hasUnViewed: false,
        isOwn: true,
      };
    }

    const storyArray = Object.values(storiesByUser);

    const sortedStories = storyArray.sort((a, b) => {
      if (a.isOwn) return -1;
      if (b.isOwn) return 1;
      return 0;
    });

    return res.status(200).json({
      success: true,
      stories: sortedStories,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching stories : " + error.message,
    });
  }
};

export const viewStory = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const story = await Story.findById(id);

    if (!story) {
      return res
        .status(404)
        .json({ success: false, message: "Story not found" });
    }

    if (!story.viewers.includes(userId)) {
      story.viewers.push(userId);
      await story.save();
    }

    return res.status(200).json({
      success: true,
      message: "Story viewed successfully",
      story,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error viewing story : " + error.message,
    });
  }
};

export const toggleLikeStory = async (req, res) => {
  try {
    const userId = req.user._id;
    const storyId = req.params.id;

    const result = await toggleLikeHelper(Story, storyId, userId);
    if (!result.success) {
      return res
        .status(result.statusCode)
        .json({ success: false, message: result.message });
    }

    return res.status(200).json({
      success: true,
      message: result.message,
      story: result.likes,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error toggling like for story : " + error.message,
    });
  }
};

export const addCommentToStory = async (req, res) => {
  try {
    const userId = req.user._id;
    const storyId = req.params.id;
    const { text } = req.body || {};

    const result = await addCommentHelper(Story, storyId, userId, text);
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
      message: "Error adding comment to story : " + error.message,
    });
  }
};

export const deleteStoriesById = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    const userId = req.user._id;

    if (!story || story.user.toString() !== userId.toString()) {
      return res
        .status(404)
        .json({ success: false, message: "Unauthorized Or Story not found" });
    }

    await story.deleteOne();

    await User.findByIdAndUpdate(userId, { $pull: { story: story._id } });

    return res.status(200).json({
      success: true,
      message: "Story deleted successfully",
      story,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error deleting story by ID : " + error.message,
    });
  }
};
