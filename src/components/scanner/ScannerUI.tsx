"use client";

import { useState, useCallback, useEffect } from "react";
import { useSocket } from "@/hooks/useSocket";

type ScanState = "idle" | "select_status" | "loading" | "success" | "error";

export interface ScanResult {
  qrCode: string;
  status: string;
  timestamp: Date;
}

export function useScannerLogic(user: any) {
  const [scanState, setScanState] = useState<ScanState>("idle");
  const [lastResult, setLastResult] = useState<ScanResult | null>(null);
  const [pendingCode, setPendingCode] = useState<string | null>(null);
  const [key, setKey] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { socket, emitScan } = useSocket();

  // Listen for scan errors from server
  useEffect(() => {
    if (!socket) return;
    const onError = (data: { message: string }) => {
      setErrorMessage(data.message || "Unknown scan error");
      setScanState("error");
    };
    socket.on("scanError", onError);
    return () => { socket.off("scanError", onError); };
  }, [socket]);

  const handleScanSuccess = useCallback((decodedText: string) => {
    if (scanState !== "idle") return;
    setPendingCode(decodedText);
    setScanState("select_status");
  }, [scanState]);

  const handleStatusSelect = useCallback(async (status: string) => {
    if (!pendingCode) return;
    setScanState("loading");

    const payload = {
      qrCode: pendingCode,
      status,
      employeeId: user?.id || "unknown",
      branchId: user?.branchId || "unknown",
    };

    emitScan(payload);

    // Wait briefly — if server emits scanError it will switch to "error" state
    await new Promise((r) => setTimeout(r, 1200));
    // Only set success if we haven't already moved to error state
    setScanState((current) => {
      if (current === "error") return "error";
      setLastResult({ ...payload, timestamp: new Date() });
      return "success";
    });
  }, [pendingCode, user, emitScan]);

  const handleScanFailure = useCallback(() => {}, []);

  const handleReset = () => {
    setScanState("idle");
    setLastResult(null);
    setPendingCode(null);
    setErrorMessage(null);
    setKey((k) => k + 1);
  };

  return { scanState, lastResult, pendingCode, key, errorMessage, handleScanSuccess, handleScanFailure, handleStatusSelect, handleReset };
}


