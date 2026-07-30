import { Search, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export type OrderTab = "ALL" | "PENDING" | "PROCESSING" | "READY" | "COMPLETED";

const TAB_META: Record<OrderTab, { label: string; active: string; idle: string }> = {
  ALL:        { label: "All Orders",  active: "bg-indigo-600 text-white shadow-md shadow-indigo-200",         idle: "bg-slate-100 text-slate-600 hover:bg-slate-200"                                },
  PENDING:    { label: "Pending",     active: "bg-amber-500 text-white shadow-md shadow-amber-200",           idle: "bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200"         },
  PROCESSING: { label: "Processing",  active: "bg-indigo-500 text-white shadow-md shadow-indigo-200",         idle: "bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200"     },
  READY:      { label: "Ready",       active: "bg-emerald-500 text-white shadow-md shadow-emerald-200",       idle: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200" },
  COMPLETED:  { label: "Completed",   active: "bg-slate-600 text-white shadow-md shadow-slate-200",           idle: "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"         },
};

interface Props {
  activeTab: OrderTab;
  onTabChange: (tab: OrderTab) => void;
  tabCounts: Record<OrderTab, number>;
  search: string;
  onSearchChange: (v: string) => void;
  totalFiltered: number;
}

export function OrderToolbar({
  activeTab, onTabChange, tabCounts, search, onSearchChange, totalFiltered,
}: Props) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white px-5 py-4 shadow-sm space-y-3">
      {/* Tab pills */}
      <div className="flex flex-wrap gap-2">
        {(Object.keys(TAB_META) as OrderTab[]).map((tab) => {
          const meta   = TAB_META[tab];
          const active = activeTab === tab;
          return (
            <button key={tab} onClick={() => onTabChange(tab)}
              className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold transition-all duration-150 ${active ? meta.active : meta.idle}`}>
              {meta.label}
              <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-extrabold
                ${active ? "bg-white/25 text-white" : "bg-white/70 text-current border border-current/20"}`}>
                {tabCounts[tab]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
          <input type="text" value={search} onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by order # or customer…"
            className="w-full h-9 pl-9 pr-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white transition" />
        </div>
        {search && (
          <Button size="sm" variant="ghost" onClick={() => onSearchChange("")}
            className="h-9 rounded-xl text-xs font-bold text-slate-500 hover:text-rose-600 hover:bg-rose-50 px-3 gap-1.5">
            <RotateCcw size={12} /> Clear
          </Button>
        )}
        <p className="text-[11px] text-slate-400 ml-auto">
          <span className="font-semibold text-slate-600">{totalFiltered}</span> orders
        </p>
      </div>
    </div>
  );
}
