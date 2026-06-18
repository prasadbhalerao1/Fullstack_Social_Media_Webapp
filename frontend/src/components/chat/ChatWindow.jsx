// Main chat window containing the message thread, socket event handlers, and typing states.
import { useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ShieldOff, Shield, Loader2 } from "lucide-react";
import { useSocket } from "@/context/SocketContext.jsx";
import {
  fetchMessages,
  addMessage,
  confirmMessage,
  updateMessageStatus,
  bulkUpdateMessageStatus,
  updateMessageDeleted,
  updateMessageEdited,
  updateMessageReactions,
  setTyping,
  updateConversationLastMessage,
  incrementUnread,
  clearUnread,
} from "@/redux/slices/messageSlice.js";
import { axiosInstance } from "@/lib/axios.js";
import ProfileImage from "@/components/common/ProfileImage.jsx";
import MessageBubble from "./MessageBubble.jsx";
import ChatInput from "./ChatInput.jsx";
import TypingIndicator from "./TypingIndicator.jsx";
import useInfiniteScroll from "@/hooks/useInfiniteScroll.js";

const ChatWindow = ({ conversation }) => {
  const dispatch = useDispatch();
  const { socket, isOnline, lastSeenMap } = useSocket();
  const { user: currentUser } = useSelector((state) => state.user);
  const { messages, hasMoreMessages, messagesLoading, typingUsers } =
    useSelector((state) => state.messages);

  const messageRef = useRef(null);
  const listRef = useRef(null);
  const prevScrollHeight = useRef(0);
  const isFirstLoad = useRef(true);

  const otherUser = conversation.otherUser;
  const conversationId = conversation._id;
  const isBlockedBySender = conversation.isBlockedBySender;
  const isBlockedByReceiver = conversation.isBlockedByReceiver;
  const isBlocked = isBlockedBySender || isBlockedByReceiver;

  const isOtherTyping =
    typingUsers?.[conversationId]?.[otherUser?._id] === true;

  // Load messages and join the socket room when conversation changes
  useEffect(() => {
    if (!conversationId) return;
    isFirstLoad.current = true;
    dispatch(fetchMessages(conversationId));

    socket?.emit("join_conversation", { conversationId });

    return () => {
      socket?.emit("leave_conversation", { conversationId });
    };
  }, [conversationId, socket, dispatch]);

  // Mark messages as read when the chat is open
  useEffect(() => {
    if (conversationId && messages.length > 0) {
      socket?.emit("messages_seen", { conversationId });
      dispatch(clearUnread(conversationId));
    }
  }, [conversationId, messages.length, socket, dispatch]);

  // Scroll to bottom on first load, and on new messages if near the bottom
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;

    if (isFirstLoad.current) {
      messageRef.current?.scrollIntoView({ behavior: "instant" });
      isFirstLoad.current = false;
    } else {
      const isNearBottom =
        list.scrollHeight - list.scrollTop - list.clientHeight < 200;
      if (isNearBottom) {
        messageRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [messages.length]);

  // After prepending old messages, restore the scroll position
  useEffect(() => {
    const list = listRef.current;
    if (!list || isFirstLoad.current) return;
    const diff = list.scrollHeight - prevScrollHeight.current;
    if (diff > 0) list.scrollTop = diff;
  }, [messages]);

  const loadOlderMessages = useCallback(() => {
    if (!hasMoreMessages || messagesLoading || messages.length === 0) return;
    prevScrollHeight.current = listRef.current?.scrollHeight || 0;
    const cursor = messages[0]?._id;
    dispatch(fetchMessages(conversationId, cursor));
  }, [hasMoreMessages, messagesLoading, messages, conversationId, dispatch]);

  const topSentinelRef = useInfiniteScroll({
    hasMore: hasMoreMessages,
    onLoadMore: loadOlderMessages,
    loading: messagesLoading,
  });

  // Wire up all socket events for this conversation
  useEffect(() => {
    if (!socket) return;

    const handleReceive = (msg) => {
      if (String(msg.conversationId) !== String(conversationId)) {
        dispatch(incrementUnread(msg.conversationId));
        dispatch(updateConversationLastMessage(msg));
        return;
      }
      dispatch(addMessage(msg));
      dispatch(updateConversationLastMessage(msg));
      socket.emit("messages_seen", { conversationId });
    };

    const handleSentAck = ({ tempId, message }) => {
      dispatch(confirmMessage({ tempId, message }));
      dispatch(updateConversationLastMessage(message));
    };

    const handleStatusUpdate = ({
      messageIds,
      status,
      conversationId: cId,
    }) => {
      if (String(cId) === String(conversationId)) {
        dispatch(updateMessageStatus({ messageIds, status }));
      }
    };

    const handleBulkStatus = ({ updates }) => {
      dispatch(bulkUpdateMessageStatus(updates));
    };

    const handleDeleted = (payload) => {
      dispatch(updateMessageDeleted(payload));
    };

    const handleEdited = (payload) => {
      dispatch(updateMessageEdited(payload));
    };

    const handleReaction = (payload) => {
      dispatch(updateMessageReactions(payload));
    };

    const handleTyping = ({ conversationId: cId, userId, isTyping }) => {
      if (String(cId) === String(conversationId)) {
        dispatch(setTyping({ conversationId: cId, userId, isTyping }));
      }
    };

    socket.on("receive_message", handleReceive);
    socket.on("message_sent_ack", handleSentAck);
    socket.on("message_status_update", handleStatusUpdate);
    socket.on("message_status_bulk_update", handleBulkStatus);
    socket.on("message_deleted", handleDeleted);
    socket.on("message_edited", handleEdited);
    socket.on("message_reaction", handleReaction);
    socket.on("typing_indicator", handleTyping);

    return () => {
      socket.off("receive_message", handleReceive);
      socket.off("message_sent_ack", handleSentAck);
      socket.off("message_status_update", handleStatusUpdate);
      socket.off("message_status_bulk_update", handleBulkStatus);
      socket.off("message_deleted", handleDeleted);
      socket.off("message_edited", handleEdited);
      socket.off("message_reaction", handleReaction);
      socket.off("typing_indicator", handleTyping);
    };
  }, [socket, conversationId, dispatch]);

  const handleToggleBlock = async () => {
    const confirmed = window.confirm(
      isBlockedBySender
        ? `Unblock ${otherUser?.username}?`
        : `Block ${otherUser?.username}? They won't be able to message you.`,
    );
    if (!confirmed) return;
    await axiosInstance.post(`/message/block/${otherUser._id}`);
    window.location.reload();
  };

  const getStatusText = () => {
    if (isOnline(otherUser?._id)) return "Online";
    const lastSeen = lastSeenMap[otherUser?._id] || otherUser?.lastSeen;
    if (!lastSeen) return "Offline";
    const d = new Date(lastSeen);
    const now = new Date();
    const diffMins = Math.floor((now - d) / 60000);
    if (diffMins < 1) return "Last seen just now";
    if (diffMins < 60) return `Last seen ${diffMins}m ago`;
    if (diffMins < 1440) return `Last seen ${Math.floor(diffMins / 60)}h ago`;
    return `Last seen ${d.toLocaleDateString()}`;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-neutral-950 shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <ProfileImage
              user={otherUser}
              className="w-10 h-10"
              showOnlineStatus={false}
              linkable={true}
            />
            {isOnline(otherUser?._id) && (
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-black" />
            )}
          </div>
          <div>
            <div className="text-sm font-semibold text-white">
              {otherUser?.username}
            </div>
            <div className="text-[10px] text-neutral-500">
              {getStatusText()}
            </div>
          </div>
        </div>

        <button
          onClick={handleToggleBlock}
          title={isBlockedBySender ? "Unblock user" : "Block user"}
          className={`p-2 rounded-full transition ${
            isBlockedBySender
              ? "text-red-400 bg-red-900/20 hover:bg-red-900/40"
              : "text-neutral-500 hover:bg-neutral-800 hover:text-white"
          }`}
        >
          {isBlockedBySender ? <ShieldOff size={16} /> : <Shield size={16} />}
        </button>
      </div>

      {isBlocked && (
        <div className="px-4 py-2 bg-red-900/20 border-b border-red-900/30 text-center text-xs text-red-400">
          {isBlockedBySender
            ? "You have blocked this user."
            : "You have been blocked by this user."}
        </div>
      )}

      {/* Messages */}
      <div
        ref={listRef}
        className="flex-1 overflow-y-auto custom-scrollbar px-4 py-4 flex flex-col gap-2"
        style={{ scrollBehavior: "smooth" }}
      >
        {/* Top sentinel triggers loading older messages when scrolled into view */}
        <div ref={topSentinelRef} className="h-1 w-full" />

        {messagesLoading && messages.length > 0 && (
          <div className="flex justify-center py-2">
            <Loader2 size={16} className="animate-spin text-neutral-500" />
          </div>
        )}

        {!messagesLoading && messages.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center text-center text-neutral-500 text-sm py-10">
            <div className="text-4xl mb-3">👋</div>
            <p>
              Say hello to{" "}
              <span className="font-semibold text-white">
                {otherUser?.username}
              </span>
              !
            </p>
          </div>
        )}

        {messagesLoading && messages.length === 0 && (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 size={24} className="animate-spin text-neutral-500" />
          </div>
        )}

        {messages
          .filter((m) => !m.deletedForMe)
          .map((msg) => (
            <MessageBubble
              key={msg._id}
              message={msg}
              isOwn={
                String(msg.sender?._id ?? msg.sender) ===
                String(currentUser?._id)
              }
            />
          ))}

        {isOtherTyping && (
          <div className="self-start">
            <TypingIndicator />
          </div>
        )}

        <div ref={messageRef} />
      </div>

      <ChatInput
        conversationId={conversationId}
        receiverId={otherUser?._id}
        isBlocked={isBlocked}
      />
    </div>
  );
};

export default ChatWindow;
