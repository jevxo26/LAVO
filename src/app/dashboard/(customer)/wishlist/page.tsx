"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Heart,
  Trash2,
  ShoppingBag,
  ArrowRight,
  Sparkles,
  Loader2,
  Tag,
  Shirt,
  AlertCircle,
  PlusCircle,
} from "lucide-react";
import { authFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/toast";
import { motion } from "framer-motion";

// ─── Types ────────────────────────────────────────────────────────────────────

interface WishlistItem {
  id: string;
  serviceName: string;
  basePrice: number;
  garmentType: string;
  category: string;
}

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
      className="group rounded-3xl border border-slate-200/80 bg-white shadow-sm overflow-hidden transition-all duration-300 hover:border-rose-300 hover:shadow-xl flex flex-col dark:bg-slate-900 dark:border-slate-800"
    >
      <div className={`relative h-28 bg-gradient-to-br ${gradient} flex items-center justify-center p-4`}>
        <Shirt size={36} className="text-white/80 transition-transform group-hover:scale-110 duration-300" />
        
        <button
          onClick={() => onRemove(item.id)}
          disabled={removing}
          aria-label="Remove from wishlist"
          className="absolute top-3.5 right-3.5 flex h-8 w-8 items-center justify-center rounded-2xl bg-white/20 text-white backdrop-blur-md hover:bg-white hover:text-rose-600 transition-all duration-200 disabled:opacity-50"
        >
          {removing ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
        </button>

        <div className="absolute bottom-3 left-3.5 flex items-center gap-1.5 rounded-full bg-black/20 backdrop-blur-md px-3 py-0.5 border border-white/20">
          <Heart size={11} className="text-rose-300 fill-rose-300" />
          <span className="text-white text-[10px] font-black tracking-wide">Saved Favorite</span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5 gap-3.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-50 text-indigo-700 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider dark:bg-indigo-950/50 dark:text-indigo-300">
            <Tag size={10} /> {item.category}
          </span>
          <span className="rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 px-2.5 py-0.5 text-[10px] font-extrabold">
            {item.garmentType}
          </span>
        </div>

        <h3 className="text-base font-black text-slate-900 dark:text-white leading-snug group-hover:text-indigo-600 transition-colors">
          {item.serviceName}
        </h3>

        <div className="mt-auto flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3.5">
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Base Cleaning Rate</p>
            <p className="text-xl font-black text-slate-900 dark:text-white leading-tight">৳{item.basePrice.toFixed(2)}</p>
          </div>
          <Link href="/dashboard/book-services">
            <Button
              className="h-9 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black gap-1.5 shadow-md shadow-indigo-600/30 transition-all hover:scale-[1.02]"
            >
              Book Service <ArrowRight size={13} />
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

export default function WishlistPage() {
  const [wishlist, setWishlist]   = useState<WishlistItem[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

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
      {/* ── 1. Hero Header Banner ───────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-950 via-rose-900 to-pink-950 p-7 md:p-9 text-white shadow-2xl border border-rose-800/40">
        <div className="pointer-events-none absolute inset-0 opacity-20">
          <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-rose-500 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-pink-500 blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-rose-300" />
              <span className="text-rose-200 text-xs font-black uppercase tracking-widest">
                Saved Favorites &amp; Bookmarks
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white leading-tight">
              My Laundry Wishlist
            </h1>
            <p className="text-rose-100 text-xs md:text-sm leading-relaxed font-medium max-w-xl">
              Quick 1-tap access to your favorite dry cleaning, wash &amp; iron, and suit care packages.
            </p>
          </div>

          {!loading && !error && wishlist.length > 0 && (
            <div className="flex items-center gap-3 shrink-0">
              <div className="rounded-2xl bg-white/10 border border-white/15 backdrop-blur-xl px-5 py-3 text-center min-w-[100px] shadow-inner">
                <p className="text-rose-200 text-[10px] font-black uppercase tracking-wider">Saved Items</p>
                <p className="text-white font-black text-2xl mt-0.5">{wishlist.length}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── 2. Content Grid ─────────────────────────────────────────────────── */}
      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 rounded-3xl bg-slate-200 dark:bg-slate-800" />
          ))}
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white py-20 text-center dark:bg-slate-900 dark:border-slate-800">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
            <AlertCircle size={26} />
          </div>
          <p className="text-sm font-black text-slate-900 dark:text-white">Could not load your wishlist</p>
          <p className="mt-1 text-xs text-slate-400 font-medium">Check your connection and try again.</p>
          <Button onClick={loadWishlist} variant="outline" className="mt-4 h-9 px-4 rounded-xl text-xs font-extrabold border-slate-200">
            Retry
          </Button>
        </div>
      ) : wishlist.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white py-24 text-center dark:bg-slate-900 dark:border-slate-800">
          <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-rose-50 text-rose-500 dark:bg-rose-950/50">
            <Heart size={38} />
          </div>
          <p className="text-lg font-black text-slate-900 dark:text-white">Your Wishlist is Empty</p>
          <p className="mt-1.5 max-w-xs text-xs text-slate-400 font-medium">
            Explore our laundry services and tap the heart icon to save your favorite garment packages here.
          </p>
          <Link href="/dashboard/book-services">
            <Button className="mt-6 h-11 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs shadow-lg shadow-indigo-600/30 gap-2">
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
