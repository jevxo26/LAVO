"use client";

import { CheckCircle2, ScanLine, Loader2, RefreshCw, ArrowLeft, XCircle, LockKeyhole } from "lucide-react";
import { QrScanner } from "@/components/scanner/QrScanner";
import { useScannerLogic } from "@/components/scanner/ScannerUI";
import Link from "next/link";

interface Props { user: any }

export function ScannerView({ user }: Props) {
  const isAgent = user?.userType === "DELIVERY_AGENT";
  const STATUSES = isAgent 
    ? ["COLLECTED"] 
    : ["PROCESSING", "WASHING", "DRYING", "IRONING", "FOLDING", "READY_FOR_DELIVERY"];

  const {
    scanState, lastResult, key, pendingCode, errorMessage, currentGarmentStatus,
    handleScanSuccess, handleScanFailure, handleStatusSelect, handleReset,
  } = useScannerLogic(user);

  return (
    <div className="min-h-screen relative bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex flex-col items-center justify-start px-4 py-10 gap-6">
      
      {/* Back Button */}
      <Link href="/dashboard" className="absolute top-6 left-6 text-indigo-300 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium">
        <ArrowLeft size={18} /> Back
      </Link>
      <div className="text-center">
        <div className="inline-flex items-center gap-2 mb-2 text-indigo-300 text-sm font-medium tracking-widest uppercase">
          <ScanLine size={16} /> LAVO {user?.userType ? user.userType.replace(/_/g, " ") : "EMPLOYEE"} SCANNER
        </div>
        <h1 className="text-3xl font-bold text-white">Scan Garment QR</h1>
        <p className="text-slate-400 mt-1 text-sm">Signed in as <span className="text-indigo-300">{user?.fullName}</span></p>
      </div>

      <div className="w-full max-w-sm">
        {scanState === "idle" && (
          <QrScanner key={key} onScanSuccess={handleScanSuccess} onScanFailure={handleScanFailure} fps={12} qrbox={240} />
        )}

        {scanState === "select_status" && (() => {
          const COMPLETED_STAGES = ["READY_FOR_DELIVERY", "OUT_FOR_DELIVERY", "DELIVERED", "COMPLETED"];
          const isFullyDone = currentGarmentStatus && COMPLETED_STAGES.includes(currentGarmentStatus.toUpperCase());

          if (isFullyDone) {
            return (
              <div className="flex flex-col items-center gap-5 py-10 text-center bg-rose-950/30 border border-rose-500/30 rounded-2xl p-6">
                <div className="rounded-full bg-rose-500/20 p-5 ring-4 ring-rose-500/30">
                  <LockKeyhole size={56} className="text-rose-400" />
                </div>
                <div>
                  <p className="text-rose-300 text-2xl font-black tracking-wide">It has already been used</p>
                  <p className="text-slate-300 text-sm mt-1">
                    This garment has already reached <span className="font-bold text-white">{currentGarmentStatus.replace(/_/g, " ")}</span>.
                  </p>
                  <p className="text-slate-500 text-xs mt-1">No further stage scans are allowed for this QR code.</p>
                  <p className="text-slate-600 text-xs mt-3 font-mono break-all">{pendingCode}</p>
                </div>
                <button onClick={handleReset}
                  className="mt-2 flex items-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors px-6 py-3 text-white font-semibold text-sm border border-slate-700">
                  <RefreshCw size={16} /> Scan Another
                </button>
              </div>
            );
          }

          return (
            <div className="flex flex-col gap-3">
              <p className="text-white font-semibold text-center mb-2">Select current processing stage:</p>
              <p className="text-slate-500 text-xs text-center font-mono break-all mb-2">{pendingCode}</p>
              {currentGarmentStatus && (
                <p className="text-amber-400 text-xs text-center mb-1">
                  ⚠️ Current stage: <span className="font-bold">{currentGarmentStatus.replace(/_/g, " ")}</span>
                </p>
              )}
              {STATUSES.map((s) => {
                const HIERARCHY = ["PENDING", "CONFIRMED", "COLLECTED", "PROCESSING", "WASHING", "DRYING", "IRONING", "FOLDING", "READY_FOR_DELIVERY", "OUT_FOR_DELIVERY", "DELIVERED", "COMPLETED"];
                const currentLevel = currentGarmentStatus ? HIERARCHY.indexOf(currentGarmentStatus.toUpperCase()) : -1;
                const buttonLevel = HIERARCHY.indexOf(s.toUpperCase());

                // A stage is disabled if the garment is already at or past that stage
                const isAlreadyDone = currentLevel !== -1 && buttonLevel !== -1 && buttonLevel <= currentLevel;
                
                return (
                  <button
                    key={s}
                    onClick={() => !isAlreadyDone && handleStatusSelect(s)}
                    disabled={isAlreadyDone}
                    className={`w-full rounded-xl border font-semibold py-3 text-sm transition-colors flex items-center justify-center gap-2 ${
                      isAlreadyDone
                        ? "bg-slate-800/60 border-slate-700/40 text-slate-600 cursor-not-allowed opacity-50"
                        : "bg-indigo-600/30 hover:bg-indigo-500/50 border-indigo-500/40 text-indigo-200"
                    }`}
                  >
                    {isAlreadyDone && <LockKeyhole size={13} className="shrink-0" />}
                    <span className={isAlreadyDone ? "line-through" : ""}>{s.replace(/_/g, " ")}</span>
                    {isAlreadyDone && <span className="text-[10px] text-slate-500 ml-1">(completed)</span>}
                  </button>
                );
              })}
              <button onClick={handleReset} className="text-slate-500 text-xs text-center mt-2">Cancel</button>
            </div>
          );
        })()}

        {scanState === "loading" && (
          <div className="flex flex-col items-center justify-center gap-4 py-20">
            <Loader2 size={56} className="text-indigo-400 animate-spin" />
            <p className="text-slate-300 text-lg font-medium">Saving to database...</p>
          </div>
        )}

        {scanState === "success" && lastResult && (
          <div className="flex flex-col items-center gap-5 py-10 text-center">
            <div className="rounded-full bg-emerald-500/20 p-5 ring-4 ring-emerald-500/30">
              <CheckCircle2 size={64} className="text-emerald-400" />
            </div>
            <div>
              {lastResult.status === "READY_FOR_DELIVERY" ? (
                <>
                  <p className="text-emerald-300 text-2xl font-black tracking-wide">All done with this garment!</p>
                  <p className="text-slate-300 text-sm mt-1">Stage → <span className="text-white font-bold">READY FOR DELIVERY</span></p>
                  <p className="text-slate-400 text-xs mt-1">Garment fully processed and ready for drop-off.</p>
                </>
              ) : (
                <>
                  <p className="text-green-300 text-xl font-bold">Scan Saved!</p>
                  <p className="text-slate-400 text-sm mt-1">Stage → <span className="text-white font-medium">{lastResult.status.replace(/_/g, " ")}</span></p>
                  <p className="text-slate-500 text-xs mt-1">Customer tracker updated successfully.</p>
                </>
              )}
              <p className="text-slate-600 text-xs mt-2 font-mono break-all">{lastResult.qrCode}</p>
            </div>
            <button onClick={handleReset}
              className="mt-4 flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 transition-colors px-6 py-3 text-white font-semibold text-sm">
              <RefreshCw size={16} /> Scan Another
            </button>
          </div>
        )}

        {scanState === "error" && (
          <div className="flex flex-col items-center gap-5 py-10 text-center">
            <div className="rounded-full bg-red-500/20 p-5 ring-4 ring-red-500/30">
              <XCircle size={64} className="text-red-400" />
            </div>
            <div>
              <p className="text-red-300 text-xl font-bold">Scan Failed</p>
              <p className="text-slate-400 text-sm mt-2">{errorMessage || "QR code not recognised. Please try again."}</p>
            </div>
            <button onClick={handleReset}
              className="mt-4 flex items-center gap-2 rounded-xl bg-slate-700 hover:bg-slate-600 transition-colors px-6 py-3 text-white font-semibold text-sm">
              <RefreshCw size={16} /> Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
