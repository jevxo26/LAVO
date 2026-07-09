"use client"

import { AdminCrudPage } from "@/components/shared/admin-crud"
import { userConfig } from "@/components/users/config"

export function UserTable() {
  return <AdminCrudPage config={userConfig} />
}
