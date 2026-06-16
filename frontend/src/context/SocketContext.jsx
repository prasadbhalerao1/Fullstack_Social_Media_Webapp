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
      value={{ socket, onlineUsers, lastSeenMap, isOnline }}
    >
      {children}
    </SocketContext.Provider>
  );
};
