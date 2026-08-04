"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Menu, ChevronDown, ShoppingBag, LogOut } from "lucide-react";
import { dashboardNavItems } from "@/data/dashboardNav";
import { useAuth } from "@/hooks/useAuth";

interface SidebarProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

export function Sidebar({ isCollapsed, toggleSidebar }: SidebarProps) {
  const pathname = usePathname();
  const [openMenu, setOpenMenu] = React.useState<string | null>(null);
  const { user, logout } = useAuth();

  const userRole = React.useMemo(() => {
    if (!user) return "";
    const rawRole = ((user as any).role || (user as any).userType || "")
      .toString()
      .toUpperCase()
      .trim()
      .replace(/[\s-]+/g, "_");

    // Delivery Agent aliases
    if (["AGENT", "DELIVERYAGENT", "DELIVERY_AGENT"].includes(rawRole)) return "DELIVERY_AGENT";
    // Branch Manager aliases
    if (["MANAGER", "BRANCHMANAGER", "BRANCH_MANAGER"].includes(rawRole)) return "BRANCH_MANAGER";
    // Employee aliases
    if (["STAFF", "BRANCH_EMPLOYEE", "BRANCHEMPLOYEE", "EMPLOYEE"].includes(rawRole)) return "EMPLOYEE";
    // Vendor aliases
    if (["VENDOR_OWNER", "VENDOROWNER", "VENDOR_STAFF", "VENDORSTAFF", "VENDOR"].includes(rawRole)) return "VENDOR";
    // Super Admin aliases
    if (["SUPER_ADMIN", "SUPERADMIN", "SUPER_ADMINISTRATOR", "SUPERADMINISTRATOR"].includes(rawRole)) return "SUPER_ADMIN";
    // Admin aliases
    if (["ADMIN", "ADMINISTRATOR", "NORMAL_ADMIN", "SYSTEM_ADMIN", "ADMIN_USER"].includes(rawRole)) return "ADMIN";
    // Customer aliases
    if (["CUSTOMER", "USER"].includes(rawRole)) return "CUSTOMER";

    return rawRole;
  }, [user]);

  React.useEffect(() => {
    dashboardNavItems.forEach((item) => {
      if (
        item.children?.some(
          (child) =>
            pathname === child.href ||
            (child.href && pathname.startsWith(`${child.href}/`))
        )
      ) {
        setOpenMenu(item.name);
      }
    });
  }, [pathname]);

  return (
    <aside
      className={cn(
        "relative flex flex-col h-screen bg-gradient-to-b from-blue-50/60 via-slate-50/80 to-indigo-50/40 backdrop-blur-xl border-r border-slate-200/50 shadow-[4px_0_24px_rgba(0,0,0,0.02)] transition-all duration-300 ease-in-out z-20",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      <div className="flex items-center justify-between py-4.5 px-4 border-b border-[#EBEDEF] shadow-xs">
        {!isCollapsed && (
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600 text-white shadow-sm">
              <ShoppingBag size={16} />
            </div>
            <span className="text-xl font-bold tracking-wide text-slate-900">
              LAUNDR<span className="text-blue-600">IX</span>
            </span>
          </Link>
        )}
        {isCollapsed && (
          <div className="mx-auto text-blue-600">
            <Menu size={24} />
          </div>
        )}
      </div>

      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-20 flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white shadow-md hover:bg-blue-700 transition-colors z-30"
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {dashboardNavItems
          .filter((item) => {
            if (!item.roles || item.roles.length === 0) return true;
            if (!userRole) return false;

            const hasDirectRole = item.roles.includes(userRole);
            const hasChildRole = item.children?.some(
              (child) => !child.roles || child.roles.includes(userRole)
            );

            return hasDirectRole || hasChildRole;
          })
          .map((item) => {
            const hasChildren = item.children && item.children.length > 0;
            const isParentActive =
              hasChildren &&
              item.children?.some(
                (child) =>
                  pathname === child.href ||
                  (child.href && pathname.startsWith(`${child.href}/`)),
              );

            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : item.href &&
                  (pathname === item.href ||
                    pathname.startsWith(`${item.href}/`));

            return (
              <div key={item.name}>
                {hasChildren ? (
                  <button
                    onClick={() =>
                      setOpenMenu(openMenu === item.name ? null : item.name)
                    }
                    className={cn(
                      "flex items-center w-full px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                      isParentActive || openMenu === item.name
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold shadow-md shadow-blue-500/20"
                        : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900",
                    )}
                  >
                    <item.icon size={19} />

                    {!isCollapsed && (
                      <>
                        <span className="ml-3 flex-1 text-left truncate">
                          {item.name}
                        </span>

                        <ChevronDown
                          size={16}
                          className={cn(
                            "transition-transform duration-300 ml-1 shrink-0",
                            openMenu === item.name && "rotate-180",
                          )}
                        />
                      </>
                    )}
                  </button>
                ) : (
                  <Link
                    href={item.href || "#"}
                    className={cn(
                      "flex items-center px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold shadow-md shadow-blue-500/20"
                        : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900",
                    )}
                  >
                    <item.icon size={19} />

                    {!isCollapsed && (
                      <span className="ml-3 truncate">{item.name}</span>
                    )}
                  </Link>
                )}
                {openMenu === item.name && !isCollapsed && hasChildren && (
                  <div className="ml-7 mt-1 space-y-1 border-l-2 border-slate-100 pl-3">
                    {item.children
                      ?.filter(
                        (child) =>
                          !child.roles ||
                          (userRole && child.roles.includes(userRole)),
                      )
                      .map((child) => {
                        const isChildActive =
                          pathname === child.href ||
                          (child.href && pathname.startsWith(`${child.href}/`));
                        return (
                          <Link
                            key={child.name}
                            href={child.href || "#"}
                            className={cn(
                              "flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all",
                              isChildActive
                                ? "bg-blue-50/80 text-blue-600 font-semibold"
                                : "text-slate-500 hover:bg-slate-100/50 hover:text-slate-900",
                            )}
                          >
                            <child.icon size={15} />
                            <span className="truncate">{child.name}</span>
                          </Link>
                        );
                      })}
                  </div>
                )}
              </div>
            );
          })}
      </nav>

      <div className="p-4 border-t border-slate-300/75 shadow-sm">
        <button
          onClick={logout}
          className={cn(
            "w-full flex z-[150] items-center justify-center gap-3 text-slate-600 hover:text-rose-600 bg-rose-50 hover:bg-rose-100 transition-all rounded-xl py-2.5 text-sm font-medium",
            isCollapsed ? "px-0" : "px-3",
          )}
          title="Logout"
        >
          <LogOut size={18} className="shrink-0 text-rose-500" />
          {!isCollapsed && (
            <span className="font-semibold text-rose-600">Logout</span>
          )}
        </button>
      </div>
    </aside>
  );
}
