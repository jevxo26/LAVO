import { Package, Clock, Shirt, CheckCircle2 } from "lucide-react";
import { OverviewStatCard } from "@/components/dashboard/shared/overview/OverviewStatCard";

interface Props {
  total: number;
  pending: number;
  processing: number;
  ready: number;
}

export function OrderStatCards({ total, pending, processing, ready }: Props) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <OverviewStatCard label="Total Orders"  sub="All active"            value={total}      icon={Package}      gradient="from-blue-500 to-indigo-600"    />
      <OverviewStatCard label="Pending"       sub="Awaiting processing"   value={pending}    icon={Clock}        gradient="from-amber-400 to-orange-500"   />
      <OverviewStatCard label="In Processing" sub="Being washed / ironed" value={processing} icon={Shirt}        gradient="from-cyan-500 to-blue-600"      />
      <OverviewStatCard label="Ready"         sub="Ready for delivery"    value={ready}      icon={CheckCircle2} gradient="from-emerald-500 to-teal-600"   />
    </div>
  );
}
