"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { DataTable } from "@/components/shared/DataTable";
import { useAuth } from "@/hooks/useAuth";
import { historyColumns } from "./HistoryColumns";
import { History } from "../types";

type HistoryTableProps = {
    search: string;
}

const HistoryTable = ({
    search
}: HistoryTableProps) => {
    const { user } = useAuth();
    const [historyData, setHistoryData] = useState<History[]>([]);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const token = localStorage.getItem("laundrix_token");
                const res = await axios.get(
                    "/api/delivery-agent/history",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                setHistoryData(res.data.data);
            } catch (error) {
                console.error(error);
            }
        };
        fetchHistory();
    }, []);

    const data = useMemo(() => {
        return historyData.filter((item) => {
            return (
                item.orderId
                    .toString()
                    .toLowerCase()
                    .includes(search.toLowerCase())
                ||
                item.customerName
                    .toLowerCase()
                    .includes(search.toLowerCase())
            );

        });

    }, [historyData, search]);



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