"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useSocket } from "@/hooks/useSocket";
import { authFetch } from "@/lib/api";

type ScanState = "idle" | "select_status" | "loading" | "success" | "error";

export interface ScanResult {
  qrCode:      string;
  status:      string;
  serviceName: string | null;
  orderNumber: string | null;
  garmentName: string | null;
  timestamp:   Date;
}

export function useScannerLogic(user: any) {
  const [scanState,            setScanState]            = useState<ScanState>("idle");
  const [lastResult,           setLastResult]           = useState<ScanResult | null>(null);
  const [pendingCode,          setPendingCode]          = useState<string | null>(null);
  const [key,                  setKey]                  = useState(0);
  const [errorMessage,         setErrorMessage]         = useState<string | null>(null);
  const [currentGarmentStatus, setCurrentGarmentStatus] = useState<string | null>(null);
  const [scannedServiceName,   setScannedServiceName]   = useState<string | null>(null);
  const [scannedOrderNumber,   setScannedOrderNumber]   = useState<string | null>(null);
  const [scannedGarmentName,   setScannedGarmentName]   = useState<string | null>(null);
  // Dynamic stages fetched from server for the scanned garment's service
  const [serviceStages,        setServiceStages]        = useState<string[]>([]);

  const isProcessingScanRef = useRef(false);
  const { socket, emitScan } = useSocket();

  // Listen for scan errors from socket server
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

    const trimmedCode = decodedText.trim();
    if (!trimmedCode) {
      // Reset ref so subsequent real scans are not blocked
      isProcessingScanRef.current = false;
      return;
    }

    setPendingCode(trimmedCode);
    setCurrentGarmentStatus(null);
    setScannedServiceName(null);
    setScannedOrderNumber(null);
    setScannedGarmentName(null);
    setServiceStages([]);
    setScanState("select_status");

    // Fetch garment status + service info
    try {
      const res = await authFetch(`/employee/garment-status?qrCode=${encodeURIComponent(trimmedCode)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          setCurrentGarmentStatus(data.data.status ?? null);
          setScannedServiceName(data.data.serviceName ?? null);
          setScannedOrderNumber(data.data.orderNumber ?? null);
          setScannedGarmentName(data.data.garmentName ?? null);
          if (Array.isArray(data.data.stages) && data.data.stages.length > 0) {
            setServiceStages(data.data.stages);
          }
        }
      }
    } catch {
      // silently ignore — non-critical status lookup
    }
  }, []);

  const handleStatusSelect = useCallback(async (status: string) => {
    if (!pendingCode) return;
    setScanState("loading");
    setErrorMessage(null);

    const payload = {
      qrCode:      pendingCode,
      status,
      employeeId:  user?.id       || "unknown",
      branchId:    user?.branchId || "unknown",
      serviceName: scannedServiceName,
      orderNumber: scannedOrderNumber,
      garmentName: scannedGarmentName,
    };

    // Emit via WebSocket (real-time push to customer tracker)
    try { emitScan(payload); } catch (e) { console.warn("WebSocket emit:", e); }

    // REST API — guaranteed DB write
    try {
      const res  = await authFetch("/employee/garment-status", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setLastResult({ qrCode: payload.qrCode, status: payload.status, serviceName: payload.serviceName, orderNumber: payload.orderNumber, garmentName: payload.garmentName, timestamp: new Date() });
        setScanState("success");
        return;
      }
      // Server returned a non-success response — show error
      setErrorMessage(data.message || "Server rejected the scan. Please try again.");
      setScanState("error");
    } catch (err: any) {
      // Network or parse failure — show error, don't silently succeed
      console.warn("REST scan update:", err);
      setErrorMessage("Could not save scan — check your connection and try again.");
      setScanState("error");
    }
  }, [pendingCode, user, emitScan, scannedServiceName, scannedOrderNumber, scannedGarmentName]);

  const handleScanFailure = useCallback(() => {}, []);

  const handleReset = () => {
    isProcessingScanRef.current = false;
    setScanState("idle");
    setLastResult(null);
    setPendingCode(null);
    setErrorMessage(null);
    setCurrentGarmentStatus(null);
    setScannedServiceName(null);
    setScannedOrderNumber(null);
    setScannedGarmentName(null);
    setServiceStages([]);
    setKey((k) => k + 1);
  };

  return {
    scanState,
    lastResult,
    pendingCode,
    key,
    errorMessage,
    currentGarmentStatus,
    scannedServiceName,
    scannedOrderNumber,
    scannedGarmentName,
    serviceStages,
    handleScanSuccess,
    handleScanFailure,
    handleStatusSelect,
    handleReset,
  };
}
