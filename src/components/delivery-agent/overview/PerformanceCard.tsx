import { Star } from "lucide-react";

type Props = {
  agent: {
    agentId: string;
    employeeCode: string;
    phone: string;
    status: string;

    totalPickups: number;
    pendingPickups: number;

    totalDeliveries: number;
    pendingDeliveries: number;
  };
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
          <strong>
            {agent.totalPickups + agent.totalDeliveries}
          </strong>
        </div>


        <div className="flex justify-between">
          <span>Pickups</span>
          <strong>
            {agent.totalPickups}
          </strong>
        </div>


        <div className="flex justify-between">
          <span>Deliveries</span>
          <strong>
            {agent.totalDeliveries}
          </strong>
        </div>


        <div className="flex justify-between">
          <span>Status</span>
          <strong>
            {agent.status}
          </strong>
        </div>

      </div>
    </div>
  );
}