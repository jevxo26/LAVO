"use client";

import { useEffect, useRef } from "react";
import { Html5QrcodeScanner, Html5QrcodeScanType } from "html5-qrcode";

interface QrScannerProps {
  onScanSuccess: (decodedText: string, decodedResult: any) => void;
  onScanFailure?: (error: any) => void;
  fps?: number;
  qrbox?: number;
  aspectRatio?: number;
  disableFlip?: boolean;
}

const qrcodeRegionId = "html5qr-code-full-region";

export function QrScanner({
  onScanSuccess,
  onScanFailure,
  fps = 10,
  qrbox = 250,
  aspectRatio = 1.0,
  disableFlip = false,
}: QrScannerProps) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    // Prevent multiple instances in React Strict Mode
    if (!scannerRef.current) {
      const config = {
        fps,
        qrbox,
        aspectRatio,
        disableFlip,
        supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
      };

      scannerRef.current = new Html5QrcodeScanner(qrcodeRegionId, config, false);
      scannerRef.current.render(onScanSuccess, onScanFailure);
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(error => {
          console.error("Failed to clear html5QrcodeScanner. ", error);
        });
        scannerRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div 
      id={qrcodeRegionId} 
      className="w-full max-w-md mx-auto rounded-xl overflow-hidden border-2 border-slate-200 bg-white shadow-sm" 
    />
  );
}
