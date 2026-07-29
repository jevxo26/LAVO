"use client";

import { useCallback, useEffect, useState } from "react";
import { authFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Pencil, Trash2, Plus, Users, Sparkles, AlertCircle, RotateCcw } from "lucide-react";
import { toast } from "sonner";

interface Employee {
  id: string; employeeId: string; fullName: string; email: string;
  phone: string; designation: string; department: string;
  joiningDate: string | null; status: string;
}
interface EmpForm { employeeId: string; designation: string; department: string; joiningDate: string; status: string; }
const EMPTY: EmpForm = { employeeId: "", designation: "", department: "", joiningDate: "", status: "ACTIVE" };

const AVATAR_COLORS = ["bg-indigo-500","bg-violet-500","bg-sky-500","bg-emerald-500","bg-amber-400","bg-rose-500"];
function avatarColor(name: string) { let h = 0; for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffff; return AVATAR_COLORS[h % AVATAR_COLORS.length]; }
function initials(name: string) { return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "??"; }

function Sk({ className }: { className?: string }) { return <div className={`animate-pulse rounded-md bg-slate-100 ${className ?? ""}`} />; }
function PageSkeleton() {
  return (
    <div className="space-y-7">
      <Sk className="h-36 w-full rounded-2xl" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">{[0,1,2].map((i) => <Sk key={i} className="h-24 rounded-2xl" />)}</div>
      <div className="space-y-3">{[0,1,2,3].map((i) => <Sk key={i} className="h-20 rounded-2xl" />)}</div>
    </div>
  );
}

export default function VendorEmployeesPage() {
  const [employees, setEmployees]   = useState<Employee[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(false);
  const [search, setSearch]         = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId]         = useState<string | null>(null);
  const [form, setForm]             = useState<EmpForm>(EMPTY);
  const [deleteId, setDeleteId]     = useState<string | null>(null);

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

  const openCreate = () => { setEditId(null); setForm(EMPTY); setDialogOpen(true); };
  const openEdit   = (emp: Employee) => {
    setEditId(emp.id);
    setForm({ employeeId: emp.employeeId, designation: emp.designation, department: emp.department,
      joiningDate: emp.joiningDate ? emp.joiningDate.slice(0, 10) : "", status: emp.status });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    const isEdit = !!editId;
    const res  = await authFetch(isEdit ? `/vendor-dashboard/employees/${editId}` : "/vendor-dashboard/employees",
      { method: isEdit ? "PATCH" : "POST", body: JSON.stringify(isEdit ? { designation: form.designation, department: form.department, status: form.status } : form) });
    const json = await res.json();
    if (json.success) { toast.success(isEdit ? "Employee updated" : "Employee added"); setDialogOpen(false); fetchEmployees(); }
    else toast.error(json.message ?? "Failed to save");
  };

  const handleDelete = async (id: string) => {
    const res  = await authFetch(`/vendor-dashboard/employees/${id}`, { method: "DELETE" });
    const json = await res.json();
    if (json.success) { toast.success("Employee removed"); setDeleteId(null); fetchEmployees(); }
    else toast.error(json.message ?? "Failed to delete");
  };

  if (loading) return <PageSkeleton />;

  const active = employees.filter((e) => e.status === "ACTIVE").length;

  return (
    <div className="space-y-7">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-violet-700 to-purple-700 px-7 py-8">
        <div className="pointer-events-none absolute inset-0 opacity-10">
          <div className="absolute -top-12 -right-12 h-56 w-56 rounded-full bg-white" />
          <div className="absolute -bottom-10 -left-8 h-40 w-40 rounded-full bg-white" />
        </div>
        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Sparkles size={13} className="text-violet-200" />
              <span className="text-violet-200 text-[11px] font-semibold uppercase tracking-widest">Vendor Dashboard</span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white">Employees</h1>
            <p className="mt-1 text-sm text-violet-100">Manage your vendor team members and their roles.</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {employees.length > 0 && (
              <>
                <div className="rounded-xl bg-white/10 border border-white/20 backdrop-blur-sm px-4 py-3 text-center">
                  <p className="text-violet-200 text-[10px] font-semibold uppercase tracking-wider">Total</p>
                  <p className="text-white font-extrabold text-xl leading-tight">{employees.length}</p>
                </div>
                <div className="rounded-xl bg-white/10 border border-white/20 backdrop-blur-sm px-4 py-3 text-center">
                  <p className="text-violet-200 text-[10px] font-semibold uppercase tracking-wider">Active</p>
                  <p className="text-white font-extrabold text-xl leading-tight">{active}</p>
                </div>
              </>
            )}
            <Button onClick={openCreate} className="h-10 rounded-xl bg-white text-violet-700 hover:bg-violet-50 font-bold text-sm px-4 gap-1.5 shadow-sm">
              <Plus size={14} /> Add Employee
            </Button>
          </div>
        </div>
      </div>

      {/* ── Stat cards ────────────────────────────────────────────────────── */}
      {!error && employees.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {[
            { label: "Total Members", sub: "All team members",   value: employees.length,                    iconBg: "bg-violet-50",  iconColor: "text-violet-600",  ringColor: "ring-violet-100"  },
            { label: "Active",        sub: "Currently working",  value: active,                              iconBg: "bg-emerald-50", iconColor: "text-emerald-600", ringColor: "ring-emerald-100" },
            { label: "Inactive",      sub: "On leave or paused", value: employees.length - active,           iconBg: "bg-slate-50",   iconColor: "text-slate-500",   ringColor: "ring-slate-100"   },
          ].map(({ label, sub, value, iconBg, iconColor, ringColor }) => (
            <div key={label} className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ring-4 ${iconBg} ${iconColor} ${ringColor}`}>
                <Users size={22} />
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

      {/* ── Search ────────────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-100 bg-white px-5 py-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email…"
              className="w-full h-9 pl-9 pr-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:bg-white transition" />
          </div>
          {search && (
            <Button size="sm" variant="ghost" onClick={() => setSearch("")}
              className="h-9 rounded-xl text-xs font-bold text-slate-500 hover:text-rose-600 hover:bg-rose-50 px-3 gap-1.5">
              <RotateCcw size={12} /> Clear
            </Button>
          )}
        </div>
      </div>

      {/* ── Content ───────────────────────────────────────────────────────── */}
      {error ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-20 text-center shadow-sm">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50">
            <AlertCircle size={26} className="text-rose-400" />
          </div>
          <p className="text-sm font-semibold text-slate-700">Could not load employees</p>
          <Button size="sm" variant="outline" onClick={fetchEmployees} className="mt-4 rounded-xl text-xs font-bold">Retry</Button>
        </div>
      ) : employees.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-24 text-center shadow-sm">
          <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-violet-50">
            <Users size={38} className="text-violet-300" />
          </div>
          <p className="text-base font-bold text-slate-800">No team members yet</p>
          <p className="mt-2 max-w-xs text-sm text-slate-400">Add your first employee to start managing your vendor team.</p>
          <Button onClick={openCreate} className="mt-6 rounded-xl bg-violet-600 hover:bg-violet-700 text-xs font-bold text-white gap-2">
            <Plus size={14} /> Add Employee
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {employees.map((emp) => {
            const name     = emp.fullName || "—";
            const isActive = emp.status === "ACTIVE";
            return (
              <div key={emp.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between rounded-2xl border border-slate-100 bg-white p-5 hover:border-violet-100 hover:shadow-sm transition-all gap-4 shadow-sm">
                <div className="flex items-center gap-4 min-w-0">
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white text-sm font-extrabold shadow-sm ${avatarColor(name)}`}>
                    {initials(name)}
                  </div>
                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[13px] font-bold text-slate-900">{name}</span>
                      <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold
                        ${isActive ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-50 text-slate-500 border-slate-200"}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-emerald-500" : "bg-slate-400"}`} />
                        {emp.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-0.5 text-[11px] text-slate-400">
                      {emp.email && <span>{emp.email}</span>}
                      {emp.phone && <span>{emp.phone}</span>}
                      {emp.designation && <span className="font-semibold text-slate-600">{emp.designation}</span>}
                      {emp.department && <span>· {emp.department}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                  {emp.joiningDate && (
                    <p className="text-[11px] text-slate-400 hidden md:block">
                      Joined {new Date(emp.joiningDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                    </p>
                  )}
                  <div className="flex items-center gap-1.5">
                    <Button size="sm" variant="outline" onClick={() => openEdit(emp)}
                      className="h-8 rounded-xl border-violet-200 text-violet-600 hover:bg-violet-50 text-xs font-bold px-3 gap-1.5">
                      <Pencil size={11} /> Edit
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setDeleteId(emp.id)}
                      className="h-8 rounded-xl border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold px-3 gap-1.5">
                      <Trash2 size={11} />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Add/Edit dialog ───────────────────────────────────────────────── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader><DialogTitle>{editId ? "Edit Employee" : "Add Employee"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            {!editId && (
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">User ID</Label>
                <Input value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })} placeholder="Paste User ID" className="rounded-xl" />
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Designation</Label>
                <Input value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} className="rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Department</Label>
                <Input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className="rounded-xl" />
              </div>
            </div>
            {!editId && (
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Joining Date</Label>
                <Input type="date" value={form.joiningDate} onChange={(e) => setForm({ ...form, joiningDate: e.target.value })} className="rounded-xl" />
              </div>
            )}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v || "ACTIVE" })}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="ACTIVE">Active</SelectItem><SelectItem value="INACTIVE">Inactive</SelectItem></SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="rounded-xl">Cancel</Button>
            <Button onClick={handleSave} className="rounded-xl bg-violet-600 hover:bg-violet-700">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete dialog ─────────────────────────────────────────────────── */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="rounded-2xl">
          <DialogHeader><DialogTitle>Remove Employee</DialogTitle></DialogHeader>
          <p className="text-sm text-slate-500">Are you sure you want to remove this employee from your vendor team?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)} className="rounded-xl">Cancel</Button>
            <Button variant="destructive" onClick={() => deleteId && handleDelete(deleteId)} className="rounded-xl">Remove</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
