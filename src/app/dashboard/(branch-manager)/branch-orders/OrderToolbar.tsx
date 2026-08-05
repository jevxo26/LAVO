import { Search, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export type OrderTab = "ALL" | "PENDING" | "PROCESSING" | "READY" | "COMPLETED";

const TAB_META: Record<OrderTab, { label: string; active: string; idle: string }> = {
  ALL:        { label: "All Orders",  active: "bg-blue-600 text-white shadow-md shadow-blue-600/30",        idle: "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"                                },
  PENDING:    { label: "Pending",     active: "bg-amber-500 text-white shadow-md shadow-amber-500/30",       idle: "bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300"        },
  PROCESSING: { label: "Processing",  active: "bg-cyan-600 text-white shadow-md shadow-cyan-600/30",        idle: "bg-cyan-50 text-cyan-700 hover:bg-cyan-100 border border-cyan-200 dark:bg-cyan-950/40 dark:text-cyan-300"            },
  READY:      { label: "Ready",       active: "bg-emerald-600 text-white shadow-md shadow-emerald-600/30",   idle: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300" },
  COMPLETED:  { label: "Completed",   active: "bg-slate-700 text-white shadow-md shadow-slate-700/30",       idle: "bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200 dark:bg-slate-800 dark:text-slate-300"         },
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
    <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-4 dark:bg-slate-900 dark:border-slate-800">
      {/* Tab pills */}
      <div className="flex flex-wrap gap-2">
        {(Object.keys(TAB_META) as OrderTab[]).map((tab) => {
          const meta   = TAB_META[tab];
          const active = activeTab === tab;
          return (
            <button key={tab} onClick={() => onTabChange(tab)}
              className={`flex items-center gap-2 rounded-2xl px-4 py-2 text-xs font-black transition-all duration-200 ${active ? meta.active : meta.idle}`}>
              {meta.label}
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-black
                ${active ? "bg-white/25 text-white" : "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200"}`}>
                {tabCounts[tab]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-slate-100 dark:border-slate-800">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-3 text-slate-400" size={15} />
          <input type="text" value={search} onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by order # or customer…"
            className="w-full h-10 rounded-2xl border border-slate-200 bg-slate-50/80 pl-10 pr-4 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-white" />
        </div>
        {search && (
          <Button size="sm" variant="ghost" onClick={() => onSearchChange("")}
            className="h-9 px-3 rounded-xl text-xs font-extrabold text-slate-500 hover:text-rose-600 gap-1.5">
            <RotateCcw size={13} /> Clear
          </Button>
        )}
        <p className="text-xs text-slate-400 font-medium">
          Showing <span className="font-black text-slate-800 dark:text-slate-200">{totalFiltered}</span> orders
        </p>
      </div>
    </div>
  );
}
