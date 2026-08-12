"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { authFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Shirt, Pencil, AlertCircle, Search, RotateCcw, Tag, PauseCircle } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { DashboardPageHero } from "@/components/shared/DashboardPageHero";
import { OverviewStatCard }  from "@/components/dashboard/shared/overview/OverviewStatCard";

// ─── Types ────────────────────────────────────────────────────────────────────

interface VendorService {
  id: string; serviceId: string;
  serviceName: string; category: string; garmentType: string;
  processingTime: string; price: number;
  minimumOrder: number; maximumOrder: number | null;
  status: string; processingCost: number; vendorRate: number;
  createdAt: string;
}
interface EditForm {
  processingTime: string; price: string; minimumOrder: string; maximumOrder: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const GRADIENTS = [
  "from-indigo-400 to-violet-600", "from-sky-400 to-cyan-600",
  "from-emerald-400 to-teal-600",  "from-amber-400 to-orange-500",
  "from-rose-400 to-pink-600",     "from-violet-400 to-purple-600",
];
function gradientFor(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) & 0xffff;
  return GRADIENTS[h % GRADIENTS.length];
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function PageSkeleton() {
  return (
    <div className="space-y-7 animate-pulse">
      <div className="h-44 rounded-3xl bg-muted" />
      <div className="grid grid-cols-3 gap-4">
        {[0,1,2].map((i) => <div key={i} className="h-28 rounded-3xl bg-muted" />)}
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {[0,1,2,3,4,5].map((i) => <div key={i} className="h-64 rounded-3xl bg-muted" />)}
      </div>
    </div>
  );
}

// ─── Service Card ─────────────────────────────────────────────────────────────

interface ServiceCardProps {
  svc: VendorService;
  onToggle: (svc: VendorService) => void;
  onEdit: (svc: VendorService) => void;
}

function ServiceCard({ svc, onToggle, onEdit }: ServiceCardProps) {
  const grad     = gradientFor(svc.serviceId);
  const isActive = svc.status === "ACTIVE";

  return (
    <motion.div
      whileHover={{ y: -3 }}
      className={`group relative rounded-3xl border bg-card shadow-sm overflow-hidden transition-all duration-200 hover:shadow-lg flex flex-col ${
        isActive ? "border-border hover:border-ring/40" : "border-border"
      }`}
    >
      {/* Gradient thumbnail */}
      <div className={`relative h-28 bg-gradient-to-br ${grad} flex items-center justify-center`}>
        <Shirt size={34} className="text-white/70 group-hover:scale-110 transition-transform duration-300" />

        {/* Status badge */}
        <div className={`absolute top-3 right-3 rounded-full px-2.5 py-0.5 text-[10px] font-black border backdrop-blur-sm ${
          isActive
            ? "bg-success/20 text-success border-success/30"
            : "bg-black/30 text-white/80 border-white/20"
        }`}>
          {svc.status}
        </div>

        {/* Category badge bottom-left */}
        <div className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full bg-black/25 backdrop-blur-sm px-2.5 py-0.5 border border-white/20">
          <Tag size={10} className="text-white/70" />
          <span className="text-white text-[10px] font-black">{svc.category}</span>
        </div>

        {/* Inactive overlay */}
        {!isActive && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center backdrop-blur-[1px]">
            <div className="flex items-center gap-1.5 rounded-full bg-black/40 px-3 py-1 border border-white/20">
              <PauseCircle size={13} className="text-white/80" />
              <span className="text-white text-[11px] font-black">Paused</span>
            </div>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-5 gap-3">
        {/* Service name + garment type */}
        <div className="space-y-1">
          <h3 className="text-sm font-black text-card-foreground leading-snug group-hover:text-primary transition-colors">
            {svc.serviceName}
          </h3>
          <p className="text-[11px] font-medium text-muted-foreground">{svc.garmentType}</p>
        </div>

        {/* Pricing row */}
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Customer Price</p>
            <p className="text-xl font-black text-card-foreground leading-tight">৳{svc.price}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Your Rate</p>
            <p className="text-base font-black text-success">৳{svc.vendorRate}</p>
          </div>
        </div>

        {/* Meta chips */}
        <div className="flex flex-wrap gap-1.5 border-t border-border pt-3">
          {[
            { label: "Time",  value: svc.processingTime || "—"                                   },
            { label: "Min",   value: `${svc.minimumOrder} pcs`                                   },
            { label: "Max",   value: svc.maximumOrder ? `${svc.maximumOrder} pcs` : "Unlimited"  },
            { label: "Cost",  value: `৳${svc.processingCost}`                                    },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-xl bg-muted/60 border border-border px-2.5 py-1">
              <p className="text-[9px] font-black uppercase tracking-wider text-muted-foreground leading-none">{label}</p>
              <p className="text-[11px] font-bold text-card-foreground mt-0.5">{value}</p>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="mt-auto flex items-center justify-between pt-2 border-t border-border">
          <div className="flex items-center gap-2">
            <Switch checked={isActive} onCheckedChange={() => onToggle(svc)} />
            <span className="text-[11px] font-bold text-muted-foreground">
              {isActive ? "Active" : "Paused"}
            </span>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEdit(svc)}
            className="h-8 rounded-xl text-xs font-bold gap-1.5 border-primary/25 hover:bg-primary/10"
            style={{ color: "var(--primary)" }}
          >
            <Pencil size={11} /> Edit
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function VendorServicesPage() {
  const [services, setServices] = useState<VendorService[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(false);
  const [search, setSearch]     = useState("");
  const [filterStatus, setFilterStatus] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");

  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId]     = useState<string | null>(null);
  const [form, setForm]         = useState<EditForm>({
    processingTime: "", price: "", minimumOrder: "", maximumOrder: "",
  });

  // ── Data ──────────────────────────────────────────────────────────────────

  const fetchServices = useCallback(async () => {
    setLoading(true); setError(false);
    try {
      const res  = await authFetch("/vendor-dashboard/services");
      const json = await res.json();
      if (json.success) setServices(json.data ?? []);
      else setError(true);
    } catch { setError(true); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchServices(); }, [fetchServices]);

  // ── Actions ───────────────────────────────────────────────────────────────

  const openEdit = (svc: VendorService) => {
    setEditId(svc.id);
    setForm({
      processingTime: svc.processingTime,
      price: String(svc.price),
      minimumOrder: String(svc.minimumOrder),
      maximumOrder: svc.maximumOrder != null ? String(svc.maximumOrder) : "",
    });
    setEditOpen(true);
  };

  const handleSave = async () => {
    if (!editId) return;
    const res  = await authFetch(`/vendor-dashboard/services/${editId}`, {
      method: "PATCH",
      body: JSON.stringify({
        processingTime: form.processingTime,
        price: parseFloat(form.price),
        minimumOrder: parseInt(form.minimumOrder),
        maximumOrder: form.maximumOrder ? parseInt(form.maximumOrder) : null,
      }),
    });
    const json = await res.json();
    if (json.success) { toast.success("Service updated"); setEditOpen(false); fetchServices(); }
    else toast.error(json.message ?? "Failed to update");
  };

  const handleToggle = async (svc: VendorService) => {
    const res  = await authFetch(`/vendor-dashboard/services/${svc.id}/toggle`, { method: "PATCH" });
    const json = await res.json();
    if (json.success) {
      toast.success(`Service ${svc.status === "ACTIVE" ? "paused" : "activated"}`);
      fetchServices();
    } else {
      toast.error(json.message ?? "Failed to toggle");
    }
  };

  // ── Derived ───────────────────────────────────────────────────────────────

  const active   = services.filter((s) => s.status === "ACTIVE").length;
  const inactive = services.filter((s) => s.status !== "ACTIVE").length;

  const filtered = useMemo(() => services.filter((s) => {
    const matchSearch = !search.trim()
      || s.serviceName.toLowerCase().includes(search.toLowerCase())
      || s.category.toLowerCase().includes(search.toLowerCase())
      || s.garmentType.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      filterStatus === "ALL" ||
      (filterStatus === "ACTIVE" && s.status === "ACTIVE") ||
      (filterStatus === "INACTIVE" && s.status !== "ACTIVE");
    return matchSearch && matchStatus;
  }), [services, search, filterStatus]);

  const hasFilters = !!search || filterStatus !== "ALL";

  if (loading) return <PageSkeleton />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-7"
    >
      {/* ── 1. Hero ──────────────────────────────────────────────────────────── */}
      <DashboardPageHero
        badge="Vendor Dashboard"
        title="My Services"
        description="Manage your processing services, pricing, and availability."
        icon={Shirt}
      />

      {/* ── 2. Stat Cards ────────────────────────────────────────────────────── */}
      {!error && services.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <OverviewStatCard label="Total Services" sub="In your catalog"    value={services.length} icon={Shirt} gradient="from-sky-500 to-cyan-600"     />
          <OverviewStatCard label="Active"         sub="Currently enabled"  value={active}          icon={Shirt} gradient="from-emerald-500 to-teal-600"  />
          <OverviewStatCard label="Paused"         sub="Temporarily paused" value={inactive}        icon={Shirt} gradient="from-slate-400 to-slate-600"   />
        </div>
      )}

      {/* ── 3. Toolbar ───────────────────────────────────────────────────────── */}
      {!error && services.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-3xl border border-border bg-card p-5 shadow-sm">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 text-muted-foreground" size={15} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by service name or category..."
              className="w-full h-10 rounded-2xl border border-border bg-muted/50 pl-10 pr-4 text-xs font-bold text-card-foreground placeholder:text-muted-foreground focus:border-ring focus:bg-card focus:outline-none transition-all"
            />
          </div>

          {/* Status filter tabs */}
          <div className="flex items-center gap-2 shrink-0">
            {(["ALL", "ACTIVE", "INACTIVE"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilterStatus(f)}
                className="rounded-2xl px-3.5 py-2 text-xs font-black transition-all"
                style={filterStatus === f ? {
                  background: f === "ACTIVE" ? "var(--success)" : f === "INACTIVE" ? "var(--muted-foreground)" : "var(--primary)",
                  color: "white",
                } : undefined}
              >
                {f === "ALL" ? `All (${services.length})` : f === "ACTIVE" ? `Active (${active})` : `Paused (${inactive})`}
              </button>
            ))}

            {hasFilters && (
              <Button
                variant="ghost"
                onClick={() => { setSearch(""); setFilterStatus("ALL"); }}
                className="h-9 px-3 rounded-xl text-xs font-extrabold text-muted-foreground hover:text-error gap-1.5"
              >
                <RotateCcw size={13} /> Reset
              </Button>
            )}
          </div>
        </div>
      )}

      {/* ── 4. Content ───────────────────────────────────────────────────────── */}
      {error ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card py-20 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-error/10 text-error">
            <AlertCircle size={26} />
          </div>
          <p className="text-sm font-black text-card-foreground">Could not load services</p>
          <Button size="sm" variant="outline" onClick={fetchServices} className="mt-4 rounded-xl text-xs font-bold border-border">
            Retry
          </Button>
        </div>
      ) : services.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card py-24 text-center">
          <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10" style={{ color: "var(--primary)" }}>
            <Shirt size={38} />
          </div>
          <p className="text-base font-black text-card-foreground">No services configured</p>
          <p className="mt-2 max-w-xs text-sm text-muted-foreground font-medium">
            Your service catalog is empty. Contact your administrator to add services.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card py-20 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
            <Search size={24} />
          </div>
          <p className="text-sm font-black text-card-foreground">No services match your filters</p>
          <Button
            variant="ghost"
            onClick={() => { setSearch(""); setFilterStatus("ALL"); }}
            className="mt-3 h-9 px-4 rounded-xl text-xs font-extrabold gap-1.5 text-muted-foreground"
          >
            <RotateCcw size={13} /> Reset Filters
          </Button>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((svc) => (
            <ServiceCard key={svc.id} svc={svc} onToggle={handleToggle} onEdit={openEdit} />
          ))}
        </div>
      )}

      {/* ── Edit Dialog ──────────────────────────────────────────────────────── */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="rounded-3xl border border-border bg-card">
          <DialogHeader>
            <DialogTitle className="font-black text-card-foreground">Edit Service</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-black text-card-foreground">Processing Time</Label>
              <Input
                value={form.processingTime}
                onChange={(e) => setForm({ ...form, processingTime: e.target.value })}
                placeholder="e.g. 24 hours"
                className="rounded-2xl h-11 text-xs"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-black text-card-foreground">Price (৳)</Label>
                <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="rounded-2xl h-11 text-xs" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-black text-card-foreground">Min Order</Label>
                <Input type="number" value={form.minimumOrder} onChange={(e) => setForm({ ...form, minimumOrder: e.target.value })} className="rounded-2xl h-11 text-xs" />
              </div>
              <div className="space-y-1.5 col-span-2">
                <Label className="text-xs font-black text-card-foreground">
                  Max Order <span className="text-muted-foreground font-normal">(blank = unlimited)</span>
                </Label>
                <Input type="number" value={form.maximumOrder} onChange={(e) => setForm({ ...form, maximumOrder: e.target.value })} className="rounded-2xl h-11 text-xs" />
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setEditOpen(false)} className="rounded-xl h-10">Cancel</Button>
            <Button
              onClick={handleSave}
              className="rounded-xl h-10 text-white font-bold"
              style={{ background: "linear-gradient(135deg, var(--primary), var(--ring))" }}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
