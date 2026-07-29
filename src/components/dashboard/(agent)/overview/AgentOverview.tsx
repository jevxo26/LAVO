"use client";

import { useEffect, useState } from "react";
import { authFetch } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { AgentHeroBanner }    from "./AgentHeroBanner";
import { AgentStatCards }     from "./AgentStatCards";
import { AgentActivityPanel } from "./AgentActivityPanel";
import { AgentQuickActions }  from "./AgentQuickActions";

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Sk({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-2xl bg-slate-100 ${className ?? ""}`} />;
}

function PageSkeleton() {
  return (
    <div className="space-y-6">
      <Sk className="h-48 w-full" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => <Sk key={i} className="h-[100px]" />)}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <Sk className="lg:col-span-2 h-72" />
        <Sk className="h-72" />
      </div>
    </div>
  );
}

// ─── AgentOverview ────────────────────────────────────────────────────────────

export function AgentOverview() {
  const { user } = useAuth();
  const [data, setData]       = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authFetch("/delivery-agent/overview")
      .then((r) => r.json())
      .then((j) => { if (j.success) setData(j.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageSkeleton />;

  const availablePickups = data?.availablePickups  ?? data?.pendingDeliveries    ?? 0;
  const activeDeliveries = data?.activeDeliveries  ?? data?.inProgressDeliveries ?? 0;
  const completedToday   = data?.completedToday    ?? data?.completedDeliveries  ?? 0;
  const totalDeliveries  = data?.totalDeliveries   ?? 0;
  const assignedRoutes   = data?.assignedRoutes    ?? 0;
  const agentStatus      = data?.status            ?? "ACTIVE";

  const completionPct = totalDeliveries > 0
    ? Math.round((completedToday / totalDeliveries) * 100) : 0;

  return (
    <div className="space-y-6">
      <AgentHeroBanner
        fullName={user?.fullName || "Agent"}
        status={agentStatus}
        availablePickups={availablePickups}
        activeDeliveries={activeDeliveries}
        completedToday={completedToday}
      />
      <AgentStatCards
        availablePickups={availablePickups}
        activeDeliveries={activeDeliveries}
        completedToday={completedToday}
        assignedRoutes={assignedRoutes}
        totalDeliveries={totalDeliveries}
      />
      <div className="grid gap-6 lg:grid-cols-3 items-start">
        <AgentActivityPanel
          availablePickups={availablePickups}
          activeDeliveries={activeDeliveries}
          completedToday={completedToday}
          assignedRoutes={assignedRoutes}
          totalDeliveries={totalDeliveries}
          completionPct={completionPct}
        />
        <AgentQuickActions
          availablePickups={availablePickups}
          activeDeliveries={activeDeliveries}
        />
      </div>
    </div>
  );
}

export default AgentOverview;
