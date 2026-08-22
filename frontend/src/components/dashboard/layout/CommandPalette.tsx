"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  X,
  Layers,
  ShoppingBag,
  Users,
  Building,
  Sparkles,
  Ticket,
  ArrowRight,
  Clock,
  ExternalLink,
  Shield,
  Truck,
  UserCheck,
  Store,
  DollarSign,
  Settings,
  HelpCircle,
  FileText,
  Activity,
  QrCode,
  MapPin,
  Flame,
  CheckCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SearchItem {
  id: string;
  title: string;
  subtitle?: string;
  category: "navigation" | "orders" | "users" | "branches" | "services" | "tickets" | "actions";
  url: string;
  badge?: string;
  icon?: React.ReactNode;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  userRole?: string;
}

// ─── Predefined Role Navigation & Quick Actions ───────────────────────────────

const ROLE_NAVIGATION_MAP: Record<string, { title: string; subtitle: string; url: string; icon: string }[]> = {
  SUPER_ADMIN: [
    { title: "Super Admin Overview", subtitle: "Core platform metrics & KPIs", url: "/dashboard/overview", icon: "Activity" },
    { title: "Website CMS & Content", subtitle: "Edit homepage copy, heroes & sections", url: "/dashboard/website-cms/pages-content", icon: "Layers" },
    { title: "Promotions & Announcements", subtitle: "Marketing banners & maintenance notices", url: "/dashboard/website-cms/announcements", icon: "Sparkles" },
    { title: "Legal Documents & Policies", subtitle: "Terms, privacy & liability policies", url: "/dashboard/website-cms/legal-documents", icon: "FileText" },
    { title: "Financial Management", subtitle: "Revenue, payouts & platform ledger", url: "/dashboard/finance", icon: "DollarSign" },
    { title: "Payout Approvals", subtitle: "Vendor & agent withdrawal requests", url: "/dashboard/payout-approvals", icon: "CheckCircle" },
    { title: "Roles & Admin Access", subtitle: "Staff role permissions & privilege levels", url: "/dashboard/role-management/admin-access", icon: "Shield" },
    { title: "Services Catalog", subtitle: "Manage laundry service types & base prices", url: "/dashboard/services", icon: "Sparkles" },
    { title: "System Delivery Charges", subtitle: "Set city & express delivery pricing", url: "/dashboard/system-settings/delivery-charges", icon: "Truck" },
    { title: "Feature Flags", subtitle: "Toggle experimental features & maintenance", url: "/dashboard/system-settings/feature-flags", icon: "Settings" },
    { title: "Pricing & Tax Rules", subtitle: "Tax rates, VAT & invoice configurations", url: "/dashboard/system-settings/pricing-tax", icon: "DollarSign" },
    { title: "Audit Logs", subtitle: "Immutable system activity & access history", url: "/dashboard/audit-logs", icon: "Clock" },
    { title: "All User Records", subtitle: "Full directory of users & staff", url: "/dashboard/users", icon: "Users" },
    { title: "Partner Vendors", subtitle: "Registered third-party facilities", url: "/dashboard/vendors", icon: "Store" },
  ],
  ADMIN: [
    { title: "Admin Operations Overview", subtitle: "Live operational hub", url: "/dashboard/overview", icon: "Activity" },
    { title: "Live Orders Monitoring", subtitle: "Real-time orders queue & status", url: "/dashboard/customer-ops/live-orders", icon: "ShoppingBag" },
    { title: "Support Tickets", subtitle: "Customer & branch inquiries", url: "/dashboard/customer-ops/support-tickets", icon: "Ticket" },
    { title: "Wallet Transactions", subtitle: "Customer wallet recharges & refunds", url: "/dashboard/customer-ops/wallet-transactions", icon: "DollarSign" },
    { title: "Agent Live GPS Tracking", subtitle: "Fleet riders active on the map", url: "/dashboard/agent-ops/live-tracking", icon: "MapPin" },
    { title: "Agent Vehicle Status", subtitle: "Vans & bikes availability", url: "/dashboard/agent-ops/vehicle-status", icon: "Truck" },
    { title: "Branch Capacity Monitor", subtitle: "Machine loads & washing volume", url: "/dashboard/branch-ops/capacity-monitor", icon: "Activity" },
    { title: "Branch Inventory & Stock", subtitle: "Detergents, packaging & supplies", url: "/dashboard/branch-ops/inventory-stock", icon: "Layers" },
    { title: "Machinery Status", subtitle: "Washer & dry-clean maintenance", url: "/dashboard/branch-ops/machineries-status", icon: "Settings" },
    { title: "Branch Directory", subtitle: "Manage regional hub locations", url: "/dashboard/branches", icon: "Building" },
    { title: "Vendor Operations", subtitle: "Third-party processing capacity", url: "/dashboard/vendor-ops/capacity-monitor", icon: "Store" },
    { title: "Vendor Commission History", subtitle: "Settlements & earnings", url: "/dashboard/vendor-ops/commission-history", icon: "DollarSign" },
    { title: "Employee Tasks", subtitle: "Internal staff assignments", url: "/dashboard/employee-ops/tasks", icon: "Users" },
    { title: "Customer Reviews & Ratings", subtitle: "Ratings and feedback moderation", url: "/dashboard/customer-reviews", icon: "Sparkles" },
    { title: "Financial Analytics", subtitle: "Weekly, monthly revenue breakdowns", url: "/dashboard/financial-analytics", icon: "DollarSign" },
  ],
  BRANCH_MANAGER: [
    { title: "Branch Overview", subtitle: "Daily volume, capacity & active orders", url: "/dashboard/branch-overview", icon: "Activity" },
    { title: "Branch Orders Queue", subtitle: "Inbound, processing & outbound orders", url: "/dashboard/branch-orders", icon: "ShoppingBag" },
    { title: "Branch Delivery & Dispatch", subtitle: "Assign riders to ready deliveries", url: "/dashboard/branch-delivery", icon: "Truck" },
    { title: "Branch Inventory Stock", subtitle: "Supplies, hangers & packaging bags", url: "/dashboard/inventory", icon: "Layers" },
    { title: "Branch Employees", subtitle: "Staff shifts & attendance", url: "/dashboard/branch-employees", icon: "Users" },
    { title: "Partner Applications", subtitle: "Review new vendor partner requests", url: "/dashboard/partner-applications", icon: "Store" },
    { title: "Partner Vendors", subtitle: "Affiliated local facilities", url: "/dashboard/partner-vendors", icon: "Store" },
    { title: "Branch Analytics", subtitle: "Order speed & completion rates", url: "/dashboard/branch-analytics", icon: "Activity" },
  ],
  AGENT: [
    { title: "Today's Pickups", subtitle: "Garments waiting for doorstep collection", url: "/dashboard/pickups", icon: "ShoppingBag" },
    { title: "Active Deliveries", subtitle: "Clean clothes ready for customer dropoff", url: "/dashboard/deliveries", icon: "Truck" },
    { title: "Optimized Route Map", subtitle: "Fastest GPS route for today's tasks", url: "/dashboard/agent-routes", icon: "MapPin" },
    { title: "Trip & Delivery History", subtitle: "Completed tasks & commission earnings", url: "/dashboard/history", icon: "Clock" },
    { title: "Agent Verification", subtitle: "NID, license & profile status", url: "/dashboard/verification", icon: "UserCheck" },
  ],
  EMPLOYEE: [
    { title: "Order Intake", subtitle: "Receive and tag clothes upon branch arrival", url: "/dashboard/intake-orders", icon: "ShoppingBag" },
    { title: "QR Code Scanner", subtitle: "Scan garment QR tags for instant status", url: "/dashboard/scanner", icon: "QrCode" },
    { title: "Garment Status Queue", subtitle: "Washing, drying, ironing & quality check", url: "/dashboard/garment-status", icon: "Layers" },
  ],
  VENDOR: [
    { title: "Vendor Orders Queue", subtitle: "Orders assigned to your facility", url: "/dashboard/vendor-orders", icon: "ShoppingBag" },
    { title: "Processing Status", subtitle: "Update garment batch completion", url: "/dashboard/processing-status", icon: "Layers" },
    { title: "Capacity Monitor", subtitle: "Set maximum daily kg / item limit", url: "/dashboard/capacity-monitor", icon: "Activity" },
    { title: "Commission & Payouts", subtitle: "Weekly settlement history", url: "/dashboard/commission-history", icon: "DollarSign" },
  ],
  CUSTOMER: [
    { title: "My Orders & History", subtitle: "Track live status & past receipts", url: "/dashboard/my-orders", icon: "ShoppingBag" },
    { title: "Track Active Orders", subtitle: "Live step-by-step progress & rider GPS", url: "/dashboard/track-orders", icon: "MapPin" },
    { title: "Book Laundry Services", subtitle: "Schedule doorstep pickup in 60s", url: "/dashboard/book-services", icon: "Sparkles" },
    { title: "Laundrix Wallet", subtitle: "Recharge balance, loyalty points & cashbacks", url: "/dashboard/wallet", icon: "DollarSign" },
    { title: "Help Desk & Support", subtitle: "Chat with customer care team", url: "/dashboard/help-desk", icon: "HelpCircle" },
    { title: "My Service Reviews", subtitle: "Rate garments care & riders", url: "/dashboard/my-reviews", icon: "Sparkles" },
    { title: "Saved Wishlist & Items", subtitle: "Favorite services & quick reorder", url: "/dashboard/wishlist", icon: "Layers" },
  ],
};

const ROLE_ACTIONS_MAP: Record<string, { title: string; subtitle: string; url: string; badge?: string }[]> = {
  SUPER_ADMIN: [
    { title: "Create New Announcement", subtitle: "Publish a promo or notice", url: "/dashboard/website-cms/announcements", badge: "Action" },
    { title: "Update Delivery Surcharge", subtitle: "Adjust citywide rates", url: "/dashboard/system-settings/delivery-charges", badge: "Action" },
    { title: "Add Legal Policy Document", subtitle: "Draft terms or compliance update", url: "/dashboard/website-cms/legal-documents", badge: "Action" },
    { title: "Review Payout Approvals", subtitle: "Process pending withdrawals", url: "/dashboard/payout-approvals", badge: "Finance" },
  ],
  ADMIN: [
    { title: "View Live Orders Feed", subtitle: "Monitor real-time customer bookings", url: "/dashboard/customer-ops/live-orders", badge: "Ops" },
    { title: "Open Support Tickets Queue", subtitle: "Resolve customer issues", url: "/dashboard/customer-ops/support-tickets", badge: "Support" },
    { title: "Check Branch Capacity Limits", subtitle: "Prevent facility overflow", url: "/dashboard/branch-ops/capacity-monitor", badge: "Ops" },
    { title: "Inspect Fleet Vehicles", subtitle: "Check bike/van readiness", url: "/dashboard/agent-ops/vehicle-status", badge: "Fleet" },
  ],
  BRANCH_MANAGER: [
    { title: "Scan Garment QR Code", subtitle: "Tag or inspect arriving clothes", url: "/dashboard/scanner", badge: "QR" },
    { title: "Assign Rider to Delivery", subtitle: "Dispatch completed orders", url: "/dashboard/branch-delivery", badge: "Dispatch" },
    { title: "Update Detergent & Stock", subtitle: "Record incoming supplies", url: "/dashboard/inventory", badge: "Stock" },
  ],
  AGENT: [
    { title: "Start Next Pickup Route", subtitle: "Navigate to closest customer", url: "/dashboard/agent-routes", badge: "GPS" },
    { title: "Complete Delivery Dropoff", subtitle: "Collect signature/payment", url: "/dashboard/deliveries", badge: "Task" },
  ],
  CUSTOMER: [
    { title: "Book a New Laundry Pickup", subtitle: "Schedule collection in 60 secs", url: "/dashboard/book-services", badge: "Book" },
    { title: "Recharge Wallet Balance", subtitle: "Add funds via bKash / Card", url: "/dashboard/wallet", badge: "Wallet" },
    { title: "Open New Support Ticket", subtitle: "Get instant assistance", url: "/dashboard/help-desk", badge: "Support" },
  ],
};

function renderNavIcon(name: string) {
  switch (name) {
    case "Activity": return <Activity size={14} className="text-blue-500" />;
    case "ShoppingBag": return <ShoppingBag size={14} className="text-indigo-500" />;
    case "Layers": return <Layers size={14} className="text-violet-500" />;
    case "Sparkles": return <Sparkles size={14} className="text-amber-500" />;
    case "FileText": return <FileText size={14} className="text-slate-500" />;
    case "DollarSign": return <DollarSign size={14} className="text-emerald-500" />;
    case "Shield": return <Shield size={14} className="text-blue-600" />;
    case "Truck": return <Truck size={14} className="text-orange-500" />;
    case "Settings": return <Settings size={14} className="text-slate-600" />;
    case "Clock": return <Clock size={14} className="text-purple-500" />;
    case "Users": return <Users size={14} className="text-teal-500" />;
    case "Store": return <Store size={14} className="text-amber-600" />;
    case "Building": return <Building size={14} className="text-cyan-600" />;
    case "Ticket": return <Ticket size={14} className="text-rose-500" />;
    case "MapPin": return <MapPin size={14} className="text-red-500" />;
    case "UserCheck": return <UserCheck size={14} className="text-emerald-600" />;
    case "QrCode": return <QrCode size={14} className="text-blue-600" />;
    case "HelpCircle": return <HelpCircle size={14} className="text-blue-500" />;
    default: return <ArrowRight size={14} className="text-slate-400" />;
  }
}

// ─── Main Command Palette ─────────────────────────────────────────────────────

export function CommandPalette({ isOpen, onClose, userRole = "CUSTOMER" }: CommandPaletteProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Live backend results
  const [liveResults, setLiveResults] = useState<{
    orders: SearchItem[];
    users: SearchItem[];
    branches: SearchItem[];
    services: SearchItem[];
    tickets: SearchItem[];
  }>({
    orders: [],
    users: [],
    branches: [],
    services: [],
    tickets: [],
  });
  const [loadingLive, setLoadingLive] = useState(false);

  // Recent Searches
  const [recentSearches, setRecentSearches] = useState<{ query: string; url: string; title: string }[]>([]);

  // Load recent searches on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("laundrix_recent_searches");
      if (stored) {
        setRecentSearches(JSON.parse(stored).slice(0, 5));
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  const saveRecentSearch = (item: { query?: string; url: string; title: string }) => {
    try {
      const existing = recentSearches.filter((r) => r.url !== item.url);
      const updated = [{ query: item.query || item.title, url: item.url, title: item.title }, ...existing].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem("laundrix_recent_searches", JSON.stringify(updated));
    } catch {
      // Ignore
    }
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem("laundrix_recent_searches");
  };

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSearch("");
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Static items for role
  const normalizedRole = (userRole || "CUSTOMER").toUpperCase().replace(/\s+/g, "_");
  const navList = ROLE_NAVIGATION_MAP[normalizedRole] || ROLE_NAVIGATION_MAP.CUSTOMER;
  const actionsList = ROLE_ACTIONS_MAP[normalizedRole] || ROLE_ACTIONS_MAP.CUSTOMER;

  // Debounced API search
  useEffect(() => {
    if (!isOpen || search.trim().length < 2) {
      setLiveResults({ orders: [], users: [], branches: [], services: [], tickets: [] });
      setLoadingLive(false);
      return;
    }

    setLoadingLive(true);
    const controller = new AbortController();

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/dashboard/search?q=${encodeURIComponent(search.trim())}&role=${normalizedRole}`, {
          signal: controller.signal,
        });
        const json = await res.json();
        if (json.success && json.data) {
          setLiveResults({
            orders: (json.data.orders || []).map((o: any) => ({ ...o, category: "orders" })),
            users: (json.data.users || []).map((u: any) => ({ ...u, category: "users" })),
            branches: (json.data.branches || []).map((b: any) => ({ ...b, category: "branches" })),
            services: (json.data.services || []).map((s: any) => ({ ...s, category: "services" })),
            tickets: (json.data.tickets || []).map((t: any) => ({ ...t, category: "tickets" })),
          });
        }
      } catch (err: any) {
        if (err.name !== "AbortError") {
          console.error("Search fetch error:", err);
        }
      } finally {
        setLoadingLive(false);
      }
    }, 220);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [search, isOpen, normalizedRole]);

  // Filter static navigation & actions
  const filteredNavItems = useMemo<SearchItem[]>(() => {
    const q = search.toLowerCase().trim();
    if (!q) return navList.map((n, i) => ({ id: `nav-${i}`, ...n, category: "navigation" }));
    return navList
      .filter((n) => n.title.toLowerCase().includes(q) || n.subtitle.toLowerCase().includes(q))
      .map((n, i) => ({ id: `nav-${i}`, ...n, category: "navigation" }));
  }, [search, navList]);

  const filteredActionItems = useMemo<SearchItem[]>(() => {
    const q = search.toLowerCase().trim();
    if (!q) return actionsList.map((a, i) => ({ id: `act-${i}`, ...a, category: "actions" }));
    return actionsList
      .filter((a) => a.title.toLowerCase().includes(q) || a.subtitle.toLowerCase().includes(q))
      .map((a, i) => ({ id: `act-${i}`, ...a, category: "actions" }));
  }, [search, actionsList]);

  // Combine results based on activeCategory
  const combinedItems = useMemo<SearchItem[]>(() => {
    let list: SearchItem[] = [];

    if (activeCategory === "ALL" || activeCategory === "ACTIONS") {
      list = [...list, ...filteredActionItems];
    }
    if (activeCategory === "ALL" || activeCategory === "NAVIGATION") {
      list = [...list, ...filteredNavItems];
    }
    if (activeCategory === "ALL" || activeCategory === "ORDERS") {
      list = [...list, ...liveResults.orders];
    }
    if (activeCategory === "ALL" || activeCategory === "USERS") {
      list = [...list, ...liveResults.users];
    }
    if (activeCategory === "ALL" || activeCategory === "BRANCHES") {
      list = [...list, ...liveResults.branches, ...liveResults.services];
    }
    if (activeCategory === "ALL" || activeCategory === "TICKETS") {
      list = [...list, ...liveResults.tickets];
    }

    return list;
  }, [activeCategory, filteredActionItems, filteredNavItems, liveResults]);

  // Reset selected index when items change
  useEffect(() => {
    setSelectedIndex(0);
  }, [combinedItems]);

  const handleSelect = useCallback(
    (item: SearchItem) => {
      saveRecentSearch({ title: item.title, url: item.url, query: search });
      onClose();
      router.push(item.url);
    },
    [router, onClose, search]
  );

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < combinedItems.length - 1 ? prev + 1 : 0));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : combinedItems.length - 1));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (combinedItems[selectedIndex]) {
          handleSelect(combinedItems[selectedIndex]);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, combinedItems, selectedIndex, handleSelect, onClose]);

  if (!isOpen) return null;

  const CATEGORY_TABS = [
    { key: "ALL", label: "All" },
    { key: "NAVIGATION", label: "Pages" },
    { key: "ORDERS", label: "Orders" },
    { key: "USERS", label: "Users" },
    { key: "BRANCHES", label: "Branches" },
    { key: "ACTIONS", label: "Actions" },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-20 px-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -10 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[80vh] z-10"
        >
          {/* Top Search Input Bar */}
          <div className="flex items-center px-4 py-3.5 border-b border-slate-100 bg-slate-50/70 gap-3">
            <Search size={18} className="text-slate-400 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search ${normalizedRole.toLowerCase().replace("_", " ")} dashboard, orders, users, pages...`}
              className="flex-1 bg-transparent text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-full transition"
              >
                <X size={14} />
              </button>
            )}
            <div className="flex items-center gap-1.5 shrink-0 pl-2 border-l border-slate-200">
              <span className="text-[10px] font-black font-mono uppercase bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md">
                {normalizedRole.replace("_", " ")}
              </span>
              <button
                onClick={onClose}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex items-center gap-1.5 px-4 py-2 border-b border-slate-100 bg-white overflow-x-auto scrollbar-none">
            {CATEGORY_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveCategory(tab.key)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  activeCategory === tab.key
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                }`}
              >
                {tab.label}
              </button>
            ))}

            {loadingLive && (
              <div className="ml-auto flex items-center gap-1.5 text-[11px] font-semibold text-blue-600 shrink-0">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
                Searching live database…
              </div>
            )}
          </div>

          {/* Results Scroll Container */}
          <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-3 space-y-4">
            
            {/* When search is empty: Show Recent Searches if available */}
            {!search.trim() && recentSearches.length > 0 && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between px-2 text-[10px] font-black uppercase tracking-wider text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock size={11} /> Recent Searches
                  </span>
                  <button onClick={clearRecentSearches} className="text-slate-400 hover:text-red-500 transition">
                    Clear History
                  </button>
                </div>
                <div className="space-y-1">
                  {recentSearches.map((rec, rIdx) => (
                    <div
                      key={rIdx}
                      onClick={() => {
                        onClose();
                        router.push(rec.url);
                      }}
                      className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-blue-50/60 hover:text-blue-600 cursor-pointer transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <Clock size={13} className="text-slate-400" />
                        {rec.title}
                      </span>
                      <ExternalLink size={12} className="text-slate-400" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Main Categorized Items List */}
            {combinedItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400">
                <Search size={28} className="text-slate-300 mb-2" />
                <p className="text-sm font-bold text-slate-700">No results found for &ldquo;{search}&rdquo;</p>
                <p className="text-xs text-slate-400 mt-1">Try checking for spelling errors or searching another keyword.</p>
              </div>
            ) : (
              <div className="space-y-1">
                {combinedItems.map((item, index) => {
                  const isSelected = selectedIndex === index;

                  return (
                    <div
                      key={item.id}
                      onClick={() => handleSelect(item)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl cursor-pointer transition-all ${
                        isSelected
                          ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm"
                          : "hover:bg-slate-50 text-slate-800"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                            isSelected ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {item.icon || renderNavIcon((item as any).icon || item.category)}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p
                              className={`text-xs font-black truncate ${
                                isSelected ? "text-white" : "text-slate-800"
                              }`}
                            >
                              {item.title}
                            </p>
                            {item.badge && (
                              <span
                                className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md ${
                                  isSelected
                                    ? "bg-white/20 text-white"
                                    : "bg-slate-100 text-slate-500 border border-slate-200"
                                }`}
                              >
                                {item.badge}
                              </span>
                            )}
                          </div>
                          {item.subtitle && (
                            <p
                              className={`text-[11px] truncate ${
                                isSelected ? "text-blue-100" : "text-slate-500"
                              }`}
                            >
                              {item.subtitle}
                            </p>
                          )}
                        </div>
                      </div>

                      <ArrowRight
                        size={14}
                        className={`shrink-0 ml-2 transition-transform ${
                          isSelected ? "text-white translate-x-1" : "text-slate-300"
                        }`}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer Shortcuts Guide */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-500">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-mono shadow-2xs">↑</kbd>
                <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-mono shadow-2xs">↓</kbd>
                to navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-mono shadow-2xs">↵</kbd>
                to select
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-mono shadow-2xs">esc</kbd>
                to close
              </span>
            </div>

            <span className="text-[10px] font-semibold text-slate-400">Laundrix Spotlight v2.0</span>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
