/**
 * MessageBubble — a single chat message.
 *
 * Features:
 *  - Alignment: right = sent by me, left = received
 *  - WhatsApp tick system: ✓ sent | ✓✓ grey delivered | ✓✓ blue read
 *  - Image/video thumbnail with click-to-fullscreen
 *  - Emoji reactions (grouped by emoji with count)
 *  - Hover actions: react, edit (own only), delete (own only)
 *  - Edit in-place (inline form, Escape to cancel)
 *  - "Deleted for everyone" ghost state
 *  - "Edited" label next to timestamp
 */
import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Check, CheckCheck, Pencil, Trash2, Smile, Play } from "lucide-react";
import { useSocket } from "@/context/SocketContext.jsx";
import { updateMessageDeleted, updateMessageEdited } from "@/redux/slices/messageSlice.js";
import MediaViewerModal from "./MediaViewerModal.jsx";

const REACTION_EMOJIS = ["❤️", "😂", "😮", "😢", "😡", "👍"];

const Ticks = ({ status }) => {
  if (status === "pending") return <Check size={12} className="text-neutral-500" />;
  if (status === "sent") return <Check size={12} className="text-neutral-400" />;
  if (status === "delivered") return <CheckCheck size={12} className="text-neutral-400" />;
  if (status === "read") return <CheckCheck size={12} className="text-blue-400" />;
  return null;
};

const MessageBubble = ({ message, isOwn }) => {
  const dispatch = useDispatch();
  const { socket } = useSocket();
  const { user: currentUser } = useSelector((state) => state.user);

  const [showActions, setShowActions] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editText, setEditText] = useState(message.text);
  const [mediaViewer, setMediaViewer] = useState(false);
  const [showDeleteMenu, setShowDeleteMenu] = useState(false);
  const deleteMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        deleteMenuRef.current &&
        !deleteMenuRef.current.contains(event.target)
      ) {
        setShowDeleteMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleOpenMedia = () => {
    if (message.mediaUrl) {
      setMediaViewer(true);
    }
  };

  const isDeletedForEveryone =
    message.deletedForEveryone ||
    (message.deletedFor?.length >= 2);

  if (message.deletedForMe) return null;

  const handleReact = (emoji) => {
    socket?.emit("react_message", { messageId: message._id, emoji });
    setShowEmojis(false);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editText.trim() || editText === message.text) {
      setEditMode(false);
      return;
    }
    socket?.emit("edit_message", { messageId: message._id, text: editText });
    dispatch(updateMessageEdited({ messageId: message._id, text: editText, editedAt: new Date() }));
    setEditMode(false);
  };

  const handleDelete = (deleteFor) => {
    socket?.emit("delete_message", { messageId: message._id, deleteFor });
    dispatch(updateMessageDeleted({ messageId: message._id, deleteFor }));
    setShowActions(false);
  };

  const time = new Date(message.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      className={`flex flex-col gap-0.5 max-w-[70%] ${isOwn ? "self-end items-end" : "self-start items-start"}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => { setShowActions(false); setShowEmojis(false); }}
    >
      <div className="relative group">
        {/* Action buttons shown on hover */}
        {showActions && !isDeletedForEveryone && (
          <div
            className={`absolute top-1 flex items-center gap-1 z-10 ${
              isOwn ? "-left-28" : "-right-28"
            }`}
          >
            <div className="relative">
              <button
                onClick={() => setShowEmojis((v) => !v)}
                className="p-1.5 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition"
                title="React"
              >
                <Smile size={14} />
              </button>
              {showEmojis && (
                <div className="absolute bottom-8 left-0 flex gap-1 bg-neutral-900 border border-white/10 rounded-full px-2 py-1 shadow-xl z-20">
                  {REACTION_EMOJIS.map((e) => (
                    <button
                      key={e}
                      onClick={() => handleReact(e)}
                      className="text-lg hover:scale-125 transition-transform"
                    >
                      {e}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {isOwn && message.text && (
              <button
                onClick={() => setEditMode(true)}
                className="p-1.5 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition"
                title="Edit"
              >
                <Pencil size={14} />
              </button>
            )}

            {isOwn && (
              <div ref={deleteMenuRef} className="relative">
                <button
                  onClick={() => setShowDeleteMenu((v) => !v)}
                  className="p-1.5 rounded-full bg-neutral-800 hover:bg-red-900/50 text-neutral-400 hover:text-red-400 transition cursor-pointer"
                  title="Delete options"
                >
                  <Trash2 size={14} />
                </button>
                {showDeleteMenu && (
                  <div className="absolute flex flex-col bottom-8 left-0 bg-neutral-900 border border-white/10 rounded-xl shadow-xl overflow-hidden z-20 min-w-[160px]">
                    <button
                      onClick={() => {
                        handleDelete("me");
                        setShowDeleteMenu(false);
                      }}
                      className="px-4 py-2.5 text-sm text-neutral-300 hover:bg-neutral-800 transition text-left cursor-pointer"
                    >
                      Delete for me
                    </button>
                    <button
                      onClick={() => {
                        handleDelete("everyone");
                        setShowDeleteMenu(false);
                      }}
                      className="px-4 py-2.5 text-sm text-red-400 hover:bg-neutral-800 transition text-left cursor-pointer"
                    >
                      Delete for everyone
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div
          className={`px-3 py-2 rounded-2xl text-sm leading-relaxed max-w-sm transition-all ${
            isOwn
              ? "bg-blue-600 text-white rounded-br-none"
              : "bg-neutral-800 text-neutral-100 rounded-bl-none"
          } ${isDeletedForEveryone ? "opacity-50 italic" : ""}`}
        >
          {isDeletedForEveryone ? (
            <span className="text-neutral-400 text-xs">
              🚫 This message was deleted
            </span>
          ) : editMode ? (
            <form onSubmit={handleEditSubmit} className="flex gap-2">
              <input
                autoFocus
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="bg-transparent border-b border-white/30 outline-none text-sm flex-1 min-w-0"
                onKeyDown={(e) => e.key === "Escape" && setEditMode(false)}
              />
              <button type="submit" className="text-xs text-green-400 font-semibold shrink-0">
                Save
              </button>
            </form>
          ) : (
            <>
              {message.mediaUrl && (
                <div
                  className="mb-1.5 rounded-xl overflow-hidden cursor-pointer relative"
                  onClick={handleOpenMedia}
                >
                  {message.mediaType === "video" ? (
                    <div className="relative">
                      <video
                        src={message.mediaUrl}
                        className="w-48 h-48 object-cover rounded-xl"
                        muted
                        playsInline
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-xl">
                        <Play size={28} className="fill-white text-white" />
                      </div>
                    </div>
                  ) : (
                    <img
                      src={message.mediaUrl}
                      alt="media"
                      className="w-48 h-48 object-cover rounded-xl"
                      loading="lazy"
                    />
                  )}
                </div>
              )}

              {message.text && (
                <p className="break-words whitespace-pre-wrap">{message.text}</p>
              )}
            </>
          )}
        </div>

        <div className={`flex items-center gap-1 mt-0.5 ${isOwn ? "justify-end" : "justify-start"}`}>
          {message.isEdited && (
            <span className="text-[10px] text-neutral-500 italic">edited</span>
          )}
          <span className="text-[10px] text-neutral-500">{time}</span>
          {isOwn && <Ticks status={message.status || "sent"} />}
        </div>
      </div>

      {/* Reactions grouped by emoji */}
      {message.reactions?.length > 0 && (
        <div className={`flex flex-wrap gap-0.5 mt-0.5 ${isOwn ? "justify-end" : "justify-start"}`}>
          {Object.entries(
            message.reactions.reduce((acc, r) => {
              acc[r.emoji] = (acc[r.emoji] || 0) + 1;
              return acc;
            }, {})
          ).map(([emoji, count]) => (
            <button
              key={emoji}
              onClick={() => handleReact(emoji)}
              className="flex items-center gap-0.5 bg-neutral-800 border border-white/10 rounded-full px-1.5 py-0.5 text-xs hover:bg-neutral-700 transition"
            >
              {emoji} {count > 1 && <span className="text-neutral-400 text-[10px]">{count}</span>}
            </button>
          ))}
        </div>
      )}

      {mediaViewer && (
        <MediaViewerModal
          url={message.mediaUrl}
          mediaType={message.mediaType}
          onClose={() => setMediaViewer(false)}
        />
      )}
    </div>
  );
};

export default MessageBubble;
