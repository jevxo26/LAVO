import { Overview } from "../../../../types/deliveryAgent/overview";
import SummaryCard from "./SummaryCard";

type Props = {
  agent: Overview;
};

export default function SummaryCards({ agent }: Props) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">

      <SummaryCard
        title="Pending Pickups"
        value={agent.pendingPickups}
      />

      <SummaryCard
        title="Pending Deliveries"
        value={agent.pendingDeliveries}
      />

      <SummaryCard
        title="Completed Pickups"
        value={agent.completedPickups}
      />

      <SummaryCard
        title="Completed Deliveries"
        value={agent.completedDeliveries}
      />

    </div>
  );
}