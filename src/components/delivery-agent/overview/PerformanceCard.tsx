import { Star } from "lucide-react";
import { Overview } from "../../../../types/deliveryAgent/overview";

type Props = {
  agent: Overview;
};

export default function PerformanceCard({ agent }: Props) {
  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold">
        Performance
      </h2>
      <div className="space-y-4">
        <div className="flex justify-between">
          <span>Total Orders</span>
          <strong>{agent.totalOrders}</strong>
        </div>
        <div className="flex justify-between">
          <span>Earnings</span>
          <strong>৳ {agent.earnings}</strong>
        </div>
        <div className="flex justify-between">
          <span>Rating</span>
          <strong className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />

            {agent.rating}
          </strong>
        </div>
      </div>
    </div>
  );
}