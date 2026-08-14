"use client";

import { io, Socket } from "socket.io-client";

let socketInstance: Socket | null = null;

export function getSocketUrl(): string {
  if (typeof window === "undefined") return "http://localhost:3000";
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (envUrl && envUrl.startsWith("http")) return envUrl;
  return window.location.origin;
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
