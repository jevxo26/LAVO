"use client";

import {
  CheckCircle2, ScanLine, Loader2, RefreshCw, ArrowLeft,
  XCircle, LockKeyhole, Shirt, Sparkles, Tag, Package,
} from "lucide-react";
import { QrScanner }        from "@/components/shared/scanner/QrScanner";
import { useScannerLogic }  from "@/components/shared/scanner/ScannerUI";
import Link from "next/link";

// ─── Stage label map ──────────────────────────────────────────────────────────

const STAGE_META: Record<string, { label: string; color: string }> = {
  PROCESSING:         { label: "Sorting & Prep",     color: "from-amber-500   to-orange-500"   },
  WASHING:            { label: "Washing",             color: "from-blue-500    to-cyan-500"     },
  DRYING:             { label: "Drying",              color: "from-orange-400  to-amber-500"    },
  IRONING:            { label: "Ironing & Pressing",  color: "from-violet-500  to-purple-600"   },
  FOLDING:            { label: "Folding & Packing",   color: "from-pink-500    to-rose-500"     },
  READY_FOR_DELIVERY: { label: "Ready for Delivery",  color: "from-emerald-500 to-green-600"    },
  DRY_CLEANING:       { label: "Dry Cleaning",        color: "from-sky-500     to-blue-600"     },
  PRESSING:           { label: "Pressing",            color: "from-indigo-500  to-violet-600"   },
  STAIN_TREATMENT:    { label: "Stain Treatment",     color: "from-red-500     to-rose-600"     },
  COLLECTED:          { label: "Collected",           color: "from-slate-500   to-slate-600"    },
};

const DEFAULT_STAGES = ["PROCESSING","WASHING","DRYING","IRONING","FOLDING","READY_FOR_DELIVERY"];
const COMPLETED_STAGES = ["READY_FOR_DELIVERY","OUT_FOR_DELIVERY","DELIVERED","COMPLETED"];
const HIERARCHY = [
  "PENDING","CONFIRMED","COLLECTED","PROCESSING",
  "STAIN_TREATMENT","DRY_CLEANING","WASHING","DRYING",
  "PRESSING","IRONING","FOLDING","READY_FOR_DELIVERY",
  "OUT_FOR_DELIVERY","DELIVERED","COMPLETED",
];

// ─── Scanner dark shell ───────────────────────────────────────────────────────
// Intentionally full-screen dark for mobile warehouse scanning environment.
// Uses CSS variables for primary/secondary so it adapts to the app's theme
// while keeping the high-contrast dark base.

const SHELL_BG: React.CSSProperties = {
  background: [
    "radial-gradient(ellipse 80% 80% at 90% 10%, color-mix(in srgb, var(--primary) 35%, transparent) 0%, transparent 55%)",
    "radial-gradient(ellipse 60% 60% at 10% 90%, color-mix(in srgb, var(--secondary) 25%, transparent) 0%, transparent 50%)",
    "linear-gradient(135deg, color-mix(in srgb, var(--primary) 10%, #0f172a) 0%, #0f172a 50%, color-mix(in srgb, var(--secondary) 8%, #0f172a) 100%)",
  ].join(", "),
};

interface Props { user: any }

export function ScannerView({ user }: Props) {
  const isAgent = user?.userType === "DELIVERY_AGENT";

  const {
    scanState, lastResult, key, pendingCode, errorMessage, currentGarmentStatus,
    scannedServiceName, scannedOrderNumber, scannedGarmentName, serviceStages,
    handleScanSuccess, handleScanFailure, handleStatusSelect, handleReset,
  } = useScannerLogic(user);

  const stagesToShow: string[] = isAgent
    ? ["COLLECTED"]
    : serviceStages.length > 0 ? serviceStages : DEFAULT_STAGES;

  return (
    <div
      className="min-h-screen relative flex flex-col items-center justify-start px-4 py-10 gap-6"
      style={SHELL_BG}
    >
      {/* Back */}
      <Link href="/dashboard"
        className="absolute top-6 left-6 flex items-center gap-2 text-sm font-bold transition-colors text-white/50 hover:text-white">
        <ArrowLeft size={18} /> Back
      </Link>

      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 mb-2 text-sm font-black tracking-widest uppercase"
          style={{ color: "color-mix(in srgb, var(--primary) 70%, white)" }}>
          <ScanLine size={16} />
          LAVO {user?.userType ? user.userType.replace(/_/g, " ") : "EMPLOYEE"} SCANNER
        </div>
        <h1 className="text-3xl font-black text-white">Scan Garment QR</h1>
        <p className="text-white/40 mt-1 text-sm">
          Signed in as <span className="font-bold" style={{ color: "color-mix(in srgb, var(--primary) 70%, white)" }}>{user?.fullName}</span>
        </p>
      </div>

      <div className="w-full max-w-sm space-y-4">

        {/* ── IDLE: Scanner ── */}
        {scanState === "idle" && (
          <QrScanner
            key={key}
            onScanSuccess={handleScanSuccess}
            onScanFailure={handleScanFailure}
            fps={12}
            qrbox={240}
          />
        )}

        {/* ── SELECT STATUS ── */}
        {scanState === "select_status" && (() => {
          const isFullyDone = currentGarmentStatus &&
            COMPLETED_STAGES.includes(currentGarmentStatus.toUpperCase());

          if (isFullyDone) return (
            <div className="flex flex-col items-center gap-5 py-10 text-center rounded-2xl p-6 border"
              style={{
                background: "color-mix(in srgb, var(--error) 10%, transparent)",
                borderColor: "color-mix(in srgb, var(--error) 30%, transparent)",
              }}>
              <div className="rounded-full p-5 ring-4"
                style={{
                  background: "color-mix(in srgb, var(--error) 15%, transparent)",
                  ringColor: "color-mix(in srgb, var(--error) 30%, transparent)",
                }}>
                <LockKeyhole size={56} style={{ color: "color-mix(in srgb, var(--error) 70%, white)" }} />
              </div>
              <div>
                <p className="text-2xl font-black tracking-wide" style={{ color: "color-mix(in srgb, var(--error) 70%, white)" }}>
                  Already Completed
                </p>
                <p className="text-white/60 text-sm mt-1">
                  This garment has already reached{" "}
                  <span className="font-black text-white">{currentGarmentStatus.replace(/_/g, " ")}</span>.
                </p>
                <p className="text-white/30 text-xs mt-1">No further stage scans are allowed.</p>
                <p className="text-white/20 text-xs mt-3 font-mono break-all">{pendingCode}</p>
              </div>
              <button onClick={handleReset}
                className="mt-2 flex items-center gap-2 rounded-xl px-6 py-3 text-white font-black text-sm transition-colors"
                style={{ background: "color-mix(in srgb, white 10%, transparent)", border: "1px solid color-mix(in srgb, white 20%, transparent)" }}>
                <RefreshCw size={16} /> Scan Another
              </button>
            </div>
          );

          return (
            <div className="flex flex-col gap-3">

              {/* Garment Info Card */}
              <div className="rounded-2xl p-4 space-y-2.5 border"
                style={{
                  background: "color-mix(in srgb, var(--primary) 12%, transparent)",
                  borderColor: "color-mix(in srgb, var(--primary) 30%, transparent)",
                }}>
                <div className="flex items-center gap-2">
                  <Sparkles size={13} style={{ color: "color-mix(in srgb, var(--primary) 70%, white)" }} />
                  <span className="text-[10px] font-black uppercase tracking-widest"
                    style={{ color: "color-mix(in srgb, var(--primary) 70%, white)" }}>
                    Scanned Garment
                  </span>
                </div>
                <div className="space-y-1.5">
                  {scannedGarmentName && (
                    <div className="flex items-center gap-2">
                      <Shirt size={14} className="text-white/40 shrink-0" />
                      <span className="text-sm font-black text-white">{scannedGarmentName}</span>
                    </div>
                  )}
                  {scannedServiceName && (
                    <div className="flex items-center gap-2">
                      <Sparkles size={13} className="shrink-0" style={{ color: "color-mix(in srgb, var(--secondary) 70%, white)" }} />
                      <span className="text-xs font-bold" style={{ color: "color-mix(in srgb, var(--secondary) 70%, white)" }}>
                        Service: {scannedServiceName}
                      </span>
                    </div>
                  )}
                  {scannedOrderNumber && (
                    <div className="flex items-center gap-2">
                      <Package size={13} className="text-white/30 shrink-0" />
                      <span className="text-xs text-white/40 font-mono">Order #{scannedOrderNumber}</span>
                    </div>
                  )}
                  {currentGarmentStatus && (
                    <div className="flex items-center gap-2">
                      <Tag size={13} className="shrink-0" style={{ color: "color-mix(in srgb, var(--warning) 70%, white)" }} />
                      <span className="text-xs font-bold" style={{ color: "color-mix(in srgb, var(--warning) 70%, white)" }}>
                        Current Stage: {currentGarmentStatus.replace(/_/g, " ")}
                      </span>
                    </div>
                  )}
                  <p className="text-[10px] text-white/20 font-mono break-all">{pendingCode}</p>
                </div>
              </div>

              {/* Stage label */}
              <p className="text-white font-black text-center text-sm">
                {scannedServiceName
                  ? `Select stage for "${scannedServiceName}":`
                  : "Select current processing stage:"}
              </p>

              {/* Stage buttons */}
              <div className="space-y-2">
                {stagesToShow.map((s) => {
                  const currentLevel = currentGarmentStatus
                    ? HIERARCHY.indexOf(currentGarmentStatus.toUpperCase()) : -1;
                  const buttonLevel  = HIERARCHY.indexOf(s.toUpperCase());
                  const isAlreadyDone = currentLevel !== -1 && buttonLevel !== -1 && buttonLevel <= currentLevel;
                  const meta = STAGE_META[s] ?? { label: s.replace(/_/g, " "), color: "from-slate-500 to-slate-600" };

                  return (
                    <button
                      key={s}
                      onClick={() => !isAlreadyDone && handleStatusSelect(s)}
                      disabled={isAlreadyDone}
                      className={`w-full rounded-xl border font-bold py-3.5 text-sm transition-all flex items-center gap-3 px-4 ${
                        isAlreadyDone
                          ? "cursor-not-allowed opacity-40"
                          : "hover:scale-[1.01]"
                      }`}
                      style={isAlreadyDone ? {
                        background: "color-mix(in srgb, white 5%, transparent)",
                        borderColor: "color-mix(in srgb, white 10%, transparent)",
                        color: "rgba(255,255,255,0.3)",
                      } : {
                        background: "color-mix(in srgb, var(--primary) 15%, transparent)",
                        borderColor: "color-mix(in srgb, var(--primary) 35%, transparent)",
                        color: "color-mix(in srgb, var(--primary) 80%, white)",
                      }}
                    >
                      {isAlreadyDone ? (
                        <LockKeyhole size={15} className="shrink-0 opacity-30" />
                      ) : (
                        <span className={`shrink-0 w-2.5 h-2.5 rounded-full bg-gradient-to-br ${meta.color}`} />
                      )}
                      <div className="flex-1 text-left">
                        <span className={`font-black text-sm ${isAlreadyDone ? "line-through opacity-30" : ""}`}>
                          {meta.label}
                        </span>
                        {isAlreadyDone && (
                          <span className="block text-[10px] opacity-30 font-medium">Already completed</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              <button onClick={handleReset}
                className="text-white/25 text-xs text-center mt-1 hover:text-white/60 transition-colors">
                ← Cancel &amp; Scan Again
              </button>
            </div>
          );
        })()}

        {/* ── LOADING ── */}
        {scanState === "loading" && (
          <div className="flex flex-col items-center justify-center gap-4 py-20">
            <Loader2 size={56} className="animate-spin" style={{ color: "color-mix(in srgb, var(--primary) 70%, white)" }} />
            <p className="text-white/60 text-lg font-bold">Saving to database…</p>
          </div>
        )}

        {/* ── SUCCESS ── */}
        {scanState === "success" && lastResult && (
          <div className="flex flex-col items-center gap-5 py-10 text-center">
            <div className="rounded-full p-5 ring-4"
              style={{
                background: "color-mix(in srgb, var(--success) 15%, transparent)",
                ringColor: "color-mix(in srgb, var(--success) 30%, transparent)",
              }}>
              <CheckCircle2 size={64} style={{ color: "color-mix(in srgb, var(--success) 70%, white)" }} />
            </div>
            <div className="space-y-2">
              {lastResult.status === "READY_FOR_DELIVERY" ? (
                <>
                  <p className="text-2xl font-black tracking-wide" style={{ color: "color-mix(in srgb, var(--success) 70%, white)" }}>
                    All Done
                  </p>
                  <p className="text-white/60 text-sm">
                    Stage → <span className="text-white font-black">READY FOR DELIVERY</span>
                  </p>
                  <p className="text-white/40 text-xs">Garment fully processed and ready for drop-off.</p>
                </>
              ) : (
                <>
                  <p className="text-xl font-black" style={{ color: "color-mix(in srgb, var(--success) 70%, white)" }}>
                    Stage Updated
                  </p>
                  <p className="text-white/60 text-sm">
                    {lastResult.garmentName && <span className="text-white font-black">{lastResult.garmentName} → </span>}
                    <span className="font-black" style={{ color: "color-mix(in srgb, var(--success) 70%, white)" }}>
                      {STAGE_META[lastResult.status]?.label ?? lastResult.status.replace(/_/g, " ")}
                    </span>
                  </p>
                  {lastResult.serviceName && (
                    <p className="text-xs font-bold" style={{ color: "color-mix(in srgb, var(--primary) 70%, white)" }}>
                      Service: {lastResult.serviceName}
                    </p>
                  )}
                  {lastResult.orderNumber && (
                    <p className="text-white/30 text-xs">Order #{lastResult.orderNumber}</p>
                  )}
                  <p className="text-white/20 text-xs font-mono break-all">{lastResult.qrCode}</p>
                  <p className="text-white/40 text-xs mt-1">Customer tracker updated in real-time.</p>
                </>
              )}
            </div>
            <button onClick={handleReset}
              className="mt-4 flex items-center gap-2 rounded-xl px-6 py-3 text-white font-black text-sm transition-all hover:scale-[1.02]"
              style={{ background: "linear-gradient(135deg, var(--primary), var(--ring))" }}>
              <RefreshCw size={16} /> Scan Next Garment
            </button>
          </div>
        )}

        {/* ── ERROR ── */}
        {scanState === "error" && (
          <div className="flex flex-col items-center gap-5 py-10 text-center">
            <div className="rounded-full p-5 ring-4"
              style={{
                background: "color-mix(in srgb, var(--error) 15%, transparent)",
                ringColor: "color-mix(in srgb, var(--error) 30%, transparent)",
              }}>
              <XCircle size={64} style={{ color: "color-mix(in srgb, var(--error) 70%, white)" }} />
            </div>
            <div>
              <p className="text-xl font-black" style={{ color: "color-mix(in srgb, var(--error) 70%, white)" }}>
                Scan Failed
              </p>
              <p className="text-white/50 text-sm mt-2">
                {errorMessage || "QR code not recognised. Please try again."}
              </p>
            </div>
            <button onClick={handleReset}
              className="mt-4 flex items-center gap-2 rounded-xl px-6 py-3 text-white font-black text-sm transition-colors"
              style={{ background: "color-mix(in srgb, white 10%, transparent)", border: "1px solid color-mix(in srgb, white 20%, transparent)" }}>
              <RefreshCw size={16} /> Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
