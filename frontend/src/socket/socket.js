/**
 * Socket.IO singleton for the frontend.
 * Uses lazy initialization: socket is created on first connectSocket() call.
 * withCredentials=true ensures the httpOnly JWT cookie is sent with the handshake.
 */
import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:3000";

/** @type {import("socket.io-client").Socket | null} */
let socket = null;

export const getSocket = (userId) => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      withCredentials: true,
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
      query: userId ? { userId } : {},
    });
  } else if (userId) {
    socket.io.opts.query = { userId };
  }
  return socket;
};

export const connectSocket = (userId) => {
  const s = getSocket(userId);
  if (userId) {
    s.io.opts.query = { userId };
  }
  if (!s.connected) s.connect();
  return s;
};

export const disconnectSocket = () => {
  if (socket?.connected) {
    socket.disconnect();
    socket = null;
  }
};
