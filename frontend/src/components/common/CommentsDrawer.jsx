import { useState, useRef } from "react";
import { X } from "lucide-react";
import CommentSection from "@/components/common/CommentSection.jsx";

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
        <div className="flex-1 overflow-y-auto p-4 no-scrollbar flex flex-col min-h-0">
          <CommentSection
            comments={comments}
            fallbackText="No replies yet. Start the conversation!"
          />
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
