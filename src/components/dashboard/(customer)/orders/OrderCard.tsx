"use client";

import React, { useState } from "react";
import {
  Calendar,
  Package,
  Clock,
  MapPin,
  ChevronDown,
  ChevronUp,
  CreditCard,
  X,
  Loader2,
  Shirt,
  Hash,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { OrderRecord, fmtDate, fmtDateTime, gradientFor } from "./types";
import { OrderStatusBadge, OrderPaymentBadge } from "./Badges";
import { OrderTimeline } from "./OrderTimeline";
import { InvoiceSummary } from "./InvoiceSummary";
import { downloadInvoice } from "@/lib/generateInvoiceHtml";

// ─── Thumbnail ────────────────────────────────────────────────────────────────

function OrderThumbnail({ seed }: { seed: string }) {
  const gradient = gradientFor(seed);
  return (
    <div className={`h-12 w-12 shrink-0 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-sm`}>
      <Shirt size={20} className="text-white/80" />
    </div>
  );
}

// ─── MetaChip ─────────────────────────────────────────────────────────────────

function MetaChip({ icon: Icon, label, value }: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <Icon size={12} className="text-slate-400 shrink-0" />
      <span className="text-[11px] text-slate-500">
        <span className="font-semibold text-slate-700">{value}</span>
        {" "}
        <span className="text-slate-400">{label}</span>
      </span>
    </div>
  );
}

// ─── GarmentTable ─────────────────────────────────────────────────────────────

function GarmentTable({ order }: { order: OrderRecord }) {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-50">
          <Package size={13} className="text-violet-500" />
        </div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Garment Items</h4>
      </div>
      <div className="rounded-xl border border-slate-100 bg-white overflow-hidden">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50/80 border-b border-slate-100">
            <tr>
              <th className="px-4 py-2.5 font-bold text-slate-500 uppercase tracking-wider text-[10px]">Service</th>
              <th className="px-4 py-2.5 text-center font-bold text-slate-500 uppercase tracking-wider text-[10px]">Qty</th>
              <th className="px-4 py-2.5 text-right font-bold text-slate-500 uppercase tracking-wider text-[10px]">Unit</th>
              <th className="px-4 py-2.5 text-right font-bold text-slate-500 uppercase tracking-wider text-[10px]">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {order.items.map((item, idx) => (
              <tr key={item.id} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/30"}>
                <td className="px-4 py-3 font-semibold text-slate-800">{item.service.serviceName}</td>
                <td className="px-4 py-3 text-center text-slate-600">{item.quantity}</td>
                <td className="px-4 py-3 text-right text-slate-600">৳{item.unitPrice.toFixed(2)}</td>
                <td className="px-4 py-3 text-right font-bold text-slate-900">৳{item.totalPrice.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── SchedulePanel ────────────────────────────────────────────────────────────

function SchedulePanel({ order }: { order: OrderRecord }) {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50">
          <Clock size={13} className="text-amber-500" />
        </div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Schedule & Logistics</h4>
      </div>
      <div className="rounded-xl border border-slate-100 bg-white p-4 text-xs space-y-3">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-50">
            <Clock size={13} className="text-indigo-500" />
          </div>
          <div>
            <p className="font-semibold text-slate-800">Estimated Pickup</p>
            <p className="text-slate-500 mt-0.5">{fmtDateTime(order.estimatedPickupTime)}</p>
          </div>
        </div>
        <div className="border-t border-slate-50 pt-3 flex items-start gap-3">
          <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-50">
            <MapPin size={13} className="text-emerald-500" />
          </div>
          <div>
            <p className="font-semibold text-slate-800">Pickup Address</p>
            <p className="text-slate-500 mt-0.5">Delivery address linked to your profile</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── OrderCard ────────────────────────────────────────────────────────────────

export interface OrderCardProps {
  order: OrderRecord;
  isExpanded: boolean;
  onToggle: () => void;
  onPayNow: (order: OrderRecord) => void;
  onCancel: (order: OrderRecord) => void;
  cancellingId: string | null;
}

export function OrderCard({
  order,
  isExpanded,
  onToggle,
  onPayNow,
  onCancel,
  cancellingId,
}: OrderCardProps) {
  const canCancel   = ["PENDING", "CONFIRMED"].includes(order.orderStatus.toUpperCase());
  const canPay      = order.paymentStatus === "UNPAID" && order.orderStatus.toUpperCase() !== "CANCELLED";
  const isCancelling = cancellingId === order.id;

  return (
    <div
      className={`rounded-2xl border bg-white shadow-sm transition-all duration-200 overflow-hidden
        ${isExpanded ? "border-indigo-200 shadow-indigo-50 shadow-md" : "border-slate-100 hover:border-slate-200 hover:shadow-md"}`}
    >
      {/* ── Card Header ─────────────────────────────────────────────────────── */}
      <div
        role="button"
        tabIndex={0}
        onClick={onToggle}
        onKeyDown={(e) => e.key === "Enter" && onToggle()}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-5 py-4 cursor-pointer select-none"
      >
        {/* Left: thumbnail + order info */}
        <div className="flex items-center gap-4 min-w-0">
          <OrderThumbnail seed={order.orderNumber} />
          <div className="min-w-0 space-y-1.5">
            {/* Order number + badges */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 text-[13px] font-bold text-slate-900">
                <Hash size={12} className="text-slate-400" />
                {order.orderNumber}
              </div>
              <OrderStatusBadge  status={order.orderStatus}  />
              <OrderPaymentBadge status={order.paymentStatus} />
            </div>
            {/* Meta */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <MetaChip icon={Calendar} label="Placed"    value={fmtDate(order.createdAt)}             />
              <MetaChip icon={Package}  label="garments"  value={String(order.totalGarments)}           />
              <MetaChip icon={Clock}    label="Pickup"    value={fmtDate(order.estimatedPickupTime)}    />
            </div>
          </div>
        </div>

        {/* Right: total + actions */}
        <div className="flex items-center justify-between sm:justify-end gap-4 sm:shrink-0">
          <div className="text-right">
            <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Grand Total</p>
            <p className="text-lg font-extrabold text-slate-900 leading-tight">৳{order.grandTotal.toFixed(2)}</p>
          </div>

          <div
            className="flex items-center gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              size="sm"
              variant="outline"
              onClick={() => downloadInvoice(order)}
              className="h-8 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold px-2.5 gap-1.5 shadow-2xs"
            >
              <Download size={12} className="text-blue-600" /> Invoice
            </Button>

            {canPay && (
              <Button
                size="sm"
                onClick={() => onPayNow(order)}
                className="h-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3 gap-1.5 shadow-sm shadow-indigo-200"
              >
                <CreditCard size={12} /> Pay Now
              </Button>
            )}

            {canCancel && (
              <Button
                size="sm"
                variant="outline"
                disabled={isCancelling}
                onClick={() => onCancel(order)}
                className="h-8 rounded-xl border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 text-xs font-bold px-3 gap-1.5"
              >
                {isCancelling
                  ? <Loader2 size={12} className="animate-spin" />
                  : <X size={12} />}
                Cancel
              </Button>
            )}
          </div>

          <div className={`p-1.5 rounded-lg transition-colors ${isExpanded ? "bg-indigo-50 text-indigo-500" : "text-slate-400 hover:bg-slate-50"}`}>
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </div>
      </div>

      {/* ── Expanded Details ─────────────────────────────────────────────────── */}
      {isExpanded && (
        <div className="border-t border-slate-100 bg-slate-50/40 px-5 py-6 space-y-6">
          {/* Timeline */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50">
                <svg
                  width="13" height="13" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.2"
                  strokeLinecap="round" strokeLinejoin="round"
                  className="text-indigo-500"
                >
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
              </div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Order Status</h4>
            </div>
            <div className="rounded-xl border border-slate-100 bg-white p-4">
              <OrderTimeline status={order.orderStatus} />
            </div>
          </div>

          {/* Items table */}
          <GarmentTable order={order} />

          {/* Schedule + Invoice side by side */}
          <div className="grid gap-5 sm:grid-cols-2">
            <SchedulePanel order={order} />
            <InvoiceSummary order={order} />
          </div>
        </div>
      )}
    </div>
  );
}
