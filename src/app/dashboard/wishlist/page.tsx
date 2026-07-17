"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Heart, 
  Trash2, 
  ShoppingBag, 
  ArrowRight,
  Shirt,
  Loader2
} from "lucide-react";
import { authFetch } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/toast";

interface WishlistItem {
  id: string;
  serviceName: string;
  basePrice: number;
  garmentType: string;
  category: string;
}

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadWishlist = async () => {
    try {
      const res = await authFetch("/customer/wishlist");
      const data = await res.json();
      if (data.success) {
        setWishlist(data.data);
      }
    } catch (err) {
      console.error("Error loading wishlist:", err);
      toast.error("Failed to load wishlist");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWishlist();
  }, []);

  const handleRemove = async (serviceId: string) => {
    try {
      const res = await authFetch(`/customer/wishlist/${serviceId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setWishlist(wishlist.filter((item) => item.id !== serviceId));
        toast.success("Removed from wishlist");
      }
    } catch {
      toast.error("Failed to remove item");
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center">
        <Loader2 size={36} className="text-indigo-600 animate-spin mb-4" />
        <p className="text-slate-600 font-medium">Loading wishlist...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">My Wishlist</h1>
        <p className="text-slate-500">Your favorited laundry services for quick access and quick scheduling.</p>
      </div>

      {wishlist.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border border-dashed rounded-2xl bg-slate-50/50 text-center px-4">
          <Heart size={48} className="text-rose-200 mb-4 animate-pulse" />
          <h3 className="font-bold text-slate-800 text-base">Your wishlist is empty</h3>
          <p className="text-slate-500 text-xs mt-1 max-w-xs mb-6">
            Explore our range of laundry services and tap the heart icon to save services here.
          </p>
          <Link href="/dashboard/book">
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-full">
              Explore Laundry Services
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {wishlist.map((item) => (
            <Card key={item.id} className="border border-slate-100 hover:border-rose-100 hover:shadow-md transition-all group overflow-hidden relative">
              <CardHeader className="pb-3 flex flex-row justify-between items-start">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase tracking-wider font-extrabold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                    {item.category}
                  </span>
                  <CardTitle className="text-base font-bold text-slate-900 pt-1.5">{item.serviceName}</CardTitle>
                  <CardDescription className="text-xs text-slate-500">{item.garmentType}</CardDescription>
                </div>
                <button
                  onClick={() => handleRemove(item.id)}
                  className="text-slate-400 hover:text-rose-600 transition-colors p-1.5 rounded-lg border border-transparent hover:bg-rose-50"
                >
                  <Trash2 size={15} />
                </button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-baseline justify-between border-t border-slate-50 pt-4">
                  <div className="space-y-0.5">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Base Price</p>
                    <p className="text-lg font-extrabold text-slate-900">৳{item.basePrice.toFixed(2)}</p>
                  </div>
                  
                  <Link href="/dashboard/book">
                    <Button size="sm" className="rounded-full text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white group-hover:scale-105 transition-transform">
                      Configure Order <ArrowRight size={12} className="ml-1" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
