"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import {
  Users,
  Building2,
  Store,
  Truck,
  UserCheck,
  DollarSign,
  Globe,
  ShieldAlert,
  Settings,
  LayoutDashboard,
  Lock,
} from "lucide-react";

export function AdminSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  if (!user) return null;

  const role = (user.userType || (user as any).role || "").toUpperCase();
  const isSuperAdmin = role === "SUPER_ADMIN";
  const perms = (user as any)?.adminPermission || {};

  const canCust = isSuperAdmin || perms.canManageCustomerOps;
  const canBranch = isSuperAdmin || perms.canManageBranchOps;
  const canVendor = isSuperAdmin || perms.canManageVendorOps;
  const canAgent = isSuperAdmin || perms.canManageAgentOps;
  const canEmp = isSuperAdmin || perms.canManageEmployeeOps;
  const canFin = isSuperAdmin || perms.canManageFinance;

  return (
    <aside className="w-64 bg-slate-900 text-white min-h-screen p-4 space-y-6 flex flex-col justify-between">
      <div className="space-y-6">
        <div className="px-3 py-2 text-xl font-black text-blue-400 tracking-wider flex items-center gap-2">
          <Lock size={20} /> LAUNDRIX ADMIN
        </div>

        <nav className="space-y-5 text-xs font-semibold">
          {/* Operations Category */}
          <div className="space-y-1">
            <span className="px-3 text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Operations</span>
            {canCust && <SidebarItem href="/dashboard/customer-ops" label="Customer Operations" icon={Users} active={pathname === "/dashboard/customer-ops"} />}
            {canBranch && <SidebarItem href="/dashboard/branch-ops" label="Branch Operations" icon={Building2} active={pathname === "/dashboard/branch-ops"} />}
            {canVendor && <SidebarItem href="/dashboard/vendor-ops" label="Vendor Operations" icon={Store} active={pathname === "/dashboard/vendor-ops"} />}
            {canAgent && <SidebarItem href="/dashboard/agent-ops" label="Agent Operations" icon={Truck} active={pathname === "/dashboard/agent-ops"} />}
            {canEmp && <SidebarItem href="/dashboard/employee-ops" label="Employee Operations" icon={UserCheck} active={pathname === "/dashboard/employee-ops"} />}
          </div>

          {/* Users Management Category (Both Super Admin & Admin) */}
          <div className="space-y-1">
            <span className="px-3 text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Users Directory</span>
            <SidebarItem href="/dashboard/users" label="User Management" icon={Users} active={pathname === "/dashboard/users"} />
            {isSuperAdmin && <SidebarItem href="/dashboard/users/permissions" label="Permission Studio" icon={Lock} active={pathname === "/dashboard/users/permissions"} />}
          </div>

          {/* System, Finance & Security Category */}
          <div className="space-y-1">
            <span className="px-3 text-[10px] uppercase font-bold text-slate-400 block tracking-wider">System & Security</span>
            {canFin && <SidebarItem href="/dashboard/finance" label="Finance & Settlements" icon={DollarSign} active={pathname === "/dashboard/finance"} />}
            {isSuperAdmin && <SidebarItem href="/dashboard/cms" label="Web CMS" icon={Globe} active={pathname === "/dashboard/cms"} />}
            {isSuperAdmin && <SidebarItem href="/dashboard/settings?tab=audit" label="Audit & Logging" icon={ShieldAlert} active={pathname?.includes("tab=audit")} />}
            {isSuperAdmin && <SidebarItem href="/dashboard/settings" label="System Settings" icon={Settings} active={pathname === "/dashboard/settings"} />}
          </div>
        </nav>
      </div>
    </aside>
  );
}

function SidebarItem({ href, label, icon: Icon, active }: { href: string; label: string; icon: any; active: boolean }) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${
        active ? "bg-blue-600 text-white font-bold" : "text-slate-300 hover:bg-slate-800 hover:text-white"
      }`}
    >
      <Icon size={16} />
      <span>{label}</span>
    </Link>
  );
}
