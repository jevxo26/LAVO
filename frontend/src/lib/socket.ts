"use client";

import { io, Socket } from "socket.io-client";

let socketInstance: Socket | null = null;

export function getSocketUrl(): string {
  if (typeof window === "undefined") return "http://localhost:5000";
  const socketEnv = process.env.NEXT_PUBLIC_SOCKET_URL;
  if (socketEnv) return socketEnv;
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (envUrl && envUrl.startsWith("http")) {
    return envUrl.replace(/\/api\/?$/, "");
  }
  // In development, Express server runs on port 5000 while Next.js runs on 3000
  return process.env.NODE_ENV === "development" ? "http://localhost:5000" : window.location.origin;
}

export function getSocket(): Socket {
  if (!socketInstance) {
    const token = typeof window !== "undefined" ? localStorage.getItem("laundrix_token") : null;
    socketInstance = io(getSocketUrl(), {
      auth: { token },
      transports: ["websocket", "polling"],
      autoConnect: true,
    });
  }
  return socketInstance;
}

export function disconnectSocket() {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
}
