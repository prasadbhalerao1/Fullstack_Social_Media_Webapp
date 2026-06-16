// Socket client setup using lazy connection initialization
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:3000";

/** @type {import("socket.io-client").Socket | null} */
let socket = null;

export const getSocket = () => {
  return socket;
};

export const connectSocket = (userId) => {
  if (!userId) return null;

  // Cleanup: if an existing socket exists, disconnect it first before starting a new connection attempt
  if (socket) {
    if (socket.connected && socket.io.opts.query?.userId === userId) {
      // Prevents duplicate socket connections if one already exists
      return socket;
    }
    // Otherwise, clear/disconnect the previous socket instance
    socket.disconnect();
    socket = null;
  }

  socket = io(SOCKET_URL, {
    withCredentials: true,
    autoConnect: false,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
    query: { userId },
  });

  socket.connect();
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
