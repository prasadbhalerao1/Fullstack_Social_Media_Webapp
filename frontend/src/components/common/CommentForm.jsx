import { useState } from "react";
import { useDispatch } from "react-redux";
import { addCommentToPost } from "@/redux/slices/postSlice.js";

const CommentForm = ({ postId, onSubmit, placeholder = "Add a comment...", inputId, className = "" }) => {
  const dispatch = useDispatch();
  const [commentText, setCommentText] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    if (onSubmit) {
      onSubmit(commentText);
    } else if (postId) {
      dispatch(addCommentToPost(postId, commentText));
    }
    setCommentText("");
  };

  return (
    <form onSubmit={handleSubmit} className={`flex items-center relative w-full ${className}`}>
      <input
        id={inputId}
        type="text"
        value={commentText}
        onChange={(e) => setCommentText(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent border-none text-sm text-white focus:outline-none placeholder-neutral-500 pr-10 py-1"
        autoComplete="off"
      />
      {commentText.trim() && (
        <button
          type="submit"
          className="absolute right-0 text-blue-500 font-semibold text-sm hover:text-white transition cursor-pointer"
        >
          Post
        </button>
      )}
    </form>
  );
};

export default CommentForm;
