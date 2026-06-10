import React, { useState } from "react";
import { Upload, Image as ImageIcon, Video as VideoIcon, X } from "lucide-react";
import { axiosInstance } from "../lib/axios";
import { toast } from "react-hot-toast";

const CreateMedia = ({ onClose, onUploadSuccess }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [mediaType, setMediaType] = useState("image");
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setMediaType(file.type.startsWith("video") ? "video" : "image");
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setMediaType(file.type.startsWith("video") ? "video" : "image");
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setPreviewUrl("");
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);

    const formData = new FormData();
    formData.append("media", selectedFile);
    formData.append("mediaType", mediaType);

    try {
      const { data } = await axiosInstance.post("/story/create", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (data.success) {
        toast.success("Story uploaded successfully!");
        if (onUploadSuccess) {
          onUploadSuccess();
        } else if (onClose) {
          onClose();
        }
      }
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error(error.response?.data?.message || "Failed to upload story.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-4 text-center">
      <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
        <h3 className="text-lg font-bold text-white">Create a New Story</h3>
        {onClose && (
          <button onClick={onClose} className="text-neutral-400 hover:text-white transition">
            <X size={18} />
          </button>
        )}
      </div>

      {!previewUrl ? (
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className="w-full h-64 border-2 border-dashed border-neutral-700 hover:border-indigo-500 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all bg-neutral-900/50 hover:bg-neutral-900/80 group relative"
        >
          <input
            type="file"
            accept="image/*,video/*"
            onChange={handleFileChange}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          />
          <div className="p-4 bg-neutral-800 rounded-full text-indigo-400 group-hover:scale-110 transition duration-300 mb-4">
            <Upload size={24} />
          </div>
          <span className="text-sm font-medium text-neutral-300">Click or Drag & Drop file</span>
          <div className="flex items-center gap-3 mt-4 text-xs text-neutral-400">
            <span className="flex items-center gap-1"><ImageIcon size={14} className="text-blue-400" /> Image</span>
            <span className="text-neutral-600">|</span>
            <span className="flex items-center gap-1"><VideoIcon size={14} className="text-emerald-400" /> Video</span>
          </div>
        </div>
      ) : (
        <div className="relative w-full h-64 rounded-2xl overflow-hidden bg-black flex items-center justify-center group border border-white/5">
          {mediaType === "video" ? (
            <video src={previewUrl} className="w-full h-full object-contain" controls />
          ) : (
            <img src={previewUrl} alt="preview" className="w-full h-full object-contain" />
          )}
          <button
            onClick={clearSelection}
            className="absolute top-3 right-3 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full transition"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <button
        disabled={!selectedFile || uploading}
        onClick={handleUpload}
        className="mt-6 w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-neutral-800 disabled:text-neutral-500 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition duration-200 shadow-lg shadow-indigo-600/10"
      >
        {uploading ? "Uploading..." : "Upload Story"}
      </button>
    </div>
  );
};

export default CreateMedia;
