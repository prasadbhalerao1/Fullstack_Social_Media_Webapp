import { useEffect } from "react";
import { X, Trash2, Bell } from "lucide-react";
import { useSocket } from "@/context/SocketContext.jsx";
import { timeAgo } from "@/lib/timeAgo.js";

const NotificationsDrawer = () => {
  const {
    isNotificationsOpen,
    setIsNotificationsOpen,
    notifications,
    markAllAsRead,
    clearNotifications,
  } = useSocket();

  // Mark all notifications as read when the drawer is opened
  useEffect(() => {
    if (isNotificationsOpen) {
      markAllAsRead();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNotificationsOpen]);

  if (!isNotificationsOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-end bg-black/60 backdrop-blur-xs"
      onClick={() => setIsNotificationsOpen(false)}
    >
      {/* Drawer Panel */}
      <div
        className="bg-neutral-900 border-l border-white/10 w-full max-w-md h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Bell size={18} className="text-white" />
            <h3 className="text-md font-semibold text-gray-200">
              Notifications
            </h3>
          </div>
          <div className="flex items-center gap-2">
            {notifications.length > 0 && (
              <button
                onClick={clearNotifications}
                className="p-1.5 text-red-400 hover:text-red-300 hover:bg-white/5 rounded-full transition cursor-pointer flex items-center justify-center"
                title="Clear all"
              >
                <Trash2 size={16} />
              </button>
            )}
            <button
              onClick={() => setIsNotificationsOpen(false)}
              className="p-1.5 text-neutral-400 hover:text-white hover:bg-white/5 rounded-full transition cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 no-scrollbar flex flex-col gap-3">
          {notifications.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-neutral-500 text-sm gap-2 py-10">
              <Bell size={24} className="text-neutral-600 animate-pulse" />
              <p>No notifications yet.</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-3.5 rounded-xl border transition duration-200 flex flex-col gap-1.5 ${
                  notif.read
                    ? "bg-neutral-950/20 border-white/5"
                    : "bg-white/5 border-white/15"
                }`}
              >
                <div className="flex justify-between items-start gap-3">
                  <p className="text-xs text-neutral-200 leading-relaxed font-medium">
                    {notif.message}
                  </p>
                  {!notif.read && (
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 mt-1.5 animate-pulse" />
                  )}
                </div>
                {notif.createdAt && (
                  <span className="text-[10px] text-neutral-500 font-medium">
                    {timeAgo(notif.createdAt)}
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsDrawer;
