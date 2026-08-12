"use client";

import { useCallback, useEffect, useState } from "react";
import { authFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Pencil, Trash2, Plus, Users, AlertCircle, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { DashboardPageHero } from "@/components/shared/DashboardPageHero";
import { OverviewStatCard }  from "@/components/dashboard/shared/overview/OverviewStatCard";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Employee {
  id: string; employeeId: string; fullName: string; email: string;
  phone: string; designation: string; department: string;
  joiningDate: string | null; status: string;
}
interface EmpForm {
  employeeId: string; designation: string; department: string;
  joiningDate: string; status: string;
}
const EMPTY: EmpForm = { employeeId: "", designation: "", department: "", joiningDate: "", status: "ACTIVE" };

// ─── Helpers ──────────────────────────────────────────────────────────────────

const AVATAR_GRADIENTS = [
  "from-indigo-500 to-violet-600", "from-violet-500 to-purple-600",
  "from-sky-500 to-cyan-600",      "from-emerald-500 to-teal-600",
  "from-amber-400 to-orange-500",  "from-rose-500 to-pink-600",
];
function avatarGradient(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffff;
  return AVATAR_GRADIENTS[h % AVATAR_GRADIENTS.length];
}
function initials(name: string) {
  return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "??";
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function PageSkeleton() {
  return (
    <div className="space-y-7 animate-pulse">
      <div className="h-44 rounded-3xl bg-muted" />
      <div className="grid grid-cols-3 gap-4">
        {[0,1,2].map((i) => <div key={i} className="h-28 rounded-3xl bg-muted" />)}
      </div>
      <div className="space-y-3">
        {[0,1,2,3].map((i) => <div key={i} className="h-20 rounded-3xl bg-muted" />)}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function VendorEmployeesPage() {
  const [employees, setEmployees]   = useState<Employee[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(false);
  const [search, setSearch]         = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId]         = useState<string | null>(null);
  const [form, setForm]             = useState<EmpForm>(EMPTY);
  const [deleteId, setDeleteId]     = useState<string | null>(null);

  // ── Data ──────────────────────────────────────────────────────────────────

  const fetchEmployees = useCallback(async () => {
    setLoading(true); setError(false);
    try {
      const res  = await authFetch(`/vendor-dashboard/employees?search=${encodeURIComponent(search)}`);
      const json = await res.json();
      if (json.success) setEmployees(json.data ?? []);
      else setError(true);
    } catch { setError(true); }
    finally { setLoading(false); }
  }, [search]);

  useEffect(() => { fetchEmployees(); }, [fetchEmployees]);

  // ── Actions ───────────────────────────────────────────────────────────────

  const openCreate = () => { setEditId(null); setForm(EMPTY); setDialogOpen(true); };
  const openEdit   = (emp: Employee) => {
    setEditId(emp.id);
    setForm({
      employeeId:  emp.employeeId,
      designation: emp.designation,
      department:  emp.department,
      joiningDate: emp.joiningDate ? emp.joiningDate.slice(0, 10) : "",
      status:      emp.status,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    const isEdit = !!editId;
    const res  = await authFetch(
      isEdit ? `/vendor-dashboard/employees/${editId}` : "/vendor-dashboard/employees",
      {
        method: isEdit ? "PATCH" : "POST",
        body: JSON.stringify(
          isEdit
            ? { designation: form.designation, department: form.department, status: form.status }
            : form
        ),
      }
    );
    const json = await res.json();
    if (json.success) {
      toast.success(isEdit ? "Employee updated" : "Employee added");
      setDialogOpen(false);
      fetchEmployees();
    } else {
      toast.error(json.message ?? "Failed to save");
    }
  };

  const handleDelete = async (id: string) => {
    const res  = await authFetch(`/vendor-dashboard/employees/${id}`, { method: "DELETE" });
    const json = await res.json();
    if (json.success) { toast.success("Employee removed"); setDeleteId(null); fetchEmployees(); }
    else toast.error(json.message ?? "Failed to delete");
  };

  if (loading) return <PageSkeleton />;

  const active   = employees.filter((e) => e.status === "ACTIVE").length;
  const inactive = employees.length - active;

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
        title="Team Members"
        description="Manage your vendor team members, designations, departments, and active status."
        icon={Users}
        chips={employees.length > 0 ? [
          { label: "Total",    value: employees.length },
          { label: "Active",   value: active           },
          { label: "Inactive", value: inactive         },
        ] : []}
      />

      {/* ── 2. Stat Cards ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <OverviewStatCard label="Total Members" sub="All team members"   value={employees.length} icon={Users} gradient="from-indigo-500 to-violet-600"  />
        <OverviewStatCard label="Active"        sub="Currently working"  value={active}           icon={Users} gradient="from-emerald-500 to-teal-600"    />
        <OverviewStatCard label="Inactive"      sub="On leave or paused" value={inactive}         icon={Users} gradient="from-slate-400 to-slate-600"     />
      </div>

      {/* ── 3. Search + Add ──────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 rounded-3xl border border-border bg-card px-5 py-4 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-3 text-muted-foreground" size={14} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            className="w-full h-10 pl-10 pr-4 rounded-2xl border border-border bg-muted/50 text-xs font-bold text-card-foreground placeholder:text-muted-foreground focus:border-ring focus:bg-card focus:outline-none transition-all"
          />
        </div>
        {search && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setSearch("")}
            className="h-9 rounded-xl text-xs font-bold text-muted-foreground hover:text-error gap-1.5"
          >
            <RotateCcw size={12} /> Clear
          </Button>
        )}
        <Button
          onClick={openCreate}
          className="h-10 px-5 rounded-2xl text-white font-black text-xs gap-1.5 shadow-sm shrink-0 transition-all hover:scale-[1.02] ml-auto"
          style={{ background: "linear-gradient(135deg, var(--primary), var(--ring))" }}
        >
          <Plus size={14} /> Add Employee
        </Button>
      </div>

      {/* ── 4. Content ───────────────────────────────────────────────────────── */}
      {error ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card py-20 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-error/10 text-error">
            <AlertCircle size={26} />
          </div>
          <p className="text-sm font-black text-card-foreground">Could not load employees</p>
          <Button size="sm" variant="outline" onClick={fetchEmployees} className="mt-4 rounded-xl text-xs font-bold border-border">
            Retry
          </Button>
        </div>
      ) : employees.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card py-24 text-center">
          <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10"
            style={{ color: "var(--primary)" }}>
            <Users size={38} />
          </div>
          <p className="text-base font-black text-card-foreground">No team members yet</p>
          <p className="mt-2 max-w-xs text-sm text-muted-foreground font-medium">
            Add your first employee to start managing your vendor team.
          </p>
          <Button
            onClick={openCreate}
            className="mt-6 rounded-2xl text-white text-xs font-black gap-2"
            style={{ background: "linear-gradient(135deg, var(--primary), var(--ring))" }}
          >
            <Plus size={14} /> Add Employee
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {employees.map((emp) => {
            const name     = emp.fullName || "—";
            const isActive = emp.status === "ACTIVE";
            const grad     = avatarGradient(name);
            return (
              <motion.div
                key={emp.id}
                whileHover={{ y: -2 }}
                className="flex flex-col sm:flex-row sm:items-center justify-between rounded-3xl border border-border bg-card p-5 hover:border-ring/40 hover:shadow-md transition-all gap-4 shadow-sm"
              >
                {/* Left */}
                <div className="flex items-center gap-4 min-w-0">
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${grad} text-white text-sm font-black shadow-sm`}>
                    {initials(name)}
                  </div>
                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-black text-card-foreground">{name}</span>
                      <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-black ${
                        isActive
                          ? "bg-success/10 text-success border-success/25"
                          : "bg-muted text-muted-foreground border-border"
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-success" : "bg-muted-foreground/50"}`} />
                        {emp.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-0.5 text-[11px] text-muted-foreground">
                      {emp.email      && <span>{emp.email}</span>}
                      {emp.phone      && <span>{emp.phone}</span>}
                      {emp.designation && <span className="font-bold text-card-foreground">{emp.designation}</span>}
                      {emp.department  && <span>· {emp.department}</span>}
                    </div>
                  </div>
                </div>

                {/* Right */}
                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                  {emp.joiningDate && (
                    <p className="text-[11px] text-muted-foreground hidden md:block">
                      Joined {new Date(emp.joiningDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                    </p>
                  )}
                  <div className="flex items-center gap-1.5">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEdit(emp)}
                      className="h-8 rounded-xl text-xs font-bold px-3 gap-1.5 border-primary/25 hover:bg-primary/10"
                      style={{ color: "var(--primary)" }}
                    >
                      <Pencil size={11} /> Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setDeleteId(emp.id)}
                      className="h-8 rounded-xl text-xs font-bold px-3 gap-1.5 border-error/25 hover:bg-error/10 text-error"
                    >
                      <Trash2 size={11} />
                    </Button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ── Add/Edit Dialog ──────────────────────────────────────────────────── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="rounded-3xl border border-border bg-card">
          <DialogHeader>
            <DialogTitle className="font-black text-card-foreground">
              {editId ? "Edit Employee" : "Add Employee"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {!editId && (
              <div className="space-y-1.5">
                <Label className="text-xs font-black text-card-foreground">User ID</Label>
                <Input
                  value={form.employeeId}
                  onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
                  placeholder="Paste User ID"
                  className="rounded-2xl h-11 text-xs"
                />
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-black text-card-foreground">Designation</Label>
                <Input value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} className="rounded-2xl h-11 text-xs" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-black text-card-foreground">Department</Label>
                <Input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className="rounded-2xl h-11 text-xs" />
              </div>
            </div>
            {!editId && (
              <div className="space-y-1.5">
                <Label className="text-xs font-black text-card-foreground">Joining Date</Label>
                <Input type="date" value={form.joiningDate} onChange={(e) => setForm({ ...form, joiningDate: e.target.value })} className="rounded-2xl h-11 text-xs" />
              </div>
            )}
            <div className="space-y-1.5">
              <Label className="text-xs font-black text-card-foreground">Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v || "ACTIVE" })}>
                <SelectTrigger className="rounded-2xl h-11 text-xs font-bold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="rounded-xl h-10">Cancel</Button>
            <Button
              onClick={handleSave}
              className="rounded-xl h-10 text-white font-bold"
              style={{ background: "linear-gradient(135deg, var(--primary), var(--ring))" }}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Dialog ────────────────────────────────────────────────────── */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="rounded-3xl border border-border bg-card">
          <DialogHeader>
            <DialogTitle className="font-black text-card-foreground">Remove Employee</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to remove this employee from your vendor team? This cannot be undone.
          </p>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteId(null)} className="rounded-xl h-10">Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => deleteId && handleDelete(deleteId)}
              className="rounded-xl h-10 font-bold"
            >
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
