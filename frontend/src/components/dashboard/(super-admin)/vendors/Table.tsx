"use client"

import { AdminCrudPage } from "@/components/shared/admin-crud"
import { vendorConfig } from "@/components/dashboard/(super-admin)/vendors/config"

export function VendorTable() {
  return <AdminCrudPage config={vendorConfig} />
}
