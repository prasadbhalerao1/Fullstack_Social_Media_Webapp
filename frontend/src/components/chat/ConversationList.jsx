/**
 * ConversationList — sidebar list of all DM conversations.
 * Shows: avatar, online dot, username, last message preview, unread badge, time.
 */
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { formatDistanceToNowStrict } from "date-fns";
import { useSocket } from "@/context/SocketContext.jsx";
import ProfileImage from "@/components/common/ProfileImage.jsx";
import {
  fetchConversations,
  setActiveConversation,
  clearUnread,
} from "@/redux/slices/messageSlice.js";

const ConversationList = ({ collapsed }) => {
  const dispatch = useDispatch();
  const { isOnline, lastSeenMap } = useSocket();
  const { conversations, activeConversation, conversationsLoading } =
    useSelector((state) => state.messages);
  const { user: currentUser } = useSelector((state) => state.user);

  useEffect(() => {
    dispatch(fetchConversations());
  }, [dispatch]);

  const handleSelect = (conv) => {
    dispatch(setActiveConversation(conv));
    dispatch(clearUnread(conv._id));
  };

  const getLastSeenText = (userId) => {
    const lastSeen = lastSeenMap[userId];
    if (isOnline(userId)) return "Online";
    if (!lastSeen) return "Offline";
    return `last seen ${formatDistanceToNowStrict(new Date(lastSeen), { addSuffix: true })}`;
  };

  const getMessagePreview = (conv) => {
    const msg = conv.lastMessage;
    if (!msg) return "Start a conversation";
    if (msg.deletedFor?.length >= 2) return "🚫 Message deleted";
    const isMine = msg.sender?._id === currentUser?._id || msg.sender === currentUser?._id;
    const prefix = isMine ? "You: " : "";
    if (msg.mediaUrl && !msg.text) return `${prefix}📎 Media`;
    return `${prefix}${msg.text?.slice(0, 40) || ""}`;
  };

  if (conversationsLoading) {
    return (
      <div className="flex-1 flex flex-col gap-2 p-3 overflow-y-auto">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 animate-pulse">
            <div className="w-10 h-10 rounded-full bg-neutral-800 shrink-0" />
            {!collapsed && (
              <div className="flex-1 space-y-1.5">
                <div className="h-3 bg-neutral-800 rounded w-24" />
                <div className="h-2.5 bg-neutral-800 rounded w-36" />
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {conversations.length === 0 ? (
        !collapsed && (
          <div className="text-center text-neutral-500 text-xs px-3 py-8">
            No conversations yet.
            <br />
            Visit someone's profile to start chatting.
          </div>
        )
      ) : (
        conversations.map((conv) => {
          const other = conv.otherUser;
          const isActive = activeConversation?._id === conv._id;
          const online = isOnline(other?._id);

          return (
            <button
              key={conv._id}
              onClick={() => handleSelect(conv)}
              className={`w-full flex items-center gap-3 px-3 py-3 transition-colors text-left ${
                isActive
                  ? "bg-neutral-800"
                  : "hover:bg-neutral-900"
              }`}
            >
              {/* Avatar with online dot */}
              <div className="relative shrink-0">
                <ProfileImage
                  user={other}
                  className="w-10 h-10"
                  showOnlineStatus={false}
                  linkable={false}
                />
                {online && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-black" />
                )}
              </div>

              {/* Text content (hidden when collapsed) */}
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-white truncate">
                      {other?.username}
                    </span>
                    <span className="text-[10px] text-neutral-500 shrink-0">
                      {conv.lastMessage?.createdAt
                        ? formatDistanceToNowStrict(
                            new Date(conv.lastMessage.createdAt),
                            { addSuffix: false }
                          )
                        : ""}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2 mt-0.5">
                    <span className="text-xs text-neutral-500 truncate">
                      {getMessagePreview(conv)}
                    </span>
                    {conv.unreadCount > 0 && (
                      <span className="shrink-0 w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
                        {conv.unreadCount > 99 ? "99+" : conv.unreadCount}
                      </span>
                    )}
                  </div>

                  <span className="text-[10px] text-neutral-600 mt-0.5 block">
                    {getLastSeenText(other?._id)}
                  </span>
                </div>
              )}
            </button>
          );
        })
      )}
    </div>
  );
};

export default ConversationList;
