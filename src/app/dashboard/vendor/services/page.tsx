"use client";

import { useCallback, useEffect, useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { authFetch } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Pencil } from "lucide-react";
import { toast } from "sonner";

interface VendorService {
  id: string;
  serviceId: string;
  processingTime: string;
  price: number;
  minimumOrder: number;
  maximumOrder: number | null;
  status: string;
  processingCost: number;
  vendorRate: number;
  createdAt: string;
}

interface EditForm {
  processingTime: string;
  price: string;
  minimumOrder: string;
  maximumOrder: string;
}

export default function VendorServicesPage() {
  const [services, setServices] = useState<VendorService[]>([]);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<EditForm>({ processingTime: "", price: "", minimumOrder: "", maximumOrder: "" });

  const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authFetch("/vendor-dashboard/services");
      const json = await res.json();
      if (json.success) setServices(json.data ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchServices(); }, [fetchServices]);

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
    const res = await authFetch(`/vendor-dashboard/services/${editId}`, {
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
    const res = await authFetch(`/vendor-dashboard/services/${svc.id}/toggle`, { method: "PATCH" });
    const json = await res.json();
    if (json.success) { toast.success(`Service ${svc.status === "ACTIVE" ? "disabled" : "enabled"}`); fetchServices(); }
    else toast.error(json.message ?? "Failed to toggle");
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Services" description="Manage your processing services, pricing, and availability." />

      <Card>
        <CardContent className="p-0">
          {loading ? <LoadingSkeleton /> : services.length === 0 ? (
            <div className="py-16 text-center text-sm text-slate-400">No services configured.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service ID</TableHead>
                  <TableHead>Processing Time</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Min Order</TableHead>
                  <TableHead>Max Order</TableHead>
                  <TableHead>Processing Cost</TableHead>
                  <TableHead>Vendor Rate</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {services.map((svc) => (
                  <TableRow key={svc.id}>
                    <TableCell className="font-mono text-xs">{svc.serviceId.slice(0, 8)}…</TableCell>
                    <TableCell>{svc.processingTime || "—"}</TableCell>
                    <TableCell>৳{svc.price}</TableCell>
                    <TableCell>{svc.minimumOrder}</TableCell>
                    <TableCell>{svc.maximumOrder ?? "—"}</TableCell>
                    <TableCell>৳{svc.processingCost}</TableCell>
                    <TableCell>৳{svc.vendorRate}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={svc.status === "ACTIVE"
                        ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                        : "border-slate-300 bg-slate-50 text-slate-500"}>
                        {svc.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Switch
                          checked={svc.status === "ACTIVE"}
                          onCheckedChange={() => handleToggle(svc)}
                        />
                        <Button size="icon" variant="ghost" className="size-7" onClick={() => openEdit(svc)}>
                          <Pencil className="size-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Service</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1">
              <Label>Processing Time</Label>
              <Input value={form.processingTime} onChange={(e) => setForm({ ...form, processingTime: e.target.value })} placeholder="e.g. 24 hours" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Price (৳)</Label>
                <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>Min Order</Label>
                <Input type="number" value={form.minimumOrder} onChange={(e) => setForm({ ...form, minimumOrder: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>Max Order</Label>
                <Input type="number" value={form.maximumOrder} onChange={(e) => setForm({ ...form, maximumOrder: e.target.value })} placeholder="Leave blank for unlimited" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
