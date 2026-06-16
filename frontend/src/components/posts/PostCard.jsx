import { useState, useRef, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import {
  Trash2,
  Play,
  Pause,
  Volume2,
  VolumeX,
} from "lucide-react";
import ProfileImage from "@/components/common/ProfileImage.jsx";
import FollowButton from "@/components/common/FollowButton.jsx";
import PostDetailsModal from "./PostDetailsModal.jsx";
import MediaIcons from "@/components/common/MediaIcons.jsx";
import CommentForm from "@/components/common/CommentForm.jsx";
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
      videoRef.current.play().catch((err) => console.log(err));
      setIsPlaying(true);
      setShowPlayIcon(true);
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
            video.play().catch((err) => console.log("Autoplay blocked:", err));
            setIsPlaying(true);
          } else {
            video.pause();
            setIsPlaying(false);
          }
        });
      },
      { threshold: 0.6 }
    );

    observer.observe(video);
    return () => {
      if (video) observer.unobserve(video);
    };
  }, [post?.mediaType, showPostModal]);

  return (
    <div className="w-full max-w-[470px] mx-auto bg-black border-b border-white/10 sm:border sm:border-white/10 sm:rounded-xl mb-6 pb-4 sm:pb-0">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-3">
        <div className="flex items-center gap-3">
          <ProfileImage user={post?.user} className="w-8 h-8" showOnlineStatus={false} />
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
          {!isOwner && <FollowButton targetId={post?.user?._id} currentUser={currentUser} />}
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
      <div className="relative w-full bg-neutral-950 flex justify-center items-center overflow-hidden max-h-[600px] border-y border-white/5 sm:border-none">
        {post?.mediaType === "image" ? (
          <img
            src={post?.mediaUrl}
            alt="Post Media"
            className="w-full h-auto object-contain max-h-[600px]"
            loading="lazy"
          />
        ) : (
          <div className="relative w-full h-full cursor-pointer" onClick={handleVideoClick}>
            <video
              ref={videoRef}
              src={post?.mediaUrl}
              className="w-full h-auto object-contain max-h-[600px]"
              loop
              playsInline
              muted={isMuted}
            />
            {/* Play/Pause overlay animation */}
            {showPlayIcon && (
              <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                <div className="bg-black/50 p-4 rounded-full text-white animate-pulse">
                  {isPlaying ? <Play size={40} className="fill-white" /> : <Pause size={40} className="fill-white" />}
                </div>
              </div>
            )}
            {/* Volume Control */}
            <button
              onClick={handleMuteToggle}
              className="absolute bottom-4 right-4 bg-black/60 p-1.5 rounded-full text-white hover:bg-black/80 transition cursor-pointer z-20"
            >
              {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
            </button>
          </div>
        )}
      </div>

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
          <div className="text-sm text-white mb-1">
            <Link
              to={`/profile/${post?.user?._id}`}
              className="font-semibold hover:underline mr-2"
            >
              {post?.user?.username}
            </Link>
            <span className="text-neutral-200">{post.caption}</span>
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
        onDelete={handleDelete}
      />
    </div>
  );
};

export default PostCard;
