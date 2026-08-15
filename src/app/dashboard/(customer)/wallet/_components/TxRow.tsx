"use client";

import React from "react";
import { ArrowUpRight, ArrowDownLeft } from "lucide-react";

export interface Transaction {
  id: string;
  transactionType: string;
  amount: number;
  referenceType?: string;
  referenceId?: string;
  paymentMethod?: string;
  status: string;
  createdAt: string;
}

export function isCredit(type: string) {
  return ["DEPOSIT", "REFUND"].includes((type ?? "").toUpperCase());
}

// Human-readable labels for raw enum values
const TX_TYPE_LABELS: Record<string, string> = {
  DEPOSIT:          "Wallet Top-Up",
  REFUND:           "Refund",
  ORDER_PAYMENT:    "Order Payment",
  WITHDRAWAL:       "Withdrawal",
  CASHBACK:         "Cashback Reward",
  ADJUSTMENT:       "Manual Adjustment",
  LOYALTY_REDEEM:   "Points Redemption",
};

const TX_METHOD_LABELS: Record<string, string> = {
  WALLET:           "Wallet",
  SSLCOMMERZ:       "SSLCommerz",
  BKASH:            "bKash",
  NAGAD:            "Nagad",
  ROCKET:           "Rocket",
  CARD:             "Card",
  CASH:             "Cash on Delivery",
};

function txLabel(type: string): string {
  return TX_TYPE_LABELS[(type ?? "").toUpperCase()] ?? type;
}

function methodLabel(method?: string): string {
  if (!method) return "Wallet";
  return TX_METHOD_LABELS[method.toUpperCase()] ?? method;
}

function txStatusStyle(status: string): { cls: string; dot: string } {
  switch ((status ?? "").toUpperCase()) {
    case "COMPLETED": return { cls: "bg-success/10 text-success border-success/25",       dot: "bg-success"             };
    case "PENDING":   return { cls: "bg-warning/10 text-warning border-warning/25",       dot: "bg-warning"             };
    case "FAILED":
    case "CANCELLED": return { cls: "bg-error/10 text-error border-error/25",             dot: "bg-error"               };
    default:          return { cls: "bg-muted text-muted-foreground border-border",       dot: "bg-muted-foreground/50" };
  }
}

function fmtTxDate(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export function TxRow({ tx }: { tx: Transaction }) {
  const credit       = isCredit(tx.transactionType);
  const { cls, dot } = txStatusStyle(tx.status);

  return (
    <div className="flex items-center gap-4 px-6 py-4 hover:bg-muted/40 transition-colors">
      {/* Type icon */}
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border ${
        credit
          ? "bg-success/10 text-success border-success/20"
          : "bg-error/10 text-error border-error/20"
      }`}>
        {credit ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
      </div>

      {/* Description + mobile meta */}
      <div className="min-w-0 flex-1">
        <p className="text-xs sm:text-sm font-black text-card-foreground leading-tight">
          {txLabel(tx.transactionType)}
        </p>
        <p className="text-[11px] font-extrabold text-muted-foreground uppercase tracking-wide mt-0.5">
          {methodLabel(tx.paymentMethod)}
          {tx.referenceType && ` · ${tx.referenceType}`}
        </p>
        {/* Mobile-only: date + status inline */}
        <div className="flex items-center gap-2 mt-1 sm:hidden">
          <span className="text-[10px] text-muted-foreground font-medium">
            {fmtTxDate(tx.createdAt)}
          </span>
          <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-black ${cls}`}>
            <span className={`h-1 w-1 rounded-full ${dot}`} />
            {tx.status}
          </span>
        </div>
      </div>

      {/* Reference ID — desktop only */}
      <div className="hidden sm:block text-right shrink-0">
        <p className="font-mono text-xs font-black text-muted-foreground">{tx.referenceId || "—"}</p>
      </div>

      {/* Date — desktop only */}
      <div className="hidden md:block text-right shrink-0">
        <p className="text-xs font-medium text-muted-foreground">
          {fmtTxDate(tx.createdAt)}
        </p>
      </div>

      {/* Status badge — desktop only */}
      <span className={`hidden sm:inline-flex items-center gap-1.5 shrink-0 rounded-full border px-3 py-0.5 text-[10px] font-black ${cls}`}>
        <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
        {tx.status}
      </span>

      {/* Amount */}
      <p className={`shrink-0 text-base font-black ${credit ? "text-success" : "text-card-foreground"}`}>
        {credit ? "+" : "−"}৳{(tx.amount ?? 0).toFixed(2)}
      </p>
    </div>
  );
}
