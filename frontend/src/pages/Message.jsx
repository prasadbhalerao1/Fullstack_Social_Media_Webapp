/**
 * Message page — full DM chat layout.
 *
 * Layout:
 *   <Sidebar />  ← app nav
 *   <aside>      ← conversation list (collapsible: w-12 icon-only | w-80 full)
 *   <main>       ← chat window or empty state
 */
import { useState } from "react";
import { useSelector } from "react-redux";
import { MessageSquare, ChevronLeft, ChevronRight } from "lucide-react";
import Sidebar from "@/components/layout/Sidebar.jsx";
import ConversationList from "@/components/chat/ConversationList.jsx";
import ChatWindow from "@/components/chat/ChatWindow.jsx";

const Message = () => {
  const { activeConversation } = useSelector((state) => state.messages);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="bg-black/95 flex text-white min-h-screen">
      {/* App navigation sidebar */}
      <Sidebar />

      {/* Conversations list aside */}
      <aside
        className={`relative flex flex-col border-r border-white/10 bg-neutral-950 transition-all duration-300 shrink-0 ${
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

      {/* Chat window or empty state */}
      <main className="flex-1 flex flex-col overflow-hidden">
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
