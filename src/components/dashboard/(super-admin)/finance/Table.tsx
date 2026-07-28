"use client";

import { AdminCrudPage } from "@/components/shared/admin-crud";
import {
  deliveryChargeConfig,
  taxRuleConfig,
} from "@/components/dashboard/(super-admin)/finance/config";

export function FinanceTables() {
  return (
    <div className="space-y-8">
      <AdminCrudPage config={taxRuleConfig} />
      <AdminCrudPage config={deliveryChargeConfig} />
    </div>
  );
}
