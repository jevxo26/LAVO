import { LogisticsTables } from "@/components/dashboard/(agent)/logistics/Table"
import { Suspense } from "react"

export default function LogisticsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LogisticsTables />
    </Suspense>
  )
}
