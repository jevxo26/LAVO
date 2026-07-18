"use client"

import { useAuth } from "@/hooks/useAuth"
import { AdminCrudPage } from "@/components/shared/admin-crud"
import { reviewConfig, supportTicketConfig } from "@/components/support/config"

import { SupportLiveChat } from "@/components/support/SupportLiveChat"

export function SupportTables() {
  const { user } = useAuth()
  const isAdmin = user?.userType === "ADMIN" || user?.userType === "SUPER_ADMIN"

  return (
    <div className="space-y-8">
      <SupportLiveChat />
      {isAdmin && (
        <>
          <AdminCrudPage config={supportTicketConfig} />
          <AdminCrudPage config={reviewConfig} />
        </>
      )}
    </div>
  )
}
