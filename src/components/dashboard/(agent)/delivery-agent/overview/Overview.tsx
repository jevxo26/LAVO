"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { useAuth } from "@/hooks/useAuth";

import SummaryCards from "./SummaryCards";
import AgentInfoCard from "./AgentInfoCard";
import PerformanceCard from "./PerformanceCard";
import { useEffect, useState } from "react";
import axios from "axios";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";

export default function Overview() {
  const { user } = useAuth();
  console.log(user)

  const [agent, setAgent] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchOverview = async () => {
    try {
      const token = localStorage.getItem("laundrix_token");

      console.log("Token:", token);

      const res = await axios.get("/api/delivery-agent/overview", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // console.log("API Success:", res.data);

      setAgent(res.data.data);
    } catch (err: any) {
      // console.log("API Error:", err);
      // console.log("Response:", err.response);
      // console.log("Data:", err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  if (loading) {
    return <LoadingSkeleton />;
  }
  return (
    <div className="space-y-6">
      <PageHeader
        title="Overview"
        description="Track today's pickup and delivery summary."
      />

      {!agent ? (
        <div className="rounded-xl border border-dashed bg-white p-10 text-center">
          <h2 className="text-xl font-semibold text-slate-900">
            No delivery data found
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Hello, <span className="font-medium">{user?.fullName}</span>.
            You don't have any pickup or delivery assigned yet. Once an
            administrator assigns tasks, your overview will appear here.
          </p>
        </div>
      ) : (
        <>
          <SummaryCards agent={agent} />

          <div className="grid gap-6 lg:grid-cols-2">
            <AgentInfoCard agent={agent}/>
            <PerformanceCard agent={agent} />
          </div>
        </>
      )}
    </div>
  );
}