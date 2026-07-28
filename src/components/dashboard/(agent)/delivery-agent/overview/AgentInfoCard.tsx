import { StatusBadge } from "@/components/shared/StatusBadge";
import { useAuth } from "@/hooks/useAuth";

type Props = {
  agent: {
    agentId: string;
    employeeCode: string;
    phone: string;
    status: string;
  };
};

export default function AgentInfoCard({ agent }: Props) {
  const { user } = useAuth();
  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold">
        Agent Information
      </h2>
      <div className="space-y-3">
        <p>
          <strong>Name:</strong> {user?.fullName ?? "-"}
        </p>
        <p>
          <strong>Agent ID:</strong> {agent.agentId}
        </p>
        <p>
          <strong>Employee Code:</strong> {agent.employeeCode}
        </p>
        <p>
          <strong>Phone:</strong> {agent.phone}
        </p>
        <p>
          {/* <strong>Branch:</strong> {agent.branch} */}
        </p>
        <div className="flex items-center gap-2">
          <strong>Status:</strong>

          <StatusBadge status={agent?.status ?? "INACTIVE"}  />
        </div>
      </div>
    </div>
  );
}