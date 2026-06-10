import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSelector } from "react-redux";
import { Plus, Play, Pause, Volume2, VolumeX, X, ChevronLeft, ChevronRight, ArrowLeft, ArrowRight, Heart, MessageCircle, Send } from "lucide-react";
import { axiosInstance } from "../lib/axios";
import { toast } from "react-hot-toast";
import Modal from "./Modal";
import CreateMedia from "./CreateMedia";

const Stories = () => {
  const { user: currentUser } = useSelector((state) => state.user);

  // Refs
  const createModalRef = useRef(null);
  const storiesModalRef = useRef(null);
  const videRef = useRef(null);
  const videoRef = videRef; // point videoRef to videRef to handle both references
  const progressIntervalRef = useRef(null);
  const commentsModalRef = useRef(null);

  // States
  const [stories, setStories] = useState([]);
  const [currentUserIndex, setCurrentUserIndex] = useState(0);
  const [isCreateStoryModal, setIsCreateStoryModal] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);

  // Modals
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [showStoryModal, setShowStoryModal] = useState(false);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [showViewStoryModal, setShowViewStoryModal] = useState(false);
  
  // Interactive Controls States
  const [commentText, setCommentText] = useState("");

  // Aliases for misspelled variables from user's template
  const isplaying = isPlaying;
  const setIsPlayingState = setIsPlaying;
  const progess = progress;
  const setProgess = setProgress;

  // Derived selectors
  const currentUserStories = stories[currentUserIndex]?.stories || [];
  const currentStory = currentUserStories[currentStoryIndex];
  const currentStoryUser = stories[currentUserIndex]?.user;
  const isLastStoryOfLastUser =
    currentUserIndex === stories.length - 1 &&
    currentStoryIndex === currentUserStories.length - 1;
  
  const canGoPrevious = currentUserIndex > 0 || currentStoryIndex > 0;
  const canGoNext = !isLastStoryOfLastUser;

  const getAllStories = async () => {
    try {
      const { data } = await axiosInstance.get("/story/all");
      if (data.success && data.stories) {
        setStories(data.stories);
      }
    } catch (error) {
      console.log("Error fetching stories:", error);
    }
  };

  useEffect(() => {
    getAllStories();
  }, []);

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

  const handleStorView = async (storyId) => {
    if (!storyId) return;
    try {
      await axiosInstance.get(`/story/${storyId}/view`);
    } catch (error) {
      console.log("Error viewing story:", error);
    }
  };

  const handlePlayPause = () => {
    if (currentStory?.mediaType === "video") {
      const video = videoRef.current;
      if (video) {
        if (video.paused) {
          video.play().catch((error) => {
            console.log("Video play failed:", error);
            setIsPlaying(false);
          });
          setIsPlaying(true);
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

  const getCurrentPlayaState = () => {
    if (currentStory?.mediaType === "video") {
      const video = videoRef.current;
      return video ? !video.paused : isPlaying;
    }
    return isPlaying;
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

  const handleLikeStory = async () => {
    if (!currentStory) return;
    try {
      const { data } = await axiosInstance.put(`/story/${currentStory._id}/like`);
      if (data.success) {
        toast.success(data.message);
        getAllStories();
      }
    } catch (error) {
      console.error("Error liking story:", error);
    }
  };

  const commentModal = () => {
    setShowCommentsModal(true);
  };

  const addCommentToStory = async (storyId) => {
    const id = storyId || currentStory?._id;
    if (!commentText.trim() || !id) return;
    try {
      const { data } = await axiosInstance.post(`/story/${id}/comment`, {
        text: commentText,
      });
      if (data.success) {
        toast.success("Comment added!");
        setCommentText("");
        getAllStories();
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  // Playback timer & progress management
  useEffect(() => {
    if (!showStoryModal || !currentStory) return;
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }

    if (currentStory.mediaType === "video") {
      const video = videoRef.current;
      if (!video) return;
      video.muted = isMuted;
      if (isPlaying) {
        video.play().catch((error) => {
          console.log("Video play error:", error);
          setIsPlaying(false);
        });
      } else {
        video.pause();
      }
    } else if (currentStory.mediaType === "image" && isPlaying) {
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
  }, [showStoryModal, currentStory, isPlaying, progress, isMuted, handleNextStory]);

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
  }, [currentStory, handleNextStory]);

  // Reset progress and video playback when active story changes
  useEffect(() => {
    if (!showStoryModal || !currentStory) return;
    setProgress(0);
    if (currentStory.mediaType === "video") {
      const video = videoRef.current;
      if (video) {
        video.currentTime = 0;
      }
    }
  }, [currentStory, showStoryModal]);

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
      setProgress(0);
      setIsPlaying(true);
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    }
  }, [showStoryModal]);

  return (
    <div className="w-full flex items-center overflow-x-auto py-4 px-2 space-x-6 no-scrollbar select-none border-b border-white/5">
      {/* Create Story Button */}
      <div onClick={handleCreateStoryModal} className="shrink-0 flex flex-col items-center cursor-pointer group">
        <div className="relative w-16 h-16 rounded-full border-2 border-dashed border-neutral-700 hover:border-indigo-500 transition-all duration-300 p-0.5 flex items-center justify-center bg-neutral-900/50">
          {currentUser?.profileImage ? (
            <img src={currentUser?.profileImage} alt="profile" className="w-full h-full rounded-full object-cover" />
          ) : (
            <div className="w-full h-full rounded-full flex items-center justify-center bg-neutral-800 text-neutral-400 group-hover:text-white transition">
              <Plus size={18} />
            </div>
          )}
          <div className="absolute -bottom-1 -right-1 bg-indigo-600 group-hover:bg-indigo-500 rounded-full p-1 shadow-md transition">
            <Plus size={12} className="text-white" />
          </div>
        </div>
        <span className="mt-2 text-[11px] text-neutral-400 font-medium group-hover:text-white transition truncate w-16 text-center">Create Story</span>
      </div>

      {/* Stories List */}
      <div className="flex space-x-6 overflow-x-auto no-scrollbar">
        {stories?.map((userStories, index) => (
          <div
            key={userStories?.user?._id}
            onClick={() => handleUserClick(index)}
            className="flex flex-col items-center cursor-pointer shrink-0 group"
          >
            <div className={`p-0.5 rounded-full border-2 transition-all duration-300 ${
              index === currentUserIndex && showStoryModal
                ? "border-indigo-500 scale-105"
                : "border-neutral-800 group-hover:border-neutral-600 group-hover:scale-105"
            }`}>
              <img
                src={userStories?.user?.profileImage || "/default-avatar.png"}
                alt={userStories?.user?.username}
                className="w-14 h-14 rounded-full object-cover border border-black"
              />
            </div>
            <span className="mt-2 text-[11px] text-neutral-400 font-medium group-hover:text-white transition truncate w-16 text-center">
              {userStories?.user?._id === currentUser?._id ? "Your story" : userStories?.user?.username}
            </span>
          </div>
        ))}
      </div>

      {/* Create Story Modal */}
      <Modal open={isCreateStoryModal} onOpenChange={setIsCreateStoryModal} title="Create Story" description="Upload a new story">
        <div className="w-full max-w-2xl">
          <CreateMedia
            onClose={() => setIsCreateStoryModal(false)}
            onUploadSuccess={() => {
              setIsCreateStoryModal(false);
              getAllStories();
            }}
          />
        </div>
      </Modal>

      {/* View Story Modal */}
      <Modal
        open={showStoryModal}
        onOpenChange={setShowStoryModal}
        showCloseButton={false}
        className="max-w-[420px] p-0 border-none bg-transparent shadow-none"
        title="View Story"
        description="Viewing active stories"
      >
        <div className="relative w-full flex flex-col items-center">
          {/* The close button was removed from here per user request */}

          <div className="w-full bg-black rounded-2xl overflow-hidden relative aspect-[9/16] max-h-[85vh] flex flex-col justify-center border border-white/10">
            {/* Progress Indicators */}
            <div className="flex gap-1.5 w-full absolute top-3 left-0 px-4 z-20">
              {currentUserStories.map((_, idx) => {
                let widthVal = "0%";
                if (idx < currentStoryIndex) widthVal = "100%";
                else if (idx === currentStoryIndex) widthVal = `${progress}%`;
                return (
                  <div key={idx} className="h-0.5 bg-white/20 rounded-full flex-1 overflow-hidden">
                    <div className="h-full bg-white transition-all duration-100 ease-linear" style={{ width: widthVal }}></div>
                  </div>
                );
              })}
            </div>

            {/* User Details and Controls Header */}
            <div className="flex items-center justify-between w-full absolute top-6 left-0 px-4 z-20 bg-gradient-to-b from-black/60 to-transparent pb-6">
              <div className="flex items-center gap-2">
                <img
                  src={currentStoryUser?.profileImage || "/default-avatar.png"}
                  className="w-8 h-8 rounded-full border border-white/20 object-cover"
                  alt=""
                />
                <span className="text-white font-semibold text-xs tracking-wide">{currentStoryUser?.username}</span>
              </div>
              <div className="flex items-center gap-4 text-white/80 z-30">
                <button onClick={handlePlayPause} className="hover:text-white transition cursor-pointer">
                  {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                </button>
                {currentStory?.mediaType === "video" && (
                  <button onClick={handleMediaVolume} className="hover:text-white transition cursor-pointer">
                    {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                  </button>
                )}
                <button onClick={() => setShowStoryModal(false)} className="hover:text-white transition cursor-pointer">
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Media Presentation */}
            <div className="flex items-center justify-center h-full pt-12 pb-20 bg-neutral-950">
              {currentStory?.mediaType === "video" ? (
                <video
                  ref={videRef}
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
                  canGoPrevious ? "opacity-0 hover:opacity-100" : "opacity-0 cursor-default"
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
                  canGoNext ? "opacity-0 hover:opacity-100" : "opacity-0 cursor-default"
                }`}
              >
                <div className="bg-black bg-opacity-50 rounded-full p-3 backdrop-blur-sm mr-4">
                  <ArrowRight className="text-white text-xl" />
                </div>
              </button>
            </div>

            {/* Bottom Controls */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 to-transparent pt-10 pb-4 px-4 z-20">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center space-x-6 text-white">
                  {/* Heart/Like Button */}
                  <button onClick={handleLikeStory} className="relative flex flex-col items-center hover:opacity-80 transition cursor-pointer">
                    <Heart size={20} className={currentStory?.likes?.includes(currentUser?._id) ? "fill-red-500 text-red-500" : "text-white"} />
                    {currentStory?.likes?.length > 0 && (
                      <span className="absolute -top-3 -right-2 text-[9px] text-white font-bold bg-red-500 rounded-full min-h-4 h-4 min-w-4 flex items-center justify-center px-1 shadow">
                        {currentStory.likes.length}
                      </span>
                    )}
                  </button>
                  {/* Comment Drawer Trigger */}
                  <button onClick={commentModal} className="relative flex flex-col items-center hover:opacity-80 transition cursor-pointer">
                    <MessageCircle size={20} className="text-white" />
                    {currentStory?.comment?.length > 0 && (
                      <span className="absolute -top-3 -right-2 text-[9px] text-white font-bold bg-indigo-600 rounded-full min-h-4 h-4 min-w-4 flex items-center justify-center px-1 shadow">
                        {currentStory.comment.length}
                      </span>
                    )}
                  </button>
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
                    onClick={() => addCommentToStory(currentStory?._id)}
                    className="absolute right-2 text-neutral-400 hover:text-white transition cursor-pointer p-1"
                  >
                    <Send size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* Comments Drawer Modal */}
            {showCommentsModal && (
              <div
                className="absolute inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-sm"
                onClick={() => setShowCommentsModal(false)}
              >
                <div
                  ref={commentsModalRef}
                  className="bg-neutral-900 border-t border-white/10 rounded-t-3xl w-full max-h-[75%] flex flex-col shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Drawer Header */}
                  <div className="flex items-center justify-between p-4 border-b border-white/10">
                    <h3 className="text-md font-semibold text-gray-200">
                      Comments ({currentStory?.comment?.length || 0})
                    </h3>
                    <button
                      onClick={() => setShowCommentsModal(false)}
                      className="p-1.5 text-neutral-400 hover:text-white hover:bg-white/5 rounded-full transition"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {/* Comments List */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
                    {currentStory?.comment?.length > 0 ? (
                      <div className="flex flex-col gap-4 text-white">
                        {currentStory.comment.map((c, i) => (
                          <div key={c._id || i} className="flex gap-3 items-start">
                            <img
                              src={c.user?.profileImage || "/default-avatar.png"}
                              className="w-8 h-8 rounded-full object-cover border border-white/10"
                              alt=""
                            />
                            <div className="flex-1 flex flex-col bg-white/5 rounded-2xl px-4 py-2 border border-white/5">
                              <span className="text-xs text-neutral-400 font-bold">
                                {c.user?.username || "user"}
                              </span>
                              <span className="text-sm text-neutral-200 mt-1">
                                {c.text}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center text-neutral-500 py-12 text-sm">
                        No replies yet. Start the conversation!
                      </div>
                    )}
                  </div>

                  {/* Inline Comment Input */}
                  <div className="p-4 border-t border-white/10 flex gap-2 bg-neutral-950/40">
                    <input
                      type="text"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Reply..."
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <button
                      onClick={() => addCommentToStory(currentStory?._id)}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white font-semibold text-xs transition"
                    >
                      Send
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Stories;