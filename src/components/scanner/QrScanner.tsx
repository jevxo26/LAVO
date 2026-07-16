"use client";

import { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner, Html5QrcodeScanType } from "html5-qrcode";

interface QrScannerProps {
  onScanSuccess: (decodedText: string, decodedResult: any) => void;
  onScanFailure?: (error: any) => void;
  fps?: number;
  qrbox?: number;
  aspectRatio?: number;
  disableFlip?: boolean;
}

export function QrScanner({
  onScanSuccess,
  onScanFailure,
  fps = 10,
  qrbox = 250,
  aspectRatio = 1.0,
  disableFlip = false,
}: QrScannerProps) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [regionId] = useState(() => `qr-region-${Math.random().toString(36).substring(2, 9)}`);

  useEffect(() => {
    // Prevent multiple instances in React Strict Mode by ensuring we only initialize once per regionId
    if (!scannerRef.current) {
      const config = {
        fps,
        qrbox,
        aspectRatio,
        disableFlip,
        supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
      };

      scannerRef.current = new Html5QrcodeScanner(regionId, config, false);
      scannerRef.current.render(onScanSuccess, onScanFailure);
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(error => {
          console.error("Failed to clear html5QrcodeScanner. ", error);
        });
        scannerRef.current = null;
      }
      
      // Force cleanup of the DOM node in case html5-qrcode clear() is too slow
      const el = document.getElementById(regionId);
      if (el) {
        el.innerHTML = '';
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [regionId]);

  return (
    <div 
      id={regionId} 
      className="w-full max-w-md mx-auto rounded-xl overflow-hidden border-2 border-slate-200 bg-white shadow-sm" 
    />
  );
}
