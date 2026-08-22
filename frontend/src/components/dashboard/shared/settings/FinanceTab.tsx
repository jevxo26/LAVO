"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

const inputCls = "bg-muted/50 border border-border rounded-xl px-3 py-2 text-sm text-card-foreground placeholder:text-muted-foreground focus:outline-none focus:border-ring transition-colors";

export function FinanceTab() {
  const [taxes,         setTaxes]         = useState<any[]>([]);
  const [deliveryRules, setDeliveryRules] = useState<any[]>([]);
  const [taxName,       setTaxName]       = useState("");
  const [taxPercent,    setTaxPercent]    = useState("");
  const [ruleName,      setRuleName]      = useState("");
  const [baseCharge,    setBaseCharge]    = useState("");
  const [distCharge,    setDistCharge]    = useState("");
  const [weightCharge,  setWeightCharge]  = useState("");

  const fetchData = async () => {
    try {
      const [taxRes, delRes] = await Promise.all([
        axios.get("/api/finance/taxes"),
        axios.get("/api/finance/delivery-charges"),
      ]);
      setTaxes(taxRes.data.data || []);
      setDeliveryRules(delRes.data.data || []);
    } catch { toast.error("Failed to load finance configuration rules"); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleAddTax = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taxName || !taxPercent) return;
    try {
      await axios.post("/api/finance/taxes", { taxName, taxPercentage: parseFloat(taxPercent) });
      toast.success("Tax rule created");
      setTaxName(""); setTaxPercent("");
      fetchData();
    } catch { toast.error("Failed to create tax rule"); }
  };

  const handleAddDelivery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ruleName || !baseCharge) return;
    try {
      await axios.post("/api/finance/delivery-charges", {
        ruleName,
        baseCharge:     parseFloat(baseCharge),
        distanceCharge: parseFloat(distCharge    || "0"),
        weightCharge:   parseFloat(weightCharge  || "0"),
      });
      toast.success("Delivery charge rule created");
      setRuleName(""); setBaseCharge(""); setDistCharge(""); setWeightCharge("");
      fetchData();
    } catch { toast.error("Failed to create delivery rule"); }
  };

  const handleDeleteTax = async (id: string) => {
    try { await axios.delete(`/api/finance/taxes/${id}`); toast.success("Tax rule deleted"); fetchData(); }
    catch { toast.error("Failed to delete tax rule"); }
  };

  const handleDeleteDelivery = async (id: string) => {
    try { await axios.delete(`/api/finance/delivery-charges/${id}`); toast.success("Delivery rule deleted"); fetchData(); }
    catch { toast.error("Failed to delete delivery rule"); }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

      {/* ── Tax Rules ── */}
      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-5">
        <div>
          <h3 className="font-black text-card-foreground text-base">Global Tax Configurations</h3>
          <p className="text-muted-foreground text-xs mt-0.5 font-medium">Define tax brackets and rates applied globally.</p>
        </div>

        <form onSubmit={handleAddTax} className="flex gap-2 items-end">
          <input
            type="text" placeholder="Tax Name (e.g. VAT)"
            value={taxName} onChange={(e) => setTaxName(e.target.value)}
            className={`flex-1 ${inputCls}`}
          />
          <input
            type="number" step="0.01" placeholder="%"
            value={taxPercent} onChange={(e) => setTaxPercent(e.target.value)}
            className={`w-20 ${inputCls}`}
          />
          <button type="submit"
            className="p-2.5 rounded-xl text-white transition-all hover:scale-[1.03]"
            style={{ background: "linear-gradient(135deg, var(--primary), var(--ring))" }}>
            <Plus size={16} />
          </button>
        </form>

        <div className="space-y-2">
          {taxes.map((t) => (
            <div key={t.id}
              className="flex items-center justify-between p-3 rounded-xl border border-border bg-muted/40">
              <span className="font-black text-sm text-card-foreground">{t.taxName}</span>
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-muted-foreground">{t.taxPercentage}%</span>
                <button onClick={() => handleDeleteTax(t.id)}
                  className="text-error hover:opacity-70 transition-opacity">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
          {taxes.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-4 font-medium">No tax rules configured yet.</p>
          )}
        </div>
      </div>

      {/* ── Delivery Charges ── */}
      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-5">
        <div>
          <h3 className="font-black text-card-foreground text-base">Delivery Fee Configuration</h3>
          <p className="text-muted-foreground text-xs mt-0.5 font-medium">Configure logistics rules based on distance/weight.</p>
        </div>

        <form onSubmit={handleAddDelivery} className="grid grid-cols-2 gap-3">
          <input
            type="text" placeholder="Rule Name"
            value={ruleName} onChange={(e) => setRuleName(e.target.value)}
            className={`col-span-2 ${inputCls}`}
          />
          <input type="number" placeholder="Base (৳)"  value={baseCharge}   onChange={(e) => setBaseCharge(e.target.value)}   className={inputCls} />
          <input type="number" placeholder="Per Km (৳)" value={distCharge}   onChange={(e) => setDistCharge(e.target.value)}   className={inputCls} />
          <input type="number" placeholder="Per Kg (৳)" value={weightCharge} onChange={(e) => setWeightCharge(e.target.value)} className={`col-span-2 ${inputCls}`} />
          <button type="submit"
            className="col-span-2 rounded-xl text-white text-sm font-black py-2.5 transition-all hover:scale-[1.01]"
            style={{ background: "linear-gradient(135deg, var(--primary), var(--ring))" }}>
            Add Rule
          </button>
        </form>

        <div className="space-y-2">
          {deliveryRules.map((d) => (
            <div key={d.id}
              className="flex items-center justify-between p-3 rounded-xl border border-border bg-muted/40">
              <div>
                <span className="font-black text-sm text-card-foreground block">{d.ruleName}</span>
                <span className="text-xs text-muted-foreground font-medium">
                  Base: ৳{d.baseCharge} · Dist: ৳{d.distanceCharge}/km · Wt: ৳{d.weightCharge}/kg
                </span>
              </div>
              <button onClick={() => handleDeleteDelivery(d.id)}
                className="text-error hover:opacity-70 transition-opacity shrink-0 ml-2">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          {deliveryRules.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-4 font-medium">No delivery rules configured yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
