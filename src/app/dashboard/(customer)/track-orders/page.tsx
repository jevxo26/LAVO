"use client";

import React, { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { io, Socket } from "socket.io-client";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, Package } from "lucide-react";
import { authFetch } from "@/lib/api";
import { toast } from "@/lib/toast";

import { OrderDetails, getStepIndex, progressPercent } from "@/components/marketing/track-orders/types";
import { TrackHeroHeader }   from "@/components/marketing/track-orders/TrackHeroHeader";
import { TrackingTimeline }  from "@/components/marketing/track-orders/TrackingTimeline";
import { OrderDetailsPanel } from "@/components/marketing/track-orders/OrderDetailsPanel";

// ─── TrackerContent ───────────────────────────────────────────────────────────

function TrackerContent() {
  const searchParams   = useSearchParams();
  const initialOrderId = searchParams.get("orderId") || "";
  const { user }       = useAuth();

  const [orderNumberInput, setOrderNumberInput] = useState("");
  const [orderDetails, setOrderDetails]         = useState<OrderDetails | null>(null);
  const [loading, setLoading]                   = useState(false);
  const [liveConnected, setLiveConnected]       = useState(false);
  const [activeOrders, setActiveOrders]         = useState<Array<{ id: string; orderNumber: string }>>([]);

  const socketRef        = useRef<Socket | null>(null);
  const activeOrderIdRef = useRef<string | null>(null);

  // ── Socket setup ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user?.id) return;

    const socketUrl =
      typeof window !== "undefined"
        ? process.env.NEXT_PUBLIC_API_URL?.startsWith("http")
          ? process.env.NEXT_PUBLIC_API_URL.replace("/api", "")
          : window.location.origin
        : "";

    const socket = io(socketUrl, {
      auth: { token: localStorage.getItem("laundrix_token") },
      transports: ["websocket", "polling"],
    });
    socketRef.current = socket;

    socket.on("connect",    () => { socket.emit("joinCustomer", user.id); setLiveConnected(true);  });
    socket.on("disconnect", () => setLiveConnected(false));

    socket.on("orderStatusUpdated", (payload: { orderId: string; orderStatus: string }) => {
      if (activeOrderIdRef.current === payload.orderId) fetchOrderDetails(payload.orderId);
    });

    return () => { socket.disconnect(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // ── Load active orders list ───────────────────────────────────────────────
  useEffect(() => {
    async function loadActive() {
      try {
        const res  = await authFetch("/customer/orders");
        const data = await res.json();
        if (data.success) {
          const list: OrderDetails[] = data.data;
          setActiveOrders(list.map((o) => ({ id: o.id, orderNumber: o.orderNumber })));
          if (initialOrderId) fetchOrderDetails(initialOrderId);
          else if (list.length > 0) fetchOrderDetails(list[0].id);
        }
      } catch (err) {
        console.error("Error loading active orders list:", err);
      }
    }
    loadActive();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialOrderId]);

  // ── Fetch a single order ──────────────────────────────────────────────────
  const fetchOrderDetails = async (idOrNumber: string) => {
    setLoading(true);
    try {
      let res  = await authFetch(`/customer/orders/${idOrNumber}`);
      let data = await res.json();

      if (!data.success) {
        const found = activeOrders.find(
          (o) => o.orderNumber.toLowerCase() === idOrNumber.toLowerCase().trim()
        );
        if (found) {
          res  = await authFetch(`/customer/orders/${found.id}`);
          data = await res.json();
        }
      }

      if (data.success) {
        setOrderDetails(data.data);
        activeOrderIdRef.current = data.data.id;
      } else {
        toast.error("Order not found. Enter a valid order number.");
        setOrderDetails(null);
      }
    } catch {
      toast.error("Error fetching order tracking details");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumberInput.trim()) { toast.error("Please enter an order number"); return; }
    fetchOrderDetails(orderNumberInput);
  };

  // ── Derived ───────────────────────────────────────────────────────────────
  const currentStepIndex = orderDetails ? getStepIndex(orderDetails.orderStatus) : 0;
  const pct              = progressPercent(currentStepIndex);
  const isCancelled      = orderDetails?.orderStatus.toUpperCase() === "CANCELLED";

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-7">

      <TrackHeroHeader
        liveConnected={liveConnected}
        orderDetails={orderDetails}
        isCancelled={!!isCancelled}
        pct={pct}
        orderNumberInput={orderNumberInput}
        activeOrders={activeOrders}
        onInputChange={setOrderNumberInput}
        onSearchSubmit={handleSearchSubmit}
        onQuickSelect={fetchOrderDetails}
      />

      {loading ? (
        <div className="flex h-52 flex-col items-center justify-center gap-3 rounded-2xl border border-slate-100 bg-white shadow-sm">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50">
            <Loader2 size={26} className="text-indigo-600 animate-spin" />
          </div>
          <p className="text-slate-500 text-xs font-semibold">Fetching order details…</p>
        </div>

      ) : orderDetails ? (
        <div className="grid gap-6 lg:grid-cols-12 items-start">
          <div className="lg:col-span-8">
            <TrackingTimeline
              order={orderDetails}
              currentStepIndex={currentStepIndex}
              pct={pct}
            />
          </div>
          <div className="lg:col-span-4">
            <OrderDetailsPanel order={orderDetails} liveConnected={liveConnected} />
          </div>
        </div>

      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-24 text-center shadow-sm">
          <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-indigo-50">
            <Package size={36} className="text-indigo-400" />
          </div>
          <p className="text-base font-bold text-slate-800">No order selected</p>
          <p className="mt-2 max-w-xs text-sm text-slate-400">
            Enter an order number above or pick one from the quick-select dropdown to see live tracking.
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Page export ──────────────────────────────────────────────────────────────

export default function TrackOrdersPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[40vh] items-center justify-center">
          <Loader2 size={30} className="text-indigo-600 animate-spin" />
        </div>
      }
    >
      <TrackerContent />
    </Suspense>
  );
}
