import { CheckCircle2, AlertCircle, Zap, Shirt, QrCode, Tag, Sparkles } from "lucide-react";
import {
  OrderDetails,
  getTrackingStepsForOrder,
  getStepIndexForOrder,
  progressPercentForOrder,
} from "./types";

interface TrackingTimelineProps {
  order: OrderDetails;
  currentStepIndex?: number;
  pct?: number;
}

export function TrackingTimeline({ order }: TrackingTimelineProps) {
  const isCancelled = order.orderStatus.toUpperCase() === "CANCELLED";

  // Dynamic service-specific steps for this order
  const trackingSteps = getTrackingStepsForOrder(order);
  const currentStepIndex = getStepIndexForOrder(order.orderStatus, trackingSteps);
  const pct = progressPercentForOrder(currentStepIndex, trackingSteps.length);

  // Service name summary
  const primaryServices = Array.from(
    new Set(
      (order.items || [])
        .map((i) => i.service?.serviceName)
        .filter(Boolean)
    )
  ).join(", ") || "Laundry Service";

  // Flatten garment items across services for live per-garment tracking
  const allGarments = (order.items || []).flatMap((item) =>
    (item.garmentItems || []).map((g) => ({
      ...g,
      serviceName: item.service?.serviceName || "Laundry Service",
      categoryName: item.service?.garmentType?.name || "Garment",
    }))
  );

  return (
    <div className="space-y-6">
      {/* ── Main Timeline Card ─────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden dark:bg-slate-900 dark:border-slate-800">

        {/* Card header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 dark:border-slate-800 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
              <Shirt size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">Garment Tracker</h2>
                <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 px-2 py-0.5 text-[10px] font-black text-blue-700 dark:text-blue-300">
                  <Sparkles size={10} /> {primaryServices}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Custom workflow timeline for{" "}
                <span className="font-bold text-indigo-600 dark:text-indigo-400">#{order.orderNumber}</span>
              </p>
            </div>
          </div>

          <span className={`self-start sm:self-auto inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-bold
            ${isCancelled
              ? "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300"
              : "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:border-indigo-800 dark:text-indigo-300"}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${isCancelled ? "bg-rose-400" : "bg-indigo-400 animate-pulse"}`} />
            {order.orderStatus}
          </span>
        </div>

        {/* Progress bar */}
        {!isCancelled && (
          <div className="px-6 pt-4 pb-2">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Service Progress ({trackingSteps.length} Stages)</span>
              <span className="text-[11px] font-extrabold text-indigo-600 dark:text-indigo-400">{pct}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-700"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        )}

        {/* Timeline body */}
        <div className="px-6 py-5">
          {isCancelled ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-rose-100 bg-rose-50/40 py-12 text-center dark:bg-rose-950/20 dark:border-rose-900/40">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 dark:bg-rose-900/50">
                <AlertCircle size={26} className="text-rose-500" />
              </div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">Order Cancelled</h3>
              <p className="mt-1.5 max-w-xs text-xs text-slate-500 dark:text-slate-400">
                This order was cancelled. Contact support if you believe this is an error.
              </p>
            </div>
          ) : (
            <div className="relative">
              {/* Vertical connector line */}
              <div className="absolute left-[15px] top-4 bottom-4 w-0.5 bg-slate-100 dark:bg-slate-800 rounded-full" />

              <div className="space-y-0">
                {trackingSteps.map((step, idx) => {
                  const isPassed  = idx <= currentStepIndex;
                  const isCurrent = idx === currentStepIndex;
                  const log = order.timelines.find(
                    (t) => t.status.toUpperCase() === step.key
                  );

                  return (
                    <div
                      key={step.key}
                      className={`relative flex gap-4 pb-6 last:pb-0 ${!isPassed ? "opacity-40" : ""}`}
                    >
                      {/* Dot */}
                      <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center">
                        {isCurrent ? (
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 shadow-md shadow-indigo-200 ring-4 ring-indigo-100 dark:ring-indigo-900">
                            <Zap size={13} className="text-white" fill="white" />
                          </div>
                        ) : isPassed ? (
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-50 border-2 border-indigo-400 dark:bg-indigo-950 dark:border-indigo-600">
                            <CheckCircle2 size={14} className="text-indigo-500 dark:text-indigo-400" />
                          </div>
                        ) : (
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 border-2 border-slate-200 dark:bg-slate-800 dark:border-slate-700">
                            <span className="h-2 w-2 rounded-full bg-slate-300 dark:bg-slate-600" />
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className={`min-w-0 flex-1 pt-1 pb-1
                        ${isCurrent ? "rounded-xl bg-indigo-50/60 border border-indigo-100 dark:bg-indigo-950/40 dark:border-indigo-800 px-3 py-2.5 -ml-1" : ""}`}>
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className={`text-[13px] font-bold leading-tight
                            ${isCurrent ? "text-indigo-700 dark:text-indigo-300" : isPassed ? "text-slate-800 dark:text-slate-200" : "text-slate-500 dark:text-slate-400"}`}>
                            {step.label}
                          </h4>
                          {isCurrent && (
                            <span className="rounded-full bg-indigo-600 px-2 py-0.5 text-[10px] font-bold text-white">
                              Current Stage
                            </span>
                          )}
                          {log && (
                            <span className="text-[10px] text-slate-400 font-medium ml-auto">
                              {new Date(log.createdAt).toLocaleString()}
                            </span>
                          )}
                        </div>
                        <p className={`mt-0.5 text-xs leading-relaxed
                          ${isCurrent ? "text-indigo-600/80 dark:text-indigo-300/80" : "text-slate-500 dark:text-slate-400"}`}>
                          {log?.description || step.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Per-Garment / Service Progress Breakdown ───────────────────────── */}
      {allGarments.length > 0 && !isCancelled && (
        <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden dark:bg-slate-900 dark:border-slate-800">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                <Shirt size={15} />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Itemized Garment Stages</h3>
                <p className="text-[11px] text-slate-400">Live processing status per garment &amp; QR label</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 dark:bg-indigo-950/50 px-2.5 py-0.5 text-[10px] font-extrabold text-indigo-700 dark:text-indigo-300">
              <Tag size={10} /> {allGarments.length} Tagged Items
            </span>
          </div>

          <div className="divide-y divide-slate-50 dark:divide-slate-800 px-6 py-2">
            {allGarments.map((garment) => (
              <div key={garment.id} className="py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    <Shirt size={14} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{garment.garmentName}</p>
                      <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 px-1.5 py-0.5 text-[9px] font-extrabold text-blue-700 dark:text-blue-300">
                        <Sparkles size={9} /> {garment.serviceName}
                      </span>
                    </div>
                    {garment.qrCodeRecord && (
                      <p className="text-[10px] text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                        <QrCode size={10} /> {garment.qrCodeRecord.qrCode}
                      </p>
                    )}
                  </div>
                </div>

                <div className="shrink-0">
                  <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-extrabold
                    ${garment.status?.toUpperCase() === "READY_FOR_DELIVERY" || garment.status?.toUpperCase() === "DELIVERED"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
                      : "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800"}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${
                      garment.status?.toUpperCase() === "READY_FOR_DELIVERY" ? "bg-emerald-500" : "bg-indigo-500 animate-pulse"
                    }`} />
                    {garment.status ? garment.status.replace(/_/g, " ") : "RECEIVED"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
