"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { ToggleLeft, ToggleRight, Zap } from "lucide-react";

export function FeatureFlagTab() {
  const [flags,   setFlags]   = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFlags = async () => {
    try {
      const res = await axios.get("/api/feature-flags");
      setFlags(res.data.data);
    } catch { toast.error("Failed to load feature flags"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchFlags(); }, []);

  const handleToggle = async (id: string, current: boolean) => {
    try {
      await axios.patch(`/api/feature-flags/${id}`, { isEnabled: !current });
      toast.success("Feature state updated successfully");
      fetchFlags();
    } catch { toast.error("Failed to update feature flag status"); }
  };

  const handleInitialize = async () => {
    setLoading(true);
    try {
      await axios.post("/api/feature-flags");
      toast.success("Default feature flags initialized successfully");
      fetchFlags();
    } catch { toast.error("Failed to initialize feature flags"); }
    finally { setLoading(false); }
  };

  if (loading) return (
    <div className="rounded-3xl border border-border bg-card p-8 text-center text-sm font-bold text-muted-foreground animate-pulse">
      Loading feature flags…
    </div>
  );

  if (flags.length === 0) return (
    <div className="rounded-3xl border border-border bg-card p-8 text-center space-y-4 max-w-md mx-auto mt-6 shadow-sm">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 mx-auto"
        style={{ color: "var(--primary)" }}>
        <Zap size={24} />
      </div>
      <h3 className="font-black text-card-foreground text-base">Initialize Feature Flags</h3>
      <p className="text-muted-foreground text-xs leading-relaxed font-medium">
        Setup default modular options including AI Route Optimization, Wallet system, and Membership benefits.
      </p>
      <button
        onClick={handleInitialize}
        className="px-5 py-2.5 text-white font-black rounded-xl text-sm transition-all hover:scale-[1.02] shadow-md"
        style={{ background: "linear-gradient(135deg, var(--primary), var(--ring))" }}
      >
        Initialize Defaults
      </button>
    </div>
  );

  return (
    <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-5">
      <div>
        <h2 className="font-black text-card-foreground text-base">Modular Feature Flags</h2>
        <p className="text-muted-foreground text-xs mt-0.5 font-medium">
          Control live rollout of platform modules instantly without code deployments.
        </p>
      </div>

      <div className="divide-y divide-border">
        {flags.map((flag) => (
          <div key={flag.id} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
            <div className="space-y-1 pr-6">
              <h4 className="text-sm font-black text-card-foreground">
                {flag.featureName.replace(/_/g, " ")}
              </h4>
              <p className="text-muted-foreground text-xs leading-relaxed font-medium">
                {flag.description || "No description provided."}
              </p>
            </div>
            <button
              onClick={() => handleToggle(flag.id, flag.isEnabled)}
              className="focus:outline-none transition-transform hover:scale-105 active:scale-95 shrink-0"
            >
              {flag.isEnabled
                ? <ToggleRight className="w-12 h-12" style={{ color: "var(--primary)" }} />
                : <ToggleLeft  className="w-12 h-12 text-muted-foreground/40" />}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
