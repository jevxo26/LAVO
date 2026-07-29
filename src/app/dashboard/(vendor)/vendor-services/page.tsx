"use client";

import { useCallback, useEffect, useState } from "react";
import { authFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Shirt, Sparkles, Pencil, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface VendorService {
  id: string; serviceId: string; processingTime: string;
  price: number; minimumOrder: number; maximumOrder: number | null;
  status: string; processingCost: number; vendorRate: number; createdAt: string;
}
interface EditForm { processingTime: string; price: string; minimumOrder: string; maximumOrder: string; }

function Sk({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-slate-100 ${className ?? ""}`} />;
}
function PageSkeleton() {
  return (
    <div className="space-y-7">
      <Sk className="h-36 w-full rounded-2xl" />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {[0,1,2,3,4,5].map((i) => <Sk key={i} className="h-44 rounded-2xl" />)}
      </div>
    </div>
  );
}

// seeded gradient for service card thumbnail
const GRADIENTS = [
  "from-indigo-400 to-violet-600","from-sky-400 to-cyan-600",
  "from-emerald-400 to-teal-600","from-amber-400 to-orange-500",
  "from-rose-400 to-pink-600","from-violet-400 to-purple-600",
];
function gradientFor(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) & 0xffff;
  return GRADIENTS[h % GRADIENTS.length];
}

export default function VendorServicesPage() {
  const [services, setServices] = useState<VendorService[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId]     = useState<string | null>(null);
  const [form, setForm]         = useState<EditForm>({ processingTime: "", price: "", minimumOrder: "", maximumOrder: "" });

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

  const openEdit = (svc: VendorService) => {
    setEditId(svc.id);
    setForm({ processingTime: svc.processingTime, price: String(svc.price),
      minimumOrder: String(svc.minimumOrder), maximumOrder: svc.maximumOrder != null ? String(svc.maximumOrder) : "" });
    setEditOpen(true);
  };

  const handleSave = async () => {
    if (!editId) return;
    const res  = await authFetch(`/vendor-dashboard/services/${editId}`, {
      method: "PATCH",
      body: JSON.stringify({ processingTime: form.processingTime, price: parseFloat(form.price),
        minimumOrder: parseInt(form.minimumOrder), maximumOrder: form.maximumOrder ? parseInt(form.maximumOrder) : null }),
    });
    const json = await res.json();
    if (json.success) { toast.success("Service updated"); setEditOpen(false); fetchServices(); }
    else toast.error(json.message ?? "Failed to update");
  };

  const handleToggle = async (svc: VendorService) => {
    const res  = await authFetch(`/vendor-dashboard/services/${svc.id}/toggle`, { method: "PATCH" });
    const json = await res.json();
    if (json.success) { toast.success(`Service ${svc.status === "ACTIVE" ? "disabled" : "enabled"}`); fetchServices(); }
    else toast.error(json.message ?? "Failed to toggle");
  };

  if (loading) return <PageSkeleton />;

  const active   = services.filter((s) => s.status === "ACTIVE").length;
  const inactive = services.filter((s) => s.status !== "ACTIVE").length;

  return (
    <div className="space-y-7">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-sky-600 via-sky-700 to-cyan-700 px-7 py-8">
        <div className="pointer-events-none absolute inset-0 opacity-10">
          <div className="absolute -top-12 -right-12 h-56 w-56 rounded-full bg-white" />
          <div className="absolute -bottom-10 -left-8 h-40 w-40 rounded-full bg-white" />
        </div>
        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Sparkles size={13} className="text-sky-200" />
              <span className="text-sky-200 text-[11px] font-semibold uppercase tracking-widest">Vendor Dashboard</span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white">Services</h1>
            <p className="mt-1 text-sm text-sky-100">Manage your processing services, pricing, and availability.</p>
          </div>
          {!error && services.length > 0 && (
            <div className="flex items-center gap-3 shrink-0">
              <div className="rounded-xl bg-white/10 border border-white/20 backdrop-blur-sm px-4 py-3 text-center">
                <p className="text-sky-200 text-[10px] font-semibold uppercase tracking-wider">Active</p>
                <p className="text-white font-extrabold text-xl leading-tight">{active}</p>
              </div>
              <div className="rounded-xl bg-white/10 border border-white/20 backdrop-blur-sm px-4 py-3 text-center">
                <p className="text-sky-200 text-[10px] font-semibold uppercase tracking-wider">Total</p>
                <p className="text-white font-extrabold text-xl leading-tight">{services.length}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Stat row ──────────────────────────────────────────────────────── */}
      {!error && services.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {[
            { label: "Total Services", sub: "In your catalog",    value: services.length, iconBg: "bg-sky-50",     iconColor: "text-sky-600",     ringColor: "ring-sky-100",     Icon: Shirt  },
            { label: "Active",         sub: "Currently enabled",  value: active,           iconBg: "bg-emerald-50", iconColor: "text-emerald-600", ringColor: "ring-emerald-100", Icon: Shirt  },
            { label: "Inactive",       sub: "Temporarily paused", value: inactive,         iconBg: "bg-slate-50",   iconColor: "text-slate-500",   ringColor: "ring-slate-100",   Icon: Shirt  },
          ].map(({ label, sub, value, Icon, iconBg, iconColor, ringColor }) => (
            <div key={label} className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ring-4 ${iconBg} ${iconColor} ${ringColor}`}>
                <Icon size={22} />
              </div>
              <div className="min-w-0">
                <p className="text-2xl font-extrabold text-slate-900 leading-none">{value}</p>
                <p className="mt-0.5 text-[12px] font-semibold text-slate-700 leading-tight">{label}</p>
                <p className="text-[11px] text-slate-400 leading-tight">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Content ───────────────────────────────────────────────────────── */}
      {error ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-20 text-center shadow-sm">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50">
            <AlertCircle size={26} className="text-rose-400" />
          </div>
          <p className="text-sm font-semibold text-slate-700">Could not load services</p>
          <Button size="sm" variant="outline" onClick={fetchServices} className="mt-4 rounded-xl text-xs font-bold">Retry</Button>
        </div>
      ) : services.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-24 text-center shadow-sm">
          <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-sky-50">
            <Shirt size={38} className="text-sky-400" />
          </div>
          <p className="text-base font-bold text-slate-800">No services configured</p>
          <p className="mt-2 max-w-xs text-sm text-slate-400">Your service catalog is empty. Contact your administrator to add services.</p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((svc) => {
            const grad    = gradientFor(svc.serviceId);
            const isActive = svc.status === "ACTIVE";
            return (
              <div key={svc.id} className={`group rounded-2xl border bg-white shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md flex flex-col
                ${isActive ? "border-slate-100 hover:border-sky-100" : "border-slate-100 opacity-70 hover:opacity-100"}`}>

                {/* Gradient thumbnail */}
                <div className={`relative h-24 bg-gradient-to-br ${grad} flex items-center justify-center`}>
                  <Shirt size={32} className="text-white/70" />
                  {/* Status overlay badge */}
                  <div className={`absolute top-3 right-3 rounded-full px-2.5 py-0.5 text-[10px] font-bold border
                    ${isActive ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-50 text-slate-500 border-slate-200"}`}>
                    {svc.status}
                  </div>
                </div>

                {/* Body */}
                <div className="flex flex-1 flex-col p-5 gap-3">
                  {/* Service ID */}
                  <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {svc.serviceId.slice(0, 12)}…
                  </p>

                  {/* Pricing row */}
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Price</p>
                      <p className="text-xl font-extrabold text-slate-900 leading-tight">৳{svc.price}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Vendor Rate</p>
                      <p className="text-base font-bold text-emerald-600">৳{svc.vendorRate}</p>
                    </div>
                  </div>

                  {/* Meta chips */}
                  <div className="flex flex-wrap gap-2 border-t border-slate-50 pt-3">
                    {[
                      { label: "Processing", value: svc.processingTime || "—" },
                      { label: "Min",        value: `${svc.minimumOrder} items` },
                      { label: "Max",        value: svc.maximumOrder ? `${svc.maximumOrder} items` : "Unlimited" },
                      { label: "Cost",       value: `৳${svc.processingCost}` },
                    ].map(({ label, value }) => (
                      <div key={label} className="rounded-lg bg-slate-50 border border-slate-100 px-2.5 py-1.5">
                        <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 leading-none">{label}</p>
                        <p className="text-[11px] font-semibold text-slate-700 mt-0.5">{value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="mt-auto flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2">
                      <Switch checked={isActive} onCheckedChange={() => handleToggle(svc)} />
                      <span className="text-[11px] font-semibold text-slate-500">{isActive ? "Enabled" : "Disabled"}</span>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => openEdit(svc)}
                      className="h-8 rounded-xl border-slate-200 text-xs font-bold text-slate-600 hover:border-sky-200 hover:text-sky-700 hover:bg-sky-50 gap-1.5">
                      <Pencil size={11} /> Edit
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Edit dialog ───────────────────────────────────────────────────── */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader><DialogTitle>Edit Service</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Processing Time</Label>
              <Input value={form.processingTime} onChange={(e) => setForm({ ...form, processingTime: e.target.value })} placeholder="e.g. 24 hours" className="rounded-xl" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Price (৳)</Label>
                <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Label>Min Order</Label>
                <Input type="number" value={form.minimumOrder} onChange={(e) => setForm({ ...form, minimumOrder: e.target.value })} className="rounded-xl" />
              </div>
              <div className="space-y-1.5 col-span-2">
                <Label>Max Order <span className="text-slate-400 font-normal">(blank = unlimited)</span></Label>
                <Input type="number" value={form.maximumOrder} onChange={(e) => setForm({ ...form, maximumOrder: e.target.value })} className="rounded-xl" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)} className="rounded-xl">Cancel</Button>
            <Button onClick={handleSave} className="rounded-xl">Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
