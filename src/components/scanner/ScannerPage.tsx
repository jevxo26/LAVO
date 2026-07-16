"use client";

import { CheckCircle2, ScanLine, Loader2, RefreshCw } from "lucide-react";
import { QrScanner } from "@/components/scanner/QrScanner";
import { useScannerLogic } from "@/components/scanner/ScannerUI";

export function ScannerPage() {
  const {
    scanState, lastResult, key,
    handleScanSuccess, handleScanFailure, handleReset,
  } = useScannerLogic();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex flex-col items-center justify-start px-4 py-10 gap-6">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 mb-2 text-indigo-300 text-sm font-medium tracking-widest uppercase">
          <ScanLine size={16} /> LAVO Employee Scanner
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Scan Garment QR</h1>
        <p className="text-slate-400 mt-1 text-sm">Point the camera at the QR tag on the bag</p>
      </div>

      <div className="w-full max-w-sm">
        {scanState === "idle" && (
          <QrScanner
            key={key}
            onScanSuccess={handleScanSuccess}
            onScanFailure={handleScanFailure}
            fps={12}
            qrbox={240}
          />
        )}

        {scanState === "loading" && (
          <div className="flex flex-col items-center justify-center gap-4 py-20">
            <Loader2 size={56} className="text-indigo-400 animate-spin" />
            <p className="text-slate-300 text-lg font-medium">Updating status...</p>
          </div>
        )}

        {scanState === "success" && lastResult && (
          <div className="flex flex-col items-center gap-5 py-10 text-center">
            <div className="rounded-full bg-green-500/20 p-5 ring-4 ring-green-500/30">
              <CheckCircle2 size={64} className="text-green-400" />
            </div>
            <div>
              <p className="text-green-300 text-xl font-bold">Scan Successful!</p>
              <p className="text-slate-400 text-sm mt-1">
                Status → <span className="text-white font-medium">{lastResult.status}</span>
              </p>
              <p className="text-slate-500 text-xs mt-2 font-mono break-all">{lastResult.qrCode}</p>
            </div>
            <button
              onClick={handleReset}
              className="mt-4 flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 transition-colors px-6 py-3 text-white font-semibold text-sm"
            >
              <RefreshCw size={16} /> Scan Another
            </button>
          </div>
        )}
      </div>

      <p className="text-slate-600 text-xs text-center max-w-xs">
        Real-time sync — the Branch Manager Dashboard updates instantly on every scan.
      </p>
    </div>
  );
}
