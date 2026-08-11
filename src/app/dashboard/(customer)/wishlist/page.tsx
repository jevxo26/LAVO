"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Heart,
  Trash2,
  ShoppingBag,
  ArrowRight,
  Loader2,
  Tag,
  Shirt,
  AlertCircle,
} from "lucide-react";
import { authFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/toast";
import { motion } from "framer-motion";
import { DashboardPageHero } from "@/components/shared/DashboardPageHero";

// ─── Types ────────────────────────────────────────────────────────────────────

interface WishlistItem {
  id: string;
  serviceName: string;
  basePrice: number;
  garmentType: string;
  category: string;
}

// ─── Card gradient helper ─────────────────────────────────────────────────────

const GRADIENTS = [
  "from-violet-500 via-purple-600 to-indigo-600",
  "from-indigo-500 via-blue-600 to-cyan-600",
  "from-emerald-500 via-teal-600 to-cyan-600",
  "from-amber-500 via-orange-600 to-red-600",
  "from-rose-500 via-pink-600 to-purple-600",
  "from-sky-500 via-indigo-600 to-purple-600",
];

function gradientFor(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) & 0xffff;
  return GRADIENTS[h % GRADIENTS.length];
}

// ─── WishlistCard ─────────────────────────────────────────────────────────────

interface WishlistCardProps {
  item: WishlistItem;
  removing: boolean;
  onRemove: (id: string) => void;
}

function WishlistCard({ item, removing, onRemove }: WishlistCardProps) {
  const gradient = gradientFor(item.serviceName);

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="group rounded-3xl border border-border bg-card shadow-sm overflow-hidden transition-all duration-300 hover:border-ring/40 hover:shadow-xl flex flex-col"
    >
      {/* Coloured top banner */}
      <div className={`relative h-28 bg-gradient-to-br ${gradient} flex items-center justify-center p-4`}>
        <Shirt size={36} className="text-white/80 transition-transform group-hover:scale-110 duration-300" />

        <button
          onClick={() => onRemove(item.id)}
          disabled={removing}
          aria-label="Remove from wishlist"
          className="absolute top-3.5 right-3.5 flex h-8 w-8 items-center justify-center rounded-2xl bg-white/20 text-white backdrop-blur-md hover:bg-white hover:text-error transition-all duration-200 disabled:opacity-50"
        >
          {removing ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
        </button>

        <div className="absolute bottom-3 left-3.5 flex items-center gap-1.5 rounded-full bg-black/20 backdrop-blur-md px-3 py-0.5 border border-white/20">
          <Heart size={11} className="text-rose-300 fill-rose-300" />
          <span className="text-white text-[10px] font-black tracking-wide">Saved Favorite</span>
        </div>
      </div>

      {/* Card body */}
      <div className="flex flex-1 flex-col p-5 gap-3.5">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className="inline-flex items-center gap-1.5 rounded-xl px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider bg-primary/10"
            style={{ color: "var(--primary)" }}
          >
            <Tag size={10} /> {item.category}
          </span>
          <span className="rounded-xl bg-muted text-muted-foreground px-2.5 py-0.5 text-[10px] font-extrabold">
            {item.garmentType}
          </span>
        </div>

        <h3 className="text-base font-black text-card-foreground leading-snug group-hover:text-primary transition-colors">
          {item.serviceName}
        </h3>

        <div className="mt-auto flex items-center justify-between border-t border-border pt-3.5">
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Base Cleaning Rate</p>
            <p className="text-xl font-black text-card-foreground leading-tight">৳{item.basePrice.toFixed(2)}</p>
          </div>
          <Link href="/dashboard/book-services">
            <Button
              className="h-9 px-4 rounded-xl text-white text-xs font-black gap-1.5 shadow-sm transition-all hover:scale-[1.02]"
              style={{ background: "linear-gradient(135deg, var(--primary), var(--ring))" }}
            >
              Book Service <ArrowRight size={13} />
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function WishlistSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-64 rounded-3xl bg-muted animate-pulse" />
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function WishlistPage() {
  const [wishlist, setWishlist]       = useState<WishlistItem[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(false);
  const [removingId, setRemovingId]   = useState<string | null>(null);

  const loadWishlist = async () => {
    setError(false);
    try {
      const res  = await authFetch("/customer/wishlist");
      const data = await res.json();
      if (data.success) setWishlist(data.data);
      else setError(true);
    } catch (err) {
      console.error("Error loading wishlist:", err);
      setError(true);
      toast.error("Failed to load wishlist");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadWishlist(); }, []);

  const handleRemove = async (serviceId: string) => {
    setRemovingId(serviceId);
    try {
      const res  = await authFetch(`/customer/wishlist/${serviceId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setWishlist((prev) => prev.filter((item) => item.id !== serviceId));
        toast.success("Removed from wishlist");
      } else {
        toast.error("Failed to remove item");
      }
    } catch {
      toast.error("Failed to remove item");
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-7"
    >
      {/* ── 1. Hero ──────────────────────────────────────────────────────────── */}
      <DashboardPageHero
        badge="Saved Favorites & Bookmarks"
        title="My Laundry Wishlist"
        description="Quick 1-tap access to your favorite dry cleaning, wash & iron, and suit care packages."
        icon={Heart}
        chips={!loading && !error && wishlist.length > 0 ? [
          { label: "Saved Items", value: wishlist.length },
        ] : []}
      />

      {/* ── 2. Content ───────────────────────────────────────────────────────── */}
      {loading ? (
        <WishlistSkeleton />
      ) : error ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card py-20 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-error/10 text-error">
            <AlertCircle size={26} />
          </div>
          <p className="text-sm font-black text-card-foreground">Could not load your wishlist</p>
          <p className="mt-1 text-xs text-muted-foreground font-medium">Check your connection and try again.</p>
          <Button onClick={loadWishlist} variant="outline" className="mt-4 h-9 px-4 rounded-xl text-xs font-extrabold border-border">
            Retry
          </Button>
        </div>
      ) : wishlist.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card py-24 text-center">
          <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10">
            <Heart size={38} style={{ color: "var(--primary)" }} />
          </div>
          <p className="text-lg font-black text-card-foreground">Your Wishlist is Empty</p>
          <p className="mt-1.5 max-w-xs text-xs text-muted-foreground font-medium">
            Explore our laundry services and tap the heart icon to save your favorite garment packages here.
          </p>
          <Link href="/dashboard/book-services">
            <Button
              className="mt-6 h-11 px-6 rounded-2xl text-white font-black text-xs shadow-lg gap-2"
              style={{ background: "linear-gradient(135deg, var(--primary), var(--ring))" }}
            >
              <ShoppingBag size={16} /> Explore Laundry Services
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {wishlist.map((item) => (
            <WishlistCard
              key={item.id}
              item={item}
              removing={removingId === item.id}
              onRemove={handleRemove}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}
