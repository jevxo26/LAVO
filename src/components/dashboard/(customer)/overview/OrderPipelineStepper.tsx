"use client";

import React from "react";
import Link from "next/link";
import {
  Package, Clock, RefreshCw, CheckCircle2, Award,
  Radio, ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ActiveOrder {
  id: string;
  orderNumber: string;
  grandTotal: number;
  orderStatus: string;
  totalGarments: number;
}

// ─── Pipeline config ──────────────────────────────────────────────────────────

const PIPELINE_STAGES = [
  { id: "PENDING",    label: "Placed",         icon: Package      },
  { id: "PICKUP",     label: "Picked Up",      icon: Clock        },
  { id: "PROCESSING", label: "Washing",        icon: RefreshCw    },
  { id: "READY",      label: "Quality Check",  icon: CheckCircle2 },
  { id: "DELIVERED",  label: "Delivered",      icon: Award        },
];

export function getStageIndex(status: string): number {
  const s = status.toUpperCase();
  if (s === "CANCELLED") return -1;
  if (s === "PENDING") return 0;
  if (s === "CONFIRMED" || s === "PICKUP") return 1;
  if (s === "PROCESSING" || s === "WASHING") return 2;
  if (s === "READY" || s === "READY_FOR_DELIVERY" || s === "DELIVERY") return 3;
  if (s === "COMPLETED" || s === "DELIVERED") return 4;
  return 0;
}

// ─── Component ────────────────────────────────────────────────────────────────

interface OrderPipelineStepperProps {
  order: ActiveOrder;
}

export function OrderPipelineStepper({ order }: OrderPipelineStepperProps) {
  const stageIdx = getStageIndex(order.orderStatus);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-3xl border border-border bg-card p-6 shadow-sm"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-2xl text-white shadow-md"
            style={{ background: "linear-gradient(135deg, var(--primary), var(--ring))" }}
          >
            <Radio size={20} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-card-foreground text-base">Active Order Status</h3>
              <span className="text-xs font-mono font-extrabold" style={{ color: "var(--primary)" }}>
                #{order.orderNumber}
              </span>
            </div>
            <p className="text-xs text-muted-foreground font-medium">
              {order.totalGarments} Garments · ৳{order.grandTotal.toFixed(2)}
            </p>
          </div>
        </div>

        <Link href={`/dashboard/track-orders?orderId=${order.id}`}>
          <Button
            className="h-9 px-4 rounded-xl text-white text-xs font-extrabold gap-1.5 shadow-sm transition-all hover:scale-[1.02]"
            style={{ background: "var(--foreground)" }}
          >
            View Full Live Map <ChevronRight size={14} />
          </Button>
        </Link>
      </div>

      {/* Stepper */}
      <div className="pt-6 pb-2 px-2">
        <div className="relative flex items-center justify-between">
          {/* Track */}
          <div className="absolute left-6 right-6 top-5 h-1 bg-border -z-0">
            <div
              className="h-full transition-all duration-700"
              style={{
                width: `${(stageIdx / (PIPELINE_STAGES.length - 1)) * 100}%`,
                background: "linear-gradient(90deg, var(--primary), var(--success))",
              }}
            />
          </div>

          {PIPELINE_STAGES.map((stage, idx) => {
            const isPassed  = idx <= stageIdx;
            const isCurrent = idx === stageIdx;
            const Icon      = stage.icon;

            return (
              <div key={stage.id} className="relative z-10 flex flex-col items-center">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-2xl border-2 transition-all duration-300"
                  style={{
                    borderColor: isCurrent ? "var(--primary)" : isPassed ? "var(--success)" : "var(--border)",
                    background:  isCurrent ? "var(--primary)" : isPassed ? "var(--success)" : "var(--card)",
                    color:       isCurrent || isPassed ? "white" : "var(--muted-foreground)",
                    boxShadow:   isCurrent ? "0 4px 16px color-mix(in srgb, var(--primary) 35%, transparent)" : "none",
                    transform:   isCurrent ? "scale(1.1)" : "scale(1)",
                  }}
                >
                  <Icon size={18} className={isCurrent ? "animate-spin" : ""} />
                </div>
                <span
                  className="mt-2 text-[11px] font-extrabold"
                  style={{
                    color: isCurrent
                      ? "var(--primary)"
                      : isPassed
                      ? "var(--card-foreground)"
                      : "var(--muted-foreground)",
                  }}
                >
                  {stage.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
