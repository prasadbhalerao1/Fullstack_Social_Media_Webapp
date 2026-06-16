import LikeButton from "./LikeButton";
import SaveButton from "./SaveButton";
import { MessageCircle, SendHorizontal } from "lucide-react";

const MediaIcons = ({ type, item, size = 24, shareIcon, handleOpenModal }) => {
  return (
    <div className="flex justify-between items-center py-3 px-3 border-t border-white/10">
      <div className="flex items-center space-x-4">
        {/* Like Button */}
        <LikeButton type={type} item={item} size={size} />

        {/* Comment Button */}
        <button
          onClick={handleOpenModal}
          className="text-white hover:opacity-70 transition cursor-pointer flex items-center justify-center"
        >
          <MessageCircle size={size} strokeWidth={2} />
        </button>

        {/* Share Button */}
        {!shareIcon && (
          <button className="text-white hover:opacity-70 transition cursor-pointer flex items-center justify-center">
            <SendHorizontal size={size} strokeWidth={2} />
          </button>
        )}
      </div>

      {/* Save Button */}
      <SaveButton post={item} size={size} />
    </div>
  );
};

export default MediaIcons;
