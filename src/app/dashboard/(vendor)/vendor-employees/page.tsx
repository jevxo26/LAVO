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
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Search, Pencil, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";

interface Employee {
  id: string;
  employeeId: string;
  fullName: string;
  email: string;
  phone: string;
  designation: string;
  department: string;
  joiningDate: string | null;
  status: string;
}

interface EmpForm {
  employeeId: string;
  designation: string;
  department: string;
  joiningDate: string;
  status: string;
}

const EMPTY_FORM: EmpForm = { employeeId: "", designation: "", department: "", joiningDate: "", status: "ACTIVE" };

export default function VendorEmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<EmpForm>(EMPTY_FORM);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authFetch(`/vendor-dashboard/employees?search=${encodeURIComponent(search)}`);
      const json = await res.json();
      if (json.success) setEmployees(json.data ?? []);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { fetchEmployees(); }, [fetchEmployees]);

  const openCreate = () => { setEditId(null); setForm(EMPTY_FORM); setDialogOpen(true); };

  const openEdit = (emp: Employee) => {
    setEditId(emp.id);
    setForm({
      employeeId: emp.employeeId,
      designation: emp.designation,
      department: emp.department,
      joiningDate: emp.joiningDate ? emp.joiningDate.slice(0, 10) : "",
      status: emp.status,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    const isEdit = !!editId;
    const url = isEdit ? `/vendor-dashboard/employees/${editId}` : "/vendor-dashboard/employees";
    const method = isEdit ? "PATCH" : "POST";
    const body = isEdit
      ? { designation: form.designation, department: form.department, status: form.status }
      : form;

    const res = await authFetch(url, { method, body: JSON.stringify(body) });
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
    const res = await authFetch(`/vendor-dashboard/employees/${id}`, { method: "DELETE" });
    const json = await res.json();
    if (json.success) { toast.success("Employee removed"); setDeleteId(null); fetchEmployees(); }
    else toast.error(json.message ?? "Failed to delete");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Employees"
        description="Manage your vendor team members."
        actionLabel="Add Employee"
        actionIcon={Plus}
        onAction={openCreate}
      />

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
        <Input
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? <LoadingSkeleton /> : employees.length === 0 ? (
            <div className="py-16 text-center text-sm text-slate-400">No employees found.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Designation</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map((emp) => (
                  <TableRow key={emp.id}>
                    <TableCell className="font-medium">{emp.fullName || "—"}</TableCell>
                    <TableCell className="text-sm text-slate-500">{emp.email || "—"}</TableCell>
                    <TableCell className="text-sm text-slate-500">{emp.phone || "—"}</TableCell>
                    <TableCell>{emp.designation || "—"}</TableCell>
                    <TableCell>{emp.department || "—"}</TableCell>
                    <TableCell>{emp.joiningDate ? new Date(emp.joiningDate).toLocaleDateString() : "—"}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={emp.status === "ACTIVE"
                        ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                        : "border-slate-300 bg-slate-50 text-slate-500"}>
                        {emp.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" className="size-7" onClick={() => openEdit(emp)}>
                          <Pencil className="size-3.5" />
                        </Button>
                        <Button size="icon" variant="ghost" className="size-7 text-red-500 hover:text-red-700"
                          onClick={() => setDeleteId(emp.id)}>
                          <Trash2 className="size-3.5" />
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

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editId ? "Edit Employee" : "Add Employee"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {!editId && (
              <div className="space-y-1">
                <Label>User ID (employeeId)</Label>
                <Input value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
                  placeholder="Paste the User ID" />
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Designation</Label>
                <Input value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>Department</Label>
                <Input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
              </div>
            </div>
            {!editId && (
              <div className="space-y-1">
                <Label>Joining Date</Label>
                <Input type="date" value={form.joiningDate} onChange={(e) => setForm({ ...form, joiningDate: e.target.value })} />
              </div>
            )}
            <div className="space-y-1">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v || "ACTIVE" })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Remove Employee</DialogTitle></DialogHeader>
          <p className="text-sm text-slate-500">Are you sure you want to remove this employee from your vendor team?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteId && handleDelete(deleteId)}>Remove</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
