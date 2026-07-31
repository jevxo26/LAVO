"use client";

import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Users, Plus, Edit2, Trash2, Ban, CheckCircle, ShieldAlert, Lock, Search } from "lucide-react";
import { toast } from "sonner";

export interface UserRow {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: string;
  status: string;
  createdAt: string;
}

interface UserManagementTableProps {
  title: string;
  description: string;
  roleFilter: string;
  initialUsers: UserRow[];
}

export function UserManagementTable({
  title,
  description,
  roleFilter,
  initialUsers,
}: UserManagementTableProps) {
  const { user } = useAuth();
  const rawRole = (user as any)?.role || user?.userType || "";
  const normalizedRole = rawRole.toUpperCase().replace(/\s+/g, "_");
  const isSuperAdmin = normalizedRole === "SUPER_ADMIN";

  const [users, setUsers] = useState<UserRow[]>(initialUsers);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredUsers = users.filter(
    (u) =>
      u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleActionClick = (actionName: string) => {
    if (!isSuperAdmin) {
      toast.error("Access Denied: Read-only mode for Admin accounts.");
      return;
    }
    toast.success(`Action '${actionName}' executed successfully.`);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/80 backdrop-blur-xl p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="text-blue-600" />
            {title}
          </h1>
          <p className="text-sm text-slate-500 mt-1">{description}</p>
        </div>

        {/* RBAC Notice & Add Button */}
        <div className="flex items-center gap-3">
          {!isSuperAdmin ? (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs font-semibold">
              <Lock size={14} /> Read-Only Mode (ADMIN)
            </div>
          ) : (
            <button
              onClick={() => handleActionClick(`Add New ${roleFilter}`)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-xl text-sm hover:bg-blue-700 shadow-sm transition-colors"
            >
              <Plus size={16} /> Add New {roleFilter}
            </button>
          )}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={`Search ${roleFilter}s by name or email...`}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <span className="text-xs font-semibold text-slate-500">
            Total {roleFilter}s: {filteredUsers.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-6">User Profile</th>
                <th className="py-3.5 px-6">Contact Info</th>
                <th className="py-3.5 px-6">Role</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6">Created At</th>
                {isSuperAdmin && <th className="py-3.5 px-6 text-right">Super Admin Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((usr) => (
                <tr key={usr.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-6 font-semibold text-slate-900">{usr.fullName}</td>
                  <td className="py-4 px-6 text-xs text-slate-600">
                    <p className="font-medium text-slate-800">{usr.email}</p>
                    <p className="text-slate-400">{usr.phone || "N/A"}</p>
                  </td>
                  <td className="py-4 px-6 text-xs">
                    <span className="px-2.5 py-1 rounded-full font-bold bg-blue-100 text-blue-800">
                      {usr.role}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-xs">
                    <span
                      className={`px-2.5 py-1 rounded-full font-bold ${
                        usr.status === "ACTIVE"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {usr.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-xs text-slate-500">{usr.createdAt}</td>

                  {/* Render Full CRUD Actions ONLY if Super Admin */}
                  {isSuperAdmin && (
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleActionClick(`Edit ${usr.fullName}`)}
                          className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit User"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleActionClick(`Toggle Ban ${usr.fullName}`)}
                          className="p-1.5 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          title="Ban / Suspend"
                        >
                          <Ban size={16} />
                        </button>
                        <button
                          onClick={() => handleActionClick(`Delete ${usr.fullName}`)}
                          className="p-1.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete User"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
