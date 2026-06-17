// Message page layout with sidebar, conversation list, and main chat window.
// On mobile: shows ConversationList full-screen, then ChatWindow full-screen with back button.
// On desktop: standard three-panel layout unchanged.
import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { MessageSquare, ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";
import Sidebar from "@/components/layout/Sidebar.jsx";
import ConversationList from "@/components/chat/ConversationList.jsx";
import ChatWindow from "@/components/chat/ChatWindow.jsx";
import { setActiveConversation } from "@/redux/slices/messageSlice.js";

const Message = () => {
  const dispatch = useDispatch();
  const { activeConversation } = useSelector((state) => state.messages);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // On mobile, track whether user has navigated into a chat
  const handleBackToList = () => {
    dispatch(setActiveConversation(null));
  };

  return (
    <div className="bg-black/95 flex text-white h-[100dvh] overflow-hidden">
      {/* App navigation sidebar — desktop only */}
      <Sidebar />

      {/* ===== MOBILE LAYOUT ===== */}
      {/* On mobile: if no active conversation, show full-screen conversation list */}
      {/* On mobile: if active conversation, show full-screen chat window */}

      {/* Mobile: Conversation List view (shown when no active conversation) */}
      <div
        className={`md:hidden flex-1 flex flex-col bg-neutral-950 ${
          activeConversation ? "hidden" : "flex"
        }`}
      >
        <div className="flex items-center px-4 py-4 border-b border-white/10 shrink-0">
          <h2 className="text-base font-bold text-white">Messages</h2>
        </div>
        <ConversationList collapsed={false} />
        {/* Mobile bottom nav clearance */}
        <div className="h-20 shrink-0" />
      </div>

      {/* Mobile: Chat view (shown when conversation is active) */}
      {activeConversation && (
        <div className="md:hidden flex-1 flex flex-col overflow-hidden">
          {/* Back button injected at the top — ChatWindow gets the conversation */}
          <div className="flex items-center gap-2 px-3 py-2.5 border-b border-white/10 bg-neutral-950 shrink-0 md:hidden">
            <button
              onClick={handleBackToList}
              className="p-1.5 rounded-full hover:bg-neutral-800 text-white transition cursor-pointer"
              aria-label="Back to messages"
            >
              <ArrowLeft size={18} />
            </button>
          </div>
          <div className="flex-1 overflow-hidden">
            <ChatWindow conversation={activeConversation} />
          </div>
        </div>
      )}

      {/* ===== DESKTOP LAYOUT ===== */}
      {/* Conversations list aside */}
      <aside
        className={`hidden md:flex relative flex-col border-r border-white/10 bg-neutral-950 transition-all duration-300 shrink-0 ${
          sidebarCollapsed ? "w-14" : "w-72"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-4 border-b border-white/10 shrink-0">
          {!sidebarCollapsed && (
            <h2 className="text-base font-bold text-white pl-1">Messages</h2>
          )}
          <button
            onClick={() => setSidebarCollapsed((v) => !v)}
            className="p-1.5 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-white transition ml-auto"
            title={sidebarCollapsed ? "Expand" : "Collapse"}
          >
            {sidebarCollapsed ? (
              <ChevronRight size={16} />
            ) : (
              <ChevronLeft size={16} />
            )}
          </button>
        </div>

        {/* Conversation items */}
        <ConversationList collapsed={sidebarCollapsed} />
      </aside>

      {/* Desktop: Chat window or empty state */}
      <main className="hidden md:flex flex-1 flex-col overflow-hidden">
        {activeConversation ? (
          <ChatWindow conversation={activeConversation} />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center select-none">
            <div className="w-20 h-20 rounded-full bg-neutral-900 flex items-center justify-center border border-white/10">
              <MessageSquare size={36} className="text-neutral-600" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-lg mb-1">
                Your Messages
              </h3>
              <p className="text-neutral-500 text-sm max-w-xs">
                Send private messages to a friend. Select a conversation or
                visit someone's profile to start chatting.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Message;
