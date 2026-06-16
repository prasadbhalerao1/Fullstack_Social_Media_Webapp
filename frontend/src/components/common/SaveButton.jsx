import { useDispatch, useSelector } from "react-redux";
import { Bookmark } from "lucide-react";
import { toggleSavePost } from "@/redux/slices/userSlice.js";

const SaveButton = ({ post, size = 24 }) => {
  const dispatch = useDispatch();
  const { user: currentUser } = useSelector((state) => state.user);

  const isSaved = currentUser?.savedPosts?.some((item) => {
    if (typeof item === "object" && item !== null) {
      return (item._id || item.id) === post?._id;
    }
    return item === post?._id;
  });

  const handleSave = (e) => {
    e.stopPropagation();
    if (post?._id) {
      dispatch(toggleSavePost(post._id));
    }
  };

  return (
    <button
      onClick={handleSave}
      className="transition-transform duration-200 hover:scale-110 active:scale-95 cursor-pointer flex items-center justify-center text-gray-300"
      title={isSaved ? "Remove from Bookmarks" : "Save to Bookmarks"}
    >
      <Bookmark
        size={size}
        className={isSaved ? "fill-white text-white" : "text-white"}
        strokeWidth={2}
      />
    </button>
  );
};

export default SaveButton;
