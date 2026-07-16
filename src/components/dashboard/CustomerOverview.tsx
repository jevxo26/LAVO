"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Wallet, 
  Sparkles, 
  ShoppingBag, 
  Heart, 
  ArrowRight, 
  Calendar,
  DollarSign,
  Ticket,
  Clock,
  Shirt
} from "lucide-react";
import { authFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/lib/toast";

interface ProfileStats {
  walletBalance: number;
  loyaltyPoints: number;
  activeOrdersCount: number;
  wishlistCount: number;
  customerCode: string;
}

interface OrderRecord {
  id: string;
  orderNumber: string;
  grandTotal: number;
  orderStatus: string;
  paymentStatus: string;
  createdAt: string;
  totalGarments: number;
}

export function CustomerOverview() {
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const statsRes = await authFetch("/customer/profile");
        const statsData = await statsRes.json();
        if (statsData.success) {
          setStats(statsData.data);
        }

        const ordersRes = await authFetch("/customer/orders");
        const ordersData = await ordersRes.json();
        if (ordersData.success) {
          setRecentOrders(ordersData.data.slice(0, 5));
        }
      } catch (err) {
        console.error("Error fetching customer overview data:", err);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "PENDING":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "CONFIRMED":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "PROCESSING":
      case "WASHING":
      case "PICKUP":
        return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "DELIVERY":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "COMPLETED":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-12 w-64 bg-slate-200 rounded-lg"></div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-slate-200 rounded-xl border"></div>
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-6">
          <div className="md:col-span-4 h-96 bg-slate-200 rounded-xl border"></div>
          <div className="md:col-span-2 h-96 bg-slate-200 rounded-xl border"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 p-8 md:p-12 text-white shadow-xl shadow-indigo-200/50">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-md">
            <Sparkles size={12} className="text-yellow-300" />
            Customer Code: {stats?.customerCode || "N/A"}
          </div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
            Clean garments are just a few clicks away!
          </h1>
          <p className="text-indigo-100 text-lg max-w-md">
            Schedule a pickup, track your items with smart QR codes, and enjoy fresh clothes hassle-free.
          </p>
          <div className="pt-2 flex gap-4">
            <Link href="/dashboard/book">
              <Button size="lg" className="rounded-full bg-white text-indigo-600 hover:bg-indigo-50 font-bold shadow-md hover:scale-[1.02] transition-all">
                Book a Laundry Service
              </Button>
            </Link>
            <Link href="/dashboard/track-orders">
              <Button variant="outline" size="lg" className="rounded-full border-white/40 text-white bg-white/10 hover:bg-white/20 font-medium hover:scale-[1.02] transition-all">
                Track Orders
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-10 bg-[radial-gradient(circle_at_center,white_0%,transparent_100%)] pointer-events-none"></div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Wallet Balance */}
        <Card className="relative overflow-hidden border-none bg-gradient-to-br from-blue-50 to-indigo-50/50 shadow-sm hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-semibold text-indigo-950">Wallet Balance</CardTitle>
            <div className="rounded-2xl bg-indigo-500/10 p-2.5 text-indigo-600">
              <Wallet size={18} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-indigo-950">৳{stats?.walletBalance?.toFixed(2) || "0.00"}</div>
            <p className="text-xs text-indigo-500 font-medium mt-1">Available for laundry booking</p>
            <Link href="/dashboard/wallet" className="inline-flex items-center gap-1 text-xs text-indigo-600 font-bold hover:underline mt-4">
              Add Balance <ArrowRight size={12} />
            </Link>
          </CardContent>
        </Card>

        {/* Loyalty Points */}
        <Card className="relative overflow-hidden border-none bg-gradient-to-br from-purple-50 to-pink-50/50 shadow-sm hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-semibold text-purple-950">Loyalty Points</CardTitle>
            <div className="rounded-2xl bg-purple-500/10 p-2.5 text-purple-600">
              <Sparkles size={18} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-purple-950">{stats?.loyaltyPoints || 0} PTS</div>
            <p className="text-xs text-purple-500 font-medium mt-1">Redeem points for discounts</p>
            <Link href="/dashboard/wallet" className="inline-flex items-center gap-1 text-xs text-purple-600 font-bold hover:underline mt-4">
              View loyalty history <ArrowRight size={12} />
            </Link>
          </CardContent>
        </Card>

        {/* Active Orders */}
        <Card className="relative overflow-hidden border-none bg-gradient-to-br from-amber-50 to-orange-50/50 shadow-sm hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-semibold text-amber-950">Active Orders</CardTitle>
            <div className="rounded-2xl bg-amber-500/10 p-2.5 text-amber-600">
              <ShoppingBag size={18} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-amber-950">{stats?.activeOrdersCount || 0}</div>
            <p className="text-xs text-amber-500 font-medium mt-1">Garments in processing cycle</p>
            <Link href="/dashboard/my-orders" className="inline-flex items-center gap-1 text-xs text-amber-600 font-bold hover:underline mt-4">
              View active orders <ArrowRight size={12} />
            </Link>
          </CardContent>
        </Card>

        {/* Wishlist */}
        <Card className="relative overflow-hidden border-none bg-gradient-to-br from-rose-50 to-red-50/50 shadow-sm hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-semibold text-rose-950">My Wishlist</CardTitle>
            <div className="rounded-2xl bg-rose-500/10 p-2.5 text-rose-600">
              <Heart size={18} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-rose-950">{stats?.wishlistCount || 0} ITEMS</div>
            <p className="text-xs text-rose-500 font-medium mt-1">Quick laundry configurations</p>
            <Link href="/dashboard/wishlist" className="inline-flex items-center gap-1 text-xs text-rose-600 font-bold hover:underline mt-4">
              Book favorite services <ArrowRight size={12} />
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid content */}
      <div className="grid gap-6 md:grid-cols-6">
        {/* Recent Orders List */}
        <Card className="md:col-span-4 border border-slate-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold text-slate-900">Recent Orders</CardTitle>
              <CardDescription>Status details of your 5 latest laundry requests</CardDescription>
            </div>
            <Link href="/dashboard/my-orders">
              <Button variant="ghost" size="sm" className="text-indigo-600 hover:text-indigo-700 font-bold">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <ShoppingBag size={48} className="text-slate-300 mb-4" />
                <h3 className="font-semibold text-slate-800 mb-1">No laundry orders yet</h3>
                <p className="text-slate-500 text-sm max-w-xs mb-4">
                  Schedule your first laundry pick-up and let us handle your garments.
                </p>
                <Link href="/dashboard/book">
                  <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full">Book Now</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div 
                    key={order.id} 
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-slate-50 hover:border-indigo-100 hover:bg-indigo-50/10 transition-all gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm sm:text-base">{order.orderNumber}</span>
                        <span className={`text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full border font-semibold ${getStatusColor(order.orderStatus)}`}>
                          {order.orderStatus}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} /> {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={12} /> {order.totalGarments} Garments
                        </span>
                        <span className="font-medium">
                          Payment: <span className={order.paymentStatus === 'PAID' ? 'text-emerald-600 font-bold' : 'text-rose-500 font-bold'}>{order.paymentStatus}</span>
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-2 sm:pt-0">
                      <span className="font-extrabold text-slate-900">৳{order.grandTotal.toFixed(2)}</span>
                      <Link href={`/dashboard/track-orders?orderId=${order.id}`}>
                        <Button variant="outline" size="sm" className="rounded-full text-xs hover:bg-indigo-600 hover:text-white transition-colors border-indigo-200 text-indigo-600">
                          Track Status
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Links & Info */}
        <Card className="md:col-span-2 border border-slate-100 shadow-sm bg-gradient-to-b from-white to-slate-50/50">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-900">Quick Actions</CardTitle>
            <CardDescription>Support and settings options</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/dashboard/book" className="flex items-center gap-3 p-3.5 bg-white border border-slate-100 rounded-xl hover:border-indigo-200 hover:shadow-sm transition-all group">
              <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600 group-hover:scale-110 transition-transform">
                <Shirt size={18} />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">Select Services</h4>
                <p className="text-[11px] text-slate-500">Calculate price & schedule pickup</p>
              </div>
            </Link>

            <Link href="/dashboard/wallet" className="flex items-center gap-3 p-3.5 bg-white border border-slate-100 rounded-xl hover:border-emerald-200 hover:shadow-sm transition-all group">
              <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600 group-hover:scale-110 transition-transform">
                <DollarSign size={18} />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-900 group-hover:text-emerald-600 transition-colors">Top Up Wallet</h4>
                <p className="text-[11px] text-slate-500">Quick online credit deposit</p>
              </div>
            </Link>

            <Link href="/dashboard/help-desk" className="flex items-center gap-3 p-3.5 bg-white border border-slate-100 rounded-xl hover:border-purple-200 hover:shadow-sm transition-all group">
              <div className="rounded-lg bg-purple-50 p-2 text-purple-600 group-hover:scale-110 transition-transform">
                <Ticket size={18} />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-900 group-hover:text-purple-600 transition-colors">Create Support Ticket</h4>
                <p className="text-[11px] text-slate-500">Ask support team a question</p>
              </div>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
