import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Search, Loader2, Heart, MessageCircle } from "lucide-react";
import Sidebar from "@/components/layout/Sidebar.jsx";
import ProfileImage from "@/components/common/ProfileImage.jsx";
import PostDetailsModal from "@/components/posts/PostDetailsModal.jsx";
import { getAllPosts } from "@/redux/slices/postSlice.js";

const Explore = () => {
  const dispatch = useDispatch();
  const { posts, loading } = useSelector((state) => state.posts);
  const { user: currentUser } = useSelector((state) => state.user);

  const [searchQuery, setSearchQuery] = useState("");
  const [activePost, setActivePost] = useState(null);

  useEffect(() => {
    dispatch(getAllPosts());
  }, [dispatch]);

  // Filter posts by caption or username matching the search query
  const filteredPosts = searchQuery.trim()
    ? posts.filter(
        (p) =>
          p.caption?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.user?.username?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : posts;

  // Keep the modal post in sync with Redux state (likes/comments)
  const currentModalPost =
    posts.find((p) => p._id === activePost?._id) || activePost;

  return (
    <div className="bg-black/95 flex text-white min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto px-4 py-6 md:py-8 max-w-5xl mx-auto flex flex-col gap-6 font-sans select-none pb-20 md:pb-8">
        {/* Search Bar */}
        <div className="relative w-full md:max-w-sm">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search posts..."
            className="w-full bg-neutral-900 border border-white/10 rounded-full pl-9 pr-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-white/30 transition"
          />
        </div>

        {/* Content Grid */}
        {loading && posts.length === 0 ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-neutral-400 w-10 h-10" />
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center text-neutral-500 text-sm py-20">
            {searchQuery
              ? "No posts found matching your search."
              : "No posts yet."}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-0.5 md:gap-1">
            {filteredPosts.map((post) => (
              <div
                key={post._id}
                onClick={() => setActivePost(post)}
                className="relative aspect-square bg-neutral-950 overflow-hidden cursor-pointer group"
              >
                {post.mediaType === "image" ? (
                  <img
                    src={post.mediaUrl}
                    alt={post.caption || "Post"}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <video
                    src={post.mediaUrl}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    muted
                    playsInline
                  />
                )}

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center gap-3">
                  <div className="flex items-center gap-5 text-white font-semibold">
                    <div className="flex items-center gap-1.5">
                      <Heart size={20} className="fill-white text-white" />
                      <span className="text-sm">{post.likes?.length || 0}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MessageCircle
                        size={20}
                        className="fill-white text-white"
                      />
                      <span className="text-sm">
                        {post.comment?.length || 0}
                      </span>
                    </div>
                  </div>
                  {post.user && (
                    <div className="flex items-center gap-2 mt-1">
                      <ProfileImage
                        user={post.user}
                        className="w-5 h-5"
                        showOnlineStatus={false}
                        linkable={false}
                      />
                      <span className="text-white text-xs font-semibold">
                        {post.user.username}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Post Details Modal */}
      {activePost && (
        <PostDetailsModal
          isOpen={!!activePost}
          onClose={() => setActivePost(null)}
          post={currentModalPost}
          currentUser={currentUser}
          onDelete={() => {
            setActivePost(null);
            dispatch(getAllPosts());
          }}
        />
      )}
    </div>
  );
};

export default Explore;
