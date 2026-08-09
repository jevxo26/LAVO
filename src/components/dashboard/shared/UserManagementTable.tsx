"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useAuth }    from "@/hooks/useAuth";
import { authFetch }  from "@/lib/api";
import { toast }      from "sonner";
import {
  Users, Plus, Trash2, Ban, CheckCircle, Lock,
  Search, Eye, User, AlertTriangle, RefreshCw,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { DashboardPageHero } from "@/components/shared/DashboardPageHero";
import { OpsTable }          from "@/components/shared/OpsTable";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UserRow {
  id:          string;
  fullName:    string;
  email:       string;
  phone?:      string;
  role?:       string;
  userType?:   string;
  status:      string;
  isVerified?: boolean;
  createdAt:   string;
}

interface UserManagementTableProps {
  title:        string;
  description:  string;
  roleFilter:   string;
  initialUsers?: UserRow[];
}

// ─── Fallback data ────────────────────────────────────────────────────────────

const FALLBACK: Record<string, UserRow[]> = {
  BRANCH_MANAGER: [
    { id: "MGR-01", fullName: "Kazi Nabil",    email: "nabil.mgr@laundrix.com",  phone: "+880 1700-998877", userType: "BRANCH_MANAGER", status: "ACTIVE", createdAt: "2026-01-01" },
    { id: "MGR-02", fullName: "Tanvir Ahmed",  email: "tanvir.mgr@laundrix.com", phone: "+880 1800-112233", userType: "BRANCH_MANAGER", status: "ACTIVE", createdAt: "2026-01-15" },
  ],
  DELIVERY_AGENT: [
    { id: "AG-01", fullName: "Kamal Hossain",  email: "kamal.agent@laundrix.com",  phone: "+880 1711-223344", userType: "DELIVERY_AGENT", status: "ACTIVE", createdAt: "2026-03-01" },
    { id: "AG-02", fullName: "Rafiqul Islam",  email: "rafiqul.agent@laundrix.com", phone: "+880 1819-887766", userType: "DELIVERY_AGENT", status: "ACTIVE", createdAt: "2026-03-10" },
  ],
  EMPLOYEE: [
    { id: "EMP-01", fullName: "Rahim Chowdhury", email: "rahim.emp@laundrix.com", phone: "+880 1722-334455", userType: "EMPLOYEE", status: "ACTIVE", createdAt: "2026-02-01" },
    { id: "EMP-02", fullName: "Nusrat Jahan",    email: "nusrat.emp@laundrix.com", phone: "+880 1823-445566", userType: "EMPLOYEE", status: "ACTIVE", createdAt: "2026-02-10" },
  ],
  VENDOR: [
    { id: "VND-01", fullName: "CleanExpress Partner", email: "contact@cleanexpress.com", phone: "+880 1733-445566", userType: "VENDOR", status: "ACTIVE", createdAt: "2026-01-20" },
    { id: "VND-02", fullName: "EcoWash Hub",          email: "info@ecowash.com",         phone: "+880 1834-556677", userType: "VENDOR", status: "ACTIVE", createdAt: "2026-02-15" },
  ],
  CUSTOMER: [
    { id: "CUST-01", fullName: "Sarah Jenkins", email: "sarah@example.com", phone: "+880 1711-998877", userType: "CUSTOMER", status: "ACTIVE", createdAt: "2026-01-10" },
    { id: "CUST-02", fullName: "David Miller",  email: "david@example.com", phone: "+880 1819-223344", userType: "CUSTOMER", status: "ACTIVE", createdAt: "2026-02-14" },
    { id: "CUST-03", fullName: "Elena Rostova", email: "elena@example.com", phone: "+880 1911-445566", userType: "CUSTOMER", status: "ACTIVE", createdAt: "2026-03-05" },
  ],
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Sk({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-muted ${className ?? ""}`} />;
}
function TableSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="border-b border-border px-5 py-4 flex gap-3">
        <Sk className="h-9 flex-1 rounded-xl max-w-sm" />
        <Sk className="h-9 w-48 rounded-xl" />
        <Sk className="h-9 w-28 rounded-xl" />
      </div>
      <div className="divide-y divide-border">
        {[0,1,2,3,4].map((i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-4">
            <div className="flex items-center gap-3 flex-1">
              <Sk className="h-9 w-9 rounded-xl shrink-0" />
              <div className="space-y-1.5"><Sk className="h-4 w-32" /><Sk className="h-3 w-20" /></div>
            </div>
            <Sk className="h-3 w-36" />
            <Sk className="h-5 w-20 rounded-full" />
            <Sk className="h-5 w-16 rounded-full" />
            <Sk className="h-3 w-20" />
            <Sk className="h-8 w-32 rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function UserManagementTable({
  title, description, roleFilter, initialUsers = [],
}: UserManagementTableProps) {
  const { user } = useAuth();

  const rawRole        = (user as any)?.role || user?.userType || "";
  const normalizedRole = rawRole.toUpperCase().replace(/\s+/g, "_");
  const isSuperAdmin   = ["SUPER_ADMIN","SUPERADMIN"].includes(normalizedRole);

  const [users,          setUsers]          = useState<UserRow[]>(initialUsers);
  const [loading,        setLoading]        = useState(true);
  const [search,         setSearch]         = useState("");
  const [statusFilter,   setStatusFilter]   = useState<"ALL"|"ACTIVE"|"BANNED">("ALL");
  const [selectedUser,   setSelectedUser]   = useState<UserRow | null>(null);
  const [userToDelete,   setUserToDelete]   = useState<UserRow | null>(null);
  const [isCreateOpen,   setIsCreateOpen]   = useState(false);
  const [createLoading,  setCreateLoading]  = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const [newFullName, setNewFullName] = useState("");
  const [newEmail,    setNewEmail]    = useState("");
  const [newPhone,    setNewPhone]    = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole,     setNewRole]     = useState(roleFilter || "CUSTOMER");

  // ── Fallback helper ────────────────────────────────────────────────────────
  const getFallbackUsers = () => {
    if (initialUsers?.length > 0) return initialUsers;
    const key = (roleFilter || "").toUpperCase().replace(/[\s_]+/g, "_");
    if (key.includes("BRANCH") || key.includes("MANAGER")) return FALLBACK.BRANCH_MANAGER;
    if (key.includes("DELIVERY") || key.includes("AGENT"))  return FALLBACK.DELIVERY_AGENT;
    if (key.includes("EMPLOYEE"))                            return FALLBACK.EMPLOYEE;
    if (key.includes("VENDOR"))                              return FALLBACK.VENDOR;
    if (key.includes("CUSTOMER"))                            return FALLBACK.CUSTOMER;
    return Object.values(FALLBACK).flat();
  };

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const queryRole = roleFilter ? roleFilter.toUpperCase().replace(/\s+/g, "_") : "";
      const url = queryRole ? `/admin/users?role=${queryRole}&limit=100` : `/admin/users?limit=100`;
      const json = await authFetch(url).then((r) => r.json());
      setUsers(json.success && json.data?.length ? json.data : getFallbackUsers());
    } catch {
      setUsers(getFallbackUsers());
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { fetchUsers(); }, [roleFilter]);

  // ── Derived ───────────────────────────────────────────────────────────────
  const active = users.filter((u) => (u.status || "").toUpperCase() === "ACTIVE").length;
  const banned = users.filter((u) => (u.status || "").toUpperCase() === "BANNED").length;

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const q = search.toLowerCase().trim();
      const matchSearch = !q || u.fullName?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) || u.phone?.toLowerCase().includes(q);
      const matchStatus = statusFilter === "ALL" || (u.status || "ACTIVE").toUpperCase() === statusFilter;
      const normFilter = roleFilter.toUpperCase().replace(/[\s_]+/g, "");
      const normRole   = (u.userType || u.role || "").toUpperCase().replace(/[\s_]+/g, "");
      const matchRole  = !roleFilter || normRole === normFilter || normRole.includes(normFilter) || normFilter.includes(normRole);
      return matchSearch && matchStatus && matchRole;
    });
  }, [users, search, statusFilter, roleFilter]);

  const hasFilters   = !!(search.trim() || statusFilter !== "ALL");
  const clearFilters = () => { setSearch(""); setStatusFilter("ALL"); };

  // ── Actions ───────────────────────────────────────────────────────────────
  const handleToggleBan = async (usr: UserRow) => {
    if (!isSuperAdmin) { toast.error("Only Super Admin can ban/unban users."); return; }
    const nextBanned = (usr.status || "").toUpperCase() !== "BANNED";
    setActionLoadingId(usr.id + "_ban");
    try {
      const json = await authFetch(`/admin/users/${usr.id}/ban`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isBanned: nextBanned }),
      }).then((r) => r.json());
      if (json.success) {
        toast.success(nextBanned ? `${usr.fullName} BANNED.` : `${usr.fullName} REACTIVATED.`);
        setUsers((prev) => prev.map((u) => u.id === usr.id ? { ...u, status: nextBanned ? "BANNED" : "ACTIVE" } : u));
      } else { toast.error(json.message || "Failed to update status"); }
    } catch { toast.error("Server error"); }
    finally { setActionLoadingId(null); }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    if (!isSuperAdmin) { toast.error("Only Super Admin can delete accounts."); setUserToDelete(null); return; }
    setActionLoadingId(userToDelete.id + "_del");
    try {
      const json = await authFetch(`/admin/users/${userToDelete.id}`, { method: "DELETE" }).then((r) => r.json());
      if (json.success) {
        toast.success(`${userToDelete.fullName} deleted.`);
        setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
        setUserToDelete(null);
      } else { toast.error(json.message || "Failed to delete"); }
    } catch { toast.error("Server error"); }
    finally { setActionLoadingId(null); }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFullName.trim() || !newEmail.trim()) { toast.error("Full Name and Email are required."); return; }
    if (!isSuperAdmin) { toast.error("Only Super Admin can create accounts."); return; }
    setCreateLoading(true);
    try {
      const json = await authFetch("/admin/users", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName: newFullName.trim(), email: newEmail.trim(), phone: newPhone.trim() || undefined, password: newPassword.trim() || "ChangeMe123!", userType: newRole.toUpperCase() }),
      }).then((r) => r.json());
      if (json.success) {
        toast.success(`Account for '${newFullName}' created.`);
        setIsCreateOpen(false);
        setNewFullName(""); setNewEmail(""); setNewPhone(""); setNewPassword("");
        fetchUsers();
      } else { toast.error(json.message || "Failed to create"); }
    } catch { toast.error("Server error"); }
    finally { setCreateLoading(false); }
  };

  return (
    <div className="space-y-5">

      {/* ── 1. Hero ─────────────────────────────────────────────────────── */}
      <DashboardPageHero
        badge="Identity & Access Governance"
        title={title}
        description={description}
        icon={Users}
        liveLabel={isSuperAdmin ? "Super Admin Control" : "Read-Only Mode"}
        chips={[
          { label: "Total Users",  value: loading ? "—" : String(users.length), sub: roleFilter || "All roles"                    },
          { label: "Active",       value: loading ? "—" : String(active),        sub: "Verified accounts"                         },
          { label: "Banned",       value: loading ? "—" : String(banned),         sub: banned > 0 ? "Restricted access" : "None"  },
        ]}
      />

      {/* ── 2. Toolbar ──────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

        {/* Status filter tabs */}
        <div className="flex items-center gap-1 rounded-2xl border border-border bg-muted p-1.5 overflow-x-auto scrollbar-none">
          {(["ALL","ACTIVE","BANNED"] as const).map((st) => {
            const isActive = statusFilter === st;
            const dotCls   = st === "ACTIVE" ? "bg-success" : st === "BANNED" ? "bg-error" : "bg-muted-foreground/60";
            const count    = st === "ALL" ? users.length : st === "ACTIVE" ? active : banned;
            return (
              <button key={st} onClick={() => setStatusFilter(st)}
                className={["flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[11px] font-black whitespace-nowrap select-none transition-all duration-150",
                  isActive ? "bg-card text-card-foreground shadow-sm" : "text-muted-foreground hover:text-card-foreground hover:bg-card/60"].join(" ")}>
                <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${dotCls}`} />
                {st === "ALL" ? "All Status" : st}
                <span className={["rounded-full px-1.5 py-px text-[10px] font-black leading-none tabular-nums",
                  isActive ? "bg-primary/12 text-primary" : "bg-muted-foreground/10 text-muted-foreground"].join(" ")}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right — search + create + refresh */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60" size={13} />
            <input type="text" placeholder="Search name, email or phone…" value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 w-64 pl-9 pr-3 rounded-xl border border-border bg-muted text-xs font-medium text-card-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring/50 focus:bg-card transition" />
          </div>
          {isSuperAdmin && (
            <Button size="sm" onClick={() => setIsCreateOpen(true)}
              className="h-8 rounded-xl text-xs font-black gap-1.5">
              <Plus size={13} /> Add {roleFilter ? roleFilter.replace(/_/g," ") : "User"}
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={fetchUsers} className="h-8 rounded-xl text-xs font-bold gap-1.5">
            <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
          </Button>
        </div>
      </div>

      {/* ── 3. Permission notice ────────────────────────────────────────── */}
      {!isSuperAdmin && (
        <div className="flex items-center gap-2.5 rounded-2xl border border-warning/25 bg-warning/8 px-4 py-3">
          <Lock size={14} className="text-warning shrink-0" />
          <p className="text-xs font-bold text-card-foreground">
            Read-Only Mode — Ban, unban, and delete actions are restricted to Super Admin.
          </p>
        </div>
      )}

      {/* ── 4. Table ────────────────────────────────────────────────────── */}
      {loading ? <TableSkeleton /> : (
        <OpsTable
          animateKey={statusFilter + search}
          keyExtractor={(u) => u.id}
          displayed={filteredUsers}
          totalCount={users.length}
          noun="users"
          hasFilters={hasFilters}
          onClearFilters={clearFilters}
          emptyTitle="No user accounts found"
          emptyFiltered="Try refining your search or filter."
          emptyDefault="No accounts available."
          footerStats={[
            { dot: "bg-success", label: "Active", value: active  },
            { dot: "bg-error",   label: "Banned", value: banned  },
          ]}
          columns={[
            {
              header: "User Profile", width: "minmax(180px,2fr)",
              render: (usr) => {
                const isBanned = usr.status?.toUpperCase() === "BANNED";
                return (
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white text-[12px] font-black shadow-md shadow-black/10 transition-transform duration-200 group-hover:scale-110 group-hover:rotate-3"
                      style={{ background: `linear-gradient(135deg, ${isBanned ? "var(--error)" : "var(--primary)"}, ${isBanned ? "var(--destructive)" : "var(--ring)"})` }}>
                      {(usr.fullName ?? "U").charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-black text-card-foreground truncate group-hover:text-primary transition-colors">{usr.fullName}</p>
                      <p className="text-[11px] font-mono text-muted-foreground">#{usr.id.slice(-6)}</p>
                    </div>
                  </div>
                );
              },
            },
            {
              header: "Contact", width: "1.5fr",
              render: (usr) => (
                <div className="space-y-0.5 min-w-0">
                  <p className="text-[12px] font-bold text-card-foreground truncate">{usr.email}</p>
                  <p className="text-[11px] text-muted-foreground font-medium">{usr.phone || "—"}</p>
                </div>
              ),
            },
            {
              header: "Role", width: "140px",
              render: (usr) => (
                <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/8 px-2.5 py-[3px] text-[10px] font-black text-primary w-fit uppercase">
                  {(usr.userType || usr.role || "USER").replace(/_/g," ")}
                </span>
              ),
            },
            {
              header: "Status", width: "110px",
              render: (usr) => {
                const isBanned = usr.status?.toUpperCase() === "BANNED";
                return (
                  <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-[3px] text-[10px] font-black w-fit ${isBanned ? "bg-error/10 text-error border-error/25" : "bg-success/10 text-success border-success/25"}`}>
                    <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${isBanned ? "bg-error" : "bg-success animate-pulse"}`} />
                    {isBanned ? "Banned" : "Active"}
                  </span>
                );
              },
            },
            {
              header: "Joined", width: "120px",
              render: (usr) => (
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium">
                  <Calendar size={11} className="shrink-0" />
                  {new Date(usr.createdAt || Date.now()).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </div>
              ),
            },
            {
              header: "Actions", width: "180px",
              render: (usr) => {
                const isBanned = usr.status?.toUpperCase() === "BANNED";
                return (
                  <div className="flex items-center gap-1 justify-end">
                    <Button size="sm" variant="ghost" onClick={() => setSelectedUser(usr)}
                      className="h-8 rounded-xl px-2.5 text-[11px] font-bold text-muted-foreground hover:text-primary hover:bg-primary/10 gap-1">
                      <Eye size={12} /> View
                    </Button>
                    {isSuperAdmin && (
                      <>
                        <Button size="sm" variant="ghost" disabled={actionLoadingId === usr.id + "_ban"}
                          onClick={() => handleToggleBan(usr)}
                          className={`h-8 rounded-xl px-2.5 text-[11px] font-black gap-1 ${isBanned ? "text-muted-foreground hover:text-success hover:bg-success/10" : "text-muted-foreground hover:text-warning hover:bg-warning/10"}`}>
                          {isBanned ? <><CheckCircle size={12} /> Unban</> : <><Ban size={12} /> Ban</>}
                        </Button>
                        <Button size="sm" variant="ghost" disabled={actionLoadingId === usr.id + "_del"}
                          onClick={() => setUserToDelete(usr)}
                          className="h-8 rounded-xl px-2.5 text-[11px] font-black text-muted-foreground hover:text-error hover:bg-error/10 gap-1">
                          <Trash2 size={12} /> Delete
                        </Button>
                      </>
                    )}
                  </div>
                );
              },
            },
          ]}
        />
      )}

      {/* ── View Detail Dialog ──────────────────────────────────────────── */}
      <Dialog open={!!selectedUser} onOpenChange={(v) => !v && setSelectedUser(null)}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-black text-card-foreground flex items-center gap-2">
              <User size={16} className="text-primary" /> {selectedUser?.fullName}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">Account ID: #{selectedUser?.id}</DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-2.5 pt-1">
              {[
                { label: "Email",   value: selectedUser.email                                              },
                { label: "Phone",   value: selectedUser.phone || "Not provided"                            },
                { label: "Role",    value: (selectedUser.userType || selectedUser.role || "USER").replace(/_/g," ") },
                { label: "Status",  value: selectedUser.status || "ACTIVE"                                 },
                { label: "Joined",  value: new Date(selectedUser.createdAt || Date.now()).toLocaleDateString() },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between rounded-xl border border-border bg-muted/50 px-3 py-2.5">
                  <span className="text-[11px] font-black text-muted-foreground uppercase tracking-wider">{label}</span>
                  <span className="text-[12px] font-bold text-card-foreground">{value}</span>
                </div>
              ))}
              <div className="flex justify-end pt-1">
                <Button variant="outline" size="sm" onClick={() => setSelectedUser(null)} className="rounded-xl text-xs font-bold">Close</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirm Dialog ───────────────────────────────────────── */}
      <Dialog open={!!userToDelete} onOpenChange={(v) => !v && setUserToDelete(null)}>
        <DialogContent className="sm:max-w-sm rounded-2xl">
          <div className="flex flex-col items-center text-center gap-3 pt-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-error/10">
              <AlertTriangle size={22} className="text-error" />
            </div>
            <DialogHeader>
              <DialogTitle className="text-base font-black text-card-foreground">Delete Account</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Permanently delete <strong className="text-card-foreground">{userToDelete?.fullName}</strong>? This cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="flex gap-2 w-full pt-1">
              <Button variant="outline" onClick={() => setUserToDelete(null)} className="flex-1 rounded-xl text-xs font-bold">Cancel</Button>
              <Button onClick={handleDeleteUser} className="flex-1 rounded-xl text-xs font-black bg-gradient-to-br from-error to-rose-600 text-white hover:opacity-90">
                Delete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Create User Dialog ──────────────────────────────────────────── */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-black text-card-foreground flex items-center gap-2">
              <Plus size={15} className="text-primary" /> Create User Account
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">Super Admin override to add platform users manually.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateUser} className="space-y-3 pt-1">
            {[
              { label: "Full Name",        value: newFullName, setter: setNewFullName, type: "text",  placeholder: "e.g. Rahul Chowdhury",    required: true  },
              { label: "Email Address",    value: newEmail,    setter: setNewEmail,    type: "email", placeholder: "e.g. user@laundrix.com",  required: true  },
              { label: "Phone Number",     value: newPhone,    setter: setNewPhone,    type: "text",  placeholder: "e.g. +880 1711-223344",   required: false },
              { label: "Initial Password", value: newPassword, setter: setNewPassword, type: "text",  placeholder: "Default: ChangeMe123!",   required: false },
            ].map(({ label, value, setter, type, placeholder, required }) => (
              <div key={label}>
                <label className="text-[11px] font-black text-muted-foreground uppercase tracking-wider block mb-1">{label}</label>
                <input type={type} required={required} value={value} onChange={(e) => setter(e.target.value)} placeholder={placeholder}
                  className="w-full h-9 px-3 rounded-xl border border-border bg-muted text-xs font-medium text-card-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring/50 focus:bg-card transition" />
              </div>
            ))}
            <div>
              <label className="text-[11px] font-black text-muted-foreground uppercase tracking-wider block mb-1">Assigned Role</label>
              <select value={newRole} onChange={(e) => setNewRole(e.target.value)}
                className="w-full h-9 px-3 rounded-xl border border-border bg-muted text-xs font-bold text-card-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 cursor-pointer">
                {["CUSTOMER","EMPLOYEE","BRANCH_MANAGER","VENDOR","DELIVERY_AGENT","ADMIN"].map((r) => (
                  <option key={r} value={r}>{r.replace(/_/g," ")}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2 pt-1">
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)} className="flex-1 rounded-xl text-xs font-bold">Cancel</Button>
              <Button type="submit" disabled={createLoading}
                className="flex-1 rounded-xl text-xs font-black bg-gradient-to-br from-primary to-indigo-700 text-white hover:opacity-90">
                {createLoading ? "Creating…" : "Create Account"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  );
}
