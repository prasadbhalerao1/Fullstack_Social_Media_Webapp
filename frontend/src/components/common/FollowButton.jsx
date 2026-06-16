import { useDispatch } from "react-redux";
import { followUser } from "@/redux/slices/userSlice.js";
import { useState } from "react";

const FollowButton = ({ targetId, currentUser }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const actualTargetId = targetId?._id || targetId;

  // If viewing our own profile/post, we don't show the button
  if (currentUser?._id === actualTargetId) return null;

  const isFollowing = currentUser?.following?.includes(actualTargetId);

  const handleFollow = async () => {
    console.log("FollowButton Audit:", {
      senderId: currentUser?._id,
      rawTargetId: targetId,
      actualTargetId,
    });

    if (!actualTargetId) {
      console.warn("FollowButton: actualTargetId is missing!");
      return;
    }

    setLoading(true);
    await dispatch(followUser(actualTargetId));
    setLoading(false);
  };

  return (
    <button
      onClick={handleFollow}
      disabled={loading}
      className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition duration-200 cursor-pointer ${
        isFollowing
          ? "bg-neutral-800 text-white hover:bg-neutral-700 border border-neutral-700"
          : "bg-white text-black hover:bg-neutral-200"
      }`}
    >
      {loading ? "..." : isFollowing ? "Following" : "Follow"}
    </button>
  );
};

export default FollowButton;
