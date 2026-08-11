"use client";

import React, { useEffect, useState } from "react";
import { Wallet, ArrowUpRight, ArrowDownLeft, BadgeDollarSign, History, AlertCircle } from "lucide-react";
import { authFetch } from "@/lib/api";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { DashboardPageHero } from "@/components/shared/DashboardPageHero";
import { OverviewStatCard } from "@/components/dashboard/shared/overview/OverviewStatCard";
import { WalletBalanceCard } from "./_components/WalletBalanceCard";
import { LoyaltyCard }       from "./_components/LoyaltyCard";
import { TopupDialog }       from "./_components/TopupDialog";
import { TxRow, isCredit }   from "./_components/TxRow";
import type { Transaction }  from "./_components/TxRow";

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function WalletSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-44 rounded-3xl bg-muted" />
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="h-48 rounded-3xl bg-muted" />
        <div className="h-48 rounded-3xl bg-muted" />
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[0, 1, 2].map((i) => <div key={i} className="h-28 rounded-3xl bg-muted" />)}
      </div>
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
      console.error("Error loading wallet:", err);
      setError(true);
      toast.error("Failed to load wallet data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  if (loading) return <WalletSkeleton />;

  if (error) return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card py-24 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-error/10 text-error">
        <AlertCircle size={26} />
      </div>
      <p className="text-sm font-black text-card-foreground">Could not load wallet data</p>
      <p className="mt-1 text-xs text-muted-foreground font-medium">Check your network connection and try again.</p>
      <Button onClick={loadData} variant="outline" className="mt-4 h-9 px-4 rounded-xl text-xs font-extrabold border-border">
        Retry
      </Button>
    </div>
  );

  const totalIn  = transactions.filter((t) => isCredit(t.transactionType) && t.status.toUpperCase() === "COMPLETED").reduce((s, t) => s + t.amount, 0);
  const totalOut = transactions.filter((t) => !isCredit(t.transactionType) && t.status.toUpperCase() === "COMPLETED").reduce((s, t) => s + t.amount, 0);

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="space-y-7">

      {/* ── 1. Hero ──────────────────────────────────────────────────────────── */}
      <DashboardPageHero
        badge="Digital Wallet & Cashback Rewards"
        title="My LAVO Wallet"
        description="1-tap instant laundry checkout, automatic cashbacks, and transparent transaction logs."
        icon={Wallet}
        chips={[
          { label: "Balance",       value: `৳${walletBalance.toFixed(2)}` },
          { label: "Reward Points", value: loyaltyPoints                  },
          { label: "Transactions",  value: transactions.length            },
        ]}
      />

      {/* ── 2. Wallet + Loyalty Cards ────────────────────────────────────────── */}
      <div className="grid gap-6 sm:grid-cols-2">
        <WalletBalanceCard balance={walletBalance} onTopUp={() => setDialogOpen(true)} />
        <LoyaltyCard points={loyaltyPoints} />
      </div>

      {/* ── 3. Summary Stats ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <OverviewStatCard label="Total Deposited" sub="Completed deposits"  value={`৳${totalIn.toFixed(2)}`}  icon={ArrowDownLeft}   gradient="from-emerald-500 to-teal-600"  />
        <OverviewStatCard label="Total Spent"     sub="Order payments"      value={`৳${totalOut.toFixed(2)}`} icon={ArrowUpRight}    gradient="from-rose-500 to-pink-600"     />
        <OverviewStatCard label="Transactions"    sub="All-time records"    value={transactions.length}        icon={BadgeDollarSign} gradient="from-blue-500 to-indigo-600"   />
      </div>

      {/* ── 4. Transaction History ───────────────────────────────────────────── */}
      <div className="rounded-3xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10" style={{ color: "var(--primary)" }}>
              <History size={18} />
            </div>
            <div>
              <h2 className="text-sm font-black text-card-foreground">Transaction Logs</h2>
              <p className="text-[11px] text-muted-foreground font-medium">Deposits, order checkouts, and refunds</p>
            </div>
          </div>
          <span className="rounded-full bg-muted px-3 py-1 text-xs font-black text-muted-foreground">
            {transactions.length} Records
          </span>
        </div>

        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
              <History size={24} />
            </div>
            <p className="text-sm font-black text-card-foreground">No transactions yet</p>
            <p className="mt-1 text-xs text-muted-foreground font-medium">Your deposit and order payment activity will be listed here.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {transactions.map((tx) => <TxRow key={tx.id} tx={tx} />)}
          </div>
        )}
      </div>

      <TopupDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </motion.div>
  );
}
