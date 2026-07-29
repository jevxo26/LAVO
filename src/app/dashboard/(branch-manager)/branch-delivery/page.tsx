"use client"

import { AdminCrudPage } from "@/components/shared/admin-crud"
import { deliveryAgentConfig } from "@/components/dashboard/(agent)/deliveryAgentsConfig"

export default function DeliveryAgentsPage() {
  return <AdminCrudPage config={deliveryAgentConfig} />
}
