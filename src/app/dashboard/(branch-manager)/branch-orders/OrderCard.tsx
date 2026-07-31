import { Package, User, Banknote, Shirt, Calendar, Store } from "lucide-react";
import { OrderStatusPill } from "./OrderStatusPill";
import { OrderActions } from "./OrderActions";

interface Props {
  order: any;
  onUpdate: () => void;
}

export function OrderCard({ order, onUpdate }: Props) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm hover:border-indigo-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">

      {/* Left */}
      <div className="flex items-start gap-4 min-w-0">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-50">
          <Package size={20} className="text-indigo-500" />
        </div>
        <div className="space-y-1.5 min-w-0">
          {/* Order # + status + vendor */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[13px] font-bold text-slate-900 font-mono">
              #{order.orderNumber}
            </span>
            <OrderStatusPill status={order.orderStatus} />
            {order.vendor ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-violet-200 bg-violet-50 px-2 py-0.5 text-[10px] font-bold text-violet-700">
                <Store size={9} /> {order.vendor.businessName}
              </span>
            ) : (
              <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                In-house
              </span>
            )}
          </div>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <User size={11} />
              <span className="font-semibold text-slate-700">
                {order.customer?.user?.fullName || "Unknown"}
              </span>
            </span>
            <span className="flex items-center gap-1">
              <Banknote size={11} />
              <span className="font-semibold text-slate-700">৳{order.grandTotal}</span>
            </span>
            {order.totalGarments && (
              <span className="flex items-center gap-1">
                <Shirt size={11} />
                <span className="font-semibold text-indigo-600">{order.totalGarments} garments</span>
              </span>
            )}
            <span className="flex items-center gap-1">
              <Calendar size={11} />
              {new Date(order.createdAt).toLocaleDateString("en-US", {
                month: "short", day: "numeric", year: "numeric",
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Right: actions */}
      <div className="shrink-0 self-start sm:self-center">
        <OrderActions order={order} onUpdate={onUpdate} />
      </div>
    </div>
  );
}
