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
  Loader2
} from "lucide-react";
import { authFetch } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/lib/toast";

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

export default function WalletPage() {
  const [walletBalance, setWalletBalance] = useState(0);
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Top up state
  const [topupAmount, setTopupAmount] = useState("");
  const [topupLoading, setTopupLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const loadData = async () => {
    try {
      const profileRes = await authFetch("/customer/profile");
      const profileData = await profileRes.json();
      if (profileData.success) {
        setWalletBalance(profileData.data.walletBalance);
        setLoyaltyPoints(profileData.data.loyaltyPoints);
      }

      const txRes = await authFetch("/customer/wallet/transactions");
      const txData = await txRes.json();
      if (txData.success) {
        setTransactions(txData.data);
      }
    } catch (err) {
      console.error("Error loading wallet details:", err);
      toast.error("Failed to load wallet data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleTopupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(topupAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error("Please enter a valid deposit amount");
      return;
    }

    setTopupLoading(true);
    try {
      const res = await authFetch("/payments/sslcommerz/topup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amountNum }),
      });

      const data = await res.json();
      if (data.success && data.data?.gatewayUrl) {
        toast.info("Redirecting to payment gateway...");
        window.location.href = data.data.gatewayUrl;
      } else {
        toast.error(data.message || "Failed to initialize payment gateway");
      }
    } catch {
      toast.error("Top-up request failed");
    } finally {
      setTopupLoading(false);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status.toUpperCase()) {
      case "COMPLETED":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "PENDING":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "FAILED":
      case "CANCELLED":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center">
        <Loader2 size={36} className="text-indigo-600 animate-spin mb-4" />
        <p className="text-slate-600 font-medium">Loading wallet details...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">My Wallet</h1>
          <p className="text-slate-500">Add online balance credits, earn loyalty points, and review transactions.</p>
        </div>

        {/* Top-up Dialog Trigger */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger
            className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-bold h-11 px-5 shadow-md shadow-indigo-100 hover:scale-[1.02] transition-transform"
          >
            <PlusCircle size={18} /> Add Balance Credits
          </DialogTrigger>
          <DialogContent className="sm:max-w-md rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-slate-900">Wallet Top-up</DialogTitle>
              <DialogDescription>
                Deposit credits to your local LAUNDRIX Wallet using secure SSLCommerz gateways (bKash, Cards, etc.)
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleTopupSubmit} className="space-y-4 pt-3">
              <div className="space-y-1.5">
                <Label htmlFor="topupAmount" className="text-xs font-bold text-slate-700">Top-up Amount (BDT)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-slate-400 font-bold text-sm">৳</span>
                  <Input
                    id="topupAmount"
                    type="number"
                    value={topupAmount}
                    onChange={(e) => setTopupAmount(e.target.value)}
                    placeholder="Enter amount (e.g. 500)"
                    min="10"
                    required
                    className="pl-7 h-11 text-sm rounded-xl font-bold"
                  />
                </div>
                <p className="text-[10px] text-slate-400">Minimum deposit: 10 BDT</p>
              </div>

              {/* Quick suggestion amounts */}
              <div className="flex gap-2">
                {[100, 500, 1000, 2000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setTopupAmount(amt.toString())}
                    className="flex-1 py-2 text-xs font-bold border rounded-xl hover:bg-slate-50 transition-colors text-slate-600 border-slate-200"
                  >
                    +৳{amt}
                  </button>
                ))}
              </div>

              <Button
                type="submit"
                disabled={topupLoading || !topupAmount}
                className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-11 mt-4"
              >
                {topupLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin mr-2" />
                    Initializing Gateway...
                  </>
                ) : (
                  "Proceed to Pay Online"
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Balance stats grid */}
      <div className="grid gap-6 sm:grid-cols-2">
        {/* Balance credit card */}
        <Card className="relative overflow-hidden border-none bg-gradient-to-tr from-slate-900 to-indigo-950 text-white shadow-xl">
          <CardContent className="p-8 space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-indigo-300 font-bold uppercase tracking-wider">LAUNDRIX Balance</p>
                <h3 className="text-4xl font-extrabold tracking-tight mt-1">৳{walletBalance.toFixed(2)}</h3>
              </div>
              <div className="rounded-2xl bg-white/10 p-3 text-white">
                <Wallet size={24} />
              </div>
            </div>
            
            <div className="flex items-center gap-1.5 text-xs text-indigo-200 bg-white/5 py-1.5 px-3.5 rounded-full w-fit">
              <TrendingUp size={12} /> Standard Currency: BDT
            </div>
          </CardContent>
        </Card>

        {/* Loyalty Points Credit Card */}
        <Card className="relative overflow-hidden border-none bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-xl">
          <CardContent className="p-8 space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-indigo-200 font-bold uppercase tracking-wider">Loyalty Rewards</p>
                <h3 className="text-4xl font-extrabold tracking-tight mt-1">{loyaltyPoints} PTS</h3>
              </div>
              <div className="rounded-2xl bg-white/10 p-3 text-white">
                <Sparkles size={24} />
              </div>
            </div>

            <div className="flex items-center gap-1 text-xs text-purple-100 font-medium">
              Points earned automatically with payments. 100 BDT spent = 1 Loyalty Point!
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction History list */}
      <Card className="border border-slate-100 shadow-sm">
        <CardHeader className="border-b border-slate-50 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold text-slate-900">Transaction History</CardTitle>
            <CardDescription className="text-xs text-slate-500">Record logs of your deposits, payouts, refunds</CardDescription>
          </div>
          <div className="text-slate-400">
            <History size={18} />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {transactions.length === 0 ? (
            <div className="text-center py-16 text-slate-400 text-sm">
              No transactions recorded yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-slate-50/50 border-b text-slate-500 font-bold">
                  <tr>
                    <th className="p-4 pl-6">Type & Method</th>
                    <th className="p-4">Reference</th>
                    <th className="p-4">Date</th>
                    <th className="p-4 text-center">Status</th>
                    <th className="p-4 text-right pr-6">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-slate-700">
                  {transactions.map((tx) => {
                    const isCredit = tx.transactionType.toUpperCase() === "DEPOSIT" || tx.transactionType.toUpperCase() === "REFUND";
                    return (
                      <tr key={tx.id} className="hover:bg-slate-50/20 transition-colors">
                        <td className="p-4 pl-6 flex items-center gap-3">
                          <div className={`p-1.5 rounded-lg border ${
                            isCredit
                              ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                              : "bg-rose-50 text-rose-600 border-rose-100"
                          }`}>
                            {isCredit ? <ArrowDownLeft size={14} /> : <ArrowUpRight size={14} />}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block">{tx.transactionType}</span>
                            <span className="text-[10px] text-slate-400 font-semibold uppercase">{tx.paymentMethod || "WALLET"}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="font-mono text-[10px] text-slate-500 font-bold">{tx.referenceId || "N/A"}</span>
                          {tx.referenceType && (
                            <span className="text-[9px] block text-slate-400 font-bold uppercase">{tx.referenceType}</span>
                          )}
                        </td>
                        <td className="p-4 text-slate-500 font-medium">
                          {new Date(tx.createdAt).toLocaleString()}
                        </td>
                        <td className="p-4 text-center">
                          <span className={`text-[10px] px-2.5 py-0.5 rounded-full border font-bold ${getStatusStyle(tx.status)}`}>
                            {tx.status}
                          </span>
                        </td>
                        <td className={`p-4 text-right pr-6 font-extrabold text-sm ${
                          isCredit ? "text-emerald-600" : "text-slate-900"
                        }`}>
                          {isCredit ? "+" : "-"}৳{tx.amount.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
