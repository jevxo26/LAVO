"use client";

import React, { useEffect, useState, useMemo } from "react";
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
  Filter,
  RotateCcw,
  BadgeDollarSign,
  X,
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
  const gradient = gradientFor(item.serviceName ?? "");
  const price    = item.basePrice ?? 0;

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
            <Tag size={10} /> {item.category ?? "—"}
          </span>
          <span className="rounded-xl bg-muted text-muted-foreground px-2.5 py-0.5 text-[10px] font-extrabold">
            {item.garmentType ?? "—"}
          </span>
        </div>

        <h3 className="text-base font-black text-card-foreground leading-snug group-hover:text-primary transition-colors">
          {item.serviceName ?? "Unnamed Service"}
        </h3>

        <div className="mt-auto flex items-center justify-between border-t border-border pt-3.5">
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Base Cleaning Rate</p>
            <p className="text-xl font-black text-card-foreground leading-tight">৳{price.toFixed(2)}</p>
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
    <div className="space-y-6">
      <div className="h-16 rounded-2xl bg-muted animate-pulse" />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-64 rounded-3xl bg-muted animate-pulse" />
        ))}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function WishlistPage() {
  const [wishlist, setWishlist]     = useState<WishlistItem[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [clearingAll, setClearingAll] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("ALL");

  const loadWishlist = async () => {
    setError(false);
    try {
      const res  = await authFetch("/customer/wishlist");
      const data = await res.json();
      if (data.success) setWishlist(data.data ?? []);
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

  const handleClearAll = async () => {
    if (!window.confirm("Remove all items from your wishlist?")) return;
    setClearingAll(true);
    try {
      const results = await Promise.allSettled(
        wishlist.map((item) =>
          authFetch(`/customer/wishlist/${item.id}`, { method: "DELETE" })
        )
      );
      const failCount = results.filter((r) => r.status === "rejected").length;
      setWishlist([]);
      setActiveCategory("ALL");
      if (failCount === 0) toast.success("Wishlist cleared");
      else toast.error(`${failCount} items failed to remove`);
    } catch {
      toast.error("Failed to clear wishlist");
    } finally {
      setClearingAll(false);
    }
  };

  // ── Derived data ────────────────────────────────────────────────────────────

  const categories = useMemo(() => {
    const cats = Array.from(new Set(wishlist.map((i) => i.category ?? "Other").filter(Boolean)));
    return cats.sort();
  }, [wishlist]);

  const filtered = useMemo(() => {
    if (activeCategory === "ALL") return wishlist;
    return wishlist.filter((i) => (i.category ?? "Other") === activeCategory);
  }, [wishlist, activeCategory]);

  const totalEstimated = useMemo(
    () => wishlist.reduce((s, i) => s + (i.basePrice ?? 0), 0),
    [wishlist]
  );

  const hasItems = wishlist.length > 0;

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
        chips={!loading && !error && hasItems ? [
          { label: "Saved Items",       value: wishlist.length                   },
          { label: "Est. Total",        value: `৳${totalEstimated.toFixed(2)}`  },
          { label: "Categories",        value: categories.length                 },
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
      ) : !hasItems ? (
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
        <>
          {/* ── Summary + filter bar ─────────────────────────────────────────── */}
          <div className="rounded-2xl border border-border bg-card px-5 py-4 shadow-sm space-y-3">
            {/* Summary row */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10"
                  style={{ color: "var(--primary)" }}
                >
                  <BadgeDollarSign size={16} />
                </div>
                <div>
                  <p className="text-xs font-black text-card-foreground">
                    {wishlist.length} saved item{wishlist.length !== 1 ? "s" : ""}
                    <span className="ml-2 text-muted-foreground font-medium">·</span>
                    <span className="ml-2 text-muted-foreground font-medium text-[11px]">
                      Combined estimate:{" "}
                      <span className="font-black text-card-foreground">৳{totalEstimated.toFixed(2)}</span>
                    </span>
                  </p>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleClearAll}
                disabled={clearingAll}
                className="h-8 rounded-xl border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 text-xs font-extrabold gap-1.5"
              >
                {clearingAll
                  ? <Loader2 size={12} className="animate-spin" />
                  : <X size={12} />}
                Clear All
              </Button>
            </div>

            {/* Category filter chips */}
            {categories.length > 1 && (
              <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-border">
                <Filter size={12} className="text-muted-foreground shrink-0" />
                {["ALL", ...categories].map((cat) => {
                  const isActive = activeCategory === cat;
                  const count    = cat === "ALL" ? wishlist.length : wishlist.filter((i) => (i.category ?? "Other") === cat).length;
                  return (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`flex items-center gap-1.5 rounded-2xl px-3 py-1 text-[11px] font-black transition-all ${
                        isActive ? "text-white shadow-sm" : "bg-muted text-muted-foreground hover:bg-muted/70"
                      }`}
                      style={isActive ? { background: "var(--primary)" } : undefined}
                    >
                      {cat === "ALL" ? "All" : cat}
                      <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-black ${
                        isActive ? "bg-white/25 text-white" : "bg-border text-muted-foreground"
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}

                {activeCategory !== "ALL" && (
                  <button
                    onClick={() => setActiveCategory("ALL")}
                    className="flex items-center gap-1 text-[11px] font-extrabold text-muted-foreground hover:text-error transition-colors ml-1"
                  >
                    <RotateCcw size={11} /> Reset
                  </button>
                )}
              </div>
            )}
          </div>

          {/* ── Cards grid ───────────────────────────────────────────────────── */}
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card py-16 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                <Filter size={22} />
              </div>
              <p className="text-sm font-black text-card-foreground">No items in this category</p>
              <button
                onClick={() => setActiveCategory("ALL")}
                className="mt-3 text-xs font-extrabold text-primary hover:underline"
              >
                Show all items
              </button>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((item) => (
                <WishlistCard
                  key={item.id}
                  item={item}
                  removing={removingId === item.id}
                  onRemove={handleRemove}
                />
              ))}
            </div>
          )}
        </>
      )}
    </motion.div>
  );
}
