"use client"

import { AdminCrudPage } from "@/components/shared/admin-crud"
import {
  deliveryAgentConfig,
  vehicleConfig,
} from "@/components/logistics/config"

export function LogisticsTables() {
  return (
    <div className="space-y-8">
      <AdminCrudPage config={deliveryAgentConfig} />
      <AdminCrudPage config={vehicleConfig} />
    </div>
  )
}
