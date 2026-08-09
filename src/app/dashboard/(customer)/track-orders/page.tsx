"use client";

import React, { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { io, Socket } from "socket.io-client";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, Package } from "lucide-react";
import { authFetch } from "@/lib/api";
import { toast } from "@/lib/toast";

import { OrderDetails, getTrackingStepsForOrder, getStepIndexForOrder, progressPercentForOrder } from "@/components/marketing/track-orders/types";
import { TrackHeroHeader }   from "@/components/marketing/track-orders/TrackHeroHeader";
import { TrackingTimeline }  from "@/components/marketing/track-orders/TrackingTimeline";
import { OrderDetailsPanel } from "@/components/marketing/track-orders/OrderDetailsPanel";

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Sk({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800 ${className ?? ""}`} />;
}

function TrackOrdersSkeleton() {
  return (
    <div className="space-y-6">
      {/* Hero / search bar skeleton */}
      <Sk className="h-36 w-full rounded-3xl" />

      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* Timeline skeleton */}
        <div className="lg:col-span-8 rounded-3xl border border-slate-100 bg-white shadow-sm p-6 space-y-6 dark:bg-slate-900 dark:border-slate-800">
          {/* Order header */}
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Sk className="h-5 w-36" />
              <Sk className="h-3 w-24" />
            </div>
            <Sk className="h-7 w-20 rounded-full" />
          </div>
          {/* Progress bar */}
          <Sk className="h-2 w-full rounded-full" />
          {/* Steps */}
          <div className="flex justify-between gap-2">
            {[0,1,2,3,4].map((i) => (
              <div key={i} className="flex flex-col items-center gap-2 flex-1">
                <Sk className="h-10 w-10 rounded-full" />
                <Sk className="h-2.5 w-14" />
              </div>
            ))}
          </div>
          {/* Details rows */}
          <div className="space-y-3 pt-2">
            {[0,1,2].map((i) => (
              <div key={i} className="flex gap-3 items-center">
                <Sk className="h-8 w-8 rounded-xl flex-shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <Sk className="h-3 w-32" />
                  <Sk className="h-2.5 w-48" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order details panel skeleton */}
        <div className="lg:col-span-4 rounded-3xl border border-slate-100 bg-white shadow-sm p-5 space-y-4 dark:bg-slate-900 dark:border-slate-800">
          <Sk className="h-4 w-28" />
          <div className="space-y-3">
            {[0,1,2,3].map((i) => (
              <div key={i} className="flex justify-between">
                <Sk className="h-3 w-24" />
                <Sk className="h-3 w-16" />
              </div>
            ))}
          </div>
          <Sk className="h-px w-full" />
          <div className="space-y-3">
            {[0,1,2].map((i) => (
              <div key={i} className="flex gap-2 items-center">
                <Sk className="h-8 w-8 rounded-xl flex-shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <Sk className="h-3 w-28" />
                  <Sk className="h-2.5 w-16" />
                </div>
                <Sk className="h-5 w-12 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── TrackerContent ───────────────────────────────────────────────────────────

function TrackerContent() {
  const searchParams   = useSearchParams();
  const initialOrderId = searchParams.get("orderId") || "";
  const { user }       = useAuth();

  const [orderNumberInput, setOrderNumberInput] = useState("");
  const [orderDetails, setOrderDetails]         = useState<OrderDetails | null>(null);
  const [loading, setLoading]                   = useState(true);
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
      setLoading(true);
      try {
        const res  = await authFetch("/customer/orders");
        const data = await res.json();
        if (data.success) {
          const list: OrderDetails[] = data.data;
          setActiveOrders(list.map((o) => ({ id: o.id, orderNumber: o.orderNumber })));
          if (initialOrderId) {
            await fetchOrderDetails(initialOrderId);
          } else if (list.length > 0) {
            await fetchOrderDetails(list[0].id);
          } else {
            setLoading(false);
          }
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error("Error loading active orders list:", err);
        setLoading(false);
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
  const trackingSteps    = getTrackingStepsForOrder(orderDetails);
  const currentStepIndex = orderDetails ? getStepIndexForOrder(orderDetails.orderStatus, trackingSteps) : 0;
  const pct              = progressPercentForOrder(currentStepIndex, trackingSteps.length);
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
        <TrackOrdersSkeleton />

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
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white py-24 text-center shadow-sm dark:bg-slate-900 dark:border-slate-800">
          <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-indigo-50 text-indigo-500 dark:bg-indigo-950/50">
            <Package size={36} className="text-indigo-400" />
          </div>
          <p className="text-base font-bold text-slate-800 dark:text-white">No order selected</p>
          <p className="mt-2 max-w-xs text-sm text-slate-400 font-medium">
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
