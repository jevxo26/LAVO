"use client";

import {
  CheckCircle2, ScanLine, Loader2, RefreshCw, ArrowLeft,
  XCircle, LockKeyhole, Shirt, Sparkles, Tag, Package,
} from "lucide-react";
import { QrScanner }        from "@/components/shared/scanner/QrScanner";
import { useScannerLogic }  from "@/components/shared/scanner/ScannerUI";
import Link from "next/link";

// ─── Stage label map ─────────────────────────────────────────────────────────
const STAGE_META: Record<string, { label: string; color: string }> = {
  PROCESSING:        { label: "Sorting & Prep",      color: "from-amber-500   to-orange-500"  },
  WASHING:           { label: "Washing",              color: "from-blue-500    to-cyan-500"    },
  DRYING:            { label: "Drying",               color: "from-orange-400  to-amber-500"   },
  IRONING:           { label: "Ironing & Pressing",   color: "from-violet-500  to-purple-600"  },
  FOLDING:           { label: "Folding & Packing",    color: "from-pink-500    to-rose-500"    },
  READY_FOR_DELIVERY:{ label: "Ready for Delivery",   color: "from-emerald-500 to-green-600"   },
  DRY_CLEANING:      { label: "Dry Cleaning",         color: "from-sky-500     to-blue-600"    },
  PRESSING:          { label: "Pressing",             color: "from-indigo-500  to-violet-600"  },
  STAIN_TREATMENT:   { label: "Stain Treatment",      color: "from-red-500     to-rose-600"    },
  COLLECTED:         { label: "Collected",            color: "from-slate-500   to-slate-600"   },
};

// Default fallback stages (shown while service-specific stages are loading)
const DEFAULT_STAGES = ["PROCESSING", "WASHING", "DRYING", "IRONING", "FOLDING", "READY_FOR_DELIVERY"];

const COMPLETED_STAGES = ["READY_FOR_DELIVERY", "OUT_FOR_DELIVERY", "DELIVERED", "COMPLETED"];

const HIERARCHY = [
  "PENDING", "CONFIRMED", "COLLECTED", "PROCESSING",
  "STAIN_TREATMENT", "DRY_CLEANING", "WASHING", "DRYING",
  "PRESSING", "IRONING", "FOLDING", "READY_FOR_DELIVERY",
  "OUT_FOR_DELIVERY", "DELIVERED", "COMPLETED",
];

interface Props { user: any }

export function ScannerView({ user }: Props) {
  const isAgent = user?.userType === "DELIVERY_AGENT";

  const {
    scanState, lastResult, key, pendingCode, errorMessage, currentGarmentStatus,
    scannedServiceName, scannedOrderNumber, scannedGarmentName, serviceStages,
    handleScanSuccess, handleScanFailure, handleStatusSelect, handleReset,
  } = useScannerLogic(user);

  // Determine which stages to show
  const stagesToShow: string[] = isAgent
    ? ["COLLECTED"]
    : serviceStages.length > 0
      ? serviceStages
      : DEFAULT_STAGES;

  return (
    <div className="min-h-screen relative bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex flex-col items-center justify-start px-4 py-10 gap-6">

      {/* Back Button */}
      <Link href="/dashboard" className="absolute top-6 left-6 text-indigo-300 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium">
        <ArrowLeft size={18} /> Back
      </Link>

      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 mb-2 text-indigo-300 text-sm font-medium tracking-widest uppercase">
          <ScanLine size={16} /> LAVO {user?.userType ? user.userType.replace(/_/g, " ") : "EMPLOYEE"} SCANNER
        </div>
        <h1 className="text-3xl font-bold text-white">Scan Garment QR</h1>
        <p className="text-slate-400 mt-1 text-sm">
          Signed in as <span className="text-indigo-300">{user?.fullName}</span>
        </p>
      </div>

      <div className="w-full max-w-sm space-y-4">

        {/* ── IDLE: Show Scanner ── */}
        {scanState === "idle" && (
          <QrScanner
            key={key}
            onScanSuccess={handleScanSuccess}
            onScanFailure={handleScanFailure}
            fps={12}
            qrbox={240}
          />
        )}

        {/* ── SELECT STATUS: Show garment info + dynamic service stages ── */}
        {scanState === "select_status" && (() => {
          const isFullyDone = currentGarmentStatus &&
            COMPLETED_STAGES.includes(currentGarmentStatus.toUpperCase());

          if (isFullyDone) {
            return (
              <div className="flex flex-col items-center gap-5 py-10 text-center bg-rose-950/30 border border-rose-500/30 rounded-2xl p-6">
                <div className="rounded-full bg-rose-500/20 p-5 ring-4 ring-rose-500/30">
                  <LockKeyhole size={56} className="text-rose-400" />
                </div>
                <div>
                  <p className="text-rose-300 text-2xl font-black tracking-wide">Already Completed</p>
                  <p className="text-slate-300 text-sm mt-1">
                    This garment has already reached{" "}
                    <span className="font-bold text-white">
                      {currentGarmentStatus.replace(/_/g, " ")}
                    </span>.
                  </p>
                  <p className="text-slate-500 text-xs mt-1">No further stage scans are allowed.</p>
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

              {/* ── Garment Info Card ── */}
              <div className="rounded-2xl bg-indigo-900/40 border border-indigo-500/30 p-4 space-y-2.5">
                <div className="flex items-center gap-2">
                  <Sparkles size={13} className="text-indigo-300" />
                  <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">Scanned Garment</span>
                </div>

                <div className="space-y-1.5">
                  {scannedGarmentName && (
                    <div className="flex items-center gap-2">
                      <Shirt size={14} className="text-slate-400 shrink-0" />
                      <span className="text-sm font-extrabold text-white">{scannedGarmentName}</span>
                    </div>
                  )}
                  {scannedServiceName && (
                    <div className="flex items-center gap-2">
                      <Sparkles size={13} className="text-cyan-400 shrink-0" />
                      <span className="text-xs font-bold text-cyan-300">Service: {scannedServiceName}</span>
                    </div>
                  )}
                  {scannedOrderNumber && (
                    <div className="flex items-center gap-2">
                      <Package size={13} className="text-slate-400 shrink-0" />
                      <span className="text-xs text-slate-400 font-mono">Order #{scannedOrderNumber}</span>
                    </div>
                  )}
                  {currentGarmentStatus && (
                    <div className="flex items-center gap-2">
                      <Tag size={13} className="text-amber-400 shrink-0" />
                      <span className="text-xs font-bold text-amber-300">
                        Current Stage: {currentGarmentStatus.replace(/_/g, " ")}
                      </span>
                    </div>
                  )}
                  <p className="text-[10px] text-slate-500 font-mono break-all">{pendingCode}</p>
                </div>
              </div>

              {/* ── Service-Specific Stage Buttons ── */}
              <p className="text-white font-semibold text-center text-sm">
                {scannedServiceName
                  ? `Select stage for "${scannedServiceName}":`
                  : "Select current processing stage:"}
              </p>

              <div className="space-y-2">
                {stagesToShow.map((s) => {
                  const currentLevel = currentGarmentStatus
                    ? HIERARCHY.indexOf(currentGarmentStatus.toUpperCase())
                    : -1;
                  const buttonLevel = HIERARCHY.indexOf(s.toUpperCase());
                  const isAlreadyDone = currentLevel !== -1 && buttonLevel !== -1 && buttonLevel <= currentLevel;
                  const meta = STAGE_META[s] ?? { label: s.replace(/_/g, " "), color: "from-slate-500 to-slate-600" };

                  return (
                    <button
                      key={s}
                      onClick={() => !isAlreadyDone && handleStatusSelect(s)}
                      disabled={isAlreadyDone}
                      className={`w-full rounded-xl border font-semibold py-3.5 text-sm transition-all flex items-center gap-3 px-4 ${
                        isAlreadyDone
                          ? "bg-slate-800/60 border-slate-700/40 text-slate-600 cursor-not-allowed opacity-50"
                          : "bg-indigo-600/20 hover:bg-indigo-500/40 border-indigo-500/40 text-indigo-100 hover:scale-[1.01] hover:shadow-lg hover:shadow-indigo-900/40"
                      }`}
                    >
                      {isAlreadyDone ? (
                        <LockKeyhole size={15} className="shrink-0 text-slate-600" />
                      ) : (
                        <span className={`shrink-0 w-2.5 h-2.5 rounded-full bg-gradient-to-br ${meta.color}`} />
                      )}
                      <div className="flex-1 text-left">
                        <span className={`font-black text-sm ${isAlreadyDone ? "line-through text-slate-600" : ""}`}>
                          {meta.label}
                        </span>
                        {isAlreadyDone && (
                          <span className="block text-[10px] text-slate-600 font-medium">Already completed</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              <button onClick={handleReset} className="text-slate-500 text-xs text-center mt-1 hover:text-slate-300 transition-colors">
                ← Cancel &amp; Scan Again
              </button>
            </div>
          );
        })()}

        {/* ── LOADING ── */}
        {scanState === "loading" && (
          <div className="flex flex-col items-center justify-center gap-4 py-20">
            <Loader2 size={56} className="text-indigo-400 animate-spin" />
            <p className="text-slate-300 text-lg font-medium">Saving to database...</p>
          </div>
        )}

        {/* ── SUCCESS ── */}
        {scanState === "success" && lastResult && (
          <div className="flex flex-col items-center gap-5 py-10 text-center">
            <div className="rounded-full bg-emerald-500/20 p-5 ring-4 ring-emerald-500/30">
              <CheckCircle2 size={64} className="text-emerald-400" />
            </div>
            <div className="space-y-2">
              {lastResult.status === "READY_FOR_DELIVERY" ? (
                <>
                  <p className="text-emerald-300 text-2xl font-black tracking-wide">All Done</p>
                  <p className="text-slate-300 text-sm">
                    Stage → <span className="text-white font-bold">READY FOR DELIVERY</span>
                  </p>
                  <p className="text-slate-400 text-xs">Garment fully processed and ready for drop-off.</p>
                </>
              ) : (
                <>
                  <p className="text-green-300 text-xl font-bold">Stage Updated</p>
                  <p className="text-slate-300 text-sm">
                    {lastResult.garmentName && <span className="text-white font-bold">{lastResult.garmentName} → </span>}
                    <span className="text-emerald-300 font-bold">
                      {STAGE_META[lastResult.status]?.label ?? lastResult.status.replace(/_/g, " ")}
                    </span>
                  </p>
                  {lastResult.serviceName && (
                    <p className="text-indigo-300 text-xs font-semibold">Service: {lastResult.serviceName}</p>
                  )}
                  {lastResult.orderNumber && (
                    <p className="text-slate-500 text-xs">Order #{lastResult.orderNumber}</p>
                  )}
                  <p className="text-slate-500 text-xs font-mono break-all">{lastResult.qrCode}</p>
                  <p className="text-slate-400 text-xs mt-1">Customer tracker updated in real-time.</p>
                </>
              )}
            </div>
            <button onClick={handleReset}
              className="mt-4 flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 transition-colors px-6 py-3 text-white font-semibold text-sm">
              <RefreshCw size={16} /> Scan Next Garment
            </button>
          </div>
        )}

        {/* ── ERROR ── */}
        {scanState === "error" && (
          <div className="flex flex-col items-center gap-5 py-10 text-center">
            <div className="rounded-full bg-red-500/20 p-5 ring-4 ring-red-500/30">
              <XCircle size={64} className="text-red-400" />
            </div>
            <div>
              <p className="text-red-300 text-xl font-bold">Scan Failed</p>
              <p className="text-slate-400 text-sm mt-2">
                {errorMessage || "QR code not recognised. Please try again."}
              </p>
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
