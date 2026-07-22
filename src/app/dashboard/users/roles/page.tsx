"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Plus, ShieldAlert } from "lucide-react";
import { CreateRoleModal } from "@/components/dashboard/rbac/CreateRoleModal";
import { PermissionMatrix } from "@/components/dashboard/rbac/PermissionMatrix";

export default function RolesPage() {
  const [roles, setRoles] = useState<any[]>([]);
  const [permissions, setPermissions] = useState<any[]>([]);
  const [selectedRole, setSelectedRole] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [rolesRes, permsRes] = await Promise.all([
        axios.get("/api/roles"),
        axios.get("/api/roles/permissions"),
      ]);
      setRoles(rolesRes.data.data);
      setPermissions(permsRes.data.data);
      if (rolesRes.data.data.length > 0) {
        // Maintain selection or select first
        setSelectedRole((prev: any) => 
          rolesRes.data.data.find((r: any) => r.id === prev?.id) || rolesRes.data.data[0]
        );
      }
    } catch (err) {
      console.error("Failed to load permissions and roles matrix", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <span className="text-slate-400 text-sm font-semibold">Loading RBAC details...</span>
      </div>
    );
  }

  const activePermissionIds = selectedRole?.permissions?.map((p: any) => p.permissionId) || [];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Roles & Permissions Studio</h1>
          <p className="text-slate-400 text-sm mt-0.5">Configure fine-grained Role-Based Access Control settings.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-md text-sm"
        >
          <Plus size={16} /> Create Custom Role
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Roles List */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-4">
          <h2 className="font-bold text-slate-900 text-base">Select Platform Role</h2>
          <div className="flex flex-col gap-2">
            {roles.map((role) => (
              <button
                key={role.id}
                onClick={() => setSelectedRole(role)}
                className={`w-full text-left p-4 rounded-xl transition-all border flex flex-col gap-1 ${
                  selectedRole?.id === role.id
                    ? "bg-blue-50/40 border-blue-500/30 text-blue-900 shadow-sm"
                    : "bg-transparent border-slate-100 text-slate-700 hover:bg-slate-50"
                }`}
              >
                <span className="font-bold text-sm tracking-wide">{role.displayName}</span>
                <span className="text-xs text-slate-400 font-medium truncate w-full">
                  {role.description || "No description provided"}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Right Side: Matrix */}
        <div className="lg:col-span-8">
          {selectedRole ? (
            <PermissionMatrix
              roleId={selectedRole.id}
              roleName={selectedRole.displayName}
              allPermissions={permissions}
              initialActiveIds={activePermissionIds}
              onSaved={fetchData}
            />
          ) : (
            <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center shadow-sm flex flex-col items-center justify-center gap-3">
              <ShieldAlert size={48} className="text-slate-300" />
              <span className="text-slate-400 font-bold text-sm">Select a role to modify permissions</span>
            </div>
          )}
        </div>
      </div>

      <CreateRoleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onRoleCreated={fetchData}
      />
    </div>
  );
}
