import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
  ArrowLeft,
  ArrowRight,
  Heart,
  MessageCircle,
  Trash2,
} from "lucide-react";
import Modal from "@/components/common/Modal.jsx";
import ProfileImage from "@/components/common/ProfileImage.jsx";
import FollowButton from "@/components/common/FollowButton.jsx";
import CommentForm from "@/components/common/CommentForm.jsx";
import {
  toggleLikeReel,
  addCommentToReel,
  deleteReelById,
  setIsMutedGlobal,
} from "@/redux/slices/reelsSlice.js";
import { timeAgo } from "@/lib/timeAgo.js";

const VideoModal = ({
  isOpen,
  onClose,
  reels = [],
  initialIndex = 0,
  currentUser,
}) => {
  const dispatch = useDispatch();
  const videoRef = useRef(null);

  const { isMutedGlobal } = useSelector((state) => state.reels);

  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showPlayIcon, setShowPlayIcon] = useState(false);

  const currentReel = reels[currentIndex];
  const isOwner = currentUser?._id === currentReel?.user?._id;

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentIndex(initialIndex);
    setIsPlaying(true);
  }, [initialIndex, isOpen]);

  // Video Ref playback management
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.muted = isMutedGlobal;
      if (isOpen && isPlaying) {
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise.catch((err) =>
            console.log("Video auto-play failed:", err),
          );
        }
      } else {
        video.pause();
      }
    }
  }, [currentIndex, isOpen, isPlaying, isMutedGlobal]);

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
      } else {
        setIsPlaying(true);
        setShowPlayIcon(true);
      }
    }
    setTimeout(() => setShowPlayIcon(false), 600);
  };

  const handleMuteToggle = (e) => {
    e.stopPropagation();
    dispatch(setIsMutedGlobal(!isMutedGlobal));
  };

  const handlePrev = (e) => {
    e?.stopPropagation();
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setIsPlaying(true);
    }
  };

  const handleNext = (e) => {
    e?.stopPropagation();
    if (currentIndex < reels.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setIsPlaying(true);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
      if (e.key === " ") {
        e.preventDefault();
        handleVideoClick();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, currentIndex, reels.length]);

  if (!isOpen || !currentReel) return null;

  const handleLike = (e) => {
    e.stopPropagation();
    dispatch(toggleLikeReel(currentReel._id));
  };

  const handleCommentSubmit = (text) => {
    dispatch(addCommentToReel(currentReel._id, text));
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this Reel?")) {
      dispatch(deleteReelById(currentReel._id));
      if (reels.length <= 1) {
        onClose();
      } else {
        handleNext();
      }
    }
  };

  const isLiked = currentReel.likes?.includes(currentUser?._id);

  return (
    <Modal
      openModal={isOpen}
      onClose={onClose}
      showCloseButton={false}
      initialWidth="max-w-4xl"
      initialHeight="h-[85vh]"
      className="md:flex-row rounded-2xl overflow-hidden border border-white/10 p-0 shadow-2xl bg-neutral-950"
    >
      <div className="flex flex-col md:flex-row w-full h-full relative select-none">
        {/* Left Side: Video Content */}
        <div className="flex-1 bg-black relative flex items-center justify-center h-[50vh] md:h-full group">
          <div
            onClick={handleVideoClick}
            className="relative w-full h-full cursor-pointer flex items-center justify-center"
          >
            <video
              ref={videoRef}
              src={currentReel.mediaUrl}
              className="w-full h-full object-contain"
              loop
              playsInline
              muted={isMutedGlobal}
            />

            {/* Play/Pause icon indicator */}
            {showPlayIcon && (
              <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                <div className="bg-black/60 p-4 rounded-full text-white animate-pulse">
                  {isPlaying ? (
                    <Play size={36} className="fill-white" />
                  ) : (
                    <Pause size={36} className="fill-white" />
                  )}
                </div>
              </div>
            )}

            {/* Global Mute Button */}
            <button
              onClick={handleMuteToggle}
              className="absolute bottom-4 right-4 bg-black/60 hover:bg-black/80 text-white rounded-full p-2 border border-white/5 transition hover:scale-105 active:scale-95 cursor-pointer z-20"
            >
              {isMutedGlobal ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
          </div>

          {/* Left Navigation Chevron */}
          {currentIndex > 0 && (
            <button
              onClick={handlePrev}
              className="absolute left-4 z-20 bg-neutral-900/80 hover:bg-neutral-800 text-white rounded-full p-2.5 shadow-md border border-white/5 opacity-0 group-hover:opacity-100 transition hover:scale-105 active:scale-95 cursor-pointer"
            >
              <ArrowLeft size={16} />
            </button>
          )}

          {/* Right Navigation Chevron */}
          {currentIndex < reels.length - 1 && (
            <button
              onClick={handleNext}
              className="absolute right-4 z-20 bg-neutral-900/80 hover:bg-neutral-800 text-white rounded-full p-2.5 shadow-md border border-white/5 opacity-0 group-hover:opacity-100 transition hover:scale-105 active:scale-95 cursor-pointer"
            >
              <ArrowRight size={16} />
            </button>
          )}

          {/* Top Close button for Modal */}
          <button
            onClick={onClose}
            className="absolute top-4 left-4 bg-neutral-900/80 hover:bg-neutral-800 text-white rounded-full p-2 border border-white/5 transition z-30 cursor-pointer md:hidden"
          >
            <X size={18} />
          </button>
        </div>

        {/* Right Side: Reels details & comments */}
        <div className="w-full md:w-[360px] flex flex-col bg-neutral-950 border-t md:border-t-0 md:border-l border-white/10 h-[35vh] md:h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/10">
            <div className="flex items-center gap-3">
              <ProfileImage
                user={currentReel.user}
                className="w-8 h-8"
                showOnlineStatus={false}
              />
              <div className="flex flex-col">
                <Link
                  to={`/profile/${currentReel.user?._id}`}
                  className="font-bold text-xs text-white hover:underline tracking-wide"
                >
                  {currentReel.user?.username}
                </Link>
                {currentReel.createdAt && (
                  <span className="text-[9px] text-neutral-400 font-medium">
                    {timeAgo(currentReel.createdAt)}
                  </span>
                )}
              </div>
              {!isOwner && (
                <FollowButton
                  targetId={currentReel.user?._id}
                  currentUser={currentUser}
                />
              )}
            </div>

            <div className="flex items-center gap-2">
              {isOwner && (
                <button
                  onClick={handleDelete}
                  className="p-1.5 text-neutral-400 hover:text-red-500 rounded-full hover:bg-red-500/10 transition cursor-pointer"
                  title="Delete Reel"
                >
                  <Trash2 size={16} />
                </button>
              )}
              {/* Desktop close button */}
              <button
                onClick={onClose}
                className="hidden md:block p-1.5 text-neutral-400 hover:text-white rounded-full hover:bg-white/5 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Comments and Caption Scroll */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
            {/* Caption (Treat as first comment) */}
            {currentReel.caption && (
              <div className="flex gap-3">
                <ProfileImage
                  user={currentReel.user}
                  className="w-8 h-8 shrink-0"
                  showOnlineStatus={false}
                />
                <div className="flex flex-col">
                  <span className="text-xs">
                    <Link
                      to={`/profile/${currentReel.user?._id}`}
                      className="font-bold text-white hover:underline mr-2"
                    >
                      {currentReel.user?.username}
                    </Link>
                    <span className="text-neutral-300 font-medium whitespace-pre-wrap">
                      {currentReel.caption}
                    </span>
                  </span>
                  <span className="text-[10px] text-neutral-500 mt-1 font-medium">
                    {timeAgo(currentReel.createdAt)}
                  </span>
                </div>
              </div>
            )}

            {/* Comments List */}
            {currentReel.comment?.length > 0
              ? currentReel.comment.map((c, idx) => (
                  <div key={c._id || idx} className="flex gap-3">
                    <ProfileImage
                      user={c.user}
                      className="w-8 h-8 shrink-0"
                      showOnlineStatus={false}
                    />
                    <div className="flex flex-col">
                      <span className="text-xs">
                        <Link
                          to={`/profile/${c.user?._id}`}
                          className="font-bold text-white hover:underline mr-2"
                        >
                          {c.user?.username || "user"}
                        </Link>
                        <span className="text-neutral-300 font-medium">
                          {c.text}
                        </span>
                      </span>
                      <span className="text-[10px] text-neutral-500 mt-1 font-medium">
                        {timeAgo(c.createdAt)}
                      </span>
                    </div>
                  </div>
                ))
              : !currentReel.caption && (
                  <div className="text-center text-neutral-500 text-xs py-12">
                    No comments yet.
                  </div>
                )}
          </div>

          {/* Reactions Footer */}
          <div className="border-t border-white/10 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4 text-white">
              {/* Like Button */}
              <button
                onClick={handleLike}
                className="hover:opacity-70 transition cursor-pointer flex items-center gap-1.5"
              >
                <Heart
                  size={20}
                  className={
                    isLiked ? "fill-red-500 text-red-500" : "text-white"
                  }
                  strokeWidth={2}
                />
                <span className="text-xs font-semibold">
                  {currentReel.likes?.length || 0}
                </span>
              </button>

              {/* Comments Icon Indicator */}
              <div className="flex items-center gap-1.5 text-neutral-400">
                <MessageCircle size={20} strokeWidth={2} />
                <span className="text-xs font-semibold text-white">
                  {currentReel.comment?.length || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Comment Form */}
          <div className="border-t border-white/10 px-4 py-3 bg-neutral-950">
            <CommentForm
              onSubmit={handleCommentSubmit}
              placeholder="Add a comment on this Reel..."
              inputId={`comment-input-reel-${currentReel._id}`}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default VideoModal;
