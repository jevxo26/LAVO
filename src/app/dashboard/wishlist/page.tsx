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
} from "lucide-react";
import { authFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/toast";

// ─── Types ────────────────────────────────────────────────────────────────────

interface WishlistItem {
  id: string;
  serviceName: string;
  basePrice: number;
  garmentType: string;
  category: string;
}

// ─── Gradient helper (seeded by service name) ─────────────────────────────────

const GRADIENTS = [
  "from-violet-400 to-purple-600",
  "from-indigo-400 to-blue-600",
  "from-emerald-400 to-teal-600",
  "from-amber-400 to-orange-500",
  "from-rose-400 to-pink-600",
  "from-sky-400 to-cyan-600",
];

function gradientFor(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) & 0xffff;
  return GRADIENTS[h % GRADIENTS.length];
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Sk({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-slate-100 ${className ?? ""}`} />;
}

function WishlistSkeletons() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="rounded-2xl border border-slate-100 bg-white overflow-hidden shadow-sm">
          <Sk className="h-28 w-full rounded-none" />
          <div className="p-5 space-y-3">
            <Sk className="h-3 w-16 rounded-full" />
            <Sk className="h-5 w-40" />
            <Sk className="h-3 w-24" />
            <div className="flex items-center justify-between pt-2 border-t border-slate-50">
              <Sk className="h-6 w-20" />
              <Sk className="h-8 w-28 rounded-xl" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
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
    <div className="group rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden transition-all duration-200 hover:border-rose-100 hover:shadow-md flex flex-col">

      {/* Gradient thumbnail */}
      <div className={`relative h-24 bg-gradient-to-br ${gradient} flex items-center justify-center`}>
        <Shirt size={32} className="text-white/70" />
        {/* Remove button */}
        <button
          onClick={() => onRemove(item.id)}
          disabled={removing}
          aria-label="Remove from wishlist"
          className="absolute top-3 right-3 flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white hover:text-rose-600 transition-all duration-150 disabled:opacity-50"
        >
          {removing ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
        </button>
        {/* Heart badge */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1 rounded-full bg-white/20 backdrop-blur-sm px-2 py-0.5">
          <Heart size={10} className="text-white fill-white" />
          <span className="text-white text-[10px] font-semibold">Saved</span>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-5 gap-3">
        {/* Category + garment type */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-md bg-indigo-50 text-indigo-600 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider">
            <Tag size={9} /> {item.category}
          </span>
          <span className="rounded-md bg-slate-50 text-slate-500 border border-slate-100 px-2 py-0.5 text-[10px] font-semibold">
            {item.garmentType}
          </span>
        </div>

        {/* Service name */}
        <h3 className="text-[15px] font-bold text-slate-900 leading-tight">{item.serviceName}</h3>

        {/* Price + CTA */}
        <div className="mt-auto flex items-center justify-between border-t border-slate-50 pt-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Base Price</p>
            <p className="text-lg font-extrabold text-slate-900 leading-tight">৳{item.basePrice.toFixed(2)}</p>
          </div>
          <Link href="/dashboard/book">
            <Button
              size="sm"
              className="h-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3 gap-1.5 shadow-sm shadow-indigo-100 group-hover:shadow-indigo-200 transition-shadow"
            >
              Book Now <ArrowRight size={12} />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

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
    <div className="space-y-7">

      {/* ── Hero Header ──────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-500 via-rose-600 to-pink-600 px-7 py-8">
        <div className="pointer-events-none absolute inset-0 opacity-10">
          <div className="absolute -top-12 -right-12 h-56 w-56 rounded-full bg-white" />
          <div className="absolute -bottom-10 -left-8 h-40 w-40 rounded-full bg-white" />
        </div>

        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Sparkles size={13} className="text-rose-200" />
              <span className="text-rose-200 text-[11px] font-semibold uppercase tracking-widest">
                Saved Services
              </span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white">My Wishlist</h1>
            <p className="mt-1 text-sm text-rose-200">
              Your favorited laundry services for quick access and scheduling.
            </p>
          </div>

          {!loading && !error && wishlist.length > 0 && (
            <div className="flex items-center gap-3 shrink-0">
              <div className="rounded-xl bg-white/10 border border-white/20 backdrop-blur-sm px-4 py-3 text-center">
                <p className="text-rose-200 text-[10px] font-semibold uppercase tracking-wider">Saved Items</p>
                <p className="text-white font-extrabold text-xl leading-tight">{wishlist.length}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Content ──────────────────────────────────────────────────────── */}
      {loading ? (
        <WishlistSkeletons />
      ) : error ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-20 text-center shadow-sm">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50">
            <AlertCircle size={26} className="text-rose-400" />
          </div>
          <p className="text-sm font-semibold text-slate-700">Could not load your wishlist</p>
          <p className="mt-1 text-xs text-slate-400">Check your connection and try again.</p>
          <Button size="sm" variant="outline" onClick={loadWishlist}
            className="mt-4 rounded-xl border-slate-200 text-xs font-bold">
            Retry
          </Button>
        </div>
      ) : wishlist.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-24 text-center shadow-sm">
          <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-rose-50">
            <Heart size={38} className="text-rose-300" />
          </div>
          <p className="text-base font-bold text-slate-800">Your wishlist is empty</p>
          <p className="mt-2 max-w-xs text-sm text-slate-400">
            Explore our laundry services and tap the heart icon to save your favourites here.
          </p>
          <Link href="/dashboard/book">
            <Button className="mt-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white gap-2">
              <ShoppingBag size={14} /> Explore Services
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
    </div>
  );
}
