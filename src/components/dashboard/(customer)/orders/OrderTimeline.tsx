import {
  ClipboardList,
  CheckCircle2,
  Truck,
  Shirt,
  Zap,
  Star,
  type LucideIcon,
} from "lucide-react";
import { TIMELINE_STEPS, getTimelineStep } from "./types";

const ICON_MAP: Record<string, LucideIcon> = {
  clipboard: ClipboardList,
  check:     CheckCircle2,
  truck:     Truck,
  shirt:     Shirt,
  zap:       Zap,
  star:      Star,
};

interface OrderTimelineProps {
  status: string;
}

export function OrderTimeline({ status }: OrderTimelineProps) {
  const activeStep = getTimelineStep(status);
  const isCancelled = status.toUpperCase() === "CANCELLED";

  if (isCancelled) {
    return (
      <div className="flex items-center gap-2.5 rounded-xl bg-rose-50 border border-rose-100 px-4 py-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose-100">
          <span className="text-rose-500 text-sm font-bold">✕</span>
        </div>
        <div>
          <p className="text-xs font-bold text-rose-700">Order Cancelled</p>
          <p className="text-[11px] text-rose-400">This order has been cancelled.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Desktop: horizontal stepper */}
      <div className="hidden sm:flex items-center w-full">
        {TIMELINE_STEPS.map((step, idx) => {
          const Icon = ICON_MAP[step.icon];
          const done    = idx < activeStep;
          const current = idx === activeStep;
          const future  = idx > activeStep;

          return (
            <div key={step.key} className="flex flex-1 items-center">
              {/* Step node */}
              <div className="flex flex-col items-center shrink-0">
                <div
                  className={`
                    flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all
                    ${done    ? "border-indigo-500 bg-indigo-500 text-white"       : ""}
                    ${current ? "border-indigo-500 bg-white text-indigo-600 shadow-md shadow-indigo-100" : ""}
                    ${future  ? "border-slate-200 bg-slate-50 text-slate-300"      : ""}
                  `}
                >
                  {done ? (
                    <CheckCircle2 size={14} className="fill-white text-white" />
                  ) : (
                    <Icon size={13} />
                  )}
                </div>
                <p className={`mt-1.5 text-[10px] font-semibold text-center leading-tight whitespace-nowrap ${
                  done || current ? "text-indigo-600" : "text-slate-400"
                }`}>
                  {step.label}
                </p>
              </div>

              {/* Connector line (not after last) */}
              {idx < TIMELINE_STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-1.5 mb-5 rounded-full transition-all ${
                  idx < activeStep ? "bg-indigo-500" : "bg-slate-200"
                }`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile: compact pill list */}
      <div className="flex sm:hidden gap-1.5 flex-wrap">
        {TIMELINE_STEPS.map((step, idx) => {
          const done    = idx < activeStep;
          const current = idx === activeStep;

          return (
            <span
              key={step.key}
              className={`
                rounded-full px-2.5 py-1 text-[11px] font-semibold border
                ${done    ? "bg-indigo-100 text-indigo-700 border-indigo-200"  : ""}
                ${current ? "bg-indigo-600 text-white border-indigo-600"       : ""}
                ${!done && !current ? "bg-slate-50 text-slate-400 border-slate-200" : ""}
              `}
            >
              {step.label}
            </span>
          );
        })}
      </div>
    </div>
  );
}
