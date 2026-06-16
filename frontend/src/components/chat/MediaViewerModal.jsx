// Fullscreen modal for viewing images and videos in chat.
import { useEffect } from "react";
import { X, Download } from "lucide-react";

const MediaViewerModal = ({ url, mediaType, onClose }) => {
  // Close on Escape key
  useEffect(() => {
    const handler = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!url) return null;

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Controls */}
      <div className="absolute top-4 right-4 flex gap-3 z-10">
        <a
          href={url}
          download
          target="_blank"
          rel="noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
          title="Download"
        >
          <Download size={18} />
        </a>
        <button
          onClick={onClose}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
        >
          <X size={18} />
        </button>
      </div>

      {/* Media */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-w-[90vw] max-h-[90vh]"
      >
        {mediaType === "video" ? (
          <video
            src={url}
            controls
            autoPlay
            className="max-w-full max-h-[90vh] rounded-xl object-contain"
          />
        ) : (
          <img
            src={url}
            alt="media"
            className="max-w-full max-h-[90vh] rounded-xl object-contain"
          />
        )}
      </div>
    </div>
  );
};

export default MediaViewerModal;
