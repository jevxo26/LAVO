"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Menu, ChevronDown  } from "lucide-react";
import { dashboardNavItems } from "@/data/dashboardNav";

interface SidebarProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

export function Sidebar({ isCollapsed, toggleSidebar }: SidebarProps) {
  const pathname = usePathname();
  const [openMenu,setOpenMenu]=React.useState<string | null>(null);

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
          <span className="text-xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent truncate">
            AdminPanel
          </span>
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
          dashboardNavItems.map((item)=>{
            const hasChildren = item.children;
            const isParentActive =
              hasChildren &&
              item.children.some(
                (child) =>
                  pathname === child.href || pathname.startsWith(`${child.href}/`)
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
                      href={item.href}
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
                      item.children?.map(child=>(
                      <Link
                        key={child.name}
                        href={child.href}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all",
                          pathname === child.href || pathname.startsWith(`${child.href}/`)
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

      <div className="p-4 border-t border-white/20">
        <div
          className={cn(
            "flex items-center",
            isCollapsed ? "justify-center" : "",
          )}
        >
          <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-400 to-purple-400 shrink-0 border-2 border-white shadow-sm flex items-center justify-center text-white font-bold text-xs">
            JD
          </div>
          {!isCollapsed && (
            <div className="ml-3 truncate">
              <p className="text-sm font-medium text-slate-700 truncate">
                John Doe
              </p>
              <p className="text-xs text-slate-500 truncate">
                admin@example.com
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
