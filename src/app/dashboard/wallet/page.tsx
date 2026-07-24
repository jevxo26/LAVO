"use client";

import React, { useEffect, useState } from "react";
import {
  Wallet,
  Sparkles,
  ArrowUpRight,
  ArrowDownLeft,
  PlusCircle,
  History,
  TrendingUp,
  Loader2,
  AlertCircle,
  CreditCard,
  BadgeDollarSign,
} from "lucide-react";
import { authFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "@/lib/toast";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Transaction {
  id: string;
  transactionType: string;
  amount: number;
  referenceType?: string;
  referenceId?: string;
  paymentMethod?: string;
  status: string;
  createdAt: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isCredit(type: string) {
  return ["DEPOSIT", "REFUND"].includes(type.toUpperCase());
}

function txStatusStyle(status: string): { cls: string; dot: string } {
  switch (status.toUpperCase()) {
    case "COMPLETED": return { cls: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" };
    case "PENDING":   return { cls: "bg-amber-50 text-amber-700 border-amber-200",       dot: "bg-amber-400"   };
    case "FAILED":
    case "CANCELLED": return { cls: "bg-rose-50 text-rose-700 border-rose-200",          dot: "bg-rose-400"    };
    default:          return { cls: "bg-slate-50 text-slate-600 border-slate-200",       dot: "bg-slate-400"   };
  }
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Sk({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-slate-100 ${className ?? ""}`} />;
}

function WalletSkeleton() {
  return (
    <div className="space-y-7">
      {/* hero */}
      <Sk className="h-36 w-full rounded-2xl" />
      {/* cards */}
      <div className="grid gap-5 sm:grid-cols-2">
        <Sk className="h-44 rounded-2xl" />
        <Sk className="h-44 rounded-2xl" />
      </div>
      {/* table header */}
      <div className="rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="space-y-2">
            <Sk className="h-4 w-40" />
            <Sk className="h-3 w-56" />
          </div>
          <Sk className="h-8 w-8 rounded-lg" />
        </div>
        <div className="divide-y divide-slate-50">
          {[0,1,2,3].map((i) => (
            <div key={i} className="flex items-center gap-4 px-6 py-4">
              <Sk className="h-9 w-9 rounded-xl shrink-0" />
              <div className="flex-1 space-y-1.5">
                <Sk className="h-3.5 w-28" />
                <Sk className="h-3 w-20" />
              </div>
              <Sk className="h-3 w-24" />
              <Sk className="h-5 w-16 rounded-full" />
              <Sk className="h-4 w-20 ml-auto" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Balance cards ────────────────────────────────────────────────────────────

function WalletBalanceCard({ balance }: { balance: number }) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-7 text-white shadow-xl">
      {/* decorative */}
      <div className="pointer-events-none absolute inset-0 opacity-10">
        <div className="absolute -top-8 -right-8 h-40 w-40 rounded-full bg-indigo-400" />
        <div className="absolute -bottom-6 -left-6 h-28 w-28 rounded-full bg-indigo-500" />
      </div>

      <div className="relative z-10 flex flex-col gap-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-indigo-300">LAVO Wallet Balance</p>
            <p className="mt-1.5 text-4xl font-extrabold tracking-tight leading-none">
              ৳{balance.toFixed(2)}
            </p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
            <Wallet size={22} className="text-indigo-200" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold text-indigo-200">
            <TrendingUp size={11} /> BDT — Bangladesh Taka
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 px-3 py-1 text-[11px] font-semibold text-emerald-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Active
          </div>
        </div>
      </div>
    </div>
  );
}

function LoyaltyCard({ points }: { points: number }) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-700 p-7 text-white shadow-xl">
      <div className="pointer-events-none absolute inset-0 opacity-10">
        <div className="absolute -top-8 -right-8 h-40 w-40 rounded-full bg-white" />
        <div className="absolute -bottom-6 -left-6 h-28 w-28 rounded-full bg-white" />
      </div>

      <div className="relative z-10 flex flex-col gap-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-violet-200">Loyalty Rewards</p>
            <p className="mt-1.5 text-4xl font-extrabold tracking-tight leading-none">
              {points.toLocaleString()} <span className="text-2xl font-bold text-violet-200">PTS</span>
            </p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
            <Sparkles size={22} className="text-violet-200" />
          </div>
        </div>

        <p className="text-[11px] font-medium text-violet-200 leading-relaxed">
          Earn 1 point for every ৳100 spent. Redeem points on your next order.
        </p>
      </div>
    </div>
  );
}

// ─── Top-up dialog ────────────────────────────────────────────────────────────

interface TopupDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

function TopupDialog({ open, onOpenChange }: TopupDialogProps) {
  const [amount, setAmount]   = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) { toast.error("Please enter a valid deposit amount"); return; }

    setLoading(true);
    try {
      const res  = await authFetch("/payments/sslcommerz/topup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: num }),
      });
      const data = await res.json();
      if (data.success && data.data?.gatewayUrl) {
        toast.info("Redirecting to payment gateway…");
        window.location.href = data.data.gatewayUrl;
      } else {
        toast.error(data.message || "Failed to initialize payment gateway");
      }
    } catch {
      toast.error("Top-up request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50">
              <CreditCard size={15} className="text-indigo-600" />
            </div>
            Wallet Top-up
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Deposit credits via SSLCommerz — bKash, Cards, Nagad and more.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="topupAmount" className="text-xs font-bold text-slate-700">Amount (BDT)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">৳</span>
              <Input
                id="topupAmount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount (e.g. 500)"
                min="10"
                required
                className="pl-7 h-11 text-sm rounded-xl font-bold"
              />
            </div>
            <p className="text-[10px] text-slate-400">Minimum deposit: ৳10 BDT</p>
          </div>

          {/* Quick amount buttons */}
          <div className="grid grid-cols-4 gap-2">
            {[100, 500, 1000, 2000].map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => setAmount(amt.toString())}
                className={`rounded-xl border py-2 text-xs font-bold transition-all
                  ${amount === amt.toString()
                    ? "border-indigo-400 bg-indigo-50 text-indigo-700"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"}`}
              >
                +৳{amt}
              </button>
            ))}
          </div>

          <Button
            type="submit"
            disabled={loading || !amount}
            className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-11 gap-2"
          >
            {loading ? (
              <><Loader2 size={15} className="animate-spin" /> Initializing Gateway…</>
            ) : (
              <><CreditCard size={15} /> Proceed to Pay</>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Transaction row ──────────────────────────────────────────────────────────

function TxRow({ tx }: { tx: Transaction }) {
  const credit              = isCredit(tx.transactionType);
  const { cls, dot }        = txStatusStyle(tx.status);

  return (
    <div className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50/50 transition-colors">
      {/* Icon */}
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border
        ${credit ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-rose-50 text-rose-600 border-rose-100"}`}>
        {credit ? <ArrowDownLeft size={15} /> : <ArrowUpRight size={15} />}
      </div>

      {/* Type + method */}
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-bold text-slate-900 leading-tight">{tx.transactionType}</p>
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
          {tx.paymentMethod || "WALLET"}
          {tx.referenceType && ` · ${tx.referenceType}`}
        </p>
      </div>

      {/* Reference */}
      <div className="hidden sm:block text-right shrink-0">
        <p className="font-mono text-[11px] text-slate-500 font-bold">{tx.referenceId || "—"}</p>
      </div>

      {/* Date */}
      <div className="hidden md:block text-right shrink-0">
        <p className="text-[11px] text-slate-400 font-medium">
          {new Date(tx.createdAt).toLocaleString("en-US", {
            month: "short", day: "numeric",
            hour: "2-digit", minute: "2-digit",
          })}
        </p>
      </div>

      {/* Status badge */}
      <span className={`hidden sm:inline-flex items-center gap-1.5 shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${cls}`}>
        <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
        {tx.status}
      </span>

      {/* Amount */}
      <p className={`shrink-0 text-sm font-extrabold ${credit ? "text-emerald-600" : "text-slate-900"}`}>
        {credit ? "+" : "−"}৳{tx.amount.toFixed(2)}
      </p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function WalletPage() {
  const [walletBalance, setWalletBalance] = useState(0);
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  const [transactions, setTransactions]   = useState<Transaction[]>([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState(false);
  const [dialogOpen, setDialogOpen]       = useState(false);

  const loadData = async () => {
    setError(false);
    try {
      const [profileRes, txRes] = await Promise.all([
        authFetch("/customer/profile"),
        authFetch("/customer/wallet/transactions"),
      ]);
      const profileData = await profileRes.json();
      const txData      = await txRes.json();

      if (profileData.success) {
        setWalletBalance(profileData.data.walletBalance);
        setLoyaltyPoints(profileData.data.loyaltyPoints);
      }
      if (txData.success) setTransactions(txData.data);
    } catch (err) {
      console.error("Error loading wallet details:", err);
      setError(true);
      toast.error("Failed to load wallet data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  if (loading) return <WalletSkeleton />;

  if (error) return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-24 text-center shadow-sm">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50">
        <AlertCircle size={26} className="text-rose-400" />
      </div>
      <p className="text-sm font-semibold text-slate-700">Could not load wallet data</p>
      <p className="mt-1 text-xs text-slate-400">Check your connection and try again.</p>
      <Button size="sm" variant="outline" onClick={loadData}
        className="mt-4 rounded-xl border-slate-200 text-xs font-bold">
        Retry
      </Button>
    </div>
  );

  // Total credits / debits for summary
  const totalIn  = transactions.filter((t) => isCredit(t.transactionType) && t.status.toUpperCase() === "COMPLETED")
                               .reduce((s, t) => s + t.amount, 0);
  const totalOut = transactions.filter((t) => !isCredit(t.transactionType) && t.status.toUpperCase() === "COMPLETED")
                               .reduce((s, t) => s + t.amount, 0);

  return (
    <div className="space-y-7">

      {/* ── Hero Header ──────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-700 px-7 py-8">
        <div className="pointer-events-none absolute inset-0 opacity-10">
          <div className="absolute -top-12 -right-12 h-56 w-56 rounded-full bg-white" />
          <div className="absolute -bottom-10 -left-8 h-40 w-40 rounded-full bg-white" />
        </div>

        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Wallet size={13} className="text-indigo-200" />
              <span className="text-indigo-200 text-[11px] font-semibold uppercase tracking-widest">
                Digital Wallet
              </span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white">My Wallet</h1>
            <p className="mt-1 text-sm text-indigo-200">
              Manage your balance, loyalty points, and transaction history.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="rounded-xl bg-white/10 border border-white/20 backdrop-blur-sm px-4 py-3 text-center">
              <p className="text-indigo-200 text-[10px] font-semibold uppercase tracking-wider">Balance</p>
              <p className="text-white font-extrabold text-xl leading-tight">৳{walletBalance.toFixed(2)}</p>
            </div>
            <Button
              onClick={() => setDialogOpen(true)}
              className="h-10 rounded-xl bg-white text-indigo-700 hover:bg-indigo-50 font-bold text-xs px-4 gap-1.5 shadow-sm"
            >
              <PlusCircle size={14} /> Add Balance
            </Button>
          </div>
        </div>
      </div>

      {/* ── Balance Cards ─────────────────────────────────────────────────── */}
      <div className="grid gap-5 sm:grid-cols-2">
        <WalletBalanceCard balance={walletBalance} />
        <LoyaltyCard points={loyaltyPoints} />
      </div>

      {/* ── Summary stat row ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Deposited",  value: `৳${totalIn.toFixed(2)}`,   iconBg: "bg-emerald-50", iconColor: "text-emerald-600", ringColor: "ring-emerald-100", Icon: ArrowDownLeft  },
          { label: "Total Spent",      value: `৳${totalOut.toFixed(2)}`,  iconBg: "bg-rose-50",    iconColor: "text-rose-500",    ringColor: "ring-rose-100",    Icon: ArrowUpRight   },
          { label: "Transactions",     value: String(transactions.length), iconBg: "bg-indigo-50",  iconColor: "text-indigo-600",  ringColor: "ring-indigo-100",  Icon: BadgeDollarSign },
        ].map(({ label, value, iconBg, iconColor, ringColor, Icon }) => (
          <div key={label} className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ring-4 ${iconBg} ${iconColor} ${ringColor}`}>
              <Icon size={19} />
            </div>
            <div className="min-w-0">
              <p className="text-lg font-extrabold text-slate-900 leading-none truncate">{value}</p>
              <p className="mt-0.5 text-[11px] font-semibold text-slate-500 leading-tight">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Transaction History ───────────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50">
              <History size={14} className="text-indigo-500" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-slate-900">Transaction History</h2>
              <p className="text-[11px] text-slate-400">Deposits, payments, refunds</p>
            </div>
          </div>
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-600">
            {transactions.length} records
          </span>
        </div>

        {/* Table / empty */}
        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50">
              <History size={24} className="text-slate-300" />
            </div>
            <p className="text-sm font-semibold text-slate-600">No transactions yet</p>
            <p className="mt-1 text-xs text-slate-400">Your wallet activity will appear here.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {transactions.map((tx) => <TxRow key={tx.id} tx={tx} />)}
          </div>
        )}
      </div>

      {/* ── Top-up dialog ─────────────────────────────────────────────────── */}
      <TopupDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
