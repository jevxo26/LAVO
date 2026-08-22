import React from "react";
import {
  Package,
  Calendar,
  Clock,
  MapPin,
  Hash,
  ReceiptText,
  Radio,
  Shirt,
  Sparkles,
} from "lucide-react";
import { OrderDetails } from "./types";

// ─── Sub-components ───────────────────────────────────────────────────────────

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-50 border border-slate-100">
        <Icon size={13} className="text-slate-400" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold text-slate-500 leading-none">{label}</p>
        <p className="mt-0.5 text-xs font-bold leading-snug text-slate-800">{value}</p>
      </div>
    </div>
  );
}

function PaymentBadge({ status }: { status: string }) {
  const paid = status.toUpperCase() === "PAID";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold
      ${paid ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-rose-50 text-rose-700 border-rose-200"}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${paid ? "bg-emerald-500" : "bg-rose-400"}`} />
      {paid ? "Paid" : "Unpaid"}
    </span>
  );
}

// ─── OrderDetailsPanel ────────────────────────────────────────────────────────

interface OrderDetailsPanelProps {
  order: OrderDetails;
  liveConnected: boolean;
}

export function OrderDetailsPanel({ order, liveConnected }: OrderDetailsPanelProps) {
  return (
    <div className="space-y-5">

      {/* Services Ordered Breakdown card */}
      {order.items && order.items.length > 0 && (
        <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <Shirt size={14} />
              </div>
              <h3 className="text-sm font-extrabold text-slate-900">Ordered Services</h3>
            </div>
            <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-blue-700">
              {order.items.length} Service{order.items.length > 1 ? "s" : ""}
            </span>
          </div>

          <div className="divide-y divide-slate-50 px-5 py-2">
            {order.items.map((item) => (
              <div key={item.id} className="py-3 flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                    <p className="text-xs font-bold text-slate-900">
                      {item.service?.serviceName || "Laundry Service"}
                    </p>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {item.service?.garmentType?.name || "Garment"} · Qty:{" "}
                    <span className="font-semibold text-slate-800">{item.quantity}</span>
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-extrabold text-slate-900">৳{item.totalPrice.toFixed(2)}</p>
                  <p className="text-[10px] text-slate-400">৳{item.unitPrice.toFixed(2)}/unit</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Delivery Details card */}
      <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50">
            <Package size={14} className="text-violet-500" />
          </div>
          <h3 className="text-sm font-extrabold text-slate-900">Delivery Details</h3>
        </div>
        <div className="px-5 py-4 space-y-4">
          <DetailRow icon={Hash}     label="Order Number"     value={order.orderNumber} />
          <DetailRow icon={Package}  label="Total Garments"   value={`${order.totalGarments} items`} />
          <DetailRow
            icon={Calendar}
            label="Date Placed"
            value={new Date(order.createdAt).toLocaleDateString("en-US", {
              month: "short", day: "numeric", year: "numeric",
            })}
          />
          <DetailRow
            icon={Clock}
            label="Est. Pickup Time"
            value={new Date(order.estimatedPickupTime).toLocaleString("en-US", {
              month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
            })}
          />
          <DetailRow icon={MapPin} label="Pickup Address" value="Address linked during order booking" />
        </div>
      </div>

      {/* Payment Summary card */}
      <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50">
            <ReceiptText size={14} className="text-indigo-500" />
          </div>
          <h3 className="text-sm font-extrabold text-slate-900">Payment Summary</h3>
        </div>
        <div className="px-5 py-4 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Payment Status</span>
            <PaymentBadge status={order.paymentStatus} />
          </div>
          <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
            <span className="text-sm font-bold text-slate-800">Grand Total</span>
            <span className="text-lg font-extrabold text-indigo-600">৳{order.grandTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Live status indicator */}
      <div className={`rounded-2xl border px-5 py-4 flex items-center gap-3
        ${liveConnected ? "bg-emerald-50 border-emerald-100" : "bg-slate-50 border-slate-100"}`}>
        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full
          ${liveConnected ? "bg-emerald-100" : "bg-slate-100"}`}>
          <Radio size={14} className={liveConnected ? "text-emerald-600" : "text-slate-400"} />
        </div>
        <div>
          <p className={`text-xs font-bold ${liveConnected ? "text-emerald-700" : "text-slate-600"}`}>
            {liveConnected ? "Live Updates Active" : "Live Updates Offline"}
          </p>
          <p className={`text-[11px] ${liveConnected ? "text-emerald-500" : "text-slate-400"}`}>
            {liveConnected
              ? "Page updates automatically when status changes."
              : "Reconnecting to real-time feed…"}
          </p>
        </div>
        {liveConnected && (
          <span className="ml-auto h-2 w-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
        )}
      </div>
    </div>
  );
}
