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
  const [openMenu,setOpenMenu]=React.useState<string | null>(null);
  const { user, logout } = useAuth();

  React.useEffect(() => {
    dashboardNavItems.forEach((item) => {
      if (
        item.children?.some(
          (child) =>
            pathname === child.href ||
            pathname.startsWith(`${child.href}/`)
        )
      ) {
        setOpenMenu(item.name);
      }
    });
  }, [pathname]);
    return (
    <aside
      className={cn(
        "relative flex flex-col h-screen bg-white/10 backdrop-blur-xl border-r border-white/20 shadow-[4px_0_24px_rgba(0,0,0,0.02)] transition-all duration-300 ease-in-out z-20",
        isCollapsed ? "w-20" : "w-64",
      )}
    >
      <div className="flex items-center justify-between h-16 px-4 border-b border-white/20">
        {!isCollapsed && (
          <Link href="/" className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600 text-white">
              <ShoppingBag size={16} />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              LAUNDRIX
            </span>
          </Link>
        )}
        {isCollapsed && (
          <div className="mx-auto text-indigo-500">
            <Menu size={24} />
          </div>
        )}
      </div>

      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-20 flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500 text-white shadow-md hover:bg-indigo-600 transition-colors z-30"
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-2">
        {
          dashboardNavItems
            .filter(item => !item.roles || (user && item.roles.includes(user.userType?.toUpperCase().replace(' ', '_'))))
            .map((item)=>{
            const hasChildren = item.children;
            const isParentActive =
              hasChildren &&
              item.children?.some(
                (child) =>
                  pathname === child.href || (child.href && pathname.startsWith(`${child.href}/`))
              );

              const isActive =
                item.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname === item.href ||
                    pathname.startsWith(`${item.href}/`);

            
            return (

              <div key={item.name}>
                {
                  hasChildren ? (
                    <button
                      onClick={() =>
                        setOpenMenu(openMenu === item.name ? null : item.name)
                      }
                      className={cn(
                        "flex items-center w-full px-3 py-3 rounded-xl transition-all",
                        isParentActive || openMenu === item.name
                          ? "bg-indigo-500/10 text-indigo-600"
                          : "text-slate-600 hover:bg-white/40"
                      )}
                    >
                      <item.icon size={20} />

                      {!isCollapsed && (
                        <>
                          <span className="ml-3 flex-1 text-left">
                            {item.name}
                          </span>

                          <ChevronDown
                            size={18}
                            className={cn(
                              "transition-transform duration-300",
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
                        "flex items-center px-3 py-3 rounded-xl transition-all",
                        isActive
                          ? "bg-indigo-500/10 text-indigo-600"
                          : "text-slate-600 hover:bg-white/40"
                      )}
                    >
                      <item.icon size={20} />

                      {!isCollapsed && (
                        <span className="ml-3">
                          {item.name}
                        </span>
                      )}
                    </Link>
                  )
                }
                {
                  openMenu===item.name && !isCollapsed && (
                    <div className="ml-8 mt-2 space-y-2">
                    {
                      item.children?.filter(child => !child.roles || (user && child.roles.includes(user.userType?.toUpperCase().replace(' ', '_')))).map(child=>(
                      <Link
                        key={child.name}
                        href={child.href || "#"}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all",
                          pathname === child.href || (child.href && pathname.startsWith(`${child.href}/`))
                            ? "bg-indigo-500/10 text-indigo-600"
                          : "text-slate-600 hover:bg-white/40"
                        )}
                      >
                      <child.icon size={16}/>
                      {child.name}
                      </Link>
                      ))
                      }
                      </div>
                  )
                }
              </div>
            )
        })}
      </nav>

      <div className="p-4 border-t border-white/20 flex flex-col gap-4">
        <div
          className={cn(
            "flex items-center",
            isCollapsed ? "justify-center" : "",
          )}
        >
          <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-400 to-purple-400 shrink-0 border-2 border-white shadow-sm flex items-center justify-center text-white font-bold text-xs uppercase">
            {user?.fullName?.charAt(0) || "U"}
          </div>
          {!isCollapsed && (
            <div className="ml-3 truncate">
              <p className="text-sm font-medium text-slate-700 truncate">
                {user?.fullName || "User"}
              </p>
              <p className="text-xs text-slate-500 truncate">
                {user?.email || user?.userType || "No role"}
              </p>
            </div>
          )}
        </div>
        
        <button 
          onClick={logout}
          className={cn(
            "flex items-center gap-3 text-slate-500 hover:text-red-500 hover:bg-red-50 transition-all rounded-xl py-2",
            isCollapsed ? "justify-center px-0" : "px-3"
          )}
          title="Logout"
        >
          <LogOut size={20} className="shrink-0" />
          {!isCollapsed && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>
    </aside>
  );
}
