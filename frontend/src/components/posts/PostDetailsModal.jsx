import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Heart,
  Trash2,
  Play,
  Pause,
  Volume2,
  VolumeX,
} from "lucide-react";
import Modal from "@/components/common/Modal.jsx";
import ProfileImage from "@/components/common/ProfileImage.jsx";
import FollowButton from "@/components/common/FollowButton.jsx";
import MediaIcons from "@/components/common/MediaIcons.jsx";
import CommentForm from "@/components/common/CommentForm.jsx";
import { timeAgo } from "@/lib/timeAgo.js";

const PostDetailsModal = ({
  post,
  currentUser,
  isOpen,
  onClose,
  onDelete,
}) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
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

  // Autoplay video when modal opens, and pause when closed
  useEffect(() => {
    if (videoRef.current) {
      if (isOpen) {
        videoRef.current.play().catch((err) => console.log(err));
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  }, [isOpen]);

  if (!post) return null;

  return (
    <Modal
      openModal={isOpen}
      onClose={onClose}
      initialWidth="max-w-5xl"
      initialHeight="h-[80vh]"
      className="md:flex-row rounded-lg overflow-hidden border border-neutral-800"
    >
      <div className="flex flex-col md:flex-row w-full h-full">
        {/* Left Side: Media */}
        <div className="flex-1 bg-black flex items-center justify-center relative overflow-hidden h-[40vh] md:h-full">
          {post?.mediaType === "image" ? (
            <img
              src={post?.mediaUrl}
              alt={post?.caption}
              className="w-full h-full object-contain bg-neutral-950"
            />
          ) : (
            <div
              className="relative w-full h-full cursor-pointer flex items-center justify-center bg-neutral-950"
              onClick={handleVideoClick}
            >
              <video
                ref={videoRef}
                src={post?.mediaUrl}
                className="w-full h-full object-contain"
                loop
                playsInline
                muted={isMuted}
                autoPlay
              />
              {/* Play/Pause overlay animation */}
              {showPlayIcon && (
                <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none transition-opacity duration-500">
                  <div className="bg-black/50 p-4 rounded-full text-white animate-pulse">
                    {isPlaying ? (
                      <Play size={40} className="fill-white" />
                    ) : (
                      <Pause size={40} className="fill-white" />
                    )}
                  </div>
                </div>
              )}
              {/* Volume Control */}
              <button
                onClick={handleMuteToggle}
                className="absolute bottom-4 right-4 bg-black/60 p-2 rounded-full text-white hover:bg-black/80 transition cursor-pointer z-20"
              >
                {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
            </div>
          )}
        </div>

        {/* Right Side: Details */}
        <div className="w-full md:w-[350px] flex flex-col bg-black border-l border-white/10 h-[40vh] md:h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <div className="flex items-center gap-3">
              <ProfileImage user={post?.user} className="w-8 h-8" showOnlineStatus={false} />
              <Link
                to={`/profile/${post?.user?._id}`}
                className="font-semibold text-sm text-white hover:underline"
              >
                {post?.user?.username}
              </Link>
              {!isOwner && <FollowButton targetId={post?.user?._id} currentUser={currentUser} />}
            </div>
            {isOwner && (
              <button
                onClick={() => {
                  onDelete();
                  onClose();
                }}
                className="p-1 text-neutral-500 hover:text-red-500 transition cursor-pointer"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>

          {/* Comments Section */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 scrollbar-hide">
            {/* Caption (Treat as first comment) */}
            {post?.caption && (
              <div className="flex gap-3">
                <ProfileImage user={post?.user} className="w-8 h-8 shrink-0" showOnlineStatus={false} />
                <div className="flex flex-col">
                  <span className="text-sm">
                    <Link
                      to={`/profile/${post?.user?._id}`}
                      className="font-semibold text-white hover:underline mr-2"
                    >
                      {post?.user?.username}
                    </Link>
                    <span className="text-neutral-200">{post.caption}</span>
                  </span>
                  <span className="text-xs text-neutral-500 mt-1">
                    {timeAgo(post?.createdAt)}
                  </span>
                </div>
              </div>
            )}

            {/* Comments List */}
            {post?.comment?.length > 0 ? (
              post.comment.map((c, idx) => (
                <div key={c._id || idx} className="flex gap-3 group">
                  <ProfileImage user={c.user} className="w-8 h-8 shrink-0" showOnlineStatus={false} />
                  <div className="flex flex-col w-full">
                    <span className="text-sm">
                      <Link
                        to={`/profile/${c.user?._id}`}
                        className="font-semibold text-white hover:underline mr-2"
                      >
                        {c.user?.username}
                      </Link>
                      <span className="text-neutral-200">{c.text}</span>
                    </span>
                    <span className="text-xs text-neutral-500 mt-1 font-medium">
                      {timeAgo(c.createdAt)}
                    </span>
                  </div>
                  {/* Small like heart for comment could go here */}
                  <button className="opacity-0 group-hover:opacity-100 mt-1 cursor-pointer">
                    <Heart size={12} className="text-neutral-500 hover:text-white" />
                  </button>
                </div>
              ))
            ) : (
              !post.caption && (
                <div className="text-center text-neutral-500 text-sm mt-10">
                  No comments yet.
                </div>
              )
            )}
          </div>

          {/* Bottom Actions */}
          <div className="border-t border-white/10 flex flex-col gap-1">
            <MediaIcons
              type="post"
              item={post}
              size={24}
              handleOpenModal={() => document.getElementById(`comment-input-${post._id}`)?.focus()}
            />
            <div className="px-4 pb-3 flex flex-col gap-1">
              {post?.likes?.length > 0 && (
                <div className="font-semibold text-sm text-white">
                  {post.likes.length} {post.likes.length === 1 ? "like" : "likes"}
                </div>
              )}
              <span className="text-[10px] text-neutral-500 uppercase font-medium">
                {timeAgo(post?.createdAt)}
              </span>
            </div>
          </div>

          {/* Comment Input */}
          <div className="border-t border-white/10 px-4 py-3">
            <CommentForm
              postId={post?._id}
              inputId={`comment-input-${post._id}`}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default PostDetailsModal;
