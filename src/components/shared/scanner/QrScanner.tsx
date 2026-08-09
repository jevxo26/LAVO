"use client";

import { useEffect, useState, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Camera, RefreshCw, AlertCircle } from "lucide-react";

interface QrScannerProps {
  onScanSuccess: (decodedText: string, decodedResult: any) => void;
  onScanFailure?: (error: any) => void;
  fps?: number;
  qrbox?: number;
}

export function QrScanner({
  onScanSuccess,
  onScanFailure,
  fps = 10,
  qrbox = 240,
}: QrScannerProps) {
  const [cameras, setCameras] = useState<Array<{ id: string; label: string }>>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>("");
  const [isScanning, setIsScanning] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const regionIdRef = useRef(`html5qr-canvas-${Math.random().toString(36).substr(2, 7)}`);

  // Fetch available cameras on mount
  useEffect(() => {
    let isMounted = true;

    async function initCameras() {
      try {
        const devices = await Html5Qrcode.getCameras();
        if (!isMounted) return;

        if (devices && devices.length > 0) {
          const list = devices.map((d, index) => ({
            id: d.id,
            label: d.label || `Camera ${index + 1}`,
          }));
          setCameras(list);

          // Prefer physical webcam over OBS Virtual Camera if available
          const nonObs = list.find((c) => !c.label.toLowerCase().includes("obs"));
          setSelectedCameraId(nonObs ? nonObs.id : list[0].id);
        } else {
          setErrorMsg("No cameras detected on your device.");
        }
      } catch (err: any) {
        console.error("Error fetching cameras:", err);
        if (isMounted) {
          setErrorMsg("Camera permission denied or camera not accessible.");
        }
      }
    }

    initCameras();
    return () => { isMounted = false; };
  }, []);

  // Start/restart scanner whenever selectedCameraId changes
  useEffect(() => {
    if (!selectedCameraId) return;
    let isMounted = true;

    const regionId = regionIdRef.current;
    const html5Qrcode = new Html5Qrcode(regionId);
    scannerRef.current = html5Qrcode;

    async function startCamera() {
      try {
        setErrorMsg(null);
        await html5Qrcode.start(
          selectedCameraId,
          {
            fps,
            qrbox: { width: qrbox, height: qrbox },
          },
          (decodedText, decodedResult) => {
            if (isMounted) onScanSuccess(decodedText, decodedResult);
          },
          (err) => {
            if (onScanFailure) onScanFailure(err);
          }
        );
        if (isMounted) setIsScanning(true);
      } catch (err: any) {
        console.error("Failed to start scanner with camera ID:", selectedCameraId, err);
        if (isMounted) {
          setIsScanning(false);
          setErrorMsg("Failed to start selected camera. Please select a different camera below.");
        }
      }
    }

    startCamera();

    return () => {
      isMounted = false;
      if (html5Qrcode.isScanning) {
        html5Qrcode.stop().catch(() => {}).finally(() => {
          try { html5Qrcode.clear(); } catch {}
        });
      }
    };
  }, [selectedCameraId, fps, qrbox, onScanSuccess, onScanFailure]);

  const handleCameraChange = async (newId: string) => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop();
      } catch (e) {
        console.warn("Error stopping scanner before switch:", e);
      }
    }
    setSelectedCameraId(newId);
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      {/* Scanner Video Canvas */}
      <div className="relative w-full rounded-2xl overflow-hidden border-2 border-indigo-500/30 bg-slate-900 shadow-2xl min-h-[300px] flex items-center justify-center">
        <div id={regionIdRef.current} className="w-full h-full" />
        
        {errorMsg && (
          <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center p-6 text-center space-y-3 z-10">
            <AlertCircle size={40} className="text-rose-400" />
            <p className="text-xs font-semibold text-slate-300 leading-relaxed max-w-xs">{errorMsg}</p>
          </div>
        )}
      </div>

      {/* Camera Selection Controls */}
      {cameras.length > 0 && (
        <div className="rounded-xl bg-slate-800/80 border border-slate-700/80 p-3 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold px-1">
            <span className="flex items-center gap-1.5 text-indigo-300">
              <Camera size={13} /> Select Camera ({cameras.length})
            </span>
            {isScanning && (
              <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Active
              </span>
            )}
          </div>

          <select
            value={selectedCameraId}
            onChange={(e) => handleCameraChange(e.target.value)}
            className="w-full rounded-lg bg-slate-900 border border-slate-700 text-white text-xs font-medium px-3 py-2.5 outline-none focus:border-indigo-500 transition-colors cursor-pointer"
          >
            {cameras.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label} {c.label.toLowerCase().includes("obs") ? " (Virtual)" : ""}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
