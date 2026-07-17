"use client";

import React, { useEffect, useState } from "react";
import { 
  ShoppingBag, 
  Calendar, 
  Clock, 
  MapPin, 
  DollarSign,
  ChevronDown, 
  ChevronUp,
  Search,
  Package,
  CreditCard,
  CheckCircle,
  AlertTriangle,
  Loader2
} from "lucide-react";
import { authFetch } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/toast";

interface OrderItem {
  id: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  service: {
    serviceName: string;
  };
}

interface OrderRecord {
  id: string;
  orderNumber: string;
  totalGarments: number;
  subtotal: number;
  discount: number;
  deliveryCharge: number;
  tax: number;
  grandTotal: number;
  paymentStatus: string;
  orderStatus: string;
  pickupAddressId: string;
  estimatedPickupTime: string;
  createdAt: string;
  items: OrderItem[];
}

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const loadOrders = async () => {
    try {
      const res = await authFetch("/customer/orders");
      const data = await res.json();
      if (data.success) {
        setOrders(data.data);
      }
    } catch (err) {
      console.error("Error loading orders:", err);
      toast.error("Failed to load your orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handlePayNow = async (order: OrderRecord) => {
    try {
      toast.info("Initializing payment gateway...");
      const payRes = await authFetch("/payments/sslcommerz/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id }),
      });
      const payData = await payRes.json();
      if (payData.success && payData.data?.gatewayUrl) {
        window.location.href = payData.data.gatewayUrl;
      } else {
        toast.error("Payment failed to initialize");
      }
    } catch {
      toast.error("Failed to start payment process");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "PENDING":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "CONFIRMED":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "PROCESSING":
      case "WASHING":
      case "PICKUP":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case "DELIVERY":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "COMPLETED":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "CANCELLED":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  const tabs = ["ALL", "PENDING", "PROCESSING", "COMPLETED", "CANCELLED"];

  // Filter orders by status and search
  const filteredOrders = orders.filter((order) => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === "ALL") return matchesSearch;
    if (activeTab === "PROCESSING") {
      return matchesSearch && ["CONFIRMED", "PROCESSING", "PICKUP", "WASHING", "DELIVERY"].includes(order.orderStatus.toUpperCase());
    }
    return matchesSearch && order.orderStatus.toUpperCase() === activeTab;
  });

  if (loading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center">
        <Loader2 size={36} className="text-indigo-600 animate-spin mb-4" />
        <p className="text-slate-600 font-medium">Loading your orders...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">My Orders</h1>
        <p className="text-slate-500">Track current garment laundry steps and look up past invoices.</p>
      </div>

      {/* Tabs and Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setExpandedOrderId(null);
              }}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                activeTab === tab
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {tab.charAt(0) + tab.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
        
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 text-slate-400" size={15} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search order number..."
            className="w-full pl-9 h-9 text-xs border rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
          />
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border border-dashed rounded-2xl bg-slate-50/50">
          <ShoppingBag size={48} className="text-slate-300 mb-4" />
          <h3 className="font-bold text-slate-800">No orders found</h3>
          <p className="text-slate-500 text-xs mt-1">There are no orders matching your current filters.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const isExpanded = expandedOrderId === order.id;
            return (
              <Card key={order.id} className="border border-slate-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                {/* Header row */}
                <div 
                  onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 cursor-pointer hover:bg-slate-50/20 gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <span className="font-bold text-slate-900">{order.orderNumber}</span>
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-full border font-bold ${getStatusColor(order.orderStatus)}`}>
                        {order.orderStatus}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} /> {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Package size={12} /> {order.totalGarments} items
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6">
                    <div className="text-right sm:space-y-0.5">
                      <p className="text-xs text-slate-400">Total Price</p>
                      <p className="font-extrabold text-slate-900">৳{order.grandTotal.toFixed(2)}</p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {order.paymentStatus === 'UNPAID' && order.orderStatus !== 'CANCELLED' && (
                        <Button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePayNow(order);
                          }}
                          size="sm" 
                          className="rounded-full text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                        >
                          Pay Now
                        </Button>
                      )}
                      
                      <div className="p-1 text-slate-400">
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t border-slate-100 p-6 bg-slate-50/30 space-y-6">
                    {/* Items table */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Garment Items</h4>
                      <div className="border rounded-xl bg-white overflow-hidden">
                        <table className="w-full text-xs text-left">
                          <thead className="bg-slate-50 border-b text-slate-600 font-bold">
                            <tr>
                              <th className="p-3">Service & Item</th>
                              <th className="p-3 text-center">Qty</th>
                              <th className="p-3 text-right">Unit Price</th>
                              <th className="p-3 text-right">Total</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y text-slate-700">
                            {order.items.map((item) => (
                              <tr key={item.id}>
                                <td className="p-3 font-semibold text-slate-900">{item.service.serviceName}</td>
                                <td className="p-3 text-center">{item.quantity}</td>
                                <td className="p-3 text-right">৳{item.unitPrice.toFixed(2)}</td>
                                <td className="p-3 text-right font-bold text-slate-900">৳{item.totalPrice.toFixed(2)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Schedule / Delivery and Payment Information */}
                    <div className="grid gap-6 sm:grid-cols-2">
                      <div className="space-y-2.5">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Schedule & Logistics</h4>
                        <div className="p-4 rounded-xl border bg-white text-xs space-y-2.5">
                          <div className="flex items-start gap-2.5">
                            <Clock size={14} className="text-slate-400 mt-0.5" />
                            <div>
                              <p className="font-semibold text-slate-800">Estimated Pickup</p>
                              <p className="text-slate-500">{new Date(order.estimatedPickupTime).toLocaleString()}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-start gap-2.5 border-t border-slate-50 pt-2.5">
                            <MapPin size={14} className="text-slate-400 mt-0.5" />
                            <div>
                              <p className="font-semibold text-slate-800">Pickup Address</p>
                              <p className="text-slate-500">Delivery address linked to profile</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2.5">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Payment invoice</h4>
                        <div className="p-4 rounded-xl border bg-white text-xs space-y-2 text-slate-600">
                          <div className="flex justify-between">
                            <span>Subtotal</span>
                            <span className="font-bold text-slate-800">৳{order.subtotal.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>VAT / Service Tax (5%)</span>
                            <span className="font-bold text-slate-800">৳{order.tax.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Delivery fee</span>
                            <span className="font-bold text-slate-800">
                              {order.deliveryCharge === 0 ? "FREE" : `৳${order.deliveryCharge.toFixed(2)}`}
                            </span>
                          </div>
                          <div className="flex justify-between text-slate-900 font-extrabold border-t border-slate-50 pt-2 text-sm">
                            <span>Grand Total</span>
                            <span className="text-indigo-600">৳{order.grandTotal.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between items-center pt-2.5 border-t border-slate-50">
                            <span className="font-semibold">Payment Status:</span>
                            <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold ${
                              order.paymentStatus === 'PAID'
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-rose-50 text-rose-700 border-rose-200"
                            }`}>
                              {order.paymentStatus}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
