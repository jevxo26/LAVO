"use client";

import { useEffect, useMemo, useState } from "react";

import { useAuth } from "@/hooks/useAuth";
import VerificationTable from "./VerificationTable";
import axios from "axios";
import { VerificationType } from "../types";


const Verification = () => {
    const { user } = useAuth();
    const [search, setSearch] = useState("");
    const [data, setData] = useState<VerificationType[]>([]);

    const fetchVerification = async () => {
        try {
            const token = localStorage.getItem("laundrix_token");

            const res = await axios.get(
                "/api/delivery-agent/verifications",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setData(res.data.data);
        } catch (err) {
            console.error(err);
        }
    };
    useEffect(() => {
        fetchVerification();
    }, []);

    const filteredData = useMemo(() => {
        return data.filter((item) => {
            return (
                item.orderId.toString().includes(search) ||
                item.customerName
                    .toLowerCase()
                    .includes(search.toLowerCase())
            );
        });
    }, [data, search]);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-semibold">
                Delivery Verification
            </h1>
            <VerificationTable
                data={filteredData}
                search={search}
                setSearch={setSearch}
                fetchVerification={fetchVerification}
            />
        </div>

    );

};


export default Verification;