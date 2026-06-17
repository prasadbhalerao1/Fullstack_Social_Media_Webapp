/* eslint-disable react-refresh/only-export-components */
// Context to manage socket connections, online status, and last seen updates
import { createContext, useContext, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { connectSocket, disconnectSocket } from "@/lib/socket.js";

const SocketContext = createContext(null);

export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error("useSocket must be used inside <SocketProvider>");
  return ctx;
};

export const SocketProvider = ({ children }) => {
  const { user } = useSelector((state) => state.user);
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [lastSeenMap, setLastSeenMap] = useState({});
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (user) {
      const stored = localStorage.getItem(`notifications_${user._id}`);
      if (stored) {
        try {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setNotifications(JSON.parse(stored));
        } catch {
          setNotifications([]);
        }
      } else {
        setNotifications([]);
      }
    } else {
      setNotifications([]);
    }
  }, [user]);

  const markAllAsRead = () => {
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, read: true }));
      if (user) {
        localStorage.setItem(`notifications_${user._id}`, JSON.stringify(updated));
      }
      return updated;
    });
  };

  const clearNotifications = () => {
    setNotifications([]);
    if (user) {
      localStorage.removeItem(`notifications_${user._id}`);
    }
  };

  useEffect(() => {
    if (!user) {
      disconnectSocket();
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSocket(null);
      return;
    }

    const s = connectSocket(user._id);
    setSocket(s);

    const handleOnlineUsers = (usersMap) => {
      const userIds = Array.isArray(usersMap)
        ? usersMap
        : Object.keys(usersMap);
      setOnlineUsers(userIds);
    };

    const handleLastSeen = ({ userId, lastSeen }) => {
      setLastSeenMap((prev) => ({ ...prev, [userId]: lastSeen }));
    };

    const handleNotification = ({ message }) => {
      toast(message, {
        icon: "🔔",
        style: {
          background: "#171717",
          color: "#fff",
          border: "1px solid rgba(255, 255, 255, 0.1)",
        },
      });

      const newNotif = {
        id: Math.random().toString(36).substring(2, 9),
        message,
        createdAt: new Date().toISOString(),
        read: false,
      };

      setNotifications((prev) => {
        const updated = [newNotif, ...prev];
        localStorage.setItem(`notifications_${user._id}`, JSON.stringify(updated));
        return updated;
      });
    };

    const handleConnect = () => {
      console.log("[Socket] Connected:", s.id);
    };

    const handleDisconnect = (reason) => {
      console.log("[Socket] Disconnected:", reason);
    };

    const handleConnectError = (err) => {
      console.error("[Socket] Connection error:", err.message);
    };

    s.on("connect", handleConnect);
    s.on("disconnect", handleDisconnect);
    s.on("connect_error", handleConnectError);
    s.on("getOnlineUsers", handleOnlineUsers);
    s.on("user_last_seen", handleLastSeen);
    s.on("notification", handleNotification);

    return () => {
      s.off("connect", handleConnect);
      s.off("disconnect", handleDisconnect);
      s.off("connect_error", handleConnectError);
      s.off("getOnlineUsers", handleOnlineUsers);
      s.off("user_last_seen", handleLastSeen);
      s.off("notification", handleNotification);
    };
  }, [user]);

  const isOnline = (userId) => onlineUsers.includes(userId?.toString());

  return (
    <SocketContext.Provider
      value={{
        socket,
        onlineUsers,
        lastSeenMap,
        isOnline,
        notifications,
        unreadCount: notifications.filter((n) => !n.read).length,
        markAllAsRead,
        clearNotifications,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
