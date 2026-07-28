'use client'
import { AdminCrudPage } from "@/components/shared/admin-crud";
import { partnerApplicationConfig } from "@/components/dashboard/partner-applications/config";


export default function PartnerApplicationsPage() {
  return (
    <AdminCrudPage
      config={partnerApplicationConfig}
    />
  );
}