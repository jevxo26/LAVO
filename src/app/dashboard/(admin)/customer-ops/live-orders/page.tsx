"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { z } from "zod";
import { Radio, Wifi, WifiOff } from "lucide-react";
import { authFetch } from "@/lib/api";
import { AdminCrudPage } from "@/components/shared/admin-crud";
import { type CrudModuleConfig } from "@/components/shared/admin-crud";
import { DashboardPageHero } from "@/components/shared/DashboardPageHero";
import { PageHeader } from "@/components/shared/PageHeader";
import { motion } from "framer-motion";

// ─── Types ────────────────────────────────────────────────────────────────────

interface LiveOrder {
  id:          string;
  orderNumber: string;
  customer:    string;
  serviceType: string;
  branch:      string;
  garments:    number;
  amount:      string;
  status:      string;
}

// ─── Status filter tabs ───────────────────────────────────────────────────────

const STATUS_TABS = [
  { label: "All",        value: "ALL",        dot: "bg-muted-foreground"         },
  { label: "Pending",    value: "PENDING",    dot: "bg-warning animate-pulse"    },
  { label: "Processing", value: "PROCESSING", dot: "bg-primary animate-pulse"    },
  { label: "Delivery",   value: "DELIVERY",   dot: "bg-secondary animate-pulse"  },
  { label: "Completed",  value: "COMPLETED",  dot: "bg-success"                  },
  { label: "Cancelled",  value: "CANCELLED",  dot: "bg-error"                    },
];

// ─── Config factory ───────────────────────────────────────────────────────────

function makeConfig(data: LiveOrder[]): CrudModuleConfig<LiveOrder> {
  return {
    title:             "Live Orders",
    description:       "Real-time order tracking, garment status and branch assignment",
    createLabel:       "New Order",
    searchPlaceholder: "Search by order ID, customer or branch…",
    emptyTitle:        "No orders found",
    emptyDescription:  "No active orders match the current filter.",
    endpoint:          "/customer-ops/live-orders",
    data,
    columns: [
      { accessorKey: "orderNumber", header: "Order ID",    kind: "id"      },
      { accessorKey: "customer",    header: "Customer"                      },
      { accessorKey: "serviceType", header: "Service"                       },
      { accessorKey: "branch",      header: "Branch / Hub"                  },
      { accessorKey: "garments",    header: "Garments"                      },
      { accessorKey: "amount",      header: "Amount",      kind: "currency" },
      { accessorKey: "status",      header: "Status",      kind: "status"   },
    ],
    schema: z.object({
      orderNumber: z.string().min(1),
      customer:    z.string().min(1),
      serviceType: z.string().min(1),
      branch:      z.string().min(1),
      garments:    z.coerce.number().min(0),
      amount:      z.string().min(1),
      status:      z.string().min(1),
    }),
    fields: [
      { name: "orderNumber", label: "Order ID",    placeholder: "e.g. ORD-0001"         },
      { name: "customer",    label: "Customer",    placeholder: "Full name"              },
      { name: "serviceType", label: "Service",     placeholder: "e.g. Dry Clean & Wash" },
      { name: "branch",      label: "Branch",      placeholder: "e.g. Central Hub"      },
      { name: "garments",    label: "Garments",    type: "number", placeholder: "0"     },
      { name: "amount",      label: "Amount (৳)",  placeholder: "0.00"                  },
      { name: "status",      label: "Status",      options: ["PENDING","PROCESSING","PICKUP","DELIVERY","COMPLETED","CANCELLED"] },
    ],
    getRowLabel: (row) => row.orderNumber,
  };
}

// ─── Data mapper ──────────────────────────────────────────────────────────────

function mapOrder(o: any): LiveOrder {
  return {
    id:          o.id,
    orderNumber: o.orderNumber ?? o.id?.slice(0, 8),
    customer:    o.customer?.user?.fullName ?? o.customerName ?? "—",
    serviceType: o.serviceType ?? o.orderType ?? "Standard Laundry",
    branch:      o.branch?.branchName ?? o.branch?.name ?? "—",
    garments:    o.totalGarments ?? o.itemsCount ?? 0,
    amount:      `৳ ${o.grandTotal ?? o.payableAmount ?? "0.00"}`,
    status:      o.orderStatus ?? o.status ?? "PENDING",
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LiveOrdersPage() {
  const [allOrders, setAllOrders] = useState<LiveOrder[]>([]);
  const [activeTab, setActiveTab] = useState("ALL");
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<any>(null);

  const fetchOrders = useCallback(() => {
    authFetch("/customer-ops/live-orders")
      .then((r) => r.json())
      .then((res) => {
        if (res?.success && Array.isArray(res.data)) {
          setAllOrders(res.data.map(mapOrder));
        }
      })
      .catch(() => {});
  }, []);

  // Initial fetch + Socket.IO live subscription
  useEffect(() => {
    fetchOrders();

    let socket: any;
    try {
      const io = require("socket.io-client");
      socket = io(process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000", {
        transports: ["websocket"],
      });
      socketRef.current = socket;

      socket.on("connect",             () => setConnected(true));
      socket.on("disconnect",          () => setConnected(false));
      socket.on("orderStatusUpdated",  fetchOrders);
      socket.on("newOrderPlaced",      fetchOrders);
      socket.on("orderAssigned",       fetchOrders);
    } catch {
      // socket.io-client not available — silent fallback to manual refresh
    }

    return () => { socket?.disconnect(); };
  }, [fetchOrders]);

  // Filter by tab
  const displayed = activeTab === "ALL"
    ? allOrders
    : allOrders.filter((o) => o.status.toUpperCase() === activeTab);

  // Tab counts
  const countFor = (val: string) =>
    val === "ALL"
      ? allOrders.length
      : allOrders.filter((o) => o.status.toUpperCase() === val).length;

  return (
    <div className="space-y-5">
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <DashboardPageHero
        badge="Customer Operations"
        title="Customer Live Orders"
        description="Real-time order tracking with socket-based auto-refresh. Monitor garment status, branch assignments and dispatch queue."
        liveLabel={connected ? "Socket Active" : undefined}
        chips={[
          { label: "Total Orders",  value: allOrders.length },
          { label: "Pending",       value: allOrders.filter((o) => o.status.toUpperCase() === "PENDING").length },
          { label: "In Progress",   value: allOrders.filter((o) => ["PROCESSING","PICKUP","DELIVERY"].includes(o.status.toUpperCase())).length },
        ]}
      />

      {/* ── Status filter tabs + connection badge ────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

        {/* Status filter tabs */}
        <div className="flex items-center gap-1 rounded-xl border border-border bg-muted p-1 overflow-x-auto">
          {STATUS_TABS.map((tab) => {
            const isActive = activeTab === tab.value;
            const count    = countFor(tab.value);
            return (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-black
                  whitespace-nowrap transition-all duration-150
                  ${isActive
                    ? "bg-card text-card-foreground shadow-sm"
                    : "text-muted-foreground hover:text-card-foreground"
                  }`}
              >
                <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${tab.dot}`} />
                {tab.label}
                <span className={`rounded-full px-1.5 py-px text-[10px] font-black
                  ${isActive ? "bg-primary/10 text-primary" : "bg-muted-foreground/10 text-muted-foreground"}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Socket connection badge */}
        <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-black
          ${connected
            ? "border-success/25 bg-success/10 text-success"
            : "border-border bg-muted text-muted-foreground"}`}>
          {connected
            ? <><Wifi size={11} className="animate-pulse" /> Live Socket</>
            : <><WifiOff size={11} /> Manual Refresh</>}
        </span>
      </div>

      {/* ── Table ────────────────────────────────────────────────────────── */}
      <AdminCrudPage config={makeConfig(displayed)} hideHeader />
    </div>
  );
}
