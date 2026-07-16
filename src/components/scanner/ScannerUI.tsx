"use client";

import { useState, useCallback } from "react";
import { useSocket } from "@/hooks/useSocket";

type ScanState = "idle" | "select_status" | "loading" | "success";

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
  const { emitScan } = useSocket();

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
    setLastResult({ ...payload, timestamp: new Date() });
    await new Promise((r) => setTimeout(r, 800));
    setScanState("success");
  }, [pendingCode, user, emitScan]);

  const handleScanFailure = useCallback(() => {}, []);

  const handleReset = () => {
    setScanState("idle");
    setLastResult(null);
    setPendingCode(null);
    setKey((k) => k + 1);
  };

  return { scanState, lastResult, pendingCode, key, handleScanSuccess, handleScanFailure, handleStatusSelect, handleReset };
}


