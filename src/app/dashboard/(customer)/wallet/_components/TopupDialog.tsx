"use client";

import React, { useState } from "react";
import { CreditCard, Loader2 } from "lucide-react";
import { authFetch } from "@/lib/api";
import { toast } from "@/lib/toast";
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

interface TopupDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export function TopupDialog({ open, onOpenChange }: TopupDialogProps) {
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
        toast.info("Redirecting to payment gateway...");
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
      <DialogContent className="sm:max-w-md rounded-3xl border border-border bg-card">
        <DialogHeader>
          <DialogTitle className="text-base font-black text-card-foreground flex items-center gap-2.5">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10"
              style={{ color: "var(--primary)" }}
            >
              <CreditCard size={18} />
            </div>
            Instant Wallet Top-Up
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground font-medium">
            Deposit cash securely via Online Payment — bKash, Nagad, Visa, Mastercard, Rocket.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="topupAmount" className="text-xs font-black text-card-foreground">
              Deposit Amount (BDT)
            </Label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground font-black text-base">৳</span>
              <Input
                id="topupAmount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount (e.g. 1000)"
                min="10"
                required
                className="pl-8 h-11 text-sm rounded-2xl font-black"
              />
            </div>
            <p className="text-[10px] text-muted-foreground font-medium">Minimum deposit: ৳10 BDT</p>
          </div>

          {/* Quick amount presets */}
          <div className="grid grid-cols-4 gap-2">
            {[100, 500, 1000, 2000].map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => setAmount(amt.toString())}
                className="rounded-xl border py-2.5 text-xs font-black transition-all"
                style={
                  amount === amt.toString()
                    ? {
                        borderColor: "var(--primary)",
                        background: "color-mix(in srgb, var(--primary) 10%, transparent)",
                        color: "var(--primary)",
                      }
                    : {
                        borderColor: "var(--border)",
                        color: "var(--muted-foreground)",
                      }
                }
              >
                +৳{amt}
              </button>
            ))}
          </div>

          <Button
            type="submit"
            disabled={loading || !amount}
            className="w-full rounded-2xl text-white font-black h-11 gap-2 shadow-lg transition-all"
            style={{ background: "linear-gradient(135deg, var(--primary), var(--ring))" }}
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
