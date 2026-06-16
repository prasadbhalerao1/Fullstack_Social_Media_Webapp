// Helper utilities for toggle likes and comments across MongoDB models

// Toggle user ID in document's likes array
export const toggleLikeHelper = async (Model, id, userId) => {
  const doc = await Model.findById(id);
  if (!doc) {
    return {
      success: false,
      statusCode: 404,
      message: `${Model.modelName} not found`,
    };
  }

  const index = doc.likes.indexOf(userId);
  if (index === -1) {
    doc.likes.push(userId);
  } else {
    doc.likes.splice(index, 1);
  }

  await doc.save();

  return {
    success: true,
    message:
      index === -1 ? `${Model.modelName} liked` : `${Model.modelName} unliked`,
    likes: doc.likes,
    doc,
    isLiked: index === -1,
  };
};

// Add a comment to document and populate commenter info
export const addCommentHelper = async (
  Model,
  id,
  userId,
  text,
  populatePath = "comment.user",
  selectFields = "username profileImage",
) => {
  const doc = await Model.findById(id);
  if (!doc) {
    return {
      success: false,
      statusCode: 404,
      message: `${Model.modelName} not found`,
    };
  }

  if (!text || !text.trim()) {
    return {
      success: false,
      statusCode: 400,
      message: "Comment text is required",
    };
  }

  const comment = {
    user: userId,
    text: text.trim(),
    createdAt: new Date(),
  };

  doc.comment.push(comment);
  await doc.save();

  const updatedDoc = await Model.findById(id).populate({
    path: populatePath,
    select: selectFields,
  });

  return {
    success: true,
    message: "Comment added successfully",
    comments: updatedDoc.comment,
    doc: updatedDoc,
  };
};
