import { useEffect, useState, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Plus, Loader2, Heart, MessageCircle, VolumeX, Volume2, Play, Pause } from "lucide-react";
import Sidebar from "@/components/layout/Sidebar.jsx";
import ProfileImage from "@/components/common/ProfileImage.jsx";
import FollowButton from "@/components/common/FollowButton.jsx";
import Modal from "@/components/common/Modal.jsx";
import CreateMedia from "@/components/media/CreateMedia.jsx";
import VideoModal from "@/components/common/VideoModal.jsx";
import { getAllReels, toggleLikeReel, setIsMutedGlobal } from "@/redux/slices/reelsSlice.js";
import useInfiniteScroll from "@/hooks/useInfiniteScroll.js";

const Reels = () => {
  const dispatch = useDispatch();
  const { user: currentUser } = useSelector((state) => state.user);
  const { reels, loading, isMutedGlobal, hasMore, nextCursor } = useSelector((state) => state.reels);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [activeReelIndex, setActiveReelIndex] = useState(null);

  useEffect(() => {
    dispatch(getAllReels());
  }, [dispatch]);

  const loadMoreReels = useCallback(() => {
    if (!loading && hasMore && nextCursor) {
      dispatch(getAllReels(nextCursor));
    }
  }, [dispatch, loading, hasMore, nextCursor]);

  const bottomSentinelRef = useInfiniteScroll({
    hasMore,
    onLoadMore: loadMoreReels,
    loading,
  });

  const handleMuteToggle = (e) => {
    e.stopPropagation();
    dispatch(setIsMutedGlobal(!isMutedGlobal));
  };

  return (
    <div className="bg-black/95 flex text-white min-h-screen">
      <Sidebar />
      <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-8 flex flex-col gap-6 items-center overflow-y-auto no-scrollbar font-sans select-none h-screen">
        
        {/* Header */}
        <div className="w-full max-w-md flex justify-between items-center border-b border-white/10 pb-4">
          <h1 className="text-xl font-bold tracking-wide">Reels</h1>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-neutral-200 text-black rounded-full text-xs font-bold transition shadow-lg shadow-white/5 cursor-pointer"
          >
            <Plus size={14} />
            <span>Create Reel</span>
          </button>
        </div>

        {/* Loading State */}
        {loading && reels.length === 0 ? (
          <div className="flex-1 flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-neutral-400 w-10 h-10" />
          </div>
        ) : reels.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20 text-neutral-500 text-sm gap-2">
            <p>No reels shared yet.</p>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="text-blue-500 hover:underline font-semibold text-xs"
            >
              Be the first to share a Reel
            </button>
          </div>
        ) : (
          /* Vertical Stack of Reel Cards */
          <div className="w-full flex flex-col gap-8 items-center pb-24">
            {reels.map((reel, index) => (
              <ReelCard
                key={reel._id}
                reel={reel}
                index={index}
                currentUser={currentUser}
                isMutedGlobal={isMutedGlobal}
                onMuteToggle={handleMuteToggle}
                onCommentClick={() => setActiveReelIndex(index)}
                onLikeToggle={() => dispatch(toggleLikeReel(reel._id))}
              />
            ))}
            {/* Infinite scroll sentinel */}
            <div ref={bottomSentinelRef} className="h-4 w-full" />
            {loading && reels.length > 0 && (
              <div className="py-4 flex justify-center">
                <Loader2 size={20} className="animate-spin text-neutral-500" />
              </div>
            )}
            {!hasMore && reels.length > 0 && (
              <div className="py-6 text-center text-neutral-600 text-xs">
                You've seen all the reels ✓
              </div>
            )}
          </div>
        )}
      </main>

      {/* Create Reel Modal */}
      <Modal
        openModal={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        initialWidth="max-w-2xl"
        initialHeight="h-auto"
      >
        <div className="w-full max-w-2xl">
          <CreateMedia
            type="reel"
            onClose={() => setIsCreateOpen(false)}
            onUploadSuccess={() => {
              setIsCreateOpen(false);
              dispatch(getAllReels());
            }}
          />
        </div>
      </Modal>

      {/* Video Navigation Modal */}
      {activeReelIndex !== null && (
        <VideoModal
          isOpen={activeReelIndex !== null}
          onClose={() => setActiveReelIndex(null)}
          reels={reels}
          initialIndex={activeReelIndex}
          currentUser={currentUser}
        />
      )}
    </div>
  );
};

/* Internal Reel Card Component to manage individual card playing states & IntersectionObserver */
const ReelCard = ({
  reel,
  index,
  currentUser,
  isMutedGlobal,
  onMuteToggle,
  onCommentClick,
  onLikeToggle,
}) => {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPlayIcon, setShowPlayIcon] = useState(false);

  // Play when card enters center of the screen, pause when it leaves
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsPlaying(true);
            videoRef.current?.play().catch((err) => console.log(err));
          } else {
            setIsPlaying(false);
            videoRef.current?.pause();
          }
        });
      },
      {
        threshold: 0.6, // must be 60% visible to autoplay
      }
    );

    const currentContainer = containerRef.current;
    if (currentContainer) {
      observer.observe(currentContainer);
    }

    return () => {
      if (currentContainer) {
        observer.unobserve(currentContainer);
      }
    };
  }, []);

  // Update volume state when global mute status changes
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMutedGlobal;
    }
  }, [isMutedGlobal]);

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

  const isLiked = reel.likes?.includes(currentUser?._id);

  return (
    <div
      ref={containerRef}
      className="w-full max-w-[360px] md:max-w-[380px] aspect-[9/16] relative bg-neutral-950 rounded-3xl overflow-hidden flex flex-col justify-center shadow-2xl border border-white/5 group"
    >
      <video
        ref={videoRef}
        src={reel.mediaUrl}
        className="w-full h-full object-cover cursor-pointer"
        loop
        playsInline
        muted={isMutedGlobal}
        onClick={handleVideoClick}
      />

      {/* Play/Pause overlay indicator */}
      {showPlayIcon && (
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none transition-opacity duration-300">
          <div className="bg-black/55 p-3 rounded-full text-white animate-pulse">
            {isPlaying ? <Play size={28} className="fill-white" /> : <Pause size={28} className="fill-white" />}
          </div>
        </div>
      )}

      {/* Top overlay details (Owner & Follow) */}
      <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-center bg-linear-to-b from-black/50 to-transparent pb-6 rounded-t-3xl pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          <ProfileImage user={reel.user} className="w-8 h-8" showOnlineStatus={false} />
          <Link
            to={`/profile/${reel.user?._id}`}
            className="font-bold text-xs text-white hover:underline tracking-wide shadow-sm"
          >
            {reel.user?.username}
          </Link>
          <FollowButton targetId={reel.user?._id} currentUser={currentUser} />
        </div>

        {/* Mute toggle button */}
        <button
          onClick={onMuteToggle}
          className="bg-black/60 hover:bg-black/85 text-white rounded-full p-2 border border-white/5 transition hover:scale-105 active:scale-95 cursor-pointer pointer-events-auto"
        >
          {isMutedGlobal ? <VolumeX size={15} /> : <Volume2 size={15} />}
        </button>
      </div>

      {/* Bottom overlay details (Caption) */}
      {reel.caption && (
        <div className="absolute bottom-4 left-4 right-14 z-20 bg-linear-to-t from-black/60 to-transparent pt-6 rounded-b-3xl pointer-events-none">
          <p className="text-white text-xs font-semibold drop-shadow-md whitespace-pre-wrap leading-relaxed">
            {reel.caption}
          </p>
        </div>
      )}

      {/* Right side floating controls */}
      <div className="absolute right-3 bottom-6 z-20 flex flex-col gap-5 items-center bg-black/30 backdrop-blur-xs py-3 px-2 rounded-full border border-white/5">
        
        {/* Like */}
        <button
          onClick={onLikeToggle}
          className="flex flex-col items-center gap-1 group/btn cursor-pointer"
        >
          <div className="bg-black/50 hover:bg-black/80 rounded-full p-2.5 transition group-hover/btn:scale-105 border border-white/5">
            <Heart
              size={18}
              className={isLiked ? "fill-red-500 text-red-500" : "text-white"}
              strokeWidth={2.5}
            />
          </div>
          <span className="text-[10px] font-bold text-white shadow-sm">
            {reel.likes?.length || 0}
          </span>
        </button>

        {/* Comment */}
        <button
          onClick={onCommentClick}
          className="flex flex-col items-center gap-1 group/btn cursor-pointer"
        >
          <div className="bg-black/50 hover:bg-black/80 rounded-full p-2.5 transition group-hover/btn:scale-105 border border-white/5">
            <MessageCircle size={18} className="text-white" strokeWidth={2.5} />
          </div>
          <span className="text-[10px] font-bold text-white shadow-sm">
            {reel.comment?.length || 0}
          </span>
        </button>
      </div>
    </div>
  );
};

export default Reels;
