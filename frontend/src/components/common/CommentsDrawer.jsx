import { useState, useRef, useEffect } from "react";
import { X } from "lucide-react";
import { Link } from "react-router-dom";
import ProfileImage from "./ProfileImage.jsx";

const CommentsDrawer = ({
  isOpen,
  onClose,
  comments = [],
  onAddComment,
  title = "Comments",
}) => {
  const [commentText, setCommentText] = useState("");
  const drawerRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    onAddComment(commentText);
    setCommentText("");
  };

  if (!isOpen) return null;

  return (
    <div
      className="absolute inset-0 z-100 flex items-end justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        ref={drawerRef}
        className="bg-neutral-900 border-t border-white/10 rounded-t-3xl w-full max-h-[75%] flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h3 className="text-md font-semibold text-gray-200">
            {title} ({comments.length})
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white hover:bg-white/5 rounded-full transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
          {comments.length > 0 ? (
            <div className="flex flex-col gap-4 text-white">
              {comments.map((c, i) => (
                <div key={c._id || i} className="flex gap-3 items-start">
                  <ProfileImage
                    user={c.user}
                    className="w-8 h-8"
                    showOnlineStatus={false}
                  />
                  <div className="flex-1 flex flex-col bg-white/5 rounded-2xl px-4 py-2 border border-white/5">
                    <Link
                      to={`/profile/${c.user?._id}`}
                      className="text-xs text-neutral-400 font-bold hover:underline"
                    >
                      {c.user?.username || "user"}
                    </Link>
                    <span className="text-sm text-neutral-200 mt-1">
                      {c.text}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-neutral-500 py-12 text-sm">
              No replies yet. Start the conversation!
            </div>
          )}
        </div>

        {/* Inline Comment Input */}
        <form
          onSubmit={handleSubmit}
          className="p-4 border-t border-white/10 flex gap-2 bg-neutral-950/40"
        >
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Reply..."
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-xs focus:outline-none focus:ring-1 focus:ring-white"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-white hover:bg-neutral-200 rounded-xl text-black font-semibold text-xs transition cursor-pointer"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default CommentsDrawer;
