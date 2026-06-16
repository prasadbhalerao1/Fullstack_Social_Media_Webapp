import { useState, useRef, useEffect } from "react";
import { useDispatch } from "react-redux";
import {
  Upload,
  Image as ImageIcon,
  Video as VideoIcon,
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
} from "lucide-react";
import { axiosInstance } from "@/lib/axios.js";
import { toast } from "react-hot-toast";
import { getAllStories } from "@/redux/slices/storiesSlice.js";
import { getAllPosts } from "@/redux/slices/postSlice.js";
import { getAllReels } from "@/redux/slices/reelsSlice.js";

const CreateMedia = ({ type = "post", onClose, onUploadSuccess }) => {
  const dispatch = useDispatch();

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
        file.type.startsWith("video/") ? "video" : "image",
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

      if (data?.success) {
        if (currentType === "story") dispatch(getAllStories());
        else if (currentType === "post") dispatch(getAllPosts());
        else if (currentType === "reel") dispatch(getAllReels());
        setFile(null);
        setCaption("");
        setPreviewUrl(null);
        setProgress(0);
        setError(null);
        setIsPlaying(false);
        setIsMuted(false);
        if (fileInputRef.current) fileInputRef.current.value = "";

        if (onUploadSuccess) {
          onUploadSuccess();
        } else if (onClose) {
          onClose();
        }
      } else {
        setError(data?.message || "Upload failed");
      }
    } catch (err) {
      console.error("Upload failed:", err);
      setError(err.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const clearSelection = () => {
    setFile(null);
    setPreviewUrl(null);
    setIsPlaying(false);
    setIsMuted(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const titleMap = {
    story: "Create a New Story",
    post: "Create a New Post",
    reel: "Create a New Reel",
  };

  const buttonMap = {
    story: "Upload Story",
    post: "Upload Post",
    reel: "Upload Reel",
  };

  return (
    <div className="flex w-full flex-col items-center gap-6 p-6 font-sans text-white bg-neutral-950/80 rounded-2xl border border-white/5">
      <div className="flex flex-col items-center gap-4 w-full">
        <h2 className="text-xl font-bold tracking-wide">
          {titleMap[currentType]}
        </h2>
        {type !== "story" && (
          <div className="flex gap-3 w-full max-w-sm">
            <button
              type="button"
              onClick={() => setCurrentType("post")}
              className={`flex-1 py-2 rounded-xl text-xs font-semibold tracking-wide transition cursor-pointer ${
                currentType === "post"
                  ? "bg-white text-black shadow-md shadow-white/20"
                  : "bg-neutral-800 text-neutral-400 hover:text-white"
              }`}
            >
              Post
            </button>
            <button
              type="button"
              onClick={() => setCurrentType("reel")}
              className={`flex-1 py-2 rounded-xl text-xs font-semibold tracking-wide transition cursor-pointer ${
                currentType === "reel"
                  ? "bg-white text-black shadow-md shadow-white/20"
                  : "bg-neutral-800 text-neutral-400 hover:text-white"
              }`}
            >
              Reel
            </button>
          </div>
        )}
      </div>

      <form
        onSubmit={handleUpload}
        className="space-y-5 w-full flex flex-col items-center"
      >
        {/* Drag Over Area */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={!previewUrl ? handleClickDropArea : undefined}
          className={`w-full h-56 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer relative overflow-hidden transition-all duration-300 ${
            isDraging
              ? "border-white bg-white/5"
              : "border-neutral-700 hover:border-white bg-neutral-900/30"
          }`}
        >
          {!previewUrl ? (
            <div className="flex flex-col items-center text-neutral-400 space-y-3 p-4 pointer-events-none">
              <div className="p-3 bg-neutral-800 rounded-full text-white group-hover:scale-110 transition duration-300">
                <Upload size={24} />
              </div>
              <p className="text-sm font-medium">
                {isDraging
                  ? "Drop your file here..."
                  : "Click or Drag & Drop file"}
              </p>

              {/* Image & Video side-by-side indicator */}
              <div className="flex items-center gap-6 text-[11px] font-semibold tracking-wide text-neutral-500 pt-2">
                <div className="flex items-center gap-1.5">
                  <ImageIcon size={14} className="text-blue-400" />
                  <span>IMAGE</span>
                </div>
                <span className="text-neutral-700">|</span>
                <div className="flex items-center gap-1.5">
                  <VideoIcon size={14} className="text-emerald-400" />
                  <span>VIDEO</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="relative w-full h-full flex items-center justify-center bg-black/40">
              {file?.type.startsWith("video/") ? (
                <div className="relative w-full h-full flex items-center justify-center">
                  <video
                    ref={videoRef}
                    src={previewUrl}
                    className="w-full h-full object-contain rounded-xl"
                    playsInline
                    onClick={(e) => {
                      e.stopPropagation();
                      const video = videoRef.current;
                      if (!video) return;
                      if (isPlaying) {
                        video.pause();
                        setIsPlaying(false);
                      } else {
                        video.play().catch((err) => console.log(err));
                        setIsPlaying(true);
                      }
                    }}
                  />
                  {/* Custom controls overlay */}
                  <div className="absolute bottom-3 left-3 flex gap-2 bg-black/60 backdrop-blur-md p-1.5 rounded-lg border border-white/5 z-20">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        const video = videoRef.current;
                        if (!video) return;
                        if (isPlaying) {
                          video.pause();
                          setIsPlaying(false);
                        } else {
                          video.play().catch((err) => console.log(err));
                          setIsPlaying(true);
                        }
                      }}
                      className="text-white hover:scale-105 transition cursor-pointer p-1"
                    >
                      {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        const video = videoRef.current;
                        if (!video) return;
                        video.muted = !video.muted;
                        setIsMuted(video.muted);
                      }}
                      className="text-white hover:scale-105 transition cursor-pointer p-1"
                    >
                      {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                    </button>
                  </div>
                </div>
              ) : (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-full object-contain rounded-xl"
                />
              )}
              {/* Clear button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  clearSelection();
                }}
                className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-lg shadow-red-500/25 transition cursor-pointer z-30"
              >
                <X size={14} />
              </button>
            </div>
          )}
        </div>

        {/* File selector input */}
        <input
          type="file"
          accept="image/*,video/*"
          onChange={handleFileChange}
          ref={fileInputRef}
          className="hidden"
        />

        {/* Caption for post & reel */}
        {currentType !== "story" && (
          <div className="w-full text-left">
            <label className="text-xs font-semibold text-neutral-400 mb-1.5 block">
              Caption
            </label>
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Add a caption..."
              disabled={uploading}
              className="w-full px-4 py-2.5 rounded-xl bg-neutral-900 border border-white/10 outline-none text-white text-sm focus:border-white focus:ring-1 focus:ring-white transition placeholder-neutral-500"
            />
          </div>
        )}

        {/* Progress Bar */}
        {uploading && (
          <div className="w-full mt-2">
            <div className="flex justify-between items-center mb-1 text-xs text-neutral-400">
              <span>Uploading...</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-neutral-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-white h-full transition-all duration-200 ease-linear animate-pulse"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {error && <p className="text-red-500 text-xs text-center">{error}</p>}

        {/* Submit button */}
        <button
          type="submit"
          disabled={uploading || !file}
          className="w-full py-3 rounded-full bg-white hover:bg-neutral-200 text-black font-semibold shadow-lg shadow-white/10 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-sm"
        >
          {uploading ? "Uploading..." : buttonMap[currentType]}
        </button>
      </form>
    </div>
  );
};

export default CreateMedia;
