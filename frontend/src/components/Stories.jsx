import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSelector } from "react-redux";
import { Plus, Play, Pause, Volume2, VolumeX, X, ChevronLeft, ChevronRight } from "lucide-react";
import { axiosInstance } from "../lib/axios";
import Modal from "./Modal";
import CreateMedia from "./CreateMedia";

const Stories = () => {
  const { user: currentUser } = useSelector((state) => state.user);

  // Refs
  const createModalRef = useRef(null);
  const storiesModalRef = useRef(null);
  const videRef = useRef(null);
  const progressIntervalRef = useRef(null);

  // States
  const [stories, setStories] = useState([
    {
      user: {
        _id: "mock1",
        username: "claire_codes",
        profileImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
      },
      stories: [
        {
          _id: "story1",
          mediaType: "image",
          mediaUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
        },
        {
          _id: "story2",
          mediaType: "image",
          mediaUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80",
        }
      ]
    },
    {
      user: {
        _id: "mock2",
        username: "dev_alex",
        profileImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
      },
      stories: [
        {
          _id: "story3",
          mediaType: "image",
          mediaUrl: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80",
        }
      ]
    }
  ]);

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

  // Aliases for misspelled variables from user's template
  const isplaying = isPlaying;
  const setIsPlayingState = setIsPlaying;
  const progess = progress;
  const setProgess = setProgress;

  const currentUserStories = stories[currentUserIndex]?.stories || [];
  const currentStory = currentUserStories[currentStoryIndex];
  const currentStoryUser = stories[currentUserIndex]?.user;

  // Group flat stories by user
  const groupStoriesByUser = (flatStories) => {
    const grouped = {};
    flatStories.forEach((story) => {
      const userId = story.user?._id;
      if (!userId) return;
      if (!grouped[userId]) {
        grouped[userId] = {
          user: story.user,
          stories: [],
        };
      }
      grouped[userId].stories.push(story);
    });
    return Object.values(grouped);
  };

  const getAllStories = async () => {
    try {
      const { data } = await axiosInstance.get("/stories/all");
      if (data.success && data.stories && data.stories.length > 0) {
        setStories(groupStoriesByUser(data.stories));
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

  const handlePlayPause = () => {
    if (currentStory?.mediaType === "video") {
      const video = videRef.current;
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
      const video = videRef.current;
      if (video) {
        video.muted = newMutedState;
      }
    }
  };

  const getCurrentPlayaState = () => {
    if (currentStory?.mediaType === "video") {
      const video = videRef.current;
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

  const isLastStoryOfLastUser =
    currentUserIndex === stories.length - 1 &&
    currentStoryIndex === currentUserStories.length - 1;

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

  // Handle story progress bar timing
  useEffect(() => {
    if (!showStoryModal || !currentStory) return;

    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }

    if (!isPlaying) return;

    const duration = currentStory.mediaType === "video" ? 15000 : 5000;
    const intervalTime = 100;
    const increment = (intervalTime / duration) * 100;

    progressIntervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressIntervalRef.current);
          handleNextStory();
          return 0;
        }
        return prev + increment;
      });
    }, intervalTime);

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [showStoryModal, currentStoryIndex, currentUserIndex, isPlaying, handleNextStory, currentStory]);

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
          <CreateMedia onClose={() => setIsCreateStoryModal(false)} />
        </div>
      </Modal>

      {/* View Story Modal */}
      <Modal open={showStoryModal} onOpenChange={setShowStoryModal} title="View Story" description="Viewing active stories">
        <div className="w-full max-w-2xl bg-black rounded-2xl overflow-hidden relative aspect-[9/16] max-h-[80vh] flex flex-col justify-center border border-white/10">
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
            <div className="flex items-center gap-4 text-white/80">
              <button onClick={handlePlayPause} className="hover:text-white transition">
                {isPlaying ? <Pause size={16} /> : <Play size={16} />}
              </button>
              {currentStory?.mediaType === "video" && (
                <button onClick={handleMediaVolume} className="hover:text-white transition">
                  {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                </button>
              )}
              <button onClick={() => setShowStoryModal(false)} className="hover:text-white transition">
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Media Presentation */}
          <div className="w-full h-full flex items-center justify-center relative bg-neutral-950">
            {currentStory?.mediaType === "video" ? (
              <video
                ref={videRef}
                src={currentStory?.mediaUrl}
                className="w-full h-full object-contain"
                autoPlay
                muted={isMuted}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />
            ) : (
              <img
                src={currentStory?.mediaUrl}
                className="w-full h-full object-contain"
                alt="Story content"
              />
            )}

            {/* Navigation Overlay Buttons */}
            <button
              onClick={handlePreviousStory}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-black/40 hover:bg-black/60 rounded-full text-white/70 hover:text-white transition z-10"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={handleNextStory}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-black/40 hover:bg-black/60 rounded-full text-white/70 hover:text-white transition z-10"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Stories;