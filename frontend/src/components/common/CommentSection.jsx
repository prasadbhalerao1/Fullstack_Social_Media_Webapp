import { Link } from "react-router-dom";
import ProfileImage from "@/components/common/ProfileImage.jsx";
import { timeAgo } from "@/lib/timeAgo.js";

const CommentSection = ({
  comments = [],
  fallbackText = "No comments yet.",
}) => {
  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-y-auto scrollbar-hide">
      {comments.length > 0 ? (
        <div className="flex flex-col gap-4">
          {comments.map((c, idx) => (
            <div
              key={c._id || idx}
              className="flex items-center gap-3 mb-1 w-full text-white"
            >
              <ProfileImage
                user={c.user}
                className="w-8 h-8 shrink-0"
                showOnlineStatus={false}
              />
              <div className="flex flex-col min-h-0 min-w-0">
                <span className="text-sm wrap-break-word">
                  <Link
                    to={`/profile/${c.user?._id}`}
                    className="font-semibold text-white hover:underline mr-2"
                  >
                    {c.user?.username || "user"}
                  </Link>
                  <span className="text-neutral-200">{c.text}</span>
                </span>
                <span className="text-[10px] text-neutral-500 mt-0.5 font-medium">
                  {timeAgo(c.createdAt)}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-neutral-500 py-12 text-sm">
          {fallbackText}
        </div>
      )}
    </div>
  );
};

export default CommentSection;
