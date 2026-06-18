import { useState, useRef, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { Trash2 } from "lucide-react";
import ProfileImage from "@/components/common/ProfileImage.jsx";
import FollowButton from "@/components/common/FollowButton.jsx";
import PostDetailsModal from "./PostDetailsModal.jsx";
import MediaIcons from "@/components/common/MediaIcons.jsx";
import CommentForm from "@/components/common/CommentForm.jsx";
import Media from "@/components/common/Media.jsx";
import { timeAgo } from "@/lib/timeAgo.js";
import { deletePostById } from "@/redux/slices/postSlice.js";

const PostCard = ({ post, currentUser }) => {
  const dispatch = useDispatch();
  const videoRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showPostModal, setShowPostModal] = useState(false);
  const [showPlayIcon, setShowPlayIcon] = useState(false);

  const isOwner = currentUser?._id === post?.user?._id;

  // Play/Pause Video Click
  const handleVideoClick = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
      setShowPlayIcon(true);
    } else {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            setShowPlayIcon(true);
          })
          .catch((err) => console.log(err));
      }
    }
    setTimeout(() => setShowPlayIcon(false), 600);
  };

  const handleMuteToggle = (e) => {
    e.stopPropagation();
    setIsMuted(!isMuted);
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      dispatch(deletePostById(post?._id));
    }
  };

  // Intersection Observer to autoplay and pause videos based on viewport visibility and modal state
  useEffect(() => {
    const video = videoRef.current;
    if (post?.mediaType !== "video" || !video) return;

    if (showPostModal) {
      video.pause();
      setIsPlaying(false);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const playPromise = video.play();
            if (playPromise !== undefined) {
              playPromise
                .then(() => {
                  setIsPlaying(true);
                })
                .catch((err) => console.log("Autoplay blocked:", err));
            }
          } else {
            video.pause();
            setIsPlaying(false);
          }
        });
      },
      { threshold: 0.6 },
    );

    observer.observe(video);
    return () => {
      if (video) observer.unobserve(video);
    };
  }, [post?.mediaType, showPostModal, isMuted]);

  // Formats inline code wrapped in backticks
  const formatCaption = (text) => {
    if (!text) return null;
    const parts = text.split(/(`[^`\n]+`)/g);
    return parts.map((part, idx) => {
      if (part.startsWith("`") && part.endsWith("`")) {
        return (
          <code
            key={idx}
            className="bg-neutral-900 border border-white/10 px-1.5 py-0.5 rounded font-mono text-xs text-cyan-400 font-normal mx-0.5"
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      return <span key={idx}>{part}</span>;
    });
  };

  return (
    <div className="w-full bg-black border-b border-white/10 sm:border sm:border-white/10 sm:rounded-xl sm:mb-4 mb-0 pb-4 sm:pb-0 hover:border-white/20 transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-3">
        <div className="flex items-center gap-3">
          <ProfileImage
            user={post?.user}
            className="w-8 h-8"
            showOnlineStatus={false}
          />
          <div className="flex items-center gap-2">
            <Link
              to={`/profile/${post?.user?._id}`}
              className="font-semibold text-sm text-white hover:underline"
            >
              {post?.user?.username}
            </Link>
            <span className="text-neutral-500 text-xs">
              • {timeAgo(post?.createdAt)}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isOwner && (
            <FollowButton
              targetId={post?.user?._id}
              currentUser={currentUser}
            />
          )}
          {isOwner && (
            <button
              onClick={handleDelete}
              className="p-1.5 text-neutral-500 hover:text-red-500 transition cursor-pointer"
              title="Delete Post"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>
 
      {/* Media */}
      <Media
        item={post}
        videoRef={videoRef}
        isPlaying={isPlaying}
        isMuted={isMuted}
        showPlayIcon={showPlayIcon}
        handleVideoClick={handleVideoClick}
        handleMuteToggle={handleMuteToggle}
        containerClassName="max-h-[600px] border-y border-white/5 sm:border-none"
      />
 
      {/* Actions */}
      <MediaIcons
        type="post"
        item={post}
        size={24}
        handleOpenModal={() => setShowPostModal(true)}
      />
 
      {/* Post Info (Likes, Caption, Comments, Comment Form) */}
      <div className="px-3 pb-3 pt-1">
        {/* Likes Count */}
        {post?.likes?.length > 0 && (
          <div className="font-semibold text-sm text-white mb-1">
            {post.likes.length} {post.likes.length === 1 ? "like" : "likes"}
          </div>
        )}
 
        {/* Caption */}
        {post?.caption && (
          <div className="text-sm text-white mb-1.5">
            <Link
              to={`/profile/${post?.user?._id}`}
              className="font-semibold hover:underline mr-2"
            >
              {post?.user?.username}
            </Link>
            <span className="text-neutral-300 font-light leading-relaxed">
              {formatCaption(post.caption)}
            </span>
          </div>
        )}

        {/* Comments Link */}
        {post?.comment?.length > 0 && (
          <button
            onClick={() => setShowPostModal(true)}
            className="text-neutral-500 text-sm font-medium hover:text-neutral-400 transition cursor-pointer mb-2"
          >
            View all {post.comment.length} comments
          </button>
        )}

        {/* Inline Comment Input */}
        <CommentForm postId={post?._id} className="mt-2" />
      </div>

      {/* Post Details Modal (Instagram Desktop Style) */}
      <PostDetailsModal
        isOpen={showPostModal}
        onClose={() => setShowPostModal(false)}
        post={post}
        currentUser={currentUser}
      />
    </div>
  );
};

export default PostCard;
