"use client";

import { useState, useCallback } from "react";
import { useSocket } from "@/hooks/useSocket";

type ScanState = "idle" | "loading" | "success";

export interface ScanResult {
  qrCode: string;
  status: string;
  timestamp: Date;
}

export function useScannerLogic() {
  const [scanState, setScanState] = useState<ScanState>("idle");
  const [lastResult, setLastResult] = useState<ScanResult | null>(null);
  const [key, setKey] = useState(0);
  const { emitScan } = useSocket();

  const handleScanSuccess = useCallback(async (decodedText: string) => {
    if (scanState !== "idle") return;
    setScanState("loading");

    const stored = typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("laundrix_user") || "{}")
      : {};
    const payload = {
      qrCode: decodedText,
      status: "PROCESSING",
      employeeId: stored.id || "unknown",
      branchId: stored.branchId || "unknown",
    };

    emitScan(payload);
    setLastResult({ ...payload, timestamp: new Date() });
    await new Promise((r) => setTimeout(r, 1200));
    setScanState("success");
  }, [scanState, emitScan]);

  const handleScanFailure = useCallback(() => {}, []);

  const handleReset = () => {
    setScanState("idle");
    setLastResult(null);
    setKey((k) => k + 1);
  };

  return { scanState, lastResult, key, handleScanSuccess, handleScanFailure, handleReset };
}

