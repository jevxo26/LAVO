"use client"

import { AdminCrudPage } from "@/components/shared/admin-crud"
import { serviceConfig } from "@/components/marketing/services/config"

export function ServiceTable() {
  return <AdminCrudPage config={serviceConfig} />
}
