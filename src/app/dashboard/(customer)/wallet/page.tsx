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
  ShieldCheck,
  Zap
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
} from "@/components/ui/dialog";
import { toast } from "@/lib/toast";
import { motion } from "framer-motion";

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

function isCredit(type: string) {
  return ["DEPOSIT", "REFUND"].includes(type.toUpperCase());
}

function txStatusStyle(status: string): { cls: string; dot: string } {
  switch (status.toUpperCase()) {
    case "COMPLETED": return { cls: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300", dot: "bg-emerald-500" };
    case "PENDING":   return { cls: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300",       dot: "bg-amber-400"   };
    case "FAILED":
    case "CANCELLED": return { cls: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300",          dot: "bg-rose-400"    };
    default:          return { cls: "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300",       dot: "bg-slate-400"   };
  }
}

// ─── Balance cards ────────────────────────────────────────────────────────────

function WalletBalanceCard({ balance, onTopUp }: { balance: number; onTopUp: () => void }) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-7 text-white shadow-2xl border border-indigo-900/40"
    >
      <div className="pointer-events-none absolute inset-0 opacity-20">
        <div className="absolute -top-12 -right-12 h-56 w-56 rounded-full bg-indigo-500 blur-3xl" />
        <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-purple-500 blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col gap-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] font-black uppercase tracking-widest text-indigo-300">LAVO Pay Wallet Balance</p>
            <p className="mt-2 text-4xl font-black tracking-tight leading-none text-white">
              ৳{balance.toFixed(2)}
            </p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md shadow-inner">
            <Wallet size={24} className="text-indigo-200" />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/10">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] font-extrabold text-indigo-200 backdrop-blur-md">
              <TrendingUp size={12} /> BDT Currency
            </span>
            <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 px-3 py-1 text-[11px] font-extrabold text-emerald-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> Active
            </span>
          </div>

          <Button
            onClick={onTopUp}
            className="h-9 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-md shadow-indigo-600/30 gap-1.5 transition-all hover:scale-[1.02]"
          >
            <PlusCircle size={14} /> Top Up Wallet
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

function LoyaltyCard({ points }: { points: number }) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-900 via-indigo-900 to-purple-950 p-7 text-white shadow-2xl border border-violet-800/40"
    >
      <div className="pointer-events-none absolute inset-0 opacity-20">
        <div className="absolute -top-12 -right-12 h-56 w-56 rounded-full bg-violet-400 blur-3xl" />
        <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-purple-500 blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col gap-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] font-black uppercase tracking-widest text-violet-300">Loyalty Rewards Tier</p>
            <p className="mt-2 text-4xl font-black tracking-tight leading-none text-white">
              {points.toLocaleString()} <span className="text-2xl font-black text-violet-300">PTS</span>
            </p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md shadow-inner">
            <Sparkles size={24} className="text-violet-200" />
          </div>
        </div>

        <div className="space-y-2 pt-1">
          <p className="text-xs font-medium text-violet-100 leading-relaxed">
            Earn 1 point for every ৳100 spent on laundry. Convert points into free order vouchers!
          </p>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 border border-amber-300/30 text-amber-300 text-[10px] font-black">
              ⭐ VIP Gold Member
            </span>
          </div>
        </div>
      </div>
    </motion.div>
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
        toast.info("Redirecting to SSLCommerz gateway...");
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
      <DialogContent className="sm:max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 dark:bg-slate-900">
        <DialogHeader>
          <DialogTitle className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
              <CreditCard size={18} />
            </div>
            Instant Wallet Top-Up
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500 font-medium">
            Deposit cash securely via SSLCommerz — bKash, Nagad, Visa, Mastercard, Rocket.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="topupAmount" className="text-xs font-black text-slate-700 dark:text-slate-300">Deposit Amount (BDT)</Label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-black text-base">৳</span>
              <Input
                id="topupAmount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount (e.g. 1000)"
                min="10"
                required
                className="pl-8 h-11 text-sm rounded-2xl font-black bg-slate-50/80 border-slate-200 dark:bg-slate-800 dark:border-slate-700"
              />
            </div>
            <p className="text-[10px] text-slate-400 font-medium">Minimum deposit: ৳10 BDT</p>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {[100, 500, 1000, 2000].map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => setAmount(amt.toString())}
                className={`rounded-xl border py-2.5 text-xs font-black transition-all ${
                  amount === amt.toString()
                    ? "border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-500"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
                }`}
              >
                +৳{amt}
              </button>
            ))}
          </div>

          <Button
            type="submit"
            disabled={loading || !amount}
            className="w-full rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black h-11 gap-2 shadow-lg shadow-indigo-600/30 transition-all"
          >
            {loading ? (
              <><Loader2 size={16} className="animate-spin" /> Initializing Payment Gateway...</>
            ) : (
              <><CreditCard size={16} /> Proceed to Pay</>
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
    <div className="flex items-center gap-4 px-6 py-4.5 hover:bg-slate-50/60 transition-colors dark:hover:bg-slate-800/40">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border ${
        credit ? "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/40 dark:border-emerald-900/60" : "bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-950/40 dark:border-rose-900/60"
      }`}>
        {credit ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-xs sm:text-sm font-black text-slate-900 dark:text-white leading-tight">{tx.transactionType}</p>
        <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wide mt-0.5">
          {tx.paymentMethod || "WALLET"}
          {tx.referenceType && ` · ${tx.referenceType}`}
        </p>
      </div>

      <div className="hidden sm:block text-right shrink-0">
        <p className="font-mono text-xs font-black text-slate-600 dark:text-slate-300">{tx.referenceId || "—"}</p>
      </div>

      <div className="hidden md:block text-right shrink-0">
        <p className="text-xs font-medium text-slate-400">
          {new Date(tx.createdAt).toLocaleString("en-US", {
            month: "short", day: "numeric",
            hour: "2-digit", minute: "2-digit",
          })}
        </p>
      </div>

      <span className={`hidden sm:inline-flex items-center gap-1.5 shrink-0 rounded-full border px-3 py-0.5 text-[10px] font-black ${cls}`}>
        <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
        {tx.status}
      </span>

      <p className={`shrink-0 text-base font-black ${credit ? "text-emerald-600 dark:text-emerald-400" : "text-slate-900 dark:text-white"}`}>
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
      toast.error("Failed to load wallet telemetry");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-40 rounded-3xl bg-slate-200 dark:bg-slate-800" />
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="h-48 rounded-3xl bg-slate-200 dark:bg-slate-800" />
          <div className="h-48 rounded-3xl bg-slate-200 dark:bg-slate-800" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white py-24 text-center dark:bg-slate-900 dark:border-slate-800">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
          <AlertCircle size={26} />
        </div>
        <p className="text-sm font-black text-slate-900 dark:text-white">Could not load wallet data</p>
        <p className="mt-1 text-xs text-slate-400 font-medium">Check your network connection and try again.</p>
        <Button onClick={loadData} variant="outline" className="mt-4 h-9 px-4 rounded-xl text-xs font-extrabold border-slate-200">
          Retry
        </Button>
      </div>
    );
  }

  const totalIn  = transactions.filter((t) => isCredit(t.transactionType) && t.status.toUpperCase() === "COMPLETED")
                               .reduce((s, t) => s + t.amount, 0);
  const totalOut = transactions.filter((t) => !isCredit(t.transactionType) && t.status.toUpperCase() === "COMPLETED")
                               .reduce((s, t) => s + t.amount, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-7"
    >
      {/* ── 1. Hero Header Banner ───────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-indigo-900 to-slate-900 p-7 md:p-9 text-white shadow-2xl border border-indigo-800/40">
        <div className="pointer-events-none absolute inset-0 opacity-20">
          <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-indigo-500 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-purple-500 blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Wallet size={14} className="text-indigo-300" />
              <span className="text-indigo-200 text-xs font-black uppercase tracking-widest">
                Digital Wallet &amp; Cashback Rewards
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white leading-tight">
              My LAVO Pay Wallet
            </h1>
            <p className="text-indigo-100 text-xs md:text-sm leading-relaxed font-medium max-w-xl">
              1-tap instant laundry checkout, automatic cashbacks, and transparent transaction logs.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button
              onClick={() => setDialogOpen(true)}
              className="h-11 px-6 rounded-2xl bg-white text-indigo-700 hover:bg-indigo-50 font-black text-xs shadow-lg gap-2 transition-all hover:scale-[1.02]"
            >
              <PlusCircle size={16} /> Add Wallet Balance
            </Button>
          </div>
        </div>
      </div>

      {/* ── 2. Balance Cards Grid ────────────────────────────────────────────── */}
      <div className="grid gap-6 sm:grid-cols-2">
        <WalletBalanceCard balance={walletBalance} onTopUp={() => setDialogOpen(true)} />
        <LoyaltyCard points={loyaltyPoints} />
      </div>

      {/* ── 3. Summary Telemetry Row ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div whileHover={{ y: -2 }} className="flex items-center gap-4 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:bg-slate-900 dark:border-slate-800">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
            <ArrowDownLeft size={22} />
          </div>
          <div>
            <p className="text-xl font-black text-slate-900 dark:text-white leading-none">৳{totalIn.toFixed(2)}</p>
            <p className="mt-1 text-xs font-bold text-slate-500">Total Deposited</p>
          </div>
        </motion.div>

        <motion.div whileHover={{ y: -2 }} className="flex items-center gap-4 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:bg-slate-900 dark:border-slate-800">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400">
            <ArrowUpRight size={22} />
          </div>
          <div>
            <p className="text-xl font-black text-slate-900 dark:text-white leading-none">৳{totalOut.toFixed(2)}</p>
            <p className="mt-1 text-xs font-bold text-slate-500">Total Spent</p>
          </div>
        </motion.div>

        <motion.div whileHover={{ y: -2 }} className="flex items-center gap-4 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:bg-slate-900 dark:border-slate-800">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
            <BadgeDollarSign size={22} />
          </div>
          <div>
            <p className="text-xl font-black text-slate-900 dark:text-white leading-none">{transactions.length}</p>
            <p className="mt-1 text-xs font-bold text-slate-500">Total Transactions</p>
          </div>
        </motion.div>
      </div>

      {/* ── 4. Transaction History Table ────────────────────────────────────── */}
      <div className="rounded-3xl border border-slate-200/80 bg-white shadow-sm overflow-hidden dark:bg-slate-900 dark:border-slate-800">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
              <History size={18} />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-900 dark:text-white">Transaction Logs</h2>
              <p className="text-[11px] text-slate-400 font-medium">Deposits, order checkouts, and refunds</p>
            </div>
          </div>
          <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs font-black text-slate-600 dark:text-slate-300">
            {transactions.length} Records
          </span>
        </div>

        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-slate-300 dark:bg-slate-800">
              <History size={24} />
            </div>
            <p className="text-sm font-black text-slate-900 dark:text-white">No transactions yet</p>
            <p className="mt-1 text-xs text-slate-400 font-medium">Your deposit and order payment activity will be listed here.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {transactions.map((tx) => <TxRow key={tx.id} tx={tx} />)}
          </div>
        )}
      </div>

      <TopupDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </motion.div>
  );
}
