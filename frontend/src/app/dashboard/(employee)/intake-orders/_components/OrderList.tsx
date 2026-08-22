"use client";

import { CheckCircle2, Inbox, Package, Shirt, Tag } from "lucide-react";
import { motion } from "framer-motion";
import { StatusPill } from "./StatusPill";
import { OrderCardSkeleton } from "./Skeletons";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Order {
  id: string; orderNumber: string; orderStatus: string;
  customerName: string; customerPhone: string; branch: string;
  totalGarments: number; qrGenerated: number; allQrDone: boolean;
  createdAt: string;
}

export type FilterTab = "pending" | "in_progress" | "all";

const TABS: { key: FilterTab; label: string }[] = [
  { key: "pending",     label: "Needs Tagging"  },
  { key: "in_progress", label: "All Tagged"     },
  { key: "all",         label: "All Orders"     },
];

// ─── Component ────────────────────────────────────────────────────────────────

interface OrderListProps {
  orders: Order[];
  filtered: Order[];
  loading: boolean;
  search: string;
  activeTab: FilterTab;
  selectedOrderId: string | null;
  pendingCount: number;
  inProgressCount: number;
  onTabChange: (tab: FilterTab) => void;
  onSelectOrder: (order: Order) => void;
}

export function OrderList({
  orders, filtered, loading, search, activeTab, selectedOrderId,
  pendingCount, inProgressCount, onTabChange, onSelectOrder,
}: OrderListProps) {
  const countFor = (key: FilterTab) =>
    key === "pending" ? pendingCount :
    key === "in_progress" ? inProgressCount :
    orders.length;

  return (
    <div className="space-y-3">
      {/* Section header */}
      <div className="flex items-center gap-3 px-1">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10"
          style={{ color: "var(--primary)" }}>
          <Package size={13} />
        </div>
        <h2 className="text-sm font-black text-card-foreground">Orders Awaiting Processing</h2>
        <span className="ml-auto rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-black text-muted-foreground">
          {loading ? "—" : filtered.length}
        </span>
      </div>

      {/* Filter tabs */}
      {!loading && (
        <div className="flex items-center gap-1.5 rounded-2xl bg-muted p-1">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-[11px] font-black transition-all ${
                activeTab === tab.key
                  ? "bg-card text-card-foreground shadow-sm"
                  : "text-muted-foreground hover:text-card-foreground"
              }`}
            >
              {tab.label}
              <span
                className="rounded-full px-1.5 py-0.5 text-[9px] font-black"
                style={activeTab === tab.key ? {
                  background: "color-mix(in srgb, var(--primary) 12%, transparent)",
                  color: "var(--primary)",
                } : undefined}
              >
                {countFor(tab.key)}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="space-y-3">{[0,1,2,3].map((i) => <OrderCardSkeleton key={i} />)}</div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card py-16 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/10"
            style={{ color: "var(--primary)" }}>
            <Inbox size={32} />
          </div>
          <p className="text-sm font-black text-card-foreground">
            {activeTab === "pending" ? "All orders tagged" :
             activeTab === "in_progress" ? "No fully tagged orders" : "No orders found"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground font-medium">
            {search ? "Try a different search term."
              : activeTab === "pending" ? "All garments in current orders have been QR tagged."
              : "No pickup-stage orders at the moment."}
          </p>
        </div>
      ) : (
        filtered.map((order) => (
          <motion.button
            key={order.id}
            whileHover={{ y: -2 }}
            onClick={() => onSelectOrder(order)}
            className={`w-full text-left rounded-3xl border p-5 transition-all duration-200 hover:shadow-md ${
              selectedOrderId === order.id
                ? "shadow-md ring-1"
                : "border-border bg-card shadow-sm hover:border-ring/40"
            }`}
            style={selectedOrderId === order.id ? {
              borderColor: "var(--primary)",
              background: "color-mix(in srgb, var(--primary) 5%, var(--card))",
            } : undefined}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[13px] font-black text-card-foreground font-mono">
                    #{order.orderNumber}
                  </span>
                  <StatusPill status={order.orderStatus} />
                  {order.allQrDone && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-success/25 bg-success/10 px-2 py-0.5 text-[10px] font-black text-success">
                      <CheckCircle2 size={10} /> All Tagged
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground font-medium">
                  {order.customerName} · {order.customerPhone}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[11px] text-muted-foreground">QR Progress</p>
                <p className="text-sm font-black text-card-foreground">
                  {order.qrGenerated}/{order.totalGarments}
                </p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: order.totalGarments > 0
                    ? `${(order.qrGenerated / order.totalGarments) * 100}%` : "0%",
                  background: order.allQrDone ? "var(--success)" : "var(--primary)",
                }}
              />
            </div>

            <div className="mt-2 flex items-center gap-4 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1"><Shirt size={11} /> {order.totalGarments} garments</span>
              <span className="flex items-center gap-1"><Tag size={11} /> {order.qrGenerated} tagged</span>
              <span className="flex items-center gap-1">
                <Package size={11} />
                {typeof order.branch === "string"
                  ? order.branch
                  : ((order.branch as any)?.branchName || (order.branch as any)?.name || "")}
              </span>
            </div>
          </motion.button>
        ))
      )}
    </div>
  );
}
