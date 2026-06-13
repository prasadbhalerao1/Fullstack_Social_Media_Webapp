import { useState, useRef, useEffect } from "react";
import {
  Upload,
  Image as ImageIcon,
  Video as VideoIcon,
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
  AlertCircle,
} from "lucide-react";
import { axiosInstance } from "../lib/axios";
import { toast } from "react-hot-toast";

const CreateMedia = ({ type = "post", onClose, onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState("");
  const [currentType, setCurrentType] = useState(type);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [isDraging, setIsDraging] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => {
    setFile(null);
    setCaption("");
    setPreviewUrl(null);
    setProgress(0);
    setError(null);
    setIsPlaying(false);
    setIsMuted(false);
    setCurrentType(type);
  }, [type]);

  const handleFileSelect = (selectedFile) => {
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setError(null);
    }
  };

  const handleFileChange = (e) => handleFileSelect(e.target.files[0]);
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDraging(true);
  };
  const handleDragLeave = () => setIsDraging(false);
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDraging(false);
    handleFileSelect(e.dataTransfer.files[0]);
  };
  const handleClickDropArea = () => fileInputRef.current?.click();

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return setError("Please select a file.");
    setUploading(true);
    setError(null);
    setProgress(0);
    try {
      const formData = new FormData();
      formData.append("media", file);
      if (currentType !== "story") formData.append("caption", caption);
      formData.append(
        "mediaType",
        file.type.startsWith("video/") ? "video" : "image"
      );

      const apiEndpoint =
        currentType === "story"
          ? "/story/create"
          : currentType === "post"
          ? "/post/create"
          : "/reel/create";

      const { data } = await axiosInstance.post(apiEndpoint, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          const loaded = progressEvent.loaded;
          const total = progressEvent.total || 1;
          setProgress(Math.round((loaded * 100) / total));
        },
      });

      if (data.success) {
        toast.success(
          `${
            currentType.charAt(0).toUpperCase() + currentType.slice(1)
          } uploaded successfully!`
        );
        if (onUploadSuccess) {
          onUploadSuccess();
        } else if (onClose) {
          onClose();
        }
      }
    } catch (err) {
      console.error("Upload failed:", err);
      const errMsg = err.response?.data?.message || `Failed to upload ${currentType}.`;
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setUploading(false);
    }
  };

  const clearSelection = () => {
    setFile(null);
    setPreviewUrl(null);
    setIsPlaying(false);
    setIsMuted(false);
  };

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      video.play().catch((err) => console.log(err));
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  return (
    <div className="p-4 text-center font-sans">
      <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
        <h3 className="text-lg font-bold text-white tracking-wide">
          Create a New {currentType.charAt(0).toUpperCase() + currentType.slice(1)}
        </h3>
        {onClose && (
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white transition cursor-pointer"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Media Type Switcher */}
      <div className="flex justify-center gap-2 mb-6">
        {["post", "reel", "story"].map((t) => (
          <button
            key={t}
            type="button"
            disabled={uploading}
            onClick={() => setCurrentType(t)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide capitalize transition duration-300 cursor-pointer ${
              currentType === t
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "bg-neutral-800 text-neutral-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-400 text-xs text-left">
          <AlertCircle size={14} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* File Dropzone Area */}
      {!previewUrl ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClickDropArea}
          className={`w-full h-72 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 bg-neutral-900/50 hover:bg-neutral-900/80 group relative ${
            isDraging ? "border-indigo-500 bg-indigo-500/5" : "border-neutral-700 hover:border-indigo-500"
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            accept={currentType === "reel" ? "video/*" : "image/*,video/*"}
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="p-4 bg-neutral-800 rounded-full text-indigo-400 group-hover:scale-110 transition duration-300 mb-4">
            <Upload size={24} />
          </div>
          <span className="text-sm font-medium text-neutral-300">
            {isDraging ? "Drop to upload" : "Click or Drag & Drop file"}
          </span>
          <div className="flex items-center gap-3 mt-4 text-xs text-neutral-400">
            {currentType !== "reel" && (
              <span className="flex items-center gap-1">
                <ImageIcon size={14} className="text-blue-400" /> Image
              </span>
            )}
            {currentType !== "reel" && <span className="text-neutral-600">|</span>}
            <span className="flex items-center gap-1">
              <VideoIcon size={14} className="text-emerald-400" /> Video
            </span>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {/* File Preview */}
          <div className="relative w-full h-72 rounded-2xl overflow-hidden bg-black flex items-center justify-center group border border-white/5 shadow-inner">
            {file?.type.startsWith("video/") ? (
              <div className="relative w-full h-full flex items-center justify-center">
                <video
                  ref={videoRef}
                  src={previewUrl}
                  className="w-full h-full object-contain"
                  playsInline
                  onClick={togglePlay}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />
                {/* Custom Overlay Controls */}
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-6">
                  <button
                    type="button"
                    onClick={togglePlay}
                    className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-all transform hover:scale-105 cursor-pointer"
                  >
                    {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                  </button>
                  <button
                    type="button"
                    onClick={toggleMute}
                    className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-all transform hover:scale-105 cursor-pointer"
                  >
                    {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                  </button>
                </div>
              </div>
            ) : (
              <img
                src={previewUrl}
                alt="preview"
                className="w-full h-full object-contain"
              />
            )}
            <button
              onClick={clearSelection}
              disabled={uploading}
              className="absolute top-3 right-3 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full transition cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          {/* Caption Input for post/reel */}
          {currentType !== "story" && (
            <div className="text-left">
              <label className="text-xs font-semibold text-neutral-400 mb-1.5 block">
                Caption
              </label>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Write a caption..."
                maxLength={500}
                rows={3}
                disabled={uploading}
                className="w-full bg-neutral-900 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/50 focus:border-indigo-600 transition placeholder-neutral-500 resize-none"
              />
              <div className="text-right text-[10px] text-neutral-500 mt-1">
                {caption.length}/500
              </div>
            </div>
          )}
        </div>
      )}

      {/* Progress Bar */}
      {uploading && (
        <div className="mt-4">
          <div className="flex justify-between items-center mb-1 text-xs text-neutral-400">
            <span>Uploading...</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-neutral-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-indigo-600 h-full transition-all duration-100 ease-linear animate-pulse"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <button
        disabled={!file || uploading}
        onClick={handleUpload}
        className="mt-6 w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-neutral-800 disabled:text-neutral-500 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition duration-200 shadow-lg shadow-indigo-600/10 cursor-pointer"
      >
        {uploading
          ? `Uploading ${currentType}...`
          : `Share ${currentType.charAt(0).toUpperCase() + currentType.slice(1)}`}
      </button>
    </div>
  );
};

export default CreateMedia;
