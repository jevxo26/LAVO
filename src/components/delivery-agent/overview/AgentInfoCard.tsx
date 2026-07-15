import { StatusBadge } from "@/components/shared/StatusBadge";
import { Overview } from "../../../../types/deliveryAgent/overview";

type Props = {
  agent: Overview;
};

export default function AgentInfoCard({ agent }: Props) {
  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold">
        Agent Information
      </h2>
      <div className="space-y-3">
        <p>
          <strong>Name:</strong> {agent.agentName}
        </p>
        <p>
          <strong>Agent ID:</strong> {agent.agentId}
        </p>
        <p>
          <strong>Branch:</strong> {agent.branch}
        </p>
        <div className="flex items-center gap-2">
          <strong>Status:</strong>

          <StatusBadge status={agent.status} />
        </div>
      </div>
    </div>
  );
}