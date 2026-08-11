"use client";

import React from "react";
import Link from "next/link";
import { ShoppingBag, Calendar, Clock, Radio, ArrowRight, Shirt } from "lucide-react";
import { Button } from "@/components/ui/button";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface OrderRecord {
  id: string;
  orderNumber: string;
  grandTotal: number;
  orderStatus: string;
  paymentStatus: string;
  createdAt: string;
  totalGarments: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function orderStatusStyle(status: string): { cls: string; dot: string } {
  switch (status.toUpperCase()) {
    case "PENDING":
      return { cls: "bg-warning/10 text-warning border-warning/25", dot: "bg-warning animate-pulse" };
    case "CONFIRMED":
      return { cls: "bg-primary/10 text-primary border-primary/25", dot: "bg-primary" };
    case "PROCESSING":
    case "WASHING":
    case "PICKUP":
      return { cls: "bg-primary/10 text-primary border-primary/25", dot: "bg-primary animate-pulse" };
    case "READY":
    case "READY_FOR_DELIVERY":
      return { cls: "bg-secondary/10 text-secondary border-secondary/25", dot: "bg-secondary animate-pulse" };
    case "DELIVERY":
      return { cls: "bg-secondary/10 text-secondary border-secondary/25", dot: "bg-secondary animate-pulse" };
    case "COMPLETED":
      return { cls: "bg-success/10 text-success border-success/25", dot: "bg-success" };
    case "CANCELLED":
      return { cls: "bg-error/10 text-error border-error/25", dot: "bg-error" };
    default:
      return { cls: "bg-muted text-muted-foreground border-border", dot: "bg-muted-foreground/50" };
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

interface RecentOrdersListProps {
  orders: OrderRecord[];
}

export function RecentOrdersList({ orders }: RecentOrdersListProps) {
  return (
    <div className="md:col-span-4 rounded-3xl border border-border bg-card shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-6 py-5">
        <div className="flex items-center gap-3">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10"
            style={{ color: "var(--primary)" }}
          >
            <ShoppingBag size={18} />
          </div>
          <div>
            <h3 className="text-sm font-black text-card-foreground">Recent Laundry Orders</h3>
            <p className="text-[11px] text-muted-foreground font-medium">Order history &amp; instant tracking</p>
          </div>
        </div>
        <Link href="/dashboard/my-orders">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 rounded-xl text-xs font-extrabold gap-1 hover:bg-primary/10"
            style={{ color: "var(--primary)" }}
          >
            View All <ArrowRight size={13} />
          </Button>
        </Link>
      </div>

      {/* Body */}
      <div className="p-5">
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/10">
              <ShoppingBag size={28} style={{ color: "var(--primary)" }} />
            </div>
            <p className="text-base font-extrabold text-card-foreground">No orders yet</p>
            <p className="mt-1 text-xs text-muted-foreground max-w-xs">
              Schedule your first laundry pickup today and let our experts take care of your clothes.
            </p>
            <Link href="/dashboard/book-services">
              <Button
                className="mt-4 rounded-2xl text-white text-xs font-black gap-2 shadow-lg px-6 py-2.5"
                style={{ background: "linear-gradient(135deg, var(--primary), var(--ring))" }}
              >
                <Shirt size={15} /> Book First Service
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => {
              const { cls, dot } = orderStatusStyle(order.orderStatus);
              const paid = order.paymentStatus === "PAID";
              return (
                <div
                  key={order.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between rounded-2xl border border-border p-4 hover:border-ring/40 hover:bg-muted/30 transition-all gap-3"
                >
                  {/* Left */}
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-black text-card-foreground font-mono">
                        #{order.orderNumber}
                      </span>
                      <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-extrabold ${cls}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
                        {order.orderStatus}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-extrabold ${
                          paid
                            ? "bg-success/10 text-success border-success/25"
                            : "bg-error/10 text-error border-error/25"
                        }`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${paid ? "bg-success" : "bg-error"}`} />
                        {order.paymentStatus}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground font-medium">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {new Date(order.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} /> {order.totalGarments} garments
                      </span>
                    </div>
                  </div>

                  {/* Right */}
                  <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                    <p className="text-lg font-black text-card-foreground">
                      ৳{order.grandTotal.toFixed(2)}
                    </p>
                    <Link href={`/dashboard/track-orders?orderId=${order.id}`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-9 rounded-xl text-xs font-extrabold border-primary/25 hover:bg-primary hover:text-white hover:border-primary transition-all gap-1.5 shadow-sm"
                        style={{ color: "var(--primary)" }}
                      >
                        <Radio size={13} /> Live Track
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
