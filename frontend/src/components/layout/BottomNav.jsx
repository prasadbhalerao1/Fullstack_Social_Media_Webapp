import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { Home, Search, Film, MessageCircle, User, Plus, Bell } from "lucide-react";
import { useSocket } from "@/context/SocketContext.jsx";
import Modal from "@/components/common/Modal.jsx";
import CreateMedia from "@/components/media/CreateMedia.jsx";

const BottomNav = () => {
  const { conversations, activeConversation } = useSelector((state) => state.messages);
  const { unreadCount, setIsNotificationsOpen } = useSocket();
  const location = useLocation();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Hide bottom nav on mobile if inside an active chat thread
  if (location.pathname.startsWith("/chats") && activeConversation) {
    return null;
  }

  const totalUnread = conversations.reduce(
    (sum, c) => sum + (c.unreadCount || 0),
    0,
  );

  const navItems = [
    { id: "home", icon: <Home size={22} />, path: "/" },
    { id: "explore", icon: <Search size={22} />, path: "/explore" },
    { id: "reels", icon: <Film size={22} />, path: "/reels" },
    {
      id: "notifications",
      icon: <Bell size={22} />,
      badge: unreadCount,
      onClick: () => setIsNotificationsOpen(true),
    },
    {
      id: "messages",
      icon: <MessageCircle size={22} />,
      path: "/chats",
      badge: totalUnread,
    },
    {
      id: "profile",
      icon: <User size={22} />,
      path: "/profile/me",
    },
  ];

  const isActive = (item) => {
    if (!item.path) return false;
    if (item.path === "/") return location.pathname === "/";
    return location.pathname.startsWith(item.path);
  };

  return (
    <>
      {/* Bottom Navigation Bar — mobile only */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-black/95 backdrop-blur-xl border-t border-white/10 flex items-center justify-around px-2 pb-safe">
        {navItems.map((item) => {
          const active = isActive(item);
          const content = (
            <>
              {/* Active indicator dot */}
              {active && (
                <span className="absolute top-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white" />
              )}

              {/* Icon */}
              <div className="relative">
                {item.icon}
                {item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-4 h-4 px-0.5 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center leading-none">
                    {item.badge > 99 ? "99+" : item.badge}
                  </span>
                )}
              </div>
            </>
          );

          if (item.onClick) {
            return (
              <button
                key={item.id}
                onClick={item.onClick}
                className={`relative flex flex-col items-center justify-center p-3 rounded-2xl transition-all duration-200 min-w-[48px] cursor-pointer ${
                  active ? "text-white" : "text-white/50"
                }`}
              >
                {content}
              </button>
            );
          }

          return (
            <Link
              key={item.id}
              to={item.path}
              className={`relative flex flex-col items-center justify-center p-3 rounded-2xl transition-all duration-200 min-w-[48px] ${
                active ? "text-white" : "text-white/50"
              }`}
            >
              {content}
            </Link>
          );
        })}
      </nav>

      {/* Floating Create Button — mobile only */}
      <button
        onClick={() => setIsCreateModalOpen(true)}
        className="fixed bottom-20 right-4 z-50 md:hidden w-12 h-12 rounded-full bg-white text-black shadow-2xl shadow-white/20 flex items-center justify-center transition-all duration-200 active:scale-95 hover:bg-neutral-200 cursor-pointer"
        aria-label="Create post"
      >
        <Plus size={22} strokeWidth={2.5} />
      </button>

      {/* Create Media Modal */}
      <Modal
        openModal={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        initialWidth="max-w-2xl"
        initialHeight="h-auto"
      >
        <div className="w-full max-w-2xl">
          <CreateMedia
            type="post"
            onClose={() => setIsCreateModalOpen(false)}
            onUploadSuccess={() => setIsCreateModalOpen(false)}
          />
        </div>
      </Modal>
    </>
  );
};

export default BottomNav;
