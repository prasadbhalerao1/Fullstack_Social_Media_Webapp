import { useDispatch, useSelector } from "react-redux";
import { Bookmark } from "lucide-react";
import { toggleSavePost } from "@/redux/slices/userSlice.js";

const SaveButton = ({ post, size = 24 }) => {
  const dispatch = useDispatch();
  const { user: currentUser } = useSelector((state) => state.user);

  const isSaved = currentUser?.savedPosts?.includes(post?._id);

  const handleSave = (e) => {
    e.stopPropagation();
    if (post?._id) {
      dispatch(toggleSavePost(post._id));
    }
  };

  return (
    <button
      onClick={handleSave}
      className="hover:opacity-70 transition cursor-pointer flex items-center justify-center text-gray-300"
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
