import SummaryCard from "./SummaryCard";

type Props = {
  agent: {
    totalDeliveries: number;
    pendingDeliveries: number;
    inProgressDeliveries: number;
    completedDeliveries: number;
  };
};

export default function SummaryCards({ agent }: Props) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">

      <SummaryCard
        title="Total Deliveries"
        value={agent.totalDeliveries}
      />

      <SummaryCard
        title="Pending Deliveries"
        value={agent.pendingDeliveries}
      />

      <SummaryCard
        title="In Progress"
        value={agent.inProgressDeliveries}
      />

      <SummaryCard
        title="Completed"
        value={agent.completedDeliveries}
      />

    </div>
  );
}