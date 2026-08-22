"use client";

import { useEffect, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";

let globalSocket: Socket | null = null;

export function useSocket(branchId?: string) {
  const [socketInstance, setSocketInstance] = useState<Socket | null>(globalSocket);

  useEffect(() => {
    if (!globalSocket) {
      globalSocket = io(window.location.origin, {
        auth: { token: localStorage.getItem("laundrix_token") },
        transports: ["websocket", "polling"],
      });
    }
    setSocketInstance(globalSocket);

    if (branchId && globalSocket) {
      globalSocket.emit("joinBranch", branchId);
    }
  }, [branchId]);

  const emitScan = useCallback((data: {
    qrCode: string;
    status: string;
    employeeId: string;
    branchId: string;
  }) => {
    globalSocket?.emit("garmentScan", data);
  }, []);

  return { socket: socketInstance, emitScan };
}

