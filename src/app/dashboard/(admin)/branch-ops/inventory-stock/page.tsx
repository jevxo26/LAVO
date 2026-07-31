"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Boxes, RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react";

export default function InventoryStockPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/branch-ops/inventory-stock");
      setItems(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/80 backdrop-blur-xl p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Boxes className="text-blue-600" />
            Branch Inventory & Consumables Stock
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track detergents, softeners, packaging materials, and hangers across all branches.
          </p>
        </div>
        <button
          onClick={fetchInventory}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 font-medium rounded-xl text-sm hover:bg-slate-50 shadow-sm transition-colors"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh Stock
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-6">Item Name</th>
                <th className="py-3.5 px-6">Category</th>
                <th className="py-3.5 px-6">Branch</th>
                <th className="py-3.5 px-6">Stock Quantity</th>
                <th className="py-3.5 px-6">Min Threshold</th>
                <th className="py-3.5 px-6">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-6 font-bold text-slate-900">{item.itemName}</td>
                  <td className="py-4 px-6 text-xs">
                    <span className="px-2.5 py-1 rounded-full font-bold bg-slate-100 text-slate-700">
                      {item.category}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-slate-700 font-medium">{item.branchName}</td>
                  <td className="py-4 px-6 font-bold text-slate-900">
                    {item.stockQuantity} <span className="text-xs text-slate-500 font-normal">{item.unit}</span>
                  </td>
                  <td className="py-4 px-6 text-slate-500 font-medium">{item.minThreshold} {item.unit}</td>
                  <td className="py-4 px-6 text-xs">
                    <span
                      className={`px-2.5 py-1 rounded-full font-bold ${
                        item.status === "IN_STOCK"
                          ? "bg-emerald-100 text-emerald-800"
                          : item.status === "LOW_STOCK"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
