"use client";

import { useEffect } from "react";
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
  useEffect(() => {
    let isMounted = true;
    let scanner: Html5QrcodeScanner | null = null;

    // Clean up the DOM element just in case there's any residual HTML
    const el = document.getElementById(qrcodeRegionId);
    if (el) el.innerHTML = "";

    // Debounce the initialization by 50ms.
    // In React 18 Strict Mode, components mount, unmount, and remount instantly.
    // This timeout ensures the first "ghost" mount is cancelled before it creates a camera instance,
    // leaving only the final, real mount to initialize the scanner.
    const initTimer = setTimeout(() => {
      if (!isMounted) return;

      const config = {
        fps,
        qrbox,
        aspectRatio,
        disableFlip,
        supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
      };

      scanner = new Html5QrcodeScanner(qrcodeRegionId, config, false);
      scanner.render(onScanSuccess, onScanFailure);
    }, 50);

    return () => {
      isMounted = false;
      clearTimeout(initTimer);
      if (scanner) {
        scanner.clear().catch((error) => {
          console.error("Failed to clear html5QrcodeScanner. ", error);
        });
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
