"use client";

import React from "react";
import Link from "next/link";
import { Wallet, CreditCard, TicketCheck, Heart, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

// ─── Types ────────────────────────────────────────────────────────────────────

interface WalletShortcutsPanelProps {
  walletBalance: number;
  wishlistCount: number;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function WalletShortcutsPanel({ walletBalance, wishlistCount }: WalletShortcutsPanelProps) {
  return (
    <div className="md:col-span-2 space-y-5">
      {/* ── Wallet Top-Up Card ── */}
      <div
        className="rounded-3xl p-6 text-white shadow-xl relative overflow-hidden"
        style={{
          background: [
            "radial-gradient(ellipse 80% 80% at 10% 50%, color-mix(in srgb, var(--primary) 55%, transparent) 0%, transparent 60%)",
            "linear-gradient(135deg, color-mix(in srgb, var(--primary) 85%, black 15%) 0%, color-mix(in srgb, var(--primary) 60%, var(--secondary) 40%) 50%, color-mix(in srgb, var(--secondary) 70%, black 30%) 100%)",
          ].join(", "),
          boxShadow: "0 20px 40px -10px color-mix(in srgb, var(--primary) 45%, transparent)",
        }}
      >
        <div className="flex items-start justify-between">
          <div>
            <p
              className="text-[10px] font-black uppercase tracking-widest"
              style={{ color: "color-mix(in srgb, var(--primary-foreground) 60%, var(--secondary))" }}
            >
              LAVO Pay Wallet
            </p>
            <p className="mt-1 text-3xl font-black leading-none">৳{walletBalance.toFixed(2)}</p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md">
            <Wallet size={22} className="text-white" />
          </div>
        </div>

        <p className="mt-3 text-xs text-white/70 font-medium leading-relaxed">
          Instant 1-tap checkout &amp; automatic cashback rewards.
        </p>

        <div className="mt-4 flex gap-2">
          {[500, 1000, 2000].map((amt) => (
            <Link key={amt} href="/dashboard/wallet" className="flex-1">
              <Button className="w-full h-9 rounded-lg bg-white/15 hover:bg-white/25 border border-white/20 text-white font-extrabold text-[11px] backdrop-blur-md transition-all">
                +৳{amt}
              </Button>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Customer Shortcuts ── */}
      <div className="rounded-3xl border border-border bg-card p-5 shadow-sm space-y-3">
        <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground">
          Customer Operations
        </h3>
        <div className="space-y-2">
          <Link
            href="/dashboard/wallet"
            className="flex items-center justify-between p-3 rounded-2xl bg-muted/50 hover:bg-primary/8 hover:text-primary transition-all"
          >
            <div className="flex items-center gap-3">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-success/10"
                style={{ color: "var(--success)" }}
              >
                <CreditCard size={16} />
              </div>
              <span className="text-xs font-extrabold text-card-foreground">Wallet Transactions</span>
            </div>
            <ChevronRight size={15} className="text-muted-foreground" />
          </Link>

          <Link
            href="/dashboard/help-desk"
            className="flex items-center justify-between p-3 rounded-2xl bg-muted/50 hover:bg-primary/8 hover:text-primary transition-all"
          >
            <div className="flex items-center gap-3">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-warning/10"
                style={{ color: "var(--warning)" }}
              >
                <TicketCheck size={16} />
              </div>
              <span className="text-xs font-extrabold text-card-foreground">Support &amp; Help Desk</span>
            </div>
            <ChevronRight size={15} className="text-muted-foreground" />
          </Link>

          <Link
            href="/dashboard/wishlist"
            className="flex items-center justify-between p-3 rounded-2xl bg-muted/50 hover:bg-primary/8 hover:text-primary transition-all"
          >
            <div className="flex items-center gap-3">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-error/10"
                style={{ color: "var(--error)" }}
              >
                <Heart size={16} />
              </div>
              <span className="text-xs font-extrabold text-card-foreground">
                Saved Wishlist ({wishlistCount})
              </span>
            </div>
            <ChevronRight size={15} className="text-muted-foreground" />
          </Link>
        </div>
      </div>
    </div>
  );
}
