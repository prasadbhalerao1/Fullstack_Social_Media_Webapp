import { useState, useEffect, useRef, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import {
  Plus,
  Play,
  Pause,
  Volume2,
  VolumeX,
  X,
  ArrowLeft,
  ArrowRight,
  Heart,
  MessageCircle,
  Send,
  Eye,
  Trash2,
} from "lucide-react";
import Modal from "@/components/common/Modal.jsx";
import CreateMedia from "@/components/media/CreateMedia.jsx";
import ProfileImage from "@/components/common/ProfileImage.jsx";
import CommentsDrawer from "@/components/common/CommentsDrawer.jsx";
import { timeAgo } from "@/lib/timeAgo.js";
import {
  getAllStories,
  viewStory,
  toggleLikeStory,
  addCommentToStory,
  deleteStory,
} from "@/redux/slices/storiesSlice.js";

const Stories = () => {
  const { user: currentUser } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  // Refs
  const videoRef = useRef(null);
  const progressIntervalRef = useRef(null);
  const viewsModalRef = useRef(null);
  const scrollRef = useRef(null);

  // States
  const { stories } = useSelector((state) => state.stories);
  const [currentUserIndex, setCurrentUserIndex] = useState(0);
  const [isCreateStoryModal, setIsCreateStoryModal] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);

  // Modals
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [showStoryModal, setShowStoryModal] = useState(false);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [showViewsModal, setShowViewsModal] = useState(false);

  // Drag-to-Scroll & Carousel States
  const [isDown, setIsDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftState, setScrollLeftState] = useState(0);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  // Interactive Controls States
  const [commentText, setCommentText] = useState("");

  const updateArrowVisibility = () => {
    const slider = scrollRef.current;
    if (!slider) return;
    setShowLeftArrow(slider.scrollLeft > 5);
    setShowRightArrow(
      slider.scrollLeft < slider.scrollWidth - slider.clientWidth - 5,
    );
  };

  useEffect(() => {
    const slider = scrollRef.current;
    if (!slider) return;

    // Run initial check after data loads
    const timer = setTimeout(updateArrowVisibility, 300);

    slider.addEventListener("scroll", updateArrowVisibility);
    window.addEventListener("resize", updateArrowVisibility);
    return () => {
      clearTimeout(timer);
      slider.removeEventListener("scroll", updateArrowVisibility);
      window.removeEventListener("resize", updateArrowVisibility);
    };
  }, [stories]);

  // Handle click outside to close modals simultaneously
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isCreateStoryModal || showStoryModal || showCommentsModal) {
        const backdropClasses = [
          "fixed",
          "absolute",
          "inset-0",
          "bg-black/60",
          "bg-black/80",
        ];
        const isBackdropClick =
          backdropClasses.some((cls) => event.target.classList.contains(cls)) ||
          event.target.getAttribute("role") === "dialog";

        if (isBackdropClick) {
          setIsCreateStoryModal(false);
          setShowStoryModal(false);
          setShowCommentsModal(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showStoryModal, isCreateStoryModal, showCommentsModal]);

  const handleMouseDown = (e) => {
    const slider = scrollRef.current;
    if (!slider) return;
    setIsDown(true);
    setStartX(e.pageX - slider.offsetLeft);
    setScrollLeftState(slider.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDown(false);
  };

  const handleMouseUp = () => {
    setIsDown(false);
  };

  const handleMouseMove = (e) => {
    if (!isDown) return;
    e.preventDefault();
    const slider = scrollRef.current;
    if (!slider) return;
    const x = e.pageX - slider.offsetLeft;
    const walk = (x - startX) * 2; // scroll speed multiplier
    slider.scrollLeft = scrollLeftState - walk;
  };

  // Touch scroll equivalents
  const handleTouchStart = (e) => {
    const slider = scrollRef.current;
    if (!slider) return;
    setIsDown(true);
    setStartX(e.touches[0].pageX - slider.offsetLeft);
    setScrollLeftState(slider.scrollLeft);
  };

  const handleTouchEnd = () => {
    setIsDown(false);
  };

  const handleTouchMove = (e) => {
    if (!isDown) return;
    const slider = scrollRef.current;
    if (!slider) return;
    const x = e.touches[0].pageX - slider.offsetLeft;
    const walk = (x - startX) * 1.5;
    slider.scrollLeft = scrollLeftState - walk;
  };

  const scrollStories = (direction) => {
    const slider = scrollRef.current;
    if (!slider) return;
    const scrollAmount = slider.clientWidth * 0.75; // scroll 75% of visible width
    slider.scrollTo({
      left:
        direction === "left"
          ? slider.scrollLeft - scrollAmount
          : slider.scrollLeft + scrollAmount,
      behavior: "smooth",
    });
  };

  // Derived selectors
  const currentUserStories = stories[currentUserIndex]?.stories || [];
  const currentStory = currentUserStories[currentStoryIndex];
  const currentStoryUser = stories[currentUserIndex]?.user;
  const isLastStoryOfLastUser =
    currentUserIndex === stories.length - 1 &&
    currentStoryIndex === currentUserStories.length - 1;

  const canGoPrevious = currentUserIndex > 0 || currentStoryIndex > 0;
  const canGoNext = !isLastStoryOfLastUser;

  useEffect(() => {
    dispatch(getAllStories());
  }, [dispatch]);

  const handleCreateStoryModal = () => {
    setIsCreateStoryModal(true);
  };

  const handleUserClick = (index) => {
    setCurrentUserIndex(index);
    setShowStoryModal(true);
    setCurrentStoryIndex(0);
    setProgress(0);
    setIsPlaying(true);
  };

  const handleStorView = (storyId) => {
    if (!storyId) return;
    if (currentStoryUser?._id === currentUser?._id) return;
    dispatch(viewStory(storyId));
  };

  const handlePlayPause = () => {
    if (currentStory?.mediaType === "video") {
      const video = videoRef.current;
      if (video) {
        if (video.paused) {
          const playPromise = video.play();
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                setIsPlaying(true);
              })
              .catch((error) => {
                console.log("Video play failed:", error);
                setIsPlaying(false);
              });
          } else {
            setIsPlaying(true);
          }
        } else {
          video.pause();
          setIsPlaying(false);
        }
      }
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const handleMediaVolume = () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    if (currentStory?.mediaType === "video") {
      const video = videoRef.current;
      if (video) {
        video.muted = newMutedState;
      }
    }
  };

  const handlePreviousStory = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex((prev) => prev - 1);
      setProgress(0);
      setIsPlaying(true);
    } else if (currentUserIndex > 0) {
      const previousUserStories = stories[currentUserIndex - 1]?.stories || [];
      setCurrentUserIndex((prev) => prev - 1);
      setCurrentStoryIndex(previousUserStories.length - 1);
      setProgress(0);
      setIsPlaying(true);
    }
  };

  const handleNextStory = useCallback(() => {
    const currentStories = stories[currentUserIndex]?.stories || [];
    if (isLastStoryOfLastUser) {
      setTimeout(() => {
        setShowStoryModal(false);
      }, 300);
      return;
    }
    if (currentStoryIndex < currentStories.length - 1) {
      setCurrentStoryIndex((prev) => prev + 1);
      setProgress(0);
      setIsPlaying(true);
    } else if (currentUserIndex < stories.length - 1) {
      setCurrentUserIndex((prev) => prev + 1);
      setCurrentStoryIndex(0);
      setProgress(0);
      setIsPlaying(true);
    }
  }, [
    setShowStoryModal,
    setCurrentStoryIndex,
    setCurrentUserIndex,
    setProgress,
    setIsPlaying,
    currentStoryIndex,
    currentUserIndex,
    isLastStoryOfLastUser,
    stories,
  ]);

  const handleLikeStory = () => {
    if (!currentStory?._id) return;
    dispatch(toggleLikeStory(currentStory._id));
  };

  const handleDeleteStory = (storyId) => {
    if (!storyId) return;
    if (window.confirm("Are you sure you want to delete this story?")) {
      dispatch(deleteStory(storyId));
      const currentStories = stories[currentUserIndex]?.stories || [];
      if (currentStories.length <= 1) {
        setShowStoryModal(false);
      } else {
        handleNextStory();
      }
    }
  };

  const commentModal = () => {
    setShowCommentsModal(true);
  };

  const handleAddCommentToStory = (storyId, text) => {
    const id = storyId || currentStory?._id;
    const content = text || commentText;
    if (!content.trim() || !id) return;
    dispatch(addCommentToStory(id, content));
    if (!text) setCommentText("");
  };

  // Playback timer & progress management
  useEffect(() => {
    if (!showStoryModal || !currentStory) return;
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }

    const isPausedByModal = showCommentsModal || showViewsModal;
    const activePlaying = isPlaying && !isPausedByModal;

    if (currentStory.mediaType === "video") {
      const video = videoRef.current;
      if (!video) return;
      video.muted = isMuted;
      if (activePlaying) {
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              // Playing successfully
            })
            .catch((error) => {
              console.log("Video play error:", error);
              setIsPlaying(false);
            });
        }
      } else {
        video.pause();
      }
    } else if (currentStory.mediaType === "image" && activePlaying) {
      const imageDuration = 5000;
      // account for already elapsed progress
      const startTime = Date.now() - (progress / 100) * imageDuration;
      progressIntervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const newProgress = Math.min(100, (elapsed / imageDuration) * 100);
        setProgress(newProgress);
        if (newProgress >= 100) {
          clearInterval(progressIntervalRef.current);
          progressIntervalRef.current = null;
          handleNextStory();
        }
      }, 100);
    }

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    };
  }, [
    showStoryModal,
    currentStory,
    isPlaying,
    progress,
    isMuted,
    showCommentsModal,
    showViewsModal,
    handleNextStory,
    videoRef,
  ]);

  // Handle video event listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video || currentStory?.mediaType !== "video") return;

    const handleTimeUpdate = () => {
      if (video.duration) {
        const newProgress = (video.currentTime / video.duration) * 100;
        setProgress(newProgress);
      }
    };

    const handleEnded = () => {
      setProgress(100);
      setTimeout(() => {
        handleNextStory();
      }, 100);
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("ended", handleEnded);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("ended", handleEnded);
    };
  }, [currentStory, handleNextStory, videoRef]);

  // Reset progress and video playback when active story changes
  useEffect(() => {
    if (!showStoryModal || !currentStory) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setProgress(0);
    if (currentStory.mediaType === "video") {
      const video = videoRef.current;
      if (video) {
        video.currentTime = 0;
      }
    }
  }, [currentStory, showStoryModal, videoRef]);

  // Auto close when stories finish
  useEffect(() => {
    if (showStoryModal && isLastStoryOfLastUser && progress >= 100) {
      const timer = setTimeout(() => {
        setShowStoryModal(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isLastStoryOfLastUser, showStoryModal, progress]);

  // Reset states when modal is closed
  useEffect(() => {
    if (!showStoryModal) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setProgress(0);
      setIsPlaying(true);
      setShowCommentsModal(false);
      setShowViewsModal(false);
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    }
  }, [showStoryModal]);

  return (
    <>
      <div className="relative w-full group">
        {/* Left Chevron */}
        {showLeftArrow && (
          <button
            onClick={() => scrollStories("left")}
            className="absolute left-2 top-10 z-20 bg-neutral-900/80 hover:bg-neutral-800 text-white rounded-full p-1.5 shadow-md border border-white/5 transition hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center"
          >
            <ArrowLeft size={14} />
          </button>
        )}

        {/* Right Chevron */}
        {showRightArrow && (
          <button
            onClick={() => scrollStories("right")}
            className="absolute right-2 top-10 z-20 bg-neutral-900/80 hover:bg-neutral-800 text-white rounded-full p-1.5 shadow-md border border-white/5 transition hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center"
          >
            <ArrowRight size={14} />
          </button>
        )}

        <div
          ref={scrollRef}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onTouchMove={handleTouchMove}
          className="w-full flex items-center overflow-x-auto py-4 px-2 space-x-6 no-scrollbar select-none border-b border-white/5 cursor-grab active:cursor-grabbing scroll-smooth"
        >
          {/* Create Story Button */}
          <div
            onClick={handleCreateStoryModal}
            className="shrink-0 flex flex-col items-center cursor-pointer group"
          >
            <div className="relative w-16 h-16 rounded-full border border-dashed border-neutral-700 hover:border-white transition-all duration-300 p-0.5 flex items-center justify-center bg-neutral-900/50">
              <ProfileImage
                user={currentUser}
                className="w-full h-full"
                showOnlineStatus={false}
                linkable={false}
              />
              <div className="absolute -bottom-1 -right-1 bg-white group-hover:bg-neutral-200 rounded-full p-1 shadow-md transition">
                <Plus size={12} className="text-black" />
              </div>
            </div>
            <span className="mt-2 text-[11px] text-neutral-400 font-medium group-hover:text-white transition truncate w-16 text-center">
              Create Story
            </span>
          </div>

          {/* Stories List */}
          <div className="flex space-x-6">
            {stories?.map((userStories, index) => (
              <div
                key={userStories?.user?._id}
                onClick={() => handleUserClick(index)}
                className="flex flex-col items-center cursor-pointer shrink-0 group"
              >
                <div
                  className={`p-0.5 rounded-full border-2 transition-all duration-300 ${
                    index === currentUserIndex && showStoryModal
                      ? "border-white scale-105"
                      : userStories.hasUnViewed
                        ? "border-white group-hover:border-neutral-200"
                        : "border-neutral-800 group-hover:border-neutral-600"
                  }`}
                >
                  <ProfileImage
                    user={userStories?.user}
                    className="w-14 h-14"
                    showOnlineStatus={false}
                    linkable={false}
                  />
                </div>
                <span className="mt-2 text-[11px] text-neutral-400 font-medium group-hover:text-white transition truncate w-16 text-center">
                  {userStories?.user?._id === currentUser?._id
                    ? "Your story"
                    : userStories?.user?.username}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Create Story Modal */}
      <StoryModelWrapper
        isOpen={isCreateStoryModal}
        onClose={() => setIsCreateStoryModal(false)}
        onUploadSuccess={() => {
          setIsCreateStoryModal(false);
          dispatch(getAllStories());
        }}
      />

      <Modal
        openModal={showStoryModal}
        onClose={() => setShowStoryModal(false)}
        showCloseButton={false}
        initialWidth="w-full sm:max-w-[420px]"
        initialHeight="h-full sm:h-auto"
        className="w-full sm:w-[90%] h-full sm:h-auto p-0 border-none bg-transparent shadow-none !rounded-none sm:!rounded-2xl"
      >
        <div className="relative w-full h-full flex flex-col items-center">
          {/* The close button was removed from here per user request */}

          <div className="w-full h-full sm:h-auto bg-black overflow-hidden relative sm:aspect-9/16 max-h-[100dvh] sm:max-h-[85vh] flex flex-col justify-center border-0 sm:border sm:border-white/10 sm:rounded-2xl">
            {/* Progress Indicators */}
            <div className="flex gap-1.5 w-full absolute top-3 left-0 px-4 z-20">
              {currentUserStories.map((_, idx) => {
                let widthVal = "0%";
                if (idx < currentStoryIndex) widthVal = "100%";
                else if (idx === currentStoryIndex) widthVal = `${progress}%`;
                return (
                  <div
                    key={idx}
                    className="h-0.5 bg-white/20 rounded-full flex-1 overflow-hidden"
                  >
                    <div
                      className="h-full bg-white transition-all duration-100 ease-linear"
                      style={{ width: widthVal }}
                    ></div>
                  </div>
                );
              })}
            </div>

            {/* User Details and Controls Header */}
            <div className="flex items-center justify-between w-full absolute top-6 left-0 px-4 z-20 bg-linear-to-b from-black/60 to-transparent pb-6">
              <div className="flex items-center gap-2">
                <ProfileImage
                  user={currentStoryUser}
                  className="w-8 h-8"
                  showOnlineStatus={false}
                />
                <Link
                  to={`/profile/${currentStoryUser?._id}`}
                  className="text-white font-semibold text-xs tracking-wide hover:underline"
                >
                  {currentStoryUser?.username}
                </Link>
                {currentStory?.createdAt && (
                  <span className="text-[10px] text-neutral-400 font-medium">
                    • {timeAgo(currentStory.createdAt)}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 text-white/80 z-30">
                {currentStoryUser?._id === currentUser?._id && (
                  <button
                    onClick={() => handleDeleteStory(currentStory?._id)}
                    className="text-red-500 hover:text-red-400 transition cursor-pointer p-1"
                    title="Delete Story"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
                <button
                  onClick={handlePlayPause}
                  className="hover:text-white transition cursor-pointer"
                >
                  {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                </button>
                {currentStory?.mediaType === "video" && (
                  <button
                    onClick={handleMediaVolume}
                    className="hover:text-white transition cursor-pointer"
                  >
                    {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                  </button>
                )}
                <button
                  onClick={() => setShowStoryModal(false)}
                  className="hover:text-white transition cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Media Presentation */}
            <div className="flex items-center justify-center h-full pt-12 pb-20 bg-neutral-950">
              {currentStory?.mediaType === "video" ? (
                <video
                  ref={videoRef}
                  src={currentStory?.mediaUrl}
                  muted={isMuted}
                  onLoadedData={() => handleStorView(currentStory?._id)}
                  playsInline
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  className="max-w-full max-h-full object-contain"
                  autoPlay
                />
              ) : (
                <img
                  src={currentStory?.mediaUrl}
                  onLoad={() => handleStorView(currentStory?._id)}
                  alt="story"
                  className="max-w-full max-h-full object-contain"
                />
              )}
            </div>

            {/* Caption Overlay */}
            {currentStory?.caption && (
              <div className="absolute bottom-20 left-0 right-0 px-4 z-20">
                <p className="text-white text-center text-sm bg-black/60 rounded-xl p-3 backdrop-blur-sm border border-white/5">
                  {currentStory?.caption}
                </p>
              </div>
            )}

            {/* Navigators Overlay */}
            <div className="absolute inset-0 flex justify-between items-center pointer-events-none z-10">
              <button
                onClick={handlePreviousStory}
                disabled={!canGoPrevious}
                className={`w-1/2 h-full flex items-center justify-start pointer-events-auto transition-opacity ${
                  canGoPrevious
                    ? "opacity-0 hover:opacity-100"
                    : "opacity-0 cursor-default"
                }`}
              >
                <div className="bg-black bg-opacity-50 rounded-full p-3 backdrop-blur-sm ml-4">
                  <ArrowLeft className="text-white text-xl" />
                </div>
              </button>
              <button
                onClick={handleNextStory}
                disabled={!canGoNext}
                className={`w-1/2 h-full flex items-center justify-end pointer-events-auto transition-opacity ${
                  canGoNext
                    ? "opacity-0 hover:opacity-100"
                    : "opacity-0 cursor-default"
                }`}
              >
                <div className="bg-black bg-opacity-50 rounded-full p-3 backdrop-blur-sm mr-4">
                  <ArrowRight className="text-white text-xl" />
                </div>
              </button>
            </div>

            {/* Bottom Controls */}
            <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/95 to-transparent pt-10 pb-4 px-4 z-20">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center space-x-6 text-white">
                  {/* Heart/Like Button */}
                  <button
                    onClick={handleLikeStory}
                    className="relative flex flex-col items-center hover:opacity-80 transition cursor-pointer"
                  >
                    <Heart
                      size={20}
                      className={
                        currentStory?.likes?.includes(currentUser?._id)
                          ? "fill-red-500 text-red-500"
                          : "text-white"
                      }
                    />
                    {currentStory?.likes?.length > 0 && (
                      <span className="absolute -top-3 -right-2 text-[9px] text-white font-bold bg-red-500 rounded-full min-h-4 h-4 min-w-4 flex items-center justify-center px-1 shadow">
                        {currentStory.likes.length}
                      </span>
                    )}
                  </button>
                  {/* Comment Drawer Trigger */}
                  <button
                    onClick={commentModal}
                    className="relative flex flex-col items-center hover:opacity-80 transition cursor-pointer"
                  >
                    <MessageCircle size={20} className="text-white" />
                    {currentStory?.comment?.length > 0 && (
                      <span className="absolute -top-3 -right-2 text-[9px] text-black font-bold bg-white rounded-full min-h-4 h-4 min-w-4 flex items-center justify-center px-1 shadow">
                        {currentStory.comment.length}
                      </span>
                    )}
                  </button>
                  {/* Views Button (only for owner) */}
                  {currentStoryUser?._id === currentUser?._id && (
                    <button
                      onClick={() => setShowViewsModal(true)}
                      className="relative flex flex-col items-center hover:opacity-80 transition cursor-pointer"
                    >
                      <Eye size={20} className="text-white" />
                      {currentStory?.viewers?.length > 0 && (
                        <span className="absolute -top-3 -right-2 text-[9px] text-black font-bold bg-white rounded-full min-h-4 h-4 min-w-4 flex items-center justify-center px-1 shadow">
                          {currentStory.viewers.length}
                        </span>
                      )}
                    </button>
                  )}
                </div>

                {/* Reply Input Box */}
                <div className="flex-1 relative flex items-center">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Reply..."
                    className="w-full bg-white/10 hover:bg-white/15 focus:bg-white/20 border border-white/5 rounded-full pl-4 pr-10 py-2 text-white text-xs placeholder-neutral-400 focus:outline-none transition duration-200"
                  />
                  <button
                    onClick={() => handleAddCommentToStory(currentStory?._id)}
                    className="absolute right-2 text-neutral-400 hover:text-white transition cursor-pointer p-1"
                  >
                    <Send size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* Comments Drawer Modal */}
            <CommentsDrawer
              isOpen={showCommentsModal}
              onClose={() => setShowCommentsModal(false)}
              comments={currentStory?.comment || []}
              onAddComment={(text) =>
                handleAddCommentToStory(currentStory?._id, text)
              }
            />

            {/* Views Drawer Modal */}
            {showViewsModal && (
              <div
                className="absolute inset-0 z-100 flex items-end justify-center bg-black/60 backdrop-blur-sm"
                onClick={() => setShowViewsModal(false)}
              >
                <div
                  ref={viewsModalRef}
                  className="bg-neutral-900 border-t border-white/10 rounded-t-3xl w-full max-h-[75%] flex flex-col shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Drawer Header */}
                  <div className="flex items-center justify-between p-4 border-b border-white/10">
                    <h3 className="text-md font-semibold text-gray-200">
                      Views ({currentStory?.viewers?.length || 0})
                    </h3>
                    <button
                      onClick={() => setShowViewsModal(false)}
                      className="p-1.5 text-neutral-400 hover:text-white hover:bg-white/5 rounded-full transition"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {/* Viewers List */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
                    {currentStory?.viewers?.length > 0 ? (
                      <div className="flex flex-col gap-4 text-white">
                        {currentStory.viewers.map((viewer, i) => (
                          <div
                            key={viewer._id || i}
                            className="flex gap-3 items-center"
                          >
                            <ProfileImage
                              user={viewer}
                              className="w-8 h-8"
                              showOnlineStatus={false}
                            />
                            <div className="flex-1 flex flex-col">
                              <Link
                                to={`/profile/${viewer?._id}`}
                                className="text-sm text-neutral-200 font-semibold hover:underline"
                              >
                                {viewer?.username || "user"}
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center text-neutral-500 py-12 text-sm">
                        No views yet.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Modal>
    </>
  );
};

const StoryModelWrapper = ({ isOpen, onClose, onUploadSuccess }) => {
  return (
    <Modal
      openModal={isOpen}
      onClose={onClose}
      initialWidth="max-w-2xl"
      initialHeight="h-auto"
    >
      <div className="w-full max-w-2xl">
        <CreateMedia
          type="story"
          onClose={onClose}
          onUploadSuccess={onUploadSuccess}
        />
      </div>
    </Modal>
  );
};

export default Stories;
