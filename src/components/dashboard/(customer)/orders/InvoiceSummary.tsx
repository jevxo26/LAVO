import { Receipt, Download } from "lucide-react";
import { OrderRecord } from "./types";
import { OrderPaymentBadge } from "./Badges";
import { downloadInvoice } from "@/lib/generateInvoiceHtml";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

interface InvoiceSummaryProps {
  order: OrderRecord;
}

interface LineProps {
  label: string;
  value: string;
  bold?: boolean;
  accent?: boolean;
  faint?: boolean;
}

function Line({ label, value, bold, accent, faint }: LineProps) {
  return (
    <div className={`flex items-center justify-between ${faint ? "text-slate-400" : ""}`}>
      <span className={bold ? "font-semibold text-slate-700" : "text-slate-500"}>{label}</span>
      <span className={`font-bold ${accent ? "text-indigo-600 text-sm" : "text-slate-800"}`}>{value}</span>
    </div>
  );
}

export function InvoiceSummary({ order }: InvoiceSummaryProps) {
  const { user } = useAuth();

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50">
            <Receipt size={14} className="text-indigo-500" />
          </div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Payment Invoice</h4>
        </div>
      </div>

      {/* Invoice box */}
      <div className="rounded-xl border border-slate-100 bg-white p-4 text-xs space-y-2.5 shadow-sm">
        <Line label="Subtotal"           value={`৳${order.subtotal.toFixed(2)}`} />

        {order.discount > 0 && (
          <Line label="Discount" value={`-৳${order.discount.toFixed(2)}`} />
        )}

        <Line
          label="Delivery Fee"
          value={order.deliveryCharge === 0 ? "FREE" : `৳${order.deliveryCharge.toFixed(2)}`}
        />

        <Line label="VAT / Service Tax (5%)" value={`৳${order.tax.toFixed(2)}`} />

        {/* Divider */}
        <div className="border-t border-slate-100 pt-2.5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-extrabold text-slate-900">Grand Total</span>
            <span className="text-sm font-extrabold text-indigo-600">৳{order.grandTotal.toFixed(2)}</span>
          </div>
        </div>

        {/* Payment status */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-2.5">
          <span className="font-semibold text-slate-600">Payment Status</span>
          <OrderPaymentBadge status={order.paymentStatus} />
        </div>

        {/* Download Invoice Button */}
        <div className="border-t border-slate-100 pt-3">
          <Button
            size="sm"
            variant="outline"
            onClick={() => downloadInvoice(order, user?.fullName, user?.phone, user?.email)}
            className="w-full h-9 rounded-xl border-blue-200 bg-blue-50/60 hover:bg-blue-100 text-blue-700 text-xs font-bold gap-2 shadow-xs transition-all"
          >
            <Download size={14} /> Download Tax Invoice (PDF)
          </Button>
        </div>
      </div>
    </div>
  );
}
