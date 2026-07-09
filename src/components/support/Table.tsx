"use client"

import { AdminCrudPage } from "@/components/shared/admin-crud"
import { reviewConfig, supportTicketConfig } from "@/components/support/config"

export function SupportTables() {
  return (
    <div className="space-y-8">
      <AdminCrudPage config={supportTicketConfig} />
      <AdminCrudPage config={reviewConfig} />
    </div>
  )
}
