import { CheckCircle2, AlertCircle, Zap } from "lucide-react";
import { OrderDetails, TRACKING_STEPS } from "./types";

interface TrackingTimelineProps {
  order: OrderDetails;
  currentStepIndex: number;
  pct: number;
}

export function TrackingTimeline({ order, currentStepIndex, pct }: TrackingTimelineProps) {
  const isCancelled = order.orderStatus.toUpperCase() === "CANCELLED";

  return (
    <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">

      {/* Card header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50">
            {/* Shirt icon inline to avoid extra icon import in parent */}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600">
              <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.57a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.57a2 2 0 0 0-1.34-2.23z"/>
            </svg>
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-slate-900">Garment Tracker</h2>
            <p className="text-[11px] text-slate-400">
              Real-time status for{" "}
              <span className="font-semibold text-indigo-600">#{order.orderNumber}</span>
            </p>
          </div>
        </div>

        <span className={`self-start sm:self-auto inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-bold
          ${isCancelled
            ? "bg-rose-50 text-rose-700 border-rose-200"
            : "bg-indigo-50 text-indigo-700 border-indigo-200"}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${isCancelled ? "bg-rose-400" : "bg-indigo-400 animate-pulse"}`} />
          {order.orderStatus}
        </span>
      </div>

      {/* Progress bar */}
      {!isCancelled && (
        <div className="px-6 pt-4 pb-2">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold text-slate-500">Overall Progress</span>
            <span className="text-[11px] font-extrabold text-indigo-600">{pct}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
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
          <div className="flex flex-col items-center justify-center rounded-2xl border border-rose-100 bg-rose-50/40 py-12 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100">
              <AlertCircle size={26} className="text-rose-500" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">Order Cancelled</h3>
            <p className="mt-1.5 max-w-xs text-xs text-slate-500">
              This order was cancelled. Contact support if you believe this is an error.
            </p>
          </div>
        ) : (
          <div className="relative">
            {/* Vertical connector line */}
            <div className="absolute left-[15px] top-4 bottom-4 w-0.5 bg-slate-100 rounded-full" />

            <div className="space-y-0">
              {TRACKING_STEPS.map((step, idx) => {
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
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 shadow-md shadow-indigo-200 ring-4 ring-indigo-100">
                          <Zap size={13} className="text-white" fill="white" />
                        </div>
                      ) : isPassed ? (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-50 border-2 border-indigo-400">
                          <CheckCircle2 size={14} className="text-indigo-500" />
                        </div>
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 border-2 border-slate-200">
                          <span className="h-2 w-2 rounded-full bg-slate-300" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className={`min-w-0 flex-1 pt-1 pb-1
                      ${isCurrent ? "rounded-xl bg-indigo-50/60 border border-indigo-100 px-3 py-2.5 -ml-1" : ""}`}>
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className={`text-[13px] font-bold leading-tight
                          ${isCurrent ? "text-indigo-700" : isPassed ? "text-slate-800" : "text-slate-500"}`}>
                          {step.label}
                        </h4>
                        {isCurrent && (
                          <span className="rounded-full bg-indigo-600 px-2 py-0.5 text-[10px] font-bold text-white">
                            Current
                          </span>
                        )}
                        {log && (
                          <span className="text-[10px] text-slate-400 font-medium ml-auto">
                            {new Date(log.createdAt).toLocaleString()}
                          </span>
                        )}
                      </div>
                      <p className={`mt-0.5 text-xs leading-relaxed
                        ${isCurrent ? "text-indigo-600/80" : "text-slate-500"}`}>
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
  );
}
