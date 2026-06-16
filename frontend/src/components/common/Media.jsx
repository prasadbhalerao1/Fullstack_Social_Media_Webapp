import { Play, Pause, Volume2, VolumeX } from "lucide-react";

const Media = ({
  item,
  videoRef,
  isPlaying,
  isMuted,
  showPlayIcon,
  handleVideoClick,
  handleMuteToggle,
  toggleMute, // support toggleMute prop
  showIcon = true, // default to true
  containerClassName = "",
  mediaClassName = "w-full h-auto object-contain max-h-[600px]",
}) => {
  if (!item) return null;

  const onMuteToggle = handleMuteToggle || toggleMute;

  return (
    <div className={`relative w-full bg-neutral-950 flex justify-center items-center overflow-hidden ${containerClassName}`}>
      {item.mediaType === "image" ? (
        <img
          src={item.mediaUrl}
          alt={item.caption || "Media content"}
          className={mediaClassName}
          loading="lazy"
        />
      ) : (
        <div className="relative w-full h-full cursor-pointer" onClick={handleVideoClick}>
          <video
            ref={videoRef}
            src={item.mediaUrl}
            className={mediaClassName}
            loop
            playsInline
            muted={isMuted}
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
          {showIcon && (
            <button
              onClick={onMuteToggle}
              className="absolute top-2 right-2 bg-black/60 p-2 rounded-full text-white hover:bg-black/80 transition cursor-pointer z-20"
            >
              {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Media;
