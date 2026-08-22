type Props = {
  agent: {
    agentId: string;
    employeeCode: string;
    phone: string;
    status: string;

    totalDeliveries: number;
    pendingDeliveries: number;
    inProgressDeliveries: number;
    completedDeliveries: number;
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
          <span>Total Deliveries</span>
          <strong>{agent.totalDeliveries}</strong>
        </div>

        <div className="flex justify-between">
          <span>Pending</span>
          <strong>{agent.pendingDeliveries}</strong>
        </div>

        <div className="flex justify-between">
          <span>In Progress</span>
          <strong>{agent.inProgressDeliveries}</strong>
        </div>

        <div className="flex justify-between">
          <span>Completed</span>
          <strong>{agent.completedDeliveries}</strong>
        </div>

        <div className="flex justify-between">
          <span>Status</span>
          <strong>{agent.status}</strong>
        </div>
      </div>
    </div>
  );
}