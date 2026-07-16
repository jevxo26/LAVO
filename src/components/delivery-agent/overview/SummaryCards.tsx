import SummaryCard from "./SummaryCard";

type Props = {
  agent: {
    totalPickups: number;
    pendingPickups: number;
    totalDeliveries: number;
    pendingDeliveries: number;
  };
};

export default function SummaryCards({ agent }: Props) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">

      <SummaryCard
        title="Total Pickups"
        value={agent.totalPickups}
      />

      <SummaryCard
        title="Pending Pickups"
        value={agent.pendingPickups}
      />

      <SummaryCard
        title="Total Deliveries"
        value={agent.totalDeliveries}
      />

      <SummaryCard
        title="Pending Deliveries"
        value={agent.pendingDeliveries}
      />

    </div>
  );
}