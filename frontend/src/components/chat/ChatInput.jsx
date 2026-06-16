/**
 * ChatInput — bottom message composer.
 *
 * - Auto-resize textarea (up to ~3 lines then scrolls)
 * - Send on Enter, Shift+Enter for newline
 * - Image/video attachment with preview strip
 * - Typing indicator debounce (stops emitting after 1.5s idle)
 * - Blocked state shows a banner instead of the input
 */
import { useState, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Send, ImagePlus, X, Loader2 } from "lucide-react";
import { useSocket } from "@/context/SocketContext.jsx";
import { addPendingMessage, sendMessageThunk } from "@/redux/slices/messageSlice.js";

const TYPING_DEBOUNCE_MS = 1500;

const ChatInput = ({ conversationId, receiverId, isBlocked }) => {
  const dispatch = useDispatch();
  const { socket } = useSocket();
  const { user: currentUser } = useSelector((state) => state.user);

  const [text, setText] = useState("");
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [sending, setSending] = useState(false);

  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);

  const emitTypingStart = useCallback(() => {
    if (!isTypingRef.current && socket) {
      socket.emit("typing_start", { conversationId, receiverId });
      isTypingRef.current = true;
    }
  }, [socket, conversationId, receiverId]);

  const emitTypingStop = useCallback(() => {
    if (isTypingRef.current && socket) {
      socket.emit("typing_stop", { conversationId, receiverId });
      isTypingRef.current = false;
    }
  }, [socket, conversationId, receiverId]);

  const handleTextChange = (e) => {
    setText(e.target.value);

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }

    emitTypingStart();
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      emitTypingStop();
    }, TYPING_DEBOUNCE_MS);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMediaFile(file);
    setMediaPreview(URL.createObjectURL(file));
    e.target.value = "";
  };

  const clearMedia = () => {
    setMediaFile(null);
    if (mediaPreview) URL.revokeObjectURL(mediaPreview);
    setMediaPreview(null);
  };

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed && !mediaFile) return;
    if (sending) return;

    clearTimeout(typingTimeoutRef.current);
    emitTypingStop();

    const tempId = `temp-${crypto.randomUUID()}`;

    // Show message immediately while we wait for the server
    const optimistic = {
      _id: tempId,
      tempId,
      conversationId,
      sender: {
        _id: currentUser._id,
        username: currentUser.username,
        profileImage: currentUser.profileImage,
      },
      receiver: { _id: receiverId },
      text: trimmed,
      mediaUrl: mediaPreview,
      mediaType: mediaFile
        ? mediaFile.type.startsWith("video")
          ? "video"
          : "image"
        : null,
      status: "pending",
      reactions: [],
      createdAt: new Date().toISOString(),
    };

    dispatch(addPendingMessage(optimistic));
    setText("");
    clearMedia();
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    setSending(true);
    try {
      const formData = new FormData();
      formData.append("conversationId", conversationId);
      formData.append("receiverId", receiverId);
      if (trimmed) formData.append("text", trimmed);
      if (mediaFile) formData.append("media", mediaFile);
      formData.append("tempId", tempId);

      await dispatch(sendMessageThunk(formData, tempId));
    } finally {
      setSending(false);
    }
  };

  if (isBlocked) {
    return (
      <div className="px-4 py-3 bg-neutral-950 border-t border-white/10 text-center text-sm text-neutral-500 select-none">
        🚫 You cannot send messages to this user
      </div>
    );
  }

  return (
    <div className="px-4 py-3 bg-neutral-950 border-t border-white/10">
      {mediaPreview && (
        <div className="relative w-20 h-20 mb-2">
          {mediaFile?.type.startsWith("video") ? (
            <video
              src={mediaPreview}
              className="w-full h-full object-cover rounded-xl border border-white/10"
              muted
              playsInline
            />
          ) : (
            <img
              src={mediaPreview}
              alt="preview"
              className="w-full h-full object-cover rounded-xl border border-white/10"
            />
          )}
          <button
            onClick={clearMedia}
            className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-600 flex items-center justify-center"
          >
            <X size={10} className="text-white" />
          </button>
        </div>
      )}

      <div className="flex items-end gap-2">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-2.5 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition shrink-0"
          title="Attach media"
        >
          <ImagePlus size={20} />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          className="hidden"
          onChange={handleFileChange}
        />

        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          placeholder="Message..."
          rows={1}
          className="flex-1 resize-none bg-neutral-800 border border-white/10 text-white text-sm rounded-2xl px-4 py-2.5 placeholder-neutral-500 focus:outline-none focus:border-white/30 transition overflow-hidden leading-relaxed"
          style={{ minHeight: "40px", maxHeight: "120px" }}
        />

        <button
          onClick={handleSend}
          disabled={(!text.trim() && !mediaFile) || sending}
          className={`p-2.5 rounded-full shrink-0 transition ${
            text.trim() || mediaFile
              ? "bg-blue-600 hover:bg-blue-500 text-white"
              : "bg-neutral-800 text-neutral-600 cursor-not-allowed"
          }`}
          title="Send"
        >
          {sending ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Send size={18} />
          )}
        </button>
      </div>
    </div>
  );
};

export default ChatInput;
