"use client";

import { useMemo, useState } from "react";

import { verification } from "../../../../data/deliveryAgent/verification";
import { useAuth } from "@/hooks/useAuth";
import VerificationTable from "./VerificationTable";


const Verification = () => {
    const { user } = useAuth();
    const [search, setSearch] = useState("");
    const data = useMemo(() => {

        return verification.filter((item) => {
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
        <div className="space-y-6">
            <h1 className="text-2xl font-semibold">
                Delivery Verification
            </h1>
            <VerificationTable
                data={data}
                search={search}
                setSearch={setSearch}
            />
        </div>

    );

};


export default Verification;