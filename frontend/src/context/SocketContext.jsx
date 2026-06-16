/**
 * SocketContext — connects the socket when a user is logged in,
 * disconnects on logout, and exposes online users + last seen info.
 */
import { createContext, useContext, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { connectSocket, disconnectSocket, getSocket } from "@/socket/socket.js";

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
      setSocket(null);
      return;
    }

    const s = connectSocket();
    setSocket(s);

    const handleOnlineUsers = (userIds) => setOnlineUsers(userIds);

    const handleLastSeen = ({ userId, lastSeen }) => {
      setLastSeenMap((prev) => ({ ...prev, [userId]: lastSeen }));
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
    s.on("online_users", handleOnlineUsers);
    s.on("user_last_seen", handleLastSeen);

    return () => {
      s.off("connect", handleConnect);
      s.off("disconnect", handleDisconnect);
      s.off("connect_error", handleConnectError);
      s.off("online_users", handleOnlineUsers);
      s.off("user_last_seen", handleLastSeen);
    };
  }, [user]);

  const isOnline = (userId) => onlineUsers.includes(userId?.toString());

  return (
    <SocketContext.Provider value={{ socket, onlineUsers, lastSeenMap, isOnline }}>
      {children}
    </SocketContext.Provider>
  );
};
