"use client";

import { useAuth } from "@/hooks/useAuth";
import { CustomerOverview } from "@/components/dashboard/CustomerOverview";

export default function DashboardPage() {
    const { user } = useAuth();

    // Check if the user is a CUSTOMER
    if (user?.userType === "CUSTOMER" || user?.userType === "Customer") {
        return <CustomerOverview />;
    }

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Welcome back, {user?.fullName || "User"}!</h1>
            <p className="text-slate-600">
                You are currently viewing the <span className="font-semibold text-indigo-600">{user?.userType || "Guest"}</span> Dashboard.
            </p>
        </div>
    );
}
