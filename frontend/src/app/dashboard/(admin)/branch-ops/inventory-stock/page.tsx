"use client";

import React, { useEffect, useState, useCallback } from "react";
import { authFetch } from "@/lib/api";
import { Boxes, RefreshCw, CheckCircle2, AlertCircle, AlertTriangle, Search, RotateCcw, TrendingDown } from "lucide-react";
import { Button }            from "@/components/ui/button";
import { DashboardPageHero } from "@/components/shared/DashboardPageHero";
import { OpsTable }          from "@/components/shared/OpsTable";
import { motion }            from "framer-motion";

interface StockItem {
  id: string; itemName: string; category: string; branchName: string;
  stockQuantity: number; minThreshold: number; unit: string; status: string;
}

function stockMeta(s: string) {
  switch (s?.toUpperCase()) {
    case "IN_STOCK":     return { cls: "bg-success/10 text-success border-success/25",   dot: "bg-success",               label: "In Stock"     };
    case "LOW_STOCK":    return { cls: "bg-warning/10 text-warning border-warning/25",   dot: "bg-warning animate-pulse", label: "Low Stock"    };
    case "OUT_OF_STOCK": return { cls: "bg-error/10 text-error border-error/25",         dot: "bg-error animate-pulse",   label: "Out of Stock" };
    default:             return { cls: "bg-muted text-muted-foreground border-border",   dot: "bg-muted-foreground/50",   label: s || "Unknown" };
  }
}
function stockBarColor(qty: number, min: number) {
  if (qty === 0) return "var(--error)";
  if (qty <= min) return "var(--warning)";
  return "var(--success)";
}

function Sk({ className }: { className?: string }) { return <div className={`animate-pulse rounded-lg bg-muted ${className ?? ""}`} />; }
function TableSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="border-b border-border px-5 py-4 flex gap-3">
        <Sk className="h-9 flex-1 rounded-xl max-w-sm" /><Sk className="h-9 w-36 rounded-xl" />
      </div>
      <div className="divide-y divide-border">
        {[0,1,2,3,4].map((i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-4">
            <Sk className="h-4 flex-1" /><Sk className="h-5 w-20 rounded-full" /><Sk className="h-3 w-24" /><Sk className="h-3 w-20" /><Sk className="h-3 w-16" /><Sk className="h-5 w-20 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

const STATUS_TABS = [
  { label: "All",          value: "ALL",          dotCls: "bg-muted-foreground/60"   },
  { label: "In Stock",     value: "IN_STOCK",     dotCls: "bg-success"               },
  { label: "Low Stock",    value: "LOW_STOCK",    dotCls: "bg-warning animate-pulse" },
  { label: "Out of Stock", value: "OUT_OF_STOCK", dotCls: "bg-error animate-pulse"   },
];

export default function InventoryStockPage() {
  const [items,      setItems]      = useState<StockItem[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search,     setSearch]     = useState("");
  const [activeTab,  setActiveTab]  = useState("ALL");

  const fetchInventory = useCallback(() => {
    setRefreshing(true);
    authFetch("/branch-ops/inventory-stock")
      .then((r) => r.json())
      .then((res) => { if (res?.success && Array.isArray(res.data)) setItems(res.data); })
      .catch(() => {})
      .finally(() => { setLoading(false); setRefreshing(false); });
  }, []);

  useEffect(() => { fetchInventory(); }, [fetchInventory]);

  const inStock    = items.filter((i) => i.status?.toUpperCase() === "IN_STOCK").length;
  const lowStock   = items.filter((i) => i.status?.toUpperCase() === "LOW_STOCK").length;
  const outOfStock = items.filter((i) => i.status?.toUpperCase() === "OUT_OF_STOCK").length;

  const countFor = (val: string) =>
    val === "ALL" ? items.length : items.filter((i) => i.status?.toUpperCase() === val).length;

  const displayed = items.filter((item) => {
    const q = search.toLowerCase();
    return (
      (!q || item.itemName?.toLowerCase().includes(q) || item.branchName?.toLowerCase().includes(q) || item.category?.toLowerCase().includes(q)) &&
      (activeTab === "ALL" || item.status?.toUpperCase() === activeTab)
    );
  });

  const hasFilters = !!(search.trim() || activeTab !== "ALL");
  const clearFilters = () => { setSearch(""); setActiveTab("ALL"); };

  return (
    <div className="space-y-5">
      <DashboardPageHero
        badge="Branch Operations" title="Inventory & Consumables Stock"
        description="Track detergents, softeners, packaging materials, and hangers across all branches. Monitor low stock alerts in real-time."
        icon={Boxes}
        liveLabel={outOfStock > 0 ? `${outOfStock} Out of Stock` : lowStock > 0 ? `${lowStock} Low Stock` : "Stock Healthy"}
        chips={[
          { label: "Total Items",  value: loading ? "—" : String(items.length),  sub: "All consumables"                            },
          { label: "Low Stock",    value: loading ? "—" : String(lowStock),       sub: lowStock   > 0 ? "Reorder needed"  : "None"  },
          { label: "Out of Stock", value: loading ? "—" : String(outOfStock),     sub: outOfStock > 0 ? "Urgent restock"  : "None"  },
        ]}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-1 rounded-2xl border border-border bg-muted p-1.5 overflow-x-auto scrollbar-none">
          {STATUS_TABS.map((tab) => {
            const isActive = activeTab === tab.value;
            return (
              <button key={tab.value} onClick={() => setActiveTab(tab.value)}
                className={["flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[11px] font-black whitespace-nowrap select-none transition-all duration-150",
                  isActive ? "bg-card text-card-foreground shadow-sm" : "text-muted-foreground hover:text-card-foreground hover:bg-card/60"].join(" ")}>
                <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${tab.dotCls}`} />
                {tab.label}
                <span className={["rounded-full px-1.5 py-px text-[10px] font-black leading-none tabular-nums",
                  isActive ? "bg-primary/12 text-primary" : "bg-muted-foreground/10 text-muted-foreground"].join(" ")}>
                  {countFor(tab.value)}
                </span>
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60" size={13} />
            <input type="text" placeholder="Search item, category, branch…" value={search} onChange={(e) => setSearch(e.target.value)}
              className="h-8 w-60 pl-9 pr-3 rounded-xl border border-border bg-muted text-xs font-medium text-card-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring/50 focus:bg-card transition" />
          </div>
          {hasFilters && <Button size="sm" variant="ghost" onClick={clearFilters} className="h-8 rounded-xl text-xs font-bold text-muted-foreground hover:text-error hover:bg-error/10 gap-1 px-2.5"><RotateCcw size={12} /> Clear</Button>}
          <Button size="sm" variant="outline" onClick={fetchInventory} className="h-8 rounded-xl text-xs font-bold gap-1.5">
            <RefreshCw size={12} className={refreshing ? "animate-spin" : ""} /> Refresh
          </Button>
        </div>
      </div>

      {loading ? <TableSkeleton /> : (
        <OpsTable
          animateKey={activeTab + search}
          keyExtractor={(i) => i.id}
          displayed={displayed}
          totalCount={items.length}
          noun="items"
          hasFilters={hasFilters}
          onClearFilters={clearFilters}
          emptyTitle="No items found"
          emptyFiltered="Try adjusting your filters."
          emptyDefault="No inventory data available."
          footerStats={[
            { dot: "bg-success", label: "In Stock",     value: inStock    },
            { dot: "bg-warning", label: "Low",          value: lowStock   },
            { dot: "bg-error",   label: "Out",          value: outOfStock },
          ]}
          columns={[
            {
              header: "Item Name", width: "minmax(160px,2fr)",
              render: (item) => {
                const isCritical = item.status?.toUpperCase() !== "IN_STOCK";
                return (
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white shadow-md shadow-black/10 transition-transform duration-200 group-hover:scale-110 group-hover:rotate-3"
                      style={{ background: `linear-gradient(135deg, ${isCritical ? "var(--warning)" : "var(--primary)"}, ${isCritical ? "var(--error)" : "var(--ring)"})` }}>
                      <Boxes size={15} strokeWidth={2.3} />
                    </div>
                    <p className="text-[13px] font-black text-card-foreground truncate group-hover:text-primary transition-colors">{item.itemName}</p>
                  </div>
                );
              },
            },
            {
              header: "Category", width: "1fr",
              render: (item) => <span className="inline-flex items-center rounded-full border border-border bg-muted px-2.5 py-[3px] text-[10px] font-black text-muted-foreground w-fit">{item.category}</span>,
            },
            {
              header: "Branch", width: "1fr",
              render: (item) => <p className="text-[13px] font-bold text-card-foreground truncate">{item.branchName}</p>,
            },
            {
              header: "Stock Level", width: "160px",
              render: (item, idx) => {
                const barColor = stockBarColor(item.stockQuantity, item.minThreshold);
                const barPct = item.minThreshold > 0 ? Math.min(Math.round((item.stockQuantity / (item.minThreshold * 3)) * 100), 100) : 100;
                return (
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[13px] font-black text-card-foreground tabular-nums">{item.stockQuantity}</span>
                      <span className="text-[11px] text-muted-foreground font-medium">{item.unit}</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${barPct}%` }} transition={{ duration: 0.6, ease: "easeOut", delay: idx * 0.04 }}
                        className="h-full rounded-full" style={{ background: barColor }} />
                    </div>
                  </div>
                );
              },
            },
            {
              header: "Threshold", width: "120px",
              render: (item) => (
                <div className="flex items-center gap-1.5">
                  <TrendingDown size={12} className="text-muted-foreground shrink-0" />
                  <span className="text-[13px] font-bold text-muted-foreground tabular-nums">{item.minThreshold} {item.unit}</span>
                </div>
              ),
            },
            {
              header: "Status", width: "130px",
              render: (item) => {
                const sm = stockMeta(item.status);
                return <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-[3px] text-[10px] font-black w-fit ${sm.cls}`}><span className={`h-1.5 w-1.5 rounded-full shrink-0 ${sm.dot}`} />{sm.label}</span>;
              },
            },
          ]}
        />
      )}
    </div>
  );
}
