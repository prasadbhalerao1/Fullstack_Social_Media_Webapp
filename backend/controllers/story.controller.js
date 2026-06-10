import Story from "../models/story.model.js";

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
      const userId = story.user._id;
      if (!acc[userId]) {
        acc[userId] = {
          user: story.user,
          stories: [],
          hasUnViewed: false,
        };
      }
      const hasViewed = story?.viewers?.some(
        (viewer) => viewer._id.toString() === userId.toString(),
      );
      if (!hasViewed) {
        acc[userId].hasUnViewed = true;
      }
      acc[userId].stories.push(story);
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
    const story = await Story.findById(req.params.id);
    const userId = req.user._id;

    if (!story) {
      return res
        .status(404)
        .json({ success: false, message: "Story not found" });
    }

    const index = story.likes.indexOf(userId);
    if (index === -1) {
      story.likes.push(userId);
    } else {
      story.likes.splice(index, 1);
    }

    await story.save();

    return res.status(200).json({
      success: true,
      message: index === -1 ? "Story liked" : "Story unliked",
      story: story.likes,
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
    const story = await Story.findById(req.params.id);
    const userId = req.user._id;

    if (!story) {
      return res
        .status(404)
        .json({ success: false, message: "Story not found" });
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

    story.comment.push(comment);
    await story.save();

    const updatedStory = await Story.findById(story._id).populate(
      "comment.user",
      "username profileImage",
    );

    return res.status(200).json({
      success: true,
      message: "Comment added successfully",
      comment: updatedStory.comment,
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
