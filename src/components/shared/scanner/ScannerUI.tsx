"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useSocket } from "@/hooks/useSocket";
import { authFetch } from "@/lib/api";

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
  const [currentGarmentStatus, setCurrentGarmentStatus] = useState<string | null>(null);
  const isProcessingScanRef = useRef(false);
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

  const handleScanSuccess = useCallback(async (decodedText: string) => {
    if (isProcessingScanRef.current) return;
    isProcessingScanRef.current = true;

    setPendingCode(decodedText);
    setCurrentGarmentStatus(null);
    setScanState("select_status");

    // Fetch current garment status concurrently
    try {
      const res = await authFetch(`/employee/garment-status?qrCode=${encodeURIComponent(decodedText)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data?.status) {
          setCurrentGarmentStatus(data.data.status);
        }
      }
    } catch {
      // silently ignore — not critical
    }
  }, []);

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
    isProcessingScanRef.current = false;
    setScanState("idle");
    setLastResult(null);
    setPendingCode(null);
    setErrorMessage(null);
    setCurrentGarmentStatus(null);
    setKey((k) => k + 1);
  };

  return { scanState, lastResult, pendingCode, key, errorMessage, currentGarmentStatus, handleScanSuccess, handleScanFailure, handleStatusSelect, handleReset };
}


