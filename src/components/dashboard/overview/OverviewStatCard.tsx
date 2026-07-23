"use client";

import React from "react";
import { LucideIcon } from "lucide-react";

interface OverviewStatCardProps {
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  icon: LucideIcon;
}

export function OverviewStatCard({
  title,
  value,
  change,
  isPositive = true,
  icon: Icon,
}: OverviewStatCardProps) {
  return (
    <div className="bg-card text-card-foreground p-5 rounded-2xl border border-border shadow-sm space-y-3 flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          {title}
        </span>
        <div className="p-2.5 bg-muted text-foreground rounded-xl">
          <Icon size={18} />
        </div>
      </div>
      <div>
        <div className="text-2xl font-bold text-foreground tracking-tight">
          {value}
        </div>
        {change && (
          <div className="flex items-center gap-1 mt-1 text-xs font-medium">
            <span
              className={isPositive ? "text-primary font-bold" : "text-destructive font-bold"}
            >
              {change}
            </span>
            <span className="text-muted-foreground">vs last week</span>
          </div>
        )}
      </div>
    </div>
  );
}
