"use client";

import { useMemo } from "react";
import { DataTable } from "@/components/shared/DataTable";
import { useAuth } from "@/hooks/useAuth";
import { history } from "../../../../data/deliveryAgent/history";
import { historyColumns } from "./HistoryColumns";

type HistoryTableProps = {
    search: string;
}

const HistoryTable = ({
    search
}: HistoryTableProps) => {
    const { user } = useAuth();
    const data = useMemo(() => {

        return history.filter((item) => {
            const matchAgent =
                item.agentId === user?.id ||
                item.agentId === undefined;

            const matchSearch =
                item.orderId
                    .toLowerCase()
                    .includes(search.toLowerCase())
                ||
                item.customerName
                    .toLowerCase()
                    .includes(search.toLowerCase());

            return matchAgent && matchSearch;
        });
    }, [user, search]);

    return (
        <div className="rounded-xl border bg-white p-5">
            <DataTable
                columns={historyColumns}
                data={data}
                emptyMessage="No history found."
            />
        </div>
    )

}


export default HistoryTable;