"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { ToggleLeft, ToggleRight, Sparkles } from "lucide-react";

export function FeatureFlagTab() {
  const [flags, setFlags] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFlags = async () => {
    try {
      const res = await axios.get("/api/feature-flags");
      setFlags(res.data.data);
    } catch (err) {
      toast.error("Failed to load feature flags");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlags();
  }, []);

  const handleToggle = async (id: string, currentStatus: boolean) => {
    try {
      await axios.patch(`/api/feature-flags/${id}`, { isEnabled: !currentStatus });
      toast.success("Feature state updated successfully");
      fetchFlags();
    } catch (err) {
      toast.error("Failed to update feature flag status");
    }
  };

  const handleInitialize = async () => {
    setLoading(true);
    try {
      await axios.post("/api/feature-flags");
      toast.success("Default feature flags initialized successfully");
      fetchFlags();
    } catch (err) {
      toast.error("Failed to initialize feature flags");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-slate-400 text-sm font-semibold p-6 text-center">Loading feature flags...</div>;

  if (flags.length === 0) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 text-center space-y-4 max-w-md mx-auto mt-6">
        <Sparkles className="w-10 h-10 text-blue-500 mx-auto" />
        <h3 className="font-bold text-slate-800 text-base">Initialize Feature Flags</h3>
        <p className="text-slate-500 text-xs leading-relaxed">Setup default modular options including AI Route Optimization, Wallet system, and Membership benefits.</p>
        <button onClick={handleInitialize} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-all shadow-md">Initialize Defaults</button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-6">
      <div>
        <h2 className="font-bold text-slate-900 text-lg">Modular Feature Flags</h2>
        <p className="text-slate-400 text-xs mt-0.5">Control live rollout of platform modules instantly without code deployments.</p>
      </div>
      <div className="divide-y divide-slate-100">
        {flags.map((flag) => (
          <div key={flag.id} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
            <div className="space-y-1 pr-6">
              <h4 className="text-sm font-bold text-slate-800 tracking-wide">{flag.featureName.replace(/_/g, " ")}</h4>
              <p className="text-slate-400 text-xs leading-relaxed">{flag.description || "No description provided."}</p>
            </div>
            <button onClick={() => handleToggle(flag.id, flag.isEnabled)} className="focus:outline-none transition-transform hover:scale-105 active:scale-95">
              {flag.isEnabled ? <ToggleRight className="w-12 h-12 text-blue-600" /> : <ToggleLeft className="w-12 h-12 text-slate-300" />}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
