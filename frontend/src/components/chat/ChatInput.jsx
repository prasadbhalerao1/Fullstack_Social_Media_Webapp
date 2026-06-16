// Bottom message composer supporting auto-resize textarea, attachments, typing indicators, and emojis.
import { useState, useRef, useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Send, ImagePlus, X, Loader2, Smile } from "lucide-react";
import { useSocket } from "@/context/SocketContext.jsx";
import {
  addPendingMessage,
  sendMessageThunk,
} from "@/redux/slices/messageSlice.js";

const TYPING_DEBOUNCE_MS = 1500;
const COMMON_EMOJIS = [
  "😀",
  "😂",
  "❤️",
  "👍",
  "🔥",
  "🙌",
  "🎉",
  "😮",
  "😢",
  "😡",
  "✨",
  "🤔",
  "👀",
  "👏",
];

const ChatInput = ({ conversationId, receiverId, isBlocked }) => {
  const dispatch = useDispatch();
  const { socket } = useSocket();
  const { user: currentUser } = useSelector((state) => state.user);

  const [message, setMessage] = useState("");
  const [files, setFiles] = useState([]);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [sending, setSending] = useState(false);

  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const emojiPickerRef = useRef(null);
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
    setMessage(e.target.value);

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
    setFiles([file]);
    setMediaPreview(URL.createObjectURL(file));
    e.target.value = "";
  };

  const clearMedia = () => {
    setFiles([]);
    if (mediaPreview) URL.revokeObjectURL(mediaPreview);
    setMediaPreview(null);
  };

  const handleEmojiClick = (emoji) => {
    setMessage((prev) => prev + emoji.data);
  };

  // Click outside listener to auto-close emoji picker
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(e.target)
      ) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSend = async () => {
    const trimmed = message.trim();
    const hasFile = files.length > 0;
    if (!trimmed && !hasFile) return;
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
      mediaType: hasFile
        ? files[0].type.startsWith("video")
          ? "video"
          : "image"
        : null,
      status: "pending",
      reactions: [],
      createdAt: new Date().toISOString(),
    };

    dispatch(addPendingMessage(optimistic));
    setMessage("");
    clearMedia();
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    setSending(true);
    try {
      const formData = new FormData();
      formData.append("conversationId", conversationId);
      formData.append("receiverId", receiverId);
      if (trimmed) formData.append("text", trimmed);
      if (hasFile) formData.append("media", files[0]);
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
    <div className="px-4 py-3 bg-neutral-950 border-t border-white/10 relative">
      {mediaPreview && (
        <div className="relative w-20 h-20 mb-2">
          {files[0]?.type.startsWith("video") ? (
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
            className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-600 flex items-center justify-center cursor-pointer"
          >
            <X size={10} className="text-white" />
          </button>
        </div>
      )}

      <div className="flex items-end gap-2 relative">
        <div className="flex items-center shrink-0">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition cursor-pointer"
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

          {/* Emoji Picker Trigger */}
          <div ref={emojiPickerRef} className="relative">
            <button
              onClick={() => setShowEmojiPicker((v) => !v)}
              className="p-2.5 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition cursor-pointer"
              title="Add emoji"
            >
              <Smile size={20} />
            </button>

            {showEmojiPicker && (
              <div className="absolute bottom-12 left-0 bg-neutral-900 border border-white/10 rounded-2xl p-3 shadow-2xl z-50 w-64">
                <div className="grid grid-cols-6 gap-2">
                  {COMMON_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => handleEmojiClick({ data: emoji })}
                      className="text-xl p-1 hover:bg-neutral-800 rounded transition cursor-pointer text-center"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <textarea
          ref={textareaRef}
          value={message}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          placeholder="Message..."
          rows={1}
          className="flex-1 resize-none bg-neutral-800 border border-white/10 text-white text-sm rounded-2xl px-4 py-2.5 placeholder-neutral-500 focus:outline-none focus:border-white/30 transition overflow-hidden leading-relaxed"
          style={{ minHeight: "40px", maxHeight: "120px" }}
        />

        <button
          onClick={handleSend}
          disabled={(!message.trim() && files.length === 0) || sending}
          className={`p-2.5 rounded-full shrink-0 transition cursor-pointer ${
            message.trim() || files.length > 0
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
