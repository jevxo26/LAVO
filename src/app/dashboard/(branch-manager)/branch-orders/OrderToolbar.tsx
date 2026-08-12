import { Search, RotateCcw, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export type OrderTab = "ALL" | "PENDING" | "PROCESSING" | "READY" | "COMPLETED";

const TAB_META: Record<OrderTab, { label: string; activeStyle: React.CSSProperties }> = {
  ALL:        { label: "All Orders",  activeStyle: { background: "var(--primary)"   } },
  PENDING:    { label: "Pending",     activeStyle: { background: "var(--warning)"   } },
  PROCESSING: { label: "Processing",  activeStyle: { background: "var(--primary)"   } },
  READY:      { label: "Ready",       activeStyle: { background: "var(--success)"   } },
  COMPLETED:  { label: "Completed",   activeStyle: { background: "var(--secondary)" } },
};

interface Props {
  activeTab: OrderTab;
  onTabChange: (tab: OrderTab) => void;
  tabCounts: Record<OrderTab, number>;
  search: string;
  onSearchChange: (v: string) => void;
  totalFiltered: number;
  onRefresh?: () => void;
  refreshing?: boolean;
}

export function OrderToolbar({
  activeTab, onTabChange, tabCounts, search, onSearchChange, totalFiltered,
  onRefresh, refreshing,
}: Props) {
  return (
    <div className="rounded-3xl border border-border bg-card p-5 shadow-sm space-y-4">
      {/* Tabs + Refresh */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-2">
          {(Object.keys(TAB_META) as OrderTab[]).map((tab) => {
            const meta   = TAB_META[tab];
            const active = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => onTabChange(tab)}
                className={`flex items-center gap-2 rounded-2xl px-4 py-2 text-xs font-black transition-all duration-200 ${
                  active ? "text-white shadow-md" : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
                style={active ? meta.activeStyle : undefined}
              >
                {meta.label}
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                  active ? "bg-white/25 text-white" : "bg-border text-muted-foreground"
                }`}>
                  {tabCounts[tab]}
                </span>
              </button>
            );
          })}
        </div>

        {onRefresh && (
          <Button
            size="sm"
            variant="outline"
            onClick={onRefresh}
            className="h-9 px-3 rounded-xl text-xs font-black gap-1.5 border-border hover:bg-muted shrink-0"
          >
            <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} /> Refresh
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-border">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-3 text-muted-foreground" size={15} />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by order # or customer…"
            className="w-full h-10 rounded-2xl border border-border bg-muted/50 pl-10 pr-4 text-xs font-bold text-card-foreground placeholder:text-muted-foreground focus:border-ring focus:bg-card focus:outline-none transition-all"
          />
        </div>
        {search && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onSearchChange("")}
            className="h-9 px-3 rounded-xl text-xs font-extrabold text-muted-foreground hover:text-error gap-1.5"
          >
            <RotateCcw size={13} /> Clear
          </Button>
        )}
        <p className="text-xs text-muted-foreground font-medium">
          Showing <span className="font-black text-card-foreground">{totalFiltered}</span> orders
        </p>
      </div>
    </div>
  );
}
