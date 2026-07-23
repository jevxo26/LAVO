"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { OverviewStatCard } from "./OverviewStatCard";
import { ClipboardList, Truck, PackageCheck, Headphones, Activity } from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";

const fallbackStageData = [
  { name: "Pending Pickups", value: 140, color: "var(--accent)" },
  { name: "In Processing", value: 280, color: "var(--primary)" },
  { name: "Ready & Delivered", value: 410, color: "var(--muted-foreground)" },
];

const fallbackActivities = [
  { id: "ORD-9481", action: "New Order Placed", entity: "Express Wash - 5 Items", user: "John Doe", time: "5m ago" },
  { id: "TCK-402", action: "Support Ticket Raised", entity: "Delayed Delivery Inquiry", user: "Sarah Jenkins", time: "18m ago" },
  { id: "AGT-12", action: "Agent Dispatched", entity: "Pickup Route #4", user: "Alex Delivery Agent", time: "32m ago" },
  { id: "ORD-9478", action: "Order Completed", entity: "Dry Cleaning & Press", user: "Robert Vance", time: "1h ago" },
];

export function NormalAdminOverview() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    axios
      .get("/api/admin/overview/normal-admin")
      .then((res) => {
        if (res.data?.success) setData(res.data.data);
      })
      .catch(() => {});
  }, []);

  const todaysOrders = data?.todaysTotalOrders ?? 830;
  const pendingPickups = data?.pendingPickups ?? 140;
  const readyForDelivery = data?.readyForDelivery ?? 95;
  const activeTickets = data?.activeSupportTickets ?? 14;
  const stageData = data?.orderStageData || fallbackStageData;
  const recentOrders = data?.recentOrders;

  const activities = recentOrders?.length
    ? recentOrders.map((ord: any) => ({
        id: ord.orderNumber || ord.id.slice(0, 8),
        action: "Order Placed",
        entity: `${ord.orderType || "Standard Laundry"} - ${ord.totalGarments || 1} Items`,
        user: ord.customer?.user?.fullName || "Registered Customer",
        time: ord.createdAt ? new Date(ord.createdAt).toLocaleTimeString() : "Recently",
      }))
    : fallbackActivities;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <OverviewStatCard title="Today's Total Orders" value={todaysOrders} change="+12.5%" icon={ClipboardList} />
        <OverviewStatCard title="Pending Pickups" value={pendingPickups} change="Requires dispatch" isPositive={false} icon={Truck} />
        <OverviewStatCard title="Ready for Delivery" value={readyForDelivery} change="Ready in hub" icon={PackageCheck} />
        <OverviewStatCard title="Active Support Tickets" value={activeTickets} change="-3 resolved" icon={Headphones} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-card text-card-foreground p-6 rounded-2xl border border-border shadow-sm space-y-4">
          <div>
            <h3 className="font-bold text-foreground text-base">Order Stage Distribution</h3>
            <p className="text-xs text-muted-foreground">Current operational volume breakdown</p>
          </div>
          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={stageData} innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value">
                  {stageData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "var(--card)", borderColor: "var(--border)", borderRadius: "12px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 pt-2 border-t border-border">
            {stageData.map((item: any) => (
              <div key={item.name} className="flex items-center justify-between text-xs font-semibold">
                <span className="text-muted-foreground flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  {item.name}
                </span>
                <span className="text-foreground">{item.value} orders</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 bg-card text-card-foreground p-6 rounded-2xl border border-border shadow-sm space-y-4">
          <h3 className="font-bold text-foreground text-base flex items-center gap-2">
            <Activity size={18} className="text-primary" /> Live Operational Activity Stream
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border text-muted-foreground uppercase font-bold">
                  <th className="py-2.5 px-3">Reference ID</th>
                  <th className="py-2.5 px-3">Action</th>
                  <th className="py-2.5 px-3">Details</th>
                  <th className="py-2.5 px-3">Initiated By</th>
                  <th className="py-2.5 px-3 text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {activities.map((act: any) => (
                  <tr key={act.id} className="hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-3 font-bold text-primary">{act.id}</td>
                    <td className="py-3 px-3 font-semibold text-foreground">{act.action}</td>
                    <td className="py-3 px-3 text-muted-foreground">{act.entity}</td>
                    <td className="py-3 px-3 text-foreground">{act.user}</td>
                    <td className="py-3 px-3 text-right text-muted-foreground">{act.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
