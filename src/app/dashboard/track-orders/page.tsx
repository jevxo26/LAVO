"use client";

import React, { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { io, Socket } from "socket.io-client";
import { useAuth } from "@/hooks/useAuth";
import { 
  Search, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  Circle, 
  Loader2,
  Package,
  Calendar,
  AlertCircle
} from "lucide-react";
import { authFetch } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/toast";

interface OrderTimeline {
  id: string;
  status: string;
  title: string;
  description: string;
  createdAt: string;
}

interface OrderDetails {
  id: string;
  orderNumber: string;
  orderStatus: string;
  paymentStatus: string;
  grandTotal: number;
  totalGarments: number;
  createdAt: string;
  estimatedPickupTime: string;
  estimatedDeliveryTime?: string;
  timelines: OrderTimeline[];
}

// Separate search hook loading logic to wrap inside Suspense
function TrackerContent() {
  const searchParams = useSearchParams();
  const initialOrderId = searchParams.get("orderId") || "";
  const { user } = useAuth();

  const [orderNumberInput, setOrderNumberInput] = useState("");
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [deliveryOtp, setDeliveryOtp] = useState<string | null>(null);
  const [pickupOtp, setPickupOtp] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeOrders, setActiveOrders] = useState<Array<{ id: string; orderNumber: string }>>([]);
  const socketRef = useRef<Socket | null>(null);
  const activeOrderIdRef = useRef<string | null>(null);

  // Socket: connect and join customer room for real-time order updates
  useEffect(() => {
    if (!user?.id) return;

    const socketUrl = typeof window !== 'undefined'
      ? (process.env.NEXT_PUBLIC_API_URL?.startsWith('http')
          ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '')
          : window.location.origin)
      : '';

    const socket = io(socketUrl, {
      auth: { token: localStorage.getItem('laundrix_token') },
      transports: ['websocket', 'polling'],
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('joinCustomer', user.id);
    });

    socket.on('orderStatusUpdated', (payload: { orderId: string; orderStatus: string }) => {
      // Only re-fetch if the update is for the currently displayed order
      if (activeOrderIdRef.current && activeOrderIdRef.current === payload.orderId) {
        fetchOrderDetails(payload.orderId);
      }
    });

    return () => { socket.disconnect(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Fetch active orders for dropdown quick selector
  useEffect(() => {
    async function loadActive() {
      try {
        const res = await authFetch("/customer/orders");
        const data = await res.json();
        if (data.success) {
          const list: OrderDetails[] = data.data;
          setActiveOrders(list.map((o) => ({ id: o.id, orderNumber: o.orderNumber })));
          
          // If we had an initial order ID, fetch it
          if (initialOrderId) {
            fetchOrderDetails(initialOrderId);
          } else if (list.length > 0) {
            // default to first active order
            fetchOrderDetails(list[0].id);
          }
        }
      } catch (err) {
        console.error("Error loading active orders list:", err);
      }
    }
    loadActive();
  }, [initialOrderId]);

  const fetchOrderDetails = async (idOrNumber: string) => {
    setLoading(true);
    try {
      // Try fetching by ID
      let res = await authFetch(`/customer/orders/${idOrNumber}`);
      let data = await res.json();

      // If not found, try searching activeOrders to match orderNumber
      if (!data.success) {
        const found = activeOrders.find(
          (o) => o.orderNumber.toLowerCase() === idOrNumber.toLowerCase().trim()
        );
        if (found) {
          res = await authFetch(`/customer/orders/${found.id}`);
          data = await res.json();
        }
      }

      if (data.success) {
        setOrderDetails(data.data);
        activeOrderIdRef.current = data.data.id; // keep ref in sync for socket listener
        
        // Fetch OTPs (pickup OTP + dropoff OTP)
        try {
          const otpRes = await authFetch(`/customer/orders/${data.data.id}/delivery-otp`);
          const otpData = await otpRes.json();
          if (otpData.success) {
            setPickupOtp(otpData.data?.pickupOtpCode || null);
            setDeliveryOtp(otpData.data?.dropoffOtpCode || null);
          } else {
            setPickupOtp(null);
            setDeliveryOtp(null);
          }
        } catch (e) {
          setPickupOtp(null);
          setDeliveryOtp(null);
        }
      } else {
        toast.error("Order details not found. Enter a valid order number.");
        setOrderDetails(null);
        setDeliveryOtp(null);
      }
    } catch {
      toast.error("Error fetching order tracking details");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumberInput.trim()) {
      toast.error("Please enter an order number");
      return;
    }
    fetchOrderDetails(orderNumberInput);
  };

  const trackingSteps = [
    { key: "PENDING",            label: "Order Placed",        desc: "We received your laundry request." },
    { key: "CONFIRMED",          label: "Confirmed",           desc: "A pickup agent has been assigned to your zone." },
    { key: "PICKUP",             label: "Collected",           desc: "Garments collected and QR tracking labels generated." },
    { key: "PROCESSING",         label: "Sorting & Prep",      desc: "Laundry items sorting at the centralized branch hub." },
    { key: "WASHING",            label: "Washing",             desc: "Garments undergoing washing or dry-cleaning cycles." },
    { key: "DRYING",             label: "Drying",              desc: "Garments being dried at optimal temperature." },
    { key: "IRONING",            label: "Ironing",             desc: "Garments being pressed and ironed for a fresh finish." },
    { key: "FOLDING",            label: "Folding & Packing",   desc: "Garments neatly folded and packed for delivery." },
    { key: "READY_FOR_DELIVERY", label: "Ready for Delivery",  desc: "Your laundry is packed and a delivery agent has been assigned." },
    { key: "OUT_FOR_DELIVERY",   label: "Out for Delivery",    desc: "Delivery agent is on the way to your address." },
    { key: "DELIVERED",          label: "Delivered",           desc: "Laundry package successfully hand-delivered. Enjoy!" },
  ];

  // Helper to determine index of active status
  const getStepIndex = (status: string) => {
    const s = status.toUpperCase();
    if (s === "CANCELLED") return -1;
    // Map every possible order/garment status to the correct step index
    const map: Record<string, number> = {
      PENDING:            0,
      CONFIRMED:          1,
      PICKUP:             2,
      PROCESSING:         3,
      WASHING:            4,
      DRYING:             5,
      IRONING:            6,
      FOLDING:            7,
      READY_FOR_DELIVERY: 8,
      OUT_FOR_DELIVERY:   9,
      DELIVERED:          10,
      COMPLETED:          10, // alias
      DELIVERY:           9,  // legacy alias
    };
    return map[s] ?? 0;
  };

  const currentStepIndex = orderDetails ? getStepIndex(orderDetails.orderStatus) : 0;

  return (
    <div className="space-y-8">
      {/* Search Order bar */}
      <Card className="border border-slate-100 shadow-sm">
        <CardContent className="p-5 flex flex-col md:flex-row gap-4 items-center justify-between">
          <form onSubmit={handleSearchSubmit} className="flex w-full md:max-w-md items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 text-slate-400" size={15} />
              <Input
                value={orderNumberInput}
                onChange={(e) => setOrderNumberInput(e.target.value)}
                placeholder="Enter Order Number (e.g. ORD-12345)..."
                className="pl-9 h-10 text-xs rounded-xl"
              />
            </div>
            <Button type="submit" className="h-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold">
              Track Order
            </Button>
          </form>

          {activeOrders.length > 0 && (
            <div className="flex items-center gap-2.5 text-xs w-full md:w-auto border-t md:border-t-0 pt-3 md:pt-0">
              <span className="font-semibold text-slate-500 whitespace-nowrap">Quick Select:</span>
              <select
                onChange={(e) => fetchOrderDetails(e.target.value)}
                className="h-9 px-3 border rounded-lg bg-white focus:outline-none w-full md:w-48 text-xs font-semibold text-slate-700"
                value={orderDetails?.id || ""}
              >
                <option value="" disabled>Select active order...</option>
                {activeOrders.map((o) => (
                  <option key={o.id} value={o.id}>{o.orderNumber}</option>
                ))}
              </select>
            </div>
          )}
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex h-48 flex-col items-center justify-center">
          <Loader2 size={30} className="text-indigo-600 animate-spin mb-3" />
          <p className="text-slate-500 text-xs font-medium">Fetching details...</p>
        </div>
      ) : orderDetails ? (
        <div className="grid gap-8 lg:grid-cols-12 items-start">
          
          {/* Timeline Tracking Details */}
          <Card className="lg:col-span-8 border border-slate-100 shadow-sm">
            <CardHeader className="border-b border-slate-50">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-lg font-bold text-slate-900">Garment Tracker</CardTitle>
                  <CardDescription className="text-xs">Real-time tracking of order {orderDetails.orderNumber}</CardDescription>
                </div>
                <span className={`self-start sm:self-auto text-xs px-3 py-1 rounded-full border font-bold ${
                  orderDetails.orderStatus === "CANCELLED"
                    ? "bg-rose-50 text-rose-700 border-rose-200"
                    : "bg-indigo-50 text-indigo-700 border-indigo-200"
                }`}>
                  Status: {orderDetails.orderStatus}
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-6 sm:p-8">
              {orderDetails.orderStatus === "CANCELLED" ? (
                <div className="flex flex-col items-center justify-center p-8 text-center bg-rose-50/30 border border-rose-100 rounded-2xl">
                  <AlertCircle size={44} className="text-rose-500 mb-3" />
                  <h3 className="font-bold text-slate-800 text-sm">Order Cancelled</h3>
                  <p className="text-slate-500 text-xs max-w-xs mt-1">
                    This order was cancelled. Please check help desk if you believe this is an error or need assistance.
                  </p>
                </div>
              ) : (
                <div className="relative pl-6 sm:pl-8 border-l border-slate-100 space-y-8 py-2">
                  {trackingSteps.map((step, idx) => {
                    const isPassed = idx <= currentStepIndex;
                    const isCurrent = idx === currentStepIndex;
                    
                    // Retrieve specific log from order timelines if available
                    const specificLog = orderDetails.timelines.find(
                      (t) => t.status.toUpperCase() === step.key
                    );

                    return (
                      <div key={step.key} className="relative group">
                        {/* Dot indicator */}
                        <div className="absolute -left-[31px] sm:-left-[39px] top-1.5 z-10 flex items-center justify-center bg-white rounded-full">
                          {isCurrent ? (
                            <div className="rounded-full bg-indigo-500 p-1 animate-pulse shadow-md shadow-indigo-200">
                              <CheckCircle2 size={16} className="text-white" />
                            </div>
                          ) : isPassed ? (
                            <CheckCircle2 size={18} className="text-indigo-600" />
                          ) : (
                            <Circle size={18} className="text-slate-200" />
                          )}
                        </div>

                        <div className={`space-y-1 ${isPassed ? "opacity-100" : "opacity-50"}`}>
                          <h4 className={`text-sm font-bold ${isCurrent ? "text-indigo-600 text-base" : "text-slate-900"}`}>
                            {step.label}
                          </h4>
                          <p className="text-xs text-slate-500">{specificLog?.description || step.desc}</p>
                          {specificLog && (
                            <p className="text-[10px] text-slate-400 font-semibold pt-0.5">
                              {new Date(specificLog.createdAt).toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Invoice/Logistics details panel */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Pickup OTP — shown when agent is coming to COLLECT garments */}
            {pickupOtp && (
              <Card className="border border-amber-200 shadow-sm bg-amber-50/60">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-bold text-amber-900 flex items-center gap-2">
                    <Package size={18} className="text-amber-600" />
                    Pickup Verification OTP
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-amber-800 mb-3">Our agent is on the way to collect your garments. Share this OTP with the agent when they arrive at your door.</p>
                  <div className="bg-white border border-amber-300 rounded-lg p-4 text-center">
                    <span className="text-3xl font-black tracking-widest text-amber-600 font-mono">
                      {pickupOtp}
                    </span>
                  </div>
                  <p className="text-[10px] text-amber-700 mt-2 text-center">⚠️ Do NOT share this OTP until the agent is at your door</p>
                </CardContent>
              </Card>
            )}

            {/* Dropoff OTP — shown when agent is coming to RETURN clean clothes */}
            {deliveryOtp && (
              <Card className="border border-indigo-100 shadow-sm bg-indigo-50/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-bold text-indigo-900 flex items-center gap-2">
                    <CheckCircle2 size={18} className="text-indigo-600" />
                    Delivery Verification OTP
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-indigo-700 mb-3">Your clean clothes are on the way! Share this OTP with the delivery agent when they arrive to confirm receipt.</p>
                  <div className="bg-white border border-indigo-200 rounded-lg p-4 text-center">
                    <span className="text-3xl font-black tracking-widest text-indigo-600 font-mono">
                      {deliveryOtp}
                    </span>
                  </div>
                  <p className="text-[10px] text-indigo-600 mt-2 text-center">⚠️ Do NOT share this OTP until the agent is at your door</p>
                </CardContent>
              </Card>
            )}

            <Card className="border border-slate-100 shadow-sm bg-gradient-to-br from-white to-slate-50/50">
              <CardHeader>
                <CardTitle className="text-base font-bold text-slate-900">Delivery Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                
                <div className="flex items-start gap-2.5">
                  <Package size={14} className="text-slate-400 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-slate-800">Total Clothes</h5>
                    <p className="text-slate-500 mt-0.5">{orderDetails.totalGarments} items</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 border-t border-slate-100/80 pt-3">
                  <Calendar size={14} className="text-slate-400 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-slate-800">Date Placed</h5>
                    <p className="text-slate-500 mt-0.5">{new Date(orderDetails.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 border-t border-slate-100/80 pt-3">
                  <Clock size={14} className="text-slate-400 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-slate-800">Est. Pickup Time</h5>
                    <p className="text-slate-500 mt-0.5">{new Date(orderDetails.estimatedPickupTime).toLocaleString()}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 border-t border-slate-100/80 pt-3">
                  <MapPin size={14} className="text-slate-400 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-slate-800">Pickup Address</h5>
                    <p className="text-slate-500 mt-0.5">Address linked during order booking</p>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-4 font-bold text-slate-900 text-sm flex justify-between">
                  <span>Grand Total:</span>
                  <span className="text-indigo-600">৳{orderDetails.grandTotal.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      ) : (
        <Card className="border border-dashed border-slate-200 py-16 text-center">
          <CardContent className="flex flex-col items-center justify-center">
            <Package size={44} className="text-slate-300 mb-3" />
            <h3 className="font-bold text-slate-800 text-sm">Select an order to track</h3>
            <p className="text-slate-500 text-xs max-w-xs mt-1">
              Provide an order number above or select an active order to view its real-time processing state.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function TrackOrdersPage() {
  return (
    <Suspense fallback={
      <div className="flex h-[40vh] items-center justify-center">
        <Loader2 size={30} className="text-indigo-600 animate-spin" />
      </div>
    }>
      <TrackerContent />
    </Suspense>
  );
}
