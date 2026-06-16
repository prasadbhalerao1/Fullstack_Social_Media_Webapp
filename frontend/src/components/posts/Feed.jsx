import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllPosts } from "@/redux/slices/postSlice.js";
import PostCard from "./PostCard.jsx";
import { Loader2 } from "lucide-react";

const Feed = () => {
  const dispatch = useDispatch();
  const { posts, loading } = useSelector((state) => state.posts);
  const { user: currentUser } = useSelector((state) => state.user);

  useEffect(() => {
    dispatch(getAllPosts());
  }, [dispatch]);

  if (loading && posts.length === 0) {
    return (
      <div className="w-full flex justify-center py-10">
        <Loader2 className="animate-spin text-white w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-[470px] mx-auto flex flex-col items-center">
      {posts && posts.length > 0 ? (
        posts.map((post) => (
          <PostCard
            key={post._id}
            post={post}
            currentUser={currentUser}
          />
        ))
      ) : (
        <div className="text-neutral-500 text-sm mt-10 text-center">
          No posts yet. Be the first to share!
        </div>
      )}
    </div>
  );
};

export default Feed;
