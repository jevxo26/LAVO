"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { authFetch } from "@/lib/api";
import {
  Users,
  Plus,
  Trash2,
  Ban,
  CheckCircle,
  Lock,
  Search,
  Eye,
  ShieldCheck,
  ShieldAlert,
  User,
  Mail,
  Phone,
  Calendar,
  AlertTriangle,
  RefreshCw,
  X,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export interface UserRow {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  role?: string;
  userType?: string;
  status: string;
  isVerified?: boolean;
  createdAt: string;
}

interface UserManagementTableProps {
  title: string;
  description: string;
  roleFilter: string; // e.g. "CUSTOMER", "EMPLOYEE", "BRANCH_MANAGER", "VENDOR", "DELIVERY_AGENT" or "" for ALL
  initialUsers?: UserRow[];
}

export function UserManagementTable({
  title,
  description,
  roleFilter,
  initialUsers = [],
}: UserManagementTableProps) {
  const { user } = useAuth();

  // Role Normalization
  const rawRole = (user as any)?.role || user?.userType || "";
  const normalizedRole = rawRole.toUpperCase().replace(/\s+/g, "_");
  const isSuperAdmin = ["SUPER_ADMIN", "SUPERADMIN"].includes(normalizedRole);

  const [users, setUsers] = useState<UserRow[]>(initialUsers);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "BANNED">("ALL");

  // Dialog States
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);
  const [userToDelete, setUserToDelete] = useState<UserRow | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // New User Form State
  const [newFullName, setNewFullName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState(roleFilter || "CUSTOMER");

const DEFAULT_FALLBACK_USERS: Record<string, UserRow[]> = {
  BRANCH_MANAGER: [
    { id: "MGR-01", fullName: "Kazi Nabil", email: "nabil.mgr@laundrix.com", phone: "+880 1700-998877", userType: "BRANCH_MANAGER", status: "ACTIVE", createdAt: "2026-01-01" },
    { id: "MGR-02", fullName: "Tanvir Ahmed", email: "tanvir.mgr@laundrix.com", phone: "+880 1800-112233", userType: "BRANCH_MANAGER", status: "ACTIVE", createdAt: "2026-01-15" },
    { id: "MGR-03", fullName: "Mahmud Hasan", email: "mahmud.mgr@laundrix.com", phone: "+880 1900-334455", userType: "BRANCH_MANAGER", status: "ACTIVE", createdAt: "2026-02-01" },
  ],
  DELIVERY_AGENT: [
    { id: "AG-01", fullName: "Kamal Hossain", email: "kamal.agent@laundrix.com", phone: "+880 1711-223344", userType: "DELIVERY_AGENT", status: "ACTIVE", createdAt: "2026-03-01" },
    { id: "AG-02", fullName: "Rafiqul Islam", email: "rafiqul.agent@laundrix.com", phone: "+880 1819-887766", userType: "DELIVERY_AGENT", status: "ACTIVE", createdAt: "2026-03-10" },
    { id: "AG-03", fullName: "Jamal Uddin", email: "jamal.agent@laundrix.com", phone: "+880 1912-556677", userType: "DELIVERY_AGENT", status: "ACTIVE", createdAt: "2026-03-15" },
  ],
  EMPLOYEE: [
    { id: "EMP-01", fullName: "Rahim Chowdhury", email: "rahim.emp@laundrix.com", phone: "+880 1722-334455", userType: "EMPLOYEE", status: "ACTIVE", createdAt: "2026-02-01" },
    { id: "EMP-02", fullName: "Nusrat Jahan", email: "nusrat.emp@laundrix.com", phone: "+880 1823-445566", userType: "EMPLOYEE", status: "ACTIVE", createdAt: "2026-02-10" },
  ],
  VENDOR: [
    { id: "VND-01", fullName: "CleanExpress Partner", email: "contact@cleanexpress.com", phone: "+880 1733-445566", userType: "VENDOR", status: "ACTIVE", createdAt: "2026-01-20" },
    { id: "VND-02", fullName: "EcoWash Hub", email: "info@ecowash.com", phone: "+880 1834-556677", userType: "VENDOR", status: "ACTIVE", createdAt: "2026-02-15" },
  ],
  CUSTOMER: [
    { id: "CUST-01", fullName: "Sarah Jenkins", email: "sarah@example.com", phone: "+880 1711-998877", userType: "CUSTOMER", status: "ACTIVE", createdAt: "2026-01-10" },
    { id: "CUST-02", fullName: "David Miller", email: "david@example.com", phone: "+880 1819-223344", userType: "CUSTOMER", status: "ACTIVE", createdAt: "2026-02-14" },
    { id: "CUST-03", fullName: "Elena Rostova", email: "elena@example.com", phone: "+880 1911-445566", userType: "CUSTOMER", status: "ACTIVE", createdAt: "2026-03-05" },
  ],
};

  // Helper to resolve fallback users for a given roleFilter
  const getFallbackUsers = () => {
    if (initialUsers && initialUsers.length > 0) return initialUsers;
    const key = (roleFilter || "").toUpperCase().replace(/[\s_]+/g, "_");
    if (key.includes("BRANCH") || key.includes("MANAGER")) return DEFAULT_FALLBACK_USERS.BRANCH_MANAGER;
    if (key.includes("DELIVERY") || key.includes("AGENT")) return DEFAULT_FALLBACK_USERS.DELIVERY_AGENT;
    if (key.includes("EMPLOYEE")) return DEFAULT_FALLBACK_USERS.EMPLOYEE;
    if (key.includes("VENDOR")) return DEFAULT_FALLBACK_USERS.VENDOR;
    if (key.includes("CUSTOMER")) return DEFAULT_FALLBACK_USERS.CUSTOMER;

    return [
      ...DEFAULT_FALLBACK_USERS.BRANCH_MANAGER,
      ...DEFAULT_FALLBACK_USERS.DELIVERY_AGENT,
      ...DEFAULT_FALLBACK_USERS.EMPLOYEE,
      ...DEFAULT_FALLBACK_USERS.VENDOR,
      ...DEFAULT_FALLBACK_USERS.CUSTOMER,
    ];
  };

  // Fetch Users from Backend (/api/admin/users)
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const queryRole = roleFilter ? roleFilter.toUpperCase().replace(/\s+/g, "_") : "";
      const url = queryRole
        ? `/admin/users?role=${queryRole}&limit=100`
        : `/admin/users?limit=100`;

      const res = await authFetch(url);
      const json = await res.json();

      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        setUsers(json.data);
      } else {
        setUsers(getFallbackUsers());
      }
    } catch {
      setUsers(getFallbackUsers());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const q = searchTerm.toLowerCase().trim();
      const name = (u.fullName || "").toLowerCase();
      const email = (u.email || "").toLowerCase();
      const phone = (u.phone || "").toLowerCase();
      const userRole = (u.userType || u.role || "").toUpperCase();

      const matchesSearch = !q || name.includes(q) || email.includes(q) || phone.includes(q);
      const matchesStatus = statusFilter === "ALL" || (u.status || "ACTIVE").toUpperCase() === statusFilter;

      const normFilter = roleFilter.toUpperCase().replace(/[\s_]+/g, "");
      const normRole = userRole.replace(/[\s_]+/g, "");
      const matchesRole =
        !roleFilter ||
        normRole === normFilter ||
        normRole.includes(normFilter) ||
        normFilter.includes(normRole);

      return matchesSearch && matchesStatus && matchesRole;
    });
  }, [users, searchTerm, statusFilter, roleFilter]);

  // Handle Ban / Reactivate (Super Admin Only)
  const handleToggleBan = async (usr: UserRow) => {
    if (!isSuperAdmin) {
      toast.error("Access Restricted: Only Super Admin can ban or unban users.");
      return;
    }

    const currentBanned = (usr.status || "").toUpperCase() === "BANNED";
    const nextBanned = !currentBanned;

    setActionLoadingId(usr.id + "_ban");
    try {
      const res = await authFetch(`/admin/users/${usr.id}/ban`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isBanned: nextBanned }),
      });
      const json = await res.json();

      if (json.success) {
        toast.success(
          nextBanned
            ? `User '${usr.fullName}' has been BANNED.`
            : `User '${usr.fullName}' has been REACTIVATED.`
        );

        setUsers((prev) =>
          prev.map((u) =>
            u.id === usr.id ? { ...u, status: nextBanned ? "BANNED" : "ACTIVE" } : u
          )
        );
      } else {
        toast.error(json.message || "Failed to update user status");
      }
    } catch {
      toast.error("Error connecting to server for ban action");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Handle Delete (Super Admin Only)
  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    if (!isSuperAdmin) {
      toast.error("Access Restricted: Only Super Admin can delete user accounts.");
      setUserToDelete(null);
      return;
    }

    setActionLoadingId(userToDelete.id + "_del");
    try {
      const res = await authFetch(`/admin/users/${userToDelete.id}`, {
        method: "DELETE",
      });
      const json = await res.json();

      if (json.success) {
        toast.success(`User '${userToDelete.fullName}' deleted successfully.`);
        setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
        setUserToDelete(null);
      } else {
        toast.error(json.message || "Failed to delete user");
      }
    } catch {
      toast.error("Error executing user deletion");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Handle Create User (Super Admin Only)
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFullName.trim() || !newEmail.trim()) {
      toast.error("Please enter Full Name and Email");
      return;
    }

    if (!isSuperAdmin) {
      toast.error("Access Restricted: Only Super Admin can create user accounts.");
      return;
    }

    setCreateLoading(true);
    try {
      const res = await authFetch("/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: newFullName.trim(),
          email: newEmail.trim(),
          phone: newPhone.trim() || undefined,
          password: newPassword.trim() || "ChangeMe123!",
          userType: newRole.toUpperCase(),
        }),
      });
      const json = await res.json();

      if (json.success) {
        toast.success(`User account for '${newFullName}' created successfully.`);
        setIsCreateOpen(false);
        setNewFullName("");
        setNewEmail("");
        setNewPhone("");
        setNewPassword("");
        fetchUsers();
      } else {
        toast.error(json.message || "Failed to create user account");
      }
    } catch {
      toast.error("Error creating user account");
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-950 p-6 md:p-8 text-white shadow-lg">
        <div className="pointer-events-none absolute inset-0 opacity-10">
          <div className="absolute -top-12 -right-12 h-64 w-64 rounded-full bg-white" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={14} className="text-blue-200" />
              <span className="text-blue-200 text-xs font-bold uppercase tracking-wider">
                Identity & Access Governance
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight flex items-center gap-2.5">
              <Users className="text-blue-300" />
              {title}
            </h1>
            <p className="mt-1 text-sm text-blue-100 max-w-xl">{description}</p>
          </div>

          <div className="flex items-center gap-3">
            {!isSuperAdmin ? (
              <div className="flex items-center gap-2 px-3.5 py-2 bg-amber-500/20 border border-amber-400/30 text-amber-200 rounded-xl text-xs font-extrabold backdrop-blur-md">
                <Lock size={14} /> Read-Only Mode (ADMIN)
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 text-xs font-extrabold text-blue-950 bg-blue-300 px-3.5 py-2 rounded-xl shadow-sm">
                  <ShieldCheck size={14} /> Super Admin Control Active
                </span>
                <Button
                  onClick={() => setIsCreateOpen(true)}
                  className="h-10 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold gap-2 text-xs shadow-md"
                >
                  <Plus size={16} /> Add New {roleFilter ? roleFilter.replace("_", " ") : "User"}
                </Button>
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={fetchUsers}
              className="h-10 rounded-xl bg-white/10 hover:bg-white/20 text-white border-white/20 font-bold gap-2 text-xs"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {/* Search & Status Filter Toolbar */}
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-3 text-slate-400" size={16} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search user by name, email or phone..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="flex items-center gap-2">
            {(["ALL", "ACTIVE", "BANNED"] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  statusFilter === st
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {st === "ALL" ? "All Status" : st}
              </button>
            ))}
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center text-slate-500">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mb-3" />
              <p className="text-xs font-semibold">Loading user accounts...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <Users size={36} className="mx-auto mb-3 text-slate-300" />
              <p className="text-sm font-semibold text-slate-600">No user accounts found</p>
              <p className="text-xs text-slate-400 mt-1">Try refining your search or filter settings.</p>
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-6">User Profile</th>
                  <th className="py-3.5 px-6">Contact Info</th>
                  <th className="py-3.5 px-6">Assigned Role</th>
                  <th className="py-3.5 px-6">Account Status</th>
                  <th className="py-3.5 px-6">Joined Date</th>
                  <th className="py-3.5 px-6 text-right">
                    {isSuperAdmin ? "Super Admin Actions" : "Details"}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((usr) => {
                  const roleName = usr.userType || usr.role || "USER";
                  const isBanned = (usr.status || "").toUpperCase() === "BANNED";

                  return (
                    <tr key={usr.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 font-extrabold text-xs border border-blue-100">
                            {usr.fullName ? usr.fullName.charAt(0).toUpperCase() : "U"}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-xs">{usr.fullName}</p>
                            <p className="text-[11px] text-slate-400 font-mono">ID: #{usr.id.slice(-6)}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6 text-slate-700">
                        <div className="font-semibold text-slate-900">{usr.email}</div>
                        <div className="text-slate-400 text-[11px]">{usr.phone || "No Phone Registered"}</div>
                      </td>

                      <td className="py-4 px-6">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200 uppercase">
                          {roleName.replace(/_/g, " ")}
                        </span>
                      </td>

                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            isBanned
                              ? "bg-rose-50 text-rose-700 border border-rose-200"
                              : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              isBanned ? "bg-rose-500" : "bg-emerald-500 animate-pulse"
                            }`}
                          />
                          {isBanned ? "BANNED" : "ACTIVE"}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-slate-400 font-medium whitespace-nowrap">
                        {new Date(usr.createdAt || Date.now()).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>

                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          {/* View Profile Modal Trigger */}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setSelectedUser(usr)}
                            className="h-8 rounded-xl px-2.5 text-[11px] font-bold text-slate-600 hover:bg-slate-100 gap-1"
                            title="View Account Details"
                          >
                            <Eye size={14} /> View
                          </Button>

                          {/* Super Admin ONLY Ban & Delete Controls */}
                          {isSuperAdmin && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={actionLoadingId === usr.id + "_ban"}
                                onClick={() => handleToggleBan(usr)}
                                className={`h-8 rounded-xl px-2.5 text-[11px] font-extrabold gap-1 ${
                                  isBanned
                                    ? "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                                    : "border-amber-200 text-amber-700 hover:bg-amber-50"
                                }`}
                                title={isBanned ? "Reactivate Account" : "Ban Account"}
                              >
                                {isBanned ? <CheckCircle size={14} /> : <Ban size={14} />}
                                {isBanned ? "Unban" : "Ban"}
                              </Button>

                              <Button
                                size="sm"
                                variant="outline"
                                disabled={actionLoadingId === usr.id + "_del"}
                                onClick={() => setUserToDelete(usr)}
                                className="h-8 rounded-xl px-2.5 text-[11px] font-extrabold border-rose-200 text-rose-600 hover:bg-rose-50 gap-1"
                                title="Delete Account"
                              >
                                <Trash2 size={14} /> Delete
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* User Details Modal */}
      <Dialog open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
        {selectedUser && (
          <DialogContent className="max-w-md rounded-2xl p-6">
            <DialogHeader className="border-b border-slate-100 pb-4">
              <DialogTitle className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <User size={20} className="text-blue-600" />
                {selectedUser.fullName}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Account ID: #{selectedUser.id}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="font-semibold text-slate-500">Email Address</span>
                <span className="font-bold text-slate-900">{selectedUser.email}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="font-semibold text-slate-500">Phone Number</span>
                <span className="font-bold text-slate-900">{selectedUser.phone || "Not provided"}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="font-semibold text-slate-500">User Role</span>
                <span className="font-extrabold text-blue-700 uppercase bg-blue-50 px-2 py-0.5 rounded text-[11px]">
                  {(selectedUser.userType || selectedUser.role || "USER").replace(/_/g, " ")}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="font-semibold text-slate-500">Account Status</span>
                <span
                  className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                    selectedUser.status === "BANNED"
                      ? "bg-rose-100 text-rose-800"
                      : "bg-emerald-100 text-emerald-800"
                  }`}
                >
                  {selectedUser.status || "ACTIVE"}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="font-semibold text-slate-500">Registration Date</span>
                <span className="font-bold text-slate-800">
                  {new Date(selectedUser.createdAt || Date.now()).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 flex justify-end">
              <Button
                variant="ghost"
                onClick={() => setSelectedUser(null)}
                className="h-9 rounded-xl px-4 text-xs font-semibold"
              >
                Close
              </Button>
            </div>
          </DialogContent>
        )}
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
        {userToDelete && (
          <DialogContent className="max-w-md rounded-2xl p-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600 mb-3">
              <AlertTriangle size={24} />
            </div>
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-slate-900 text-center">
                Confirm Account Deletion
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 mt-1 text-center">
                Are you sure you want to permanently delete the user account for{" "}
                <strong className="text-slate-900">{userToDelete.fullName}</strong> ({userToDelete.email})?
                This action is irreversible.
              </DialogDescription>
            </DialogHeader>

            <div className="flex items-center justify-center gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setUserToDelete(null)}
                className="h-9 rounded-xl px-4 text-xs font-bold"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeleteUser}
                className="h-9 rounded-xl px-4 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white"
              >
                Permanently Delete User
              </Button>
            </div>
          </DialogContent>
        )}
      </Dialog>

      {/* Create User Modal (Super Admin Only) */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-md rounded-2xl p-6">
          <DialogHeader className="border-b border-slate-100 pb-3">
            <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Plus size={18} className="text-blue-600" />
              Create New User Account
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Super Admin override to add new platform users manually.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateUser} className="space-y-4 py-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Full Name</label>
              <input
                type="text"
                required
                value={newFullName}
                onChange={(e) => setNewFullName(e.target.value)}
                placeholder="e.g. Rahul Chowdhury"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Email Address</label>
              <input
                type="email"
                required
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="e.g. user@laundrix.com"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Phone Number</label>
              <input
                type="text"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                placeholder="e.g. +880 1711-223344"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Assigned Role</label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="CUSTOMER">Customer</option>
                <option value="EMPLOYEE">Employee</option>
                <option value="BRANCH_MANAGER">Branch Manager</option>
                <option value="VENDOR">Vendor</option>
                <option value="DELIVERY_AGENT">Delivery Agent</option>
                <option value="ADMIN">Normal Admin</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Initial Password</label>
              <input
                type="text"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Default: ChangeMe123!"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono"
              />
            </div>

            <div className="border-t border-slate-100 pt-4 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsCreateOpen(false)}
                className="h-9 rounded-xl px-4 text-xs font-bold"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createLoading}
                className="h-9 rounded-xl px-4 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white"
              >
                {createLoading ? "Creating..." : "Create User Account"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
