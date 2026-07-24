import { orderStatusStyle, paymentStatusStyle } from "./types";

export function OrderStatusBadge({ status }: { status: string }) {
  const { cls, dot, label } = orderStatusStyle(status);
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${cls}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
}

export function OrderPaymentBadge({ status }: { status: string }) {
  const { cls, dot, label } = paymentStatusStyle(status);
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${cls}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
}
