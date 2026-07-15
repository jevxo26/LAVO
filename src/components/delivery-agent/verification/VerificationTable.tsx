"use client";

import { DataTable } from "@/components/shared/DataTable";
import { Verification as VerificationType } from "../../../../types/deliveryAgent/verification";
import { getVerificationColumns } from "./VerificationColumns";
import VerificationToolbar from "./VerificationToolbar";
import { useState } from "react";
import OtpDialog from "./OtpDialog";

type VerificationTableProps = {
    data: VerificationType[];
    search: string;
    setSearch: (value: string) => void;
};

const VerificationTable = ({
    data,
    search,
    setSearch,
}: VerificationTableProps) => {
    const [open, setOpen] = useState(false);
    const [selectedVerification, setSelectedVerification] =
        useState<VerificationType | null>(null);

    const handleVerify = (item: VerificationType) => {
        setSelectedVerification(item);
        setOpen(true);
    };

    const columns = getVerificationColumns({
        onVerify: handleVerify,
    });

    return (
        <div className="space-y-5">
            <VerificationToolbar
                search={search}
                setSearch={setSearch}
            />
            <div className="rounded-xl border bg-white p-5">
                <DataTable
                    columns={columns}
                    data={data}
                    emptyMessage="No verification request available."
                />
            </div>
            <OtpDialog
                open={open}
                verification={selectedVerification}
                onClose={()=>{
                setOpen(false);
                setSelectedVerification(null);
                }}
            />
        </div>
    );
};

export default VerificationTable;