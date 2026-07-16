"use client";

import { useEffect, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function useSocket(branchId?: string) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!socket) {
      socket = io(window.location.origin, {
        auth: { token: localStorage.getItem("laundrix_token") },
        transports: ["websocket", "polling"],
      });
    }
    socketRef.current = socket;

    if (branchId) {
      socket.emit("joinBranch", branchId);
    }

    return () => {
      // Keep connection alive across nav — don't disconnect
    };
  }, [branchId]);

  const emitScan = useCallback((data: {
    qrCode: string;
    status: string;
    employeeId: string;
    branchId: string;
  }) => {
    socketRef.current?.emit("garmentScan", data);
  }, []);

  return { socket: socketRef.current, emitScan };
}
