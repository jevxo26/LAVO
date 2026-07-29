"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

export function FinanceTab() {
  const [taxes, setTaxes] = useState<any[]>([]);
  const [deliveryRules, setDeliveryRules] = useState<any[]>([]);
  const [taxName, setTaxName] = useState("");
  const [taxPercent, setTaxPercent] = useState("");
  const [ruleName, setRuleName] = useState("");
  const [baseCharge, setBaseCharge] = useState("");
  const [distCharge, setDistCharge] = useState("");
  const [weightCharge, setWeightCharge] = useState("");

  const fetchData = async () => {
    try {
      const [taxRes, delRes] = await Promise.all([
        axios.get("/api/finance/taxes"),
        axios.get("/api/finance/delivery-charges"),
      ]);
      setTaxes(taxRes.data.data || []);
      setDeliveryRules(delRes.data.data || []);
    } catch {
      toast.error("Failed to load finance configuration rules");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddTax = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taxName || !taxPercent) return;
    try {
      await axios.post("/api/finance/taxes", { taxName, taxPercentage: parseFloat(taxPercent) });
      toast.success("Tax rule created");
      setTaxName("");
      setTaxPercent("");
      fetchData();
    } catch {
      toast.error("Failed to create tax rule");
    }
  };

  const handleAddDelivery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ruleName || !baseCharge) return;
    try {
      await axios.post("/api/finance/delivery-charges", {
        ruleName,
        baseCharge: parseFloat(baseCharge),
        distanceCharge: parseFloat(distCharge || "0"),
        weightCharge: parseFloat(weightCharge || "0"),
      });
      toast.success("Delivery charge rule created");
      setRuleName("");
      setBaseCharge("");
      setDistCharge("");
      setWeightCharge("");
      fetchData();
    } catch {
      toast.error("Failed to create delivery rule");
    }
  };

  const handleDeleteTax = async (id: string) => {
    try {
      await axios.delete(`/api/finance/taxes/${id}`);
      toast.success("Tax rule deleted");
      fetchData();
    } catch {
      toast.error("Failed to delete tax rule");
    }
  };

  const handleDeleteDelivery = async (id: string) => {
    try {
      await axios.delete(`/api/finance/delivery-charges/${id}`);
      toast.success("Delivery rule deleted");
      fetchData();
    } catch {
      toast.error("Failed to delete delivery rule");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      {/* Tax Rules Panel */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-6">
        <div>
          <h3 className="font-bold text-slate-900 text-base">Global Tax Configurations</h3>
          <p className="text-slate-400 text-xs mt-0.5">Define tax brackets and rates applied globally.</p>
        </div>
        <form onSubmit={handleAddTax} className="flex gap-2 items-end">
          <input
            type="text"
            placeholder="Tax Name (e.g. VAT)"
            value={taxName}
            onChange={(e) => setTaxName(e.target.value)}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <input
            type="number"
            step="0.01"
            placeholder="%"
            value={taxPercent}
            onChange={(e) => setTaxPercent(e.target.value)}
            className="w-20 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button type="submit" className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl"><Plus size={16} /></button>
        </form>
        <div className="space-y-2">
          {taxes.map((t) => (
            <div key={t.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="font-bold text-sm text-slate-700">{t.taxName}</span>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-slate-500">{t.taxPercentage}%</span>
                <button onClick={() => handleDeleteTax(t.id)} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Delivery Charges Panel */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-6">
        <div>
          <h3 className="font-bold text-slate-900 text-base">Delivery Fee Configuration</h3>
          <p className="text-slate-400 text-xs mt-0.5">Configure logistics rules based on distance/weight.</p>
        </div>
        <form onSubmit={handleAddDelivery} className="grid grid-cols-2 gap-3">
          <input
            type="text"
            placeholder="Rule Name"
            value={ruleName}
            onChange={(e) => setRuleName(e.target.value)}
            className="col-span-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <input
            type="number"
            placeholder="Base ($)"
            value={baseCharge}
            onChange={(e) => setBaseCharge(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <input
            type="number"
            placeholder="Per Km ($)"
            value={distCharge}
            onChange={(e) => setDistCharge(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <input
            type="number"
            placeholder="Per Kg ($)"
            value={weightCharge}
            onChange={(e) => setWeightCharge(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold py-2">Add Rule</button>
        </form>
        <div className="space-y-2">
          {deliveryRules.map((d) => (
            <div key={d.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div>
                <span className="font-bold text-sm text-slate-700 block">{d.ruleName}</span>
                <span className="text-xs text-slate-400">Base: ${d.baseCharge} | Dist: ${d.distanceCharge}/km | Wt: ${d.weightCharge}/kg</span>
              </div>
              <button onClick={() => handleDeleteDelivery(d.id)} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
