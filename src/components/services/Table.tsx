"use client"

import { AdminCrudPage } from "@/components/shared/admin-crud"
import { serviceConfig } from "@/components/services/config"

export function ServiceTable() {
  return <AdminCrudPage config={serviceConfig} />
}
