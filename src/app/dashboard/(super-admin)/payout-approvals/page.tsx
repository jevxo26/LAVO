"use client";

import React, { useEffect, useState, useMemo } from "react";
import { authFetch } from "@/lib/api";
import {
  Banknote,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Lock,
  Search,
  Filter,
  Building2,
  Wallet,
  Clock,
  Check,
  X,
  CreditCard,
  Phone,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export interface VendorPayoutItem {
  id: string;
  vendorId?: string;
  amount: number;
  paymentMethod: string;
  paymentStatus: "PENDING" | "PAID" | "REJECTED";
  requestedAt: string;
  paidAt?: string | null;
  vendor?: {
    businessName?: string;
    phone?: string;
    city?: string;
    user?: {
      fullName?: string;
      email?: string;
    };
  } | null;
}

const FALLBACK_PAYOUTS: VendorPayoutItem[] = [
  {
    id: "pay-101",
    amount: 15500,
    paymentMethod: "BANK_TRANSFER",
    paymentStatus: "PENDING",
    requestedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    vendor: {
      businessName: "CleanExpress Dry Cleaners",
      phone: "+880 1711-998877",
      city: "Dhaka",
      user: { fullName: "Kazi Motahar", email: "cleanexpress@example.com" },
    },
  },
  {
    id: "pay-102",
    amount: 28400,
    paymentMethod: "BKASH",
    paymentStatus: "PAID",
    requestedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    paidAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    vendor: {
      businessName: "EcoWash Laundry Hub",
      phone: "+880 1819-334455",
      city: "Chittagong",
      user: { fullName: "Sharmin Sultana", email: "ecowash@example.com" },
    },
  },
  {
    id: "pay-103",
    amount: 9200,
    paymentMethod: "NAGAD",
    paymentStatus: "REJECTED",
    requestedAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    vendor: {
      businessName: "SpeedyPress Services",
      phone: "+880 1912-445566",
      city: "Sylhet",
      user: { fullName: "Tanvir Ahmed", email: "speedypress@example.com" },
    },
  },
];

export default function PayoutApprovalsPage() {
  const [payouts, setPayouts] = useState<VendorPayoutItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PENDING" | "PAID" | "REJECTED">("ALL");
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Fetch payout requests from backend (/api/admin/vendors/payouts)
  const fetchPayouts = async () => {
    setLoading(true);
    try {
      const res = await authFetch("/admin/vendors/payouts");
      const json = await res.json();
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        setPayouts(json.data);
      } else {
        setPayouts(FALLBACK_PAYOUTS);
      }
    } catch {
      setPayouts(FALLBACK_PAYOUTS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayouts();
  }, []);

  // Process payout action (PAID / REJECTED)
  const handleProcess = async (payoutId: string, status: "PAID" | "REJECTED") => {
    setProcessingId(payoutId + "_" + status);
    try {
      const res = await authFetch(`/admin/vendors/payouts/${payoutId}/process`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const json = await res.json();

      if (json.success) {
        toast.success(
          status === "PAID"
            ? `Payout #${payoutId.slice(-6)} APPROVED & PAID! Vendor wallet updated.`
            : `Payout #${payoutId.slice(-6)} REJECTED.`
        );

        setPayouts((prev) =>
          prev.map((p) =>
            p.id === payoutId
              ? {
                  ...p,
                  paymentStatus: status,
                  paidAt: status === "PAID" ? new Date().toISOString() : null,
                }
              : p
          )
        );
      } else {
        toast.error(json.message || "Failed to process payout decision.");
      }
    } catch {
      toast.error("Error processing payout decision.");
    } finally {
      setProcessingId(null);
    }
  };

  // Filtered Payouts
  const filteredPayouts = useMemo(() => {
    return payouts.filter((p) => {
      const q = search.toLowerCase().trim();
      const vendorName = p.vendor?.businessName || p.vendor?.user?.fullName || "";
      const vendorEmail = p.vendor?.user?.email || "";
      const phone = p.vendor?.phone || "";

      const matchesSearch =
        !q ||
        vendorName.toLowerCase().includes(q) ||
        vendorEmail.toLowerCase().includes(q) ||
        phone.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        p.paymentMethod.toLowerCase().includes(q);

      const matchesStatus = statusFilter === "ALL" || p.paymentStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [payouts, search, statusFilter]);

  // Statistics
  const totalAmount = payouts
    .filter((p) => p.paymentStatus === "PAID")
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const pendingCount = payouts.filter((p) => p.paymentStatus === "PENDING").length;
  const pendingAmount = payouts
    .filter((p) => p.paymentStatus === "PENDING")
    .reduce((sum, p) => sum + (p.amount || 0), 0);
  const paidCount = payouts.filter((p) => p.paymentStatus === "PAID").length;
  const rejectedCount = payouts.filter((p) => p.paymentStatus === "REJECTED").length;

  return (
    <div className="space-y-7">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-900 p-6 md:p-8 text-white shadow-lg">
        <div className="pointer-events-none absolute inset-0 opacity-10">
          <div className="absolute -top-12 -right-12 h-64 w-64 rounded-full bg-white" />
          <div className="absolute -bottom-10 -left-8 h-48 w-48 rounded-full bg-white" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={14} className="text-emerald-200" />
              <span className="text-emerald-200 text-xs font-bold uppercase tracking-wider">
                Financial Clearance Gateway
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight flex items-center gap-2.5">
              <Banknote className="text-emerald-300" />
              Vendor Payout Approvals
            </h1>
            <p className="mt-1 text-sm text-emerald-100 max-w-xl">
              Super Admin clearance hub to approve partner bank settlements, bKash/Nagad transfers, and wallet payouts.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-xs font-extrabold text-emerald-950 bg-emerald-300 px-3.5 py-2 rounded-xl shadow-sm">
              <Lock size={14} /> Super Admin Control Only
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchPayouts}
              className="h-10 rounded-xl bg-white/10 hover:bg-white/20 text-white border-white/20 font-bold gap-2 text-xs"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-white p-4 border border-slate-200/80 shadow-sm flex items-center gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <Clock size={20} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Pending Requests</p>
            <p className="text-xl font-extrabold text-amber-600">
              {pendingCount} <span className="text-xs font-bold text-slate-400"> (৳{pendingAmount.toLocaleString()})</span>
            </p>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-4 border border-slate-200/80 shadow-sm flex items-center gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Approved & Paid</p>
            <p className="text-xl font-extrabold text-emerald-600">{paidCount}</p>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-4 border border-slate-200/80 shadow-sm flex items-center gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
            <XCircle size={20} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Rejected Requests</p>
            <p className="text-xl font-extrabold text-rose-600">{rejectedCount}</p>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-4 border border-slate-200/80 shadow-sm flex items-center gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <Wallet size={20} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Total Settled Volume</p>
            <p className="text-xl font-extrabold text-slate-900">৳ {totalAmount.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="rounded-2xl bg-white border border-slate-200/80 shadow-sm overflow-hidden">
        {/* Search & Status Filters */}
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-3 text-slate-400" size={16} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search vendor, business name, payout ref, method..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <Filter size={14} className="text-slate-400 shrink-0 ml-1" />
            {(["ALL", "PENDING", "PAID", "REJECTED"] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  statusFilter === st
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {st === "ALL" ? "All Payouts" : st}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center text-slate-500">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent mb-3" />
              <p className="text-xs font-semibold">Loading vendor payout requests...</p>
            </div>
          ) : filteredPayouts.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <Banknote size={36} className="mx-auto mb-3 text-slate-300" />
              <p className="text-sm font-semibold text-slate-600">No payout requests found</p>
              <p className="text-xs text-slate-400 mt-1">All vendor accounts are clear or check your filters.</p>
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Payout Ref</th>
                  <th className="py-3.5 px-6">Vendor Business</th>
                  <th className="py-3.5 px-6">Payout Method</th>
                  <th className="py-3.5 px-6">Requested Amount</th>
                  <th className="py-3.5 px-6">Requested Date</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Approval Decision</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPayouts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6 font-bold text-slate-900 font-mono">
                      #{p.id.slice(-8)}
                    </td>

                    <td className="py-4 px-6 font-semibold text-slate-900">
                      <div className="flex items-center gap-2">
                        <Building2 size={14} className="text-slate-400 shrink-0" />
                        <div>
                          <div>{p.vendor?.businessName || p.vendor?.user?.fullName || "Vendor Partner"}</div>
                          <div className="text-[11px] font-normal text-slate-400">
                            {p.vendor?.user?.email || p.vendor?.phone || "Registered Vendor"}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6 text-slate-700 font-semibold">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-mono text-[11px]">
                        <CreditCard size={12} className="text-slate-400" />
                        {p.paymentMethod}
                      </span>
                    </td>

                    <td className="py-4 px-6 font-extrabold text-emerald-600 text-sm">
                      ৳ {p.amount.toLocaleString()}
                    </td>

                    <td className="py-4 px-6 text-slate-400 font-medium whitespace-nowrap">
                      {new Date(p.requestedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>

                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          p.paymentStatus === "PAID"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : p.paymentStatus === "REJECTED"
                            ? "bg-rose-50 text-rose-700 border border-rose-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            p.paymentStatus === "PAID"
                              ? "bg-emerald-500"
                              : p.paymentStatus === "REJECTED"
                              ? "bg-rose-500"
                              : "bg-amber-500 animate-pulse"
                          }`}
                        />
                        {p.paymentStatus}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      {p.paymentStatus === "PENDING" ? (
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            disabled={processingId === p.id + "_PAID"}
                            onClick={() => handleProcess(p.id, "PAID")}
                            className="h-8 rounded-xl px-3 text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white gap-1 shadow-sm"
                          >
                            <Check size={13} /> Approve & Pay
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={processingId === p.id + "_REJECTED"}
                            onClick={() => handleProcess(p.id, "REJECTED")}
                            className="h-8 rounded-xl px-3 text-[11px] font-bold border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 gap-1"
                          >
                            <X size={13} /> Reject
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs font-semibold text-slate-400 italic">
                          {p.paymentStatus === "PAID" ? "Paid & Wallet Deducted" : "Rejected"}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
