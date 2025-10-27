import { io, Socket } from "socket.io-client";

// This will be set by the ApiProvider, similar to API URL
let currentSocketUrl = "http://localhost:5000";

export function setSocketUrl(apiUrl: string) {
  // Convert API URL to socket URL (remove /api suffix)
  currentSocketUrl = apiUrl.replace(/\/api$/, "");
  
  // If socket exists, disconnect and recreate with new URL
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

let socket: Socket | null = null;

export function getSocket() {
  if (socket) return socket;
  
  socket = io(currentSocketUrl, {
    path: "/socket.io",
    transports: ["websocket", "polling"], // Support both for cross-platform compatibility
    autoConnect: false,
    forceNew: true, // Force new connection
    timeout: 20000, // Increase timeout
  });
  return socket;
}

// Friends & Social Socket Events
export const joinUserRoom = (userEmail: string) => {
  const socketInstance = getSocket();
  if (socketInstance) {
    socketInstance.emit("join_user_room", userEmail);
  }
};

export const updateUserOnlineStatus = (userEmail: string, status: "online" | "offline" | "away" | "busy") => {
  const socketInstance = getSocket();
  if (socketInstance) {
    socketInstance.emit("update_online_status", { userEmail, status });
  }
};

export const subscribeToFriendUpdates = (userEmail: string, callback: (data: any) => void) => {
  const socketInstance = getSocket();
  if (socketInstance) {
    socketInstance.on("friend_online_status_update", callback);
    socketInstance.on("friend_request_received", callback);
    socketInstance.on("friend_request_accepted", callback);
  }
};

export const unsubscribeFromFriendUpdates = (callback: (data: any) => void) => {
  const socketInstance = getSocket();
  if (socketInstance) {
    socketInstance.off("friend_online_status_update", callback);
    socketInstance.off("friend_request_received", callback);
    socketInstance.off("friend_request_accepted", callback);
  }
};
