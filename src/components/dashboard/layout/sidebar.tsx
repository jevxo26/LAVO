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
    const rawRole = (user as any).role || user.userType || "";
    return rawRole.toUpperCase().replace(/\s+/g, "_");
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
        "relative flex flex-col h-screen bg-white/80 backdrop-blur-xl border-r border-slate-200/60 shadow-[4px_0_24px_rgba(0,0,0,0.02)] transition-all duration-300 ease-in-out z-20",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      <div className="flex items-center justify-between h-16 px-4 border-b border-slate-200/60">
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
          .filter(
            (item) =>
              !item.roles ||
              (userRole && item.roles.includes(userRole))
          )
          .map((item) => {
            const hasChildren = item.children && item.children.length > 0;
            const isParentActive =
              hasChildren &&
              item.children?.some(
                (child) =>
                  pathname === child.href ||
                  (child.href && pathname.startsWith(`${child.href}/`))
              );

            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : item.href && (pathname === item.href || pathname.startsWith(`${item.href}/`));

            return (
              <div key={item.name}>
                {hasChildren ? (
                  <button
                    onClick={() =>
                      setOpenMenu(openMenu === item.name ? null : item.name)
                    }
                    className={cn(
                      "flex items-center w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                      isParentActive || openMenu === item.name
                        ? "bg-blue-50 text-blue-600 font-semibold"
                        : "text-slate-600 hover:bg-slate-100/70 hover:text-slate-900"
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
                            openMenu === item.name && "rotate-180"
                          )}
                        />
                      </>
                    )}
                  </button>
                ) : (
                  <Link
                    href={item.href || "#"}
                    className={cn(
                      "flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                      isActive
                        ? "bg-blue-50 text-blue-600 font-semibold"
                        : "text-slate-600 hover:bg-slate-100/70 hover:text-slate-900"
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
                          (userRole && child.roles.includes(userRole))
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
                                : "text-slate-500 hover:bg-slate-100/50 hover:text-slate-900"
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

      <div className="p-4 border-t border-slate-200/60 flex flex-col gap-3">
        <div
          className={cn(
            "flex items-center",
            isCollapsed ? "justify-center" : ""
          )}
        >
          <div className="h-8 w-8 rounded-full bg-blue-600 text-white shrink-0 shadow-sm flex items-center justify-center font-bold text-xs uppercase">
            {user?.fullName?.charAt(0) || "U"}
          </div>
          {!isCollapsed && (
            <div className="ml-3 truncate">
              <p className="text-sm font-semibold text-slate-800 truncate">
                {user?.fullName || "User"}
              </p>
              <p className="text-xs text-slate-500 truncate capitalize">
                {(userRole || "User").replace(/_/g, " ").toLowerCase()}
              </p>
            </div>
          )}
        </div>

        <button
          onClick={logout}
          className={cn(
            "flex items-center gap-3 text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all rounded-xl py-2 text-sm font-medium",
            isCollapsed ? "justify-center px-0" : "px-3"
          )}
          title="Logout"
        >
          <LogOut size={18} className="shrink-0" />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
