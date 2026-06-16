import { useDispatch, useSelector } from "react-redux";
import { Heart } from "lucide-react";
import { toggleLikePost } from "@/redux/slices/postSlice.js";
import { toggleLikeReel } from "@/redux/slices/reelsSlice.js";

const LikeButton = ({ type, item, size = 24 }) => {
  const dispatch = useDispatch();
  const { user: currentUser } = useSelector((state) => state.user);

  const isLiked = item?.likes?.includes(currentUser?._id);

  const handleLike = (e) => {
    e.stopPropagation();
    if (type === "reel") {
      dispatch(toggleLikeReel(item?._id));
    } else {
      dispatch(toggleLikePost(item?._id));
    }
  };

  return (
    <button
      onClick={handleLike}
      className="hover:opacity-70 transition cursor-pointer flex items-center justify-center"
      title={isLiked ? "Unlike" : "Like"}
    >
      <Heart
        size={size}
        className={isLiked ? "fill-red-500 text-red-500" : "text-white"}
        strokeWidth={2}
      />
    </button>
  );
};

export default LikeButton;

