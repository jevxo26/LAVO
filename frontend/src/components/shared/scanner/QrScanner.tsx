"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Camera, RefreshCw, AlertCircle, VideoOff, ShieldAlert } from "lucide-react";

interface QrScannerProps {
  onScanSuccess: (decodedText: string, decodedResult: any) => void;
  onScanFailure?: (error: any) => void;
  fps?: number;
  qrbox?: number;
}

// ─── Camera error classifier ──────────────────────────────────────────────────

interface CameraError {
  title: string;
  message: string;
  canRetry: boolean;
  icon: "shield" | "video-off" | "alert";
}

function classifyCameraError(err: any): CameraError {
  const name    = err?.name    ?? "";
  const message = (err?.message ?? "").toLowerCase();

  // Camera physically busy (another app/tab using it)
  if (
    name === "NotReadableError" ||
    name === "TrackStartError" ||
    message.includes("could not start video source") ||
    message.includes("failed to allocate videosource") ||
    message.includes("device in use")
  ) {
    return {
      title:    "Camera Already in Use",
      message:  "Another app or browser tab is using this camera. Close them and tap Retry.",
      canRetry: true,
      icon:     "video-off",
    };
  }

  // Permission denied
  if (
    name === "NotAllowedError" ||
    name === "PermissionDeniedError" ||
    message.includes("permission denied") ||
    message.includes("not allowed")
  ) {
    return {
      title:    "Camera Permission Denied",
      message:  "Please allow camera access in your browser settings, then tap Retry.",
      canRetry: true,
      icon:     "shield",
    };
  }

  // No camera found
  if (
    name === "NotFoundError" ||
    name === "DevicesNotFoundError" ||
    message.includes("not found") ||
    message.includes("no camera")
  ) {
    return {
      title:    "No Camera Found",
      message:  "No camera was detected on this device.",
      canRetry: false,
      icon:     "alert",
    };
  }

  // Camera not supported / insecure context
  if (
    name === "NotSupportedError" ||
    name === "TypeError" ||
    message.includes("insecure") ||
    message.includes("https")
  ) {
    return {
      title:    "Camera Not Supported",
      message:  "Camera access requires a secure (HTTPS) connection or is not supported on this device.",
      canRetry: false,
      icon:     "alert",
    };
  }

  // Overconstrained (specific camera ID no longer valid)
  if (name === "OverconstrainedError") {
    return {
      title:    "Camera Unavailable",
      message:  "The selected camera is no longer available. Please choose a different one.",
      canRetry: true,
      icon:     "video-off",
    };
  }

  // Generic fallback
  return {
    title:    "Camera Error",
    message:  err?.message || "Could not start the camera. Please try again.",
    canRetry: true,
    icon:     "alert",
  };
}

// ─── Stop all active getUserMedia tracks ──────────────────────────────────────

async function releaseAllCameraTracks() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    stream.getTracks().forEach((t) => t.stop());
  } catch {
    // ignore — may not have a stream
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export function QrScanner({
  onScanSuccess,
  onScanFailure,
  fps = 10,
  qrbox = 240,
}: QrScannerProps) {
  const [cameras,          setCameras]          = useState<Array<{ id: string; label: string }>>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>("");
  const [isScanning,       setIsScanning]       = useState(false);
  const [cameraError,      setCameraError]      = useState<CameraError | null>(null);
  const [retryKey,         setRetryKey]         = useState(0);

  const scannerRef  = useRef<Html5Qrcode | null>(null);
  const regionIdRef = useRef(`html5qr-canvas-${Math.random().toString(36).substr(2, 7)}`);

  // Stable refs for callbacks — prevents scanner effect from restarting
  const onScanSuccessRef = useRef(onScanSuccess);
  const onScanFailureRef = useRef(onScanFailure);
  useEffect(() => { onScanSuccessRef.current = onScanSuccess; }, [onScanSuccess]);
  useEffect(() => { onScanFailureRef.current = onScanFailure; }, [onScanFailure]);

  // ── Retry handler ──────────────────────────────────────────────────────────

  const handleRetry = useCallback(async () => {
    setCameraError(null);
    setIsScanning(false);
    // Release any stuck tracks before retrying
    await releaseAllCameraTracks();
    // Re-enumerate cameras and restart
    setRetryKey((k) => k + 1);
  }, []);

  // ── Camera enumeration ─────────────────────────────────────────────────────

  useEffect(() => {
    let isMounted = true;
    setCameraError(null);

    async function initCameras() {
      try {
        // Request native userMedia permission first to trigger browser permission prompt
        if (typeof window !== "undefined" && navigator?.mediaDevices?.getUserMedia) {
          try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
            stream.getTracks().forEach((track) => track.stop());
          } catch (permErr: any) {
            if (permErr?.name === "NotAllowedError" || permErr?.name === "PermissionDeniedError") {
              if (isMounted) {
                setCameraError({
                  title: "Camera Permission Blocked",
                  message: "Camera access is blocked by your browser. Click the lock icon 🔒 next to the website URL in your address bar and change Camera to 'Allow', then click Retry.",
                  canRetry: true,
                  icon: "shield",
                });
              }
              return;
            }
          }
        }

        const devices = await Html5Qrcode.getCameras();
        if (!isMounted) return;

        if (devices && devices.length > 0) {
          const list = devices.map((d, i) => ({
            id:    d.id,
            label: d.label || `Camera ${i + 1}`,
          }));
          setCameras(list);
          const nonObs = list.find((c) => !c.label.toLowerCase().includes("obs"));
          setSelectedCameraId(nonObs ? nonObs.id : list[0].id);
        } else {
          if (isMounted) {
            setCameraError({
              title:    "No Camera Found",
              message:  "No cameras were detected on this device.",
              canRetry: false,
              icon:     "alert",
            });
          }
        }
      } catch (err: any) {
        console.error("Camera enumeration error:", err);
        if (isMounted) setCameraError(classifyCameraError(err));
      }
    }

    initCameras();
    return () => { isMounted = false; };
  }, [retryKey]);

  // ── Scanner start/stop ─────────────────────────────────────────────────────

  useEffect(() => {
    if (!selectedCameraId) return;
    let isMounted = true;

    const regionId   = regionIdRef.current;
    const html5Qrcode = new Html5Qrcode(regionId);
    scannerRef.current = html5Qrcode;

    async function startCamera() {
      try {
        setCameraError(null);
        await html5Qrcode.start(
          selectedCameraId,
          { fps, qrbox: { width: qrbox, height: qrbox } },
          (decodedText, decodedResult) => {
            if (isMounted) onScanSuccessRef.current(decodedText, decodedResult);
          },
          (err) => {
            // per-frame failure — intentional no-op, just call the prop ref
            if (onScanFailureRef.current) onScanFailureRef.current(err);
          }
        );
        if (isMounted) setIsScanning(true);
      } catch (err: any) {
        console.error("Failed to start scanner:", err);
        if (!isMounted) return;

        setIsScanning(false);

        // Classify and show friendly error
        const classified = classifyCameraError(err);
        setCameraError(classified);

        // For NotReadableError specifically: release all tracks so retry works
        if (
          err?.name === "NotReadableError" ||
          err?.name === "TrackStartError" ||
          (err?.message ?? "").toLowerCase().includes("could not start video source")
        ) {
          await releaseAllCameraTracks();
        }

        // Try to clean up the html5qrcode DOM node
        try { html5Qrcode.clear(); } catch {}
      }
    }

    startCamera();

    return () => {
      isMounted = false;
      if (html5Qrcode.isScanning) {
        html5Qrcode
          .stop()
          .catch(() => {})
          .finally(() => { try { html5Qrcode.clear(); } catch {} });
      } else {
        try { html5Qrcode.clear(); } catch {}
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCameraId, fps, qrbox]);
  // Note: onScanSuccess/onScanFailure intentionally excluded — handled via refs above

  // ── Camera switch ──────────────────────────────────────────────────────────

  const handleCameraChange = async (newId: string) => {
    if (scannerRef.current?.isScanning) {
      try { await scannerRef.current.stop(); } catch (e) {
        console.warn("Error stopping scanner before switch:", e);
      }
    }
    setSelectedCameraId(newId);
  };

  // ── Error icon helper ──────────────────────────────────────────────────────

  const ErrorIcon = () => {
    if (cameraError?.icon === "shield")    return <ShieldAlert size={36} style={{ color: "color-mix(in srgb, var(--warning) 70%, white)" }} />;
    if (cameraError?.icon === "video-off") return <VideoOff    size={36} style={{ color: "color-mix(in srgb, var(--error) 70%, white)" }} />;
    return <AlertCircle size={36} style={{ color: "color-mix(in srgb, var(--error) 70%, white)" }} />;
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="w-full max-w-md mx-auto space-y-4">

      {/* ── Scanner Video Canvas ── */}
      <div
        className="relative w-full rounded-2xl overflow-hidden shadow-2xl min-h-[300px] flex items-center justify-center"
        style={{
          background: "#0f172a",
          border: "2px solid color-mix(in srgb, var(--primary) 30%, transparent)",
        }}
      >
        <div id={regionIdRef.current} className="w-full h-full" />

        {/* ── Camera error overlay ── */}
        {cameraError && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center gap-4 z-10"
            style={{ background: "rgba(15,23,42,0.92)" }}
          >
            <ErrorIcon />

            <div className="space-y-1.5">
              <p className="text-sm font-black text-white">{cameraError.title}</p>
              <p className="text-xs text-white/50 leading-relaxed max-w-[260px]">
                {cameraError.message}
              </p>
            </div>

            {cameraError.canRetry && (
              <button
                onClick={handleRetry}
                className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-white font-black text-xs transition-all hover:scale-[1.03]"
                style={{ background: "linear-gradient(135deg, var(--primary), var(--ring))" }}
              >
                <RefreshCw size={14} /> Retry Camera
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Camera Selection Controls ── */}
      {cameras.length > 0 && !cameraError && (
        <div
          className="rounded-xl p-3 space-y-2"
          style={{
            background: "color-mix(in srgb, white 6%, transparent)",
            border: "1px solid color-mix(in srgb, white 10%, transparent)",
          }}
        >
          <div className="flex items-center justify-between text-xs font-bold px-1">
            <span className="flex items-center gap-1.5" style={{ color: "color-mix(in srgb, var(--primary) 70%, white)" }}>
              <Camera size={13} /> Select Camera ({cameras.length})
            </span>
            {isScanning && (
              <span
                className="flex items-center gap-1 text-[10px] font-black"
                style={{ color: "color-mix(in srgb, var(--success) 70%, white)" }}
              >
                <span
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{ background: "var(--success)" }}
                />
                Active
              </span>
            )}
          </div>

          <select
            value={selectedCameraId}
            onChange={(e) => handleCameraChange(e.target.value)}
            className="w-full rounded-lg text-white text-xs font-medium px-3 py-2.5 outline-none cursor-pointer transition-colors"
            style={{
              background: "#0f172a",
              border: "1px solid color-mix(in srgb, white 15%, transparent)",
            }}
          >
            {cameras.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}{c.label.toLowerCase().includes("obs") ? " (Virtual)" : ""}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
