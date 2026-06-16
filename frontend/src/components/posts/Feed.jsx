import { useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Loader2 } from "lucide-react";
import { getAllPosts } from "@/redux/slices/postSlice.js";
import PostCard from "./PostCard.jsx";
import useInfiniteScroll from "@/hooks/useInfiniteScroll.js";

const Feed = () => {
  const dispatch = useDispatch();
  const { posts, loading, hasMore, nextCursor } = useSelector(
    (state) => state.posts,
  );
  const { user: currentUser } = useSelector((state) => state.user);

  // Initial load
  useEffect(() => {
    dispatch(getAllPosts());
  }, [dispatch]);

  // Infinite scroll: load next page when bottom sentinel enters view
  const loadMore = useCallback(() => {
    if (!loading && hasMore && nextCursor) {
      dispatch(getAllPosts(nextCursor));
    }
  }, [dispatch, loading, hasMore, nextCursor]);

  const bottomSentinelRef = useInfiniteScroll({
    hasMore,
    onLoadMore: loadMore,
    loading,
  });

  return (
    <div className="w-full max-w-[470px] mx-auto flex flex-col items-center">
      {/* Initial loading state */}
      {loading && posts.length === 0 && (
        <div className="w-full flex justify-center py-10">
          <Loader2 className="animate-spin text-white w-8 h-8" />
        </div>
      )}

      {/* Posts */}
      {posts.map((post) => (
        <PostCard key={post._id} post={post} currentUser={currentUser} />
      ))}

      {/* Empty state */}
      {!loading && posts.length === 0 && (
        <div className="text-neutral-500 text-sm mt-10 text-center">
          No posts yet. Be the first to share!
        </div>
      )}

      {/* Bottom sentinel — IntersectionObserver triggers here */}
      <div ref={bottomSentinelRef} className="h-4 w-full" />

      {/* Loading more spinner */}
      {loading && posts.length > 0 && (
        <div className="py-4 flex justify-center">
          <Loader2 size={20} className="animate-spin text-neutral-500" />
        </div>
      )}

      {/* End of feed message */}
      {!hasMore && posts.length > 0 && (
        <div className="py-6 text-center text-neutral-600 text-xs">
          You're all caught up ✓
        </div>
      )}
    </div>
  );
};

export default Feed;
