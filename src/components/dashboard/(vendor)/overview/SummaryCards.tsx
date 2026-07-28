import {
  ClipboardList,
  Clock,
  CheckCircle,
  CalendarDays,
  Wallet,
  TrendingUp,
  Banknote,
  Star,
} from "lucide-react";
import SummaryCard from "./SummaryCard";

type Props = {
  vendor: {
    totalOrders: number;
    activeOrders: number;
    completedOrders: number;
    todayOrders: number;
    walletBalance: number;
    totalEarnings: number;
    pendingSettlement: number;
    averageRating: number;
  };
};

export default function SummaryCards({ vendor }: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <SummaryCard
        title="Total Orders"
        value={vendor.totalOrders}
        icon={ClipboardList}
        description="All time"
        accent="blue"
      />
      <SummaryCard
        title="Active Orders"
        value={vendor.activeOrders}
        icon={Clock}
        description="Currently processing"
        accent="amber"
      />
      <SummaryCard
        title="Completed Orders"
        value={vendor.completedOrders}
        icon={CheckCircle}
        description="All time"
        accent="green"
      />
      <SummaryCard
        title="Today's Orders"
        value={vendor.todayOrders}
        icon={CalendarDays}
        description="Received today"
        accent="violet"
      />
      <SummaryCard
        title="Wallet Balance"
        value={`৳${vendor.walletBalance.toLocaleString()}`}
        icon={Wallet}
        description="Available to withdraw"
        accent="green"
      />
      <SummaryCard
        title="Total Earnings"
        value={`৳${vendor.totalEarnings.toLocaleString()}`}
        icon={TrendingUp}
        description="Lifetime earnings"
        accent="blue"
      />
      <SummaryCard
        title="Pending Settlement"
        value={`৳${vendor.pendingSettlement.toLocaleString()}`}
        icon={Banknote}
        description="Awaiting clearance"
        accent="amber"
      />
      <SummaryCard
        title="Avg. Rating"
        value={vendor.averageRating.toFixed(1)}
        icon={Star}
        description="Customer rating"
        accent="violet"
      />
    </div>
  );
}
