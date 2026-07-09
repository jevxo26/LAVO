"use client"

import { AdminCrudPage } from "@/components/shared/admin-crud"
import { deliveryChargeConfig, taxRuleConfig } from "@/components/finance/config"

export function FinanceTables() {
  return (
    <div className="space-y-8">
      <AdminCrudPage config={taxRuleConfig} />
      <AdminCrudPage config={deliveryChargeConfig} />
    </div>
  )
}
