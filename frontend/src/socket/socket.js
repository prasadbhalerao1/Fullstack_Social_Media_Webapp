/**
 * Socket.IO singleton for the frontend.
 * Uses lazy initialization: socket is created on first connectSocket() call.
 * withCredentials=true ensures the httpOnly JWT cookie is sent with the handshake.
 */
import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:3000";

/** @type {import("socket.io-client").Socket | null} */
let socket = null;

export const getSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      withCredentials: true,
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });
  }
  return socket;
};

export const connectSocket = () => {
  const s = getSocket();
  if (!s.connected) s.connect();
  return s;
};

export const disconnectSocket = () => {
  if (socket?.connected) {
    socket.disconnect();
    socket = null;
  }
};
