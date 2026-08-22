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
  CheckCircle,
  Globe,
  Sliders,
  Wrench,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SearchItem {
  id: string;
  title: string;
  subtitle?: string;
  category: "navigation" | "orders" | "users" | "branches" | "services" | "tickets" | "actions" | "public";
  url: string;
  badge?: string;
  icon?: React.ReactNode;
}

interface NavbarSearchProps {
  userRole?: string;
  onSearchChange?: (val: string) => void;
}

// ─── Dynamic Icon Resolver ───────────────────────────────────────────────────

function getNavIcon(iconName?: string): React.ReactNode {
  switch (iconName) {
    case "Activity": return <Activity size={14} className="text-blue-500 shrink-0" />;
    case "ShoppingBag": return <ShoppingBag size={14} className="text-indigo-500 shrink-0" />;
    case "Layers": return <Layers size={14} className="text-violet-500 shrink-0" />;
    case "Sparkles": return <Sparkles size={14} className="text-amber-500 shrink-0" />;
    case "FileText": return <FileText size={14} className="text-slate-500 shrink-0" />;
    case "DollarSign": return <DollarSign size={14} className="text-emerald-500 shrink-0" />;
    case "Shield": return <Shield size={14} className="text-blue-600 shrink-0" />;
    case "Truck": return <Truck size={14} className="text-orange-500 shrink-0" />;
    case "Settings": return <Settings size={14} className="text-slate-600 shrink-0" />;
    case "Clock": return <Clock size={14} className="text-purple-500 shrink-0" />;
    case "Users": return <Users size={14} className="text-teal-500 shrink-0" />;
    case "Store": return <Store size={14} className="text-amber-600 shrink-0" />;
    case "Building": return <Building size={14} className="text-cyan-600 shrink-0" />;
    case "Ticket": return <Ticket size={14} className="text-rose-500 shrink-0" />;
    case "MapPin": return <MapPin size={14} className="text-red-500 shrink-0" />;
    case "UserCheck": return <UserCheck size={14} className="text-emerald-600 shrink-0" />;
    case "QrCode": return <QrCode size={14} className="text-blue-600 shrink-0" />;
    case "HelpCircle": return <HelpCircle size={14} className="text-blue-500 shrink-0" />;
    case "Globe": return <Globe size={14} className="text-sky-500 shrink-0" />;
    case "Sliders": return <Sliders size={14} className="text-indigo-600 shrink-0" />;
    case "Wrench": return <Wrench size={14} className="text-slate-600 shrink-0" />;
    default: return <ArrowRight size={14} className="text-slate-400 shrink-0" />;
  }
}

// ─── 100% Comprehensive All-Role Routes Matrix ────────────────────────────────

const ALL_ROLE_ROUTES: Record<string, { title: string; subtitle: string; url: string; icon: string }[]> = {
  SUPER_ADMIN: [
    { title: "Super Admin Overview", subtitle: "Platform statistics & core operational metrics", url: "/dashboard/overview", icon: "Activity" },
    { title: "Website CMS — Pages Content", subtitle: "Edit public landing pages, copy & heroes", url: "/dashboard/website-cms/pages-content", icon: "Layers" },
    { title: "Website CMS — Announcements", subtitle: "Publish promotional banners & alerts", url: "/dashboard/website-cms/announcements", icon: "Sparkles" },
    { title: "Website CMS — Legal Documents", subtitle: "Manage Terms of Service, Privacy Policy", url: "/dashboard/website-cms/legal-documents", icon: "FileText" },
    { title: "CMS Content Studio (Legacy)", subtitle: "Content management studio view", url: "/dashboard/cms", icon: "Layers" },
    { title: "Financial Management", subtitle: "Platform ledger, revenue & payout balances", url: "/dashboard/finance", icon: "DollarSign" },
    { title: "Payout Approvals", subtitle: "Authorize vendor & agent withdrawal requests", url: "/dashboard/payout-approvals", icon: "CheckCircle" },
    { title: "Role Management & Admin Access", subtitle: "Manage staff privilege levels & admin roles", url: "/dashboard/role-management/admin-access", icon: "Shield" },
    { title: "Permissions Matrix", subtitle: "Granular access control & role permissions", url: "/dashboard/permissions", icon: "Shield" },
    { title: "Roles Directory", subtitle: "List of system roles and security profiles", url: "/dashboard/roles", icon: "Users" },
    { title: "Services Catalog", subtitle: "Manage laundry service types, pricings & categories", url: "/dashboard/services", icon: "Sparkles" },
    { title: "System Delivery Charges", subtitle: "Set base, express & citywide delivery rates", url: "/dashboard/system-settings/delivery-charges", icon: "Truck" },
    { title: "Feature Flags", subtitle: "Toggle experimental features & system modules", url: "/dashboard/system-settings/feature-flags", icon: "Settings" },
    { title: "Financial Rules", subtitle: "Tax rates, VAT rules & automated commissions", url: "/dashboard/system-settings/financial-rules", icon: "DollarSign" },
    { title: "Pricing & Tax Configuration", subtitle: "System tax rules & service invoice setup", url: "/dashboard/system-settings/pricing-tax", icon: "Sliders" },
    { title: "All Users Directory", subtitle: "Master record of customers, staff & admins", url: "/dashboard/users", icon: "Users" },
    { title: "Partner Vendors Directory", subtitle: "Authorized laundry vendors & facilities", url: "/dashboard/vendors", icon: "Store" },
    { title: "System Audit Logs", subtitle: "Immutable security trail & admin actions log", url: "/dashboard/audit-logs", icon: "Clock" },
    { title: "My Profile", subtitle: "Admin account settings & credentials", url: "/dashboard/profile", icon: "UserCheck" },
    { title: "System Settings", subtitle: "Account preferences & notification rules", url: "/dashboard/settings", icon: "Settings" },
  ],
  ADMIN: [
    { title: "Admin Operations Overview", subtitle: "Daily operational hub & live statistics", url: "/dashboard/overview", icon: "Activity" },
    { title: "Live Orders Monitoring", subtitle: "Real-time order processing feed & statuses", url: "/dashboard/customer-ops/live-orders", icon: "ShoppingBag" },
    { title: "Customer Support Tickets", subtitle: "Inbound customer issues & resolution queue", url: "/dashboard/customer-ops/support-tickets", icon: "Ticket" },
    { title: "Wallet Transactions", subtitle: "Customer wallet recharges, refunds & debits", url: "/dashboard/customer-ops/wallet-transactions", icon: "DollarSign" },
    { title: "Agent Live GPS Tracking", subtitle: "Real-time interactive rider location map", url: "/dashboard/agent-ops/live-tracking", icon: "MapPin" },
    { title: "Agent Vehicle Fleet Status", subtitle: "Delivery vans, motorbikes & availability", url: "/dashboard/agent-ops/vehicle-status", icon: "Truck" },
    { title: "Branch Capacity Monitor", subtitle: "Washing load monitoring & facility volume", url: "/dashboard/branch-ops/capacity-monitor", icon: "Activity" },
    { title: "Branch Inventory & Stock", subtitle: "Detergents, packaging bags & supplies", url: "/dashboard/branch-ops/inventory-stock", icon: "Layers" },
    { title: "Machinery Status", subtitle: "Commercial washing & dry-clean maintenance", url: "/dashboard/branch-ops/machineries-status", icon: "Wrench" },
    { title: "Branch Locations Directory", subtitle: "Regional collection & processing hubs", url: "/dashboard/branches", icon: "Building" },
    { title: "Vendor Capacity Monitor", subtitle: "Third-party partner capacity & throughput", url: "/dashboard/vendor-ops/capacity-monitor", icon: "Store" },
    { title: "Vendor Commission History", subtitle: "Vendor settlement reports & commission logs", url: "/dashboard/vendor-ops/commission-history", icon: "DollarSign" },
    { title: "Vendor Processing Status", subtitle: "Partner facility garment batch updates", url: "/dashboard/vendor-ops/processing-status", icon: "Layers" },
    { title: "Employee Tasks", subtitle: "Staff daily task assignments & status", url: "/dashboard/employee-ops/tasks", icon: "Users" },
    { title: "Employee Work Updates", subtitle: "Daily shift logs & processing updates", url: "/dashboard/employee-ops/work-updates", icon: "Clock" },
    { title: "Customer Reviews & Moderation", subtitle: "Customer ratings & feedback review", url: "/dashboard/customer-reviews", icon: "Sparkles" },
    { title: "Financial Analytics", subtitle: "Revenue charts, profit margins & growth", url: "/dashboard/financial-analytics", icon: "DollarSign" },
    { title: "Operations Analytics", subtitle: "Turnaround time, SLAs & order fulfillment", url: "/dashboard/analytics", icon: "Activity" },
    { title: "Logistics Management", subtitle: "Dispatch routing & logistics control", url: "/dashboard/logistics", icon: "Truck" },
    { title: "Support Helpdesk", subtitle: "Internal support ticketing system", url: "/dashboard/support", icon: "HelpCircle" },
    { title: "User Management — Customers", subtitle: "Customer profiles & contact history", url: "/dashboard/user-management/customers", icon: "Users" },
    { title: "User Management — Agents", subtitle: "Delivery riders & pickup agents", url: "/dashboard/user-management/agents", icon: "Truck" },
    { title: "User Management — Branch Managers", subtitle: "Branch management personnel", url: "/dashboard/user-management/branch-managers", icon: "Building" },
    { title: "User Management — Employees", subtitle: "Internal facility & floor staff", url: "/dashboard/user-management/employees", icon: "Users" },
    { title: "User Management — Vendors", subtitle: "Partner laundry businesses", url: "/dashboard/user-management/vendors", icon: "Store" },
    { title: "My Profile", subtitle: "Personal settings & credentials", url: "/dashboard/profile", icon: "UserCheck" },
    { title: "Account Settings", subtitle: "Preferences & system configuration", url: "/dashboard/settings", icon: "Settings" },
  ],
  BRANCH_MANAGER: [
    { title: "Branch Overview", subtitle: "Today's volume, active orders & capacity", url: "/dashboard/branch-overview", icon: "Activity" },
    { title: "Branch Orders Queue", subtitle: "Inbound pickup, washing & ready orders", url: "/dashboard/branch-orders", icon: "ShoppingBag" },
    { title: "Branch Delivery Dispatch", subtitle: "Assign available delivery agents", url: "/dashboard/branch-delivery", icon: "Truck" },
    { title: "Branch Inventory & Stock", subtitle: "Detergents, packaging & supplies", url: "/dashboard/inventory", icon: "Layers" },
    { title: "Branch Employees", subtitle: "Staff roster, shifts & attendance", url: "/dashboard/branch-employees", icon: "Users" },
    { title: "Partner Applications", subtitle: "Review new vendor partner inquiries", url: "/dashboard/partner-applications", icon: "Store" },
    { title: "Partner Vendors", subtitle: "Affiliated local processing hubs", url: "/dashboard/partner-vendors", icon: "Store" },
    { title: "Branch Analytics", subtitle: "Speed of service, revenue & daily orders", url: "/dashboard/branch-analytics", icon: "Activity" },
    { title: "My Profile", subtitle: "Manager details & branch assignment", url: "/dashboard/profile", icon: "UserCheck" },
    { title: "Branch Settings", subtitle: "Notifications & shift settings", url: "/dashboard/settings", icon: "Settings" },
  ],
  AGENT: [
    { title: "Today's Pickups", subtitle: "Garments scheduled for doorstep pickup", url: "/dashboard/pickups", icon: "ShoppingBag" },
    { title: "Active Deliveries", subtitle: "Clean clothes ready for customer dropoff", url: "/dashboard/deliveries", icon: "Truck" },
    { title: "Optimized Route Map", subtitle: "Fastest GPS navigation for tasks", url: "/dashboard/agent-routes", icon: "MapPin" },
    { title: "Trip & Delivery History", subtitle: "Completed tasks & commission earnings", url: "/dashboard/history", icon: "Clock" },
    { title: "Agent Verification", subtitle: "NID, driving license & vehicle docs", url: "/dashboard/verification", icon: "UserCheck" },
    { title: "My Profile", subtitle: "Agent profile & payout account", url: "/dashboard/profile", icon: "UserCheck" },
    { title: "App Settings", subtitle: "GPS & notification preferences", url: "/dashboard/settings", icon: "Settings" },
  ],
  VENDOR: [
    { title: "Vendor Orders Queue", subtitle: "Orders allocated to your facility", url: "/dashboard/vendor-orders", icon: "ShoppingBag" },
    { title: "Processing Services", subtitle: "Garment batch statuses & services", url: "/dashboard/vendor-services", icon: "Layers" },
    { title: "Daily Capacity Monitor", subtitle: "Set maximum processing limit", url: "/dashboard/vendor-capacity", icon: "Activity" },
    { title: "Vendor Employees", subtitle: "Facility staff & workers roster", url: "/dashboard/vendor-employees", icon: "Users" },
    { title: "Payout Requests", subtitle: "Request weekly earnings withdrawal", url: "/dashboard/payouts", icon: "DollarSign" },
    { title: "Vendor Wallet", subtitle: "Commission balance & financial ledger", url: "/dashboard/vendor-wallet", icon: "DollarSign" },
    { title: "Performance Metrics", subtitle: "On-time completion & quality score", url: "/dashboard/performance", icon: "Sparkles" },
    { title: "Vendor Profile", subtitle: "Trade license & business details", url: "/dashboard/profile", icon: "Store" },
    { title: "Settings", subtitle: "Notification & account preferences", url: "/dashboard/settings", icon: "Settings" },
  ],
  EMPLOYEE: [
    { title: "Order Intake", subtitle: "Receive and register clothes upon branch arrival", url: "/dashboard/intake-orders", icon: "ShoppingBag" },
    { title: "QR Code Scanner", subtitle: "Scan garment QR tags for instant status", url: "/dashboard/scanner", icon: "QrCode" },
    { title: "My Profile", subtitle: "Employee profile & shift schedule", url: "/dashboard/profile", icon: "UserCheck" },
    { title: "Settings", subtitle: "Account preferences", url: "/dashboard/settings", icon: "Settings" },
  ],
  CUSTOMER: [
    { title: "My Orders & Receipts", subtitle: "Track live status & past digital receipts", url: "/dashboard/my-orders", icon: "ShoppingBag" },
    { title: "Track Active Orders", subtitle: "Real-time QR garment timeline & rider GPS", url: "/dashboard/track-orders", icon: "MapPin" },
    { title: "Book Laundry Services", subtitle: "Schedule doorstep pickup in 60 seconds", url: "/dashboard/book-services", icon: "Sparkles" },
    { title: "Laundrix Wallet", subtitle: "Recharge balance, loyalty points & cashbacks", url: "/dashboard/wallet", icon: "DollarSign" },
    { title: "Help Desk & Support", subtitle: "Chat with customer support team", url: "/dashboard/help-desk", icon: "HelpCircle" },
    { title: "My Service Reviews", subtitle: "Rate garment care, iron quality & riders", url: "/dashboard/my-reviews", icon: "Sparkles" },
    { title: "Saved Wishlist & Reorder", subtitle: "Favorite services & quick 1-click reorder", url: "/dashboard/wishlist", icon: "Layers" },
    { title: "My Profile & Addresses", subtitle: "Manage saved delivery addresses & phone", url: "/dashboard/profile", icon: "UserCheck" },
    { title: "Preferences & Settings", subtitle: "Notification alerts & language", url: "/dashboard/settings", icon: "Settings" },
  ],
};

const PUBLIC_PAGES: { title: string; subtitle: string; url: string; icon: string }[] = [
  { title: "Laundrix Homepage", subtitle: "Public landing page & feature showcase", url: "/", icon: "Globe" },
  { title: "Services Catalog", subtitle: "Wash & fold, dry cleaning, steam iron pricing", url: "/services", icon: "Sparkles" },
  { title: "Pricing & Calculator", subtitle: "Interactive laundry cost estimator", url: "/pricing", icon: "DollarSign" },
  { title: "Coverage & Cities", subtitle: "Check service availability across Bangladesh", url: "/coverage", icon: "MapPin" },
  { title: "Branch Locations", subtitle: "Find nearest Laundrix physical branch", url: "/branches", icon: "Building" },
  { title: "Corporate B2B Solutions", subtitle: "Enterprise laundry for hotels & hospitals", url: "/corporate", icon: "Building" },
  { title: "Partner Network", subtitle: "Become a laundry or delivery partner", url: "/partner", icon: "Store" },
  { title: "Our Story & Mission", subtitle: "Learn about the Laundrix vision & team", url: "/story", icon: "FileText" },
  { title: "Contact Us", subtitle: "Reach out to support & executive office", url: "/contact", icon: "HelpCircle" },
  { title: "Insights & Fabric Care Blog", subtitle: "Fabric care tips & company news", url: "/insights", icon: "Layers" },
];

const ROLE_ACTIONS_MAP: Record<string, { title: string; subtitle: string; url: string; badge?: string }[]> = {
  SUPER_ADMIN: [
    { title: "Create New Announcement Banner", subtitle: "Publish promo discount or maintenance notice", url: "/dashboard/website-cms/announcements", badge: "Action" },
    { title: "Update Delivery Fee Rules", subtitle: "Adjust express surcharge & city rates", url: "/dashboard/system-settings/delivery-charges", badge: "Action" },
    { title: "Draft Legal Policy Document", subtitle: "Update Terms of Service or Privacy Policy", url: "/dashboard/website-cms/legal-documents", badge: "Action" },
    { title: "Review Pending Payouts", subtitle: "Authorize vendor & agent balance withdrawals", url: "/dashboard/payout-approvals", badge: "Finance" },
  ],
  ADMIN: [
    { title: "Open Live Orders Queue", subtitle: "Inspect incoming customer orders", url: "/dashboard/customer-ops/live-orders", badge: "Ops" },
    { title: "Open Customer Support Tickets", subtitle: "Resolve customer inquiries & disputes", url: "/dashboard/customer-ops/support-tickets", badge: "Support" },
    { title: "Check Branch Capacity Limits", subtitle: "Prevent washing load overflow", url: "/dashboard/branch-ops/capacity-monitor", badge: "Ops" },
    { title: "Track Active Rider Fleet", subtitle: "View live GPS locations on map", url: "/dashboard/agent-ops/live-tracking", badge: "Fleet" },
  ],
  BRANCH_MANAGER: [
    { title: "Scan Garment QR Tag", subtitle: "Verify garment status at branch", url: "/dashboard/scanner", badge: "QR" },
    { title: "Dispatch Delivery to Rider", subtitle: "Assign ready order to available agent", url: "/dashboard/branch-delivery", badge: "Dispatch" },
    { title: "Record Stock Inventory", subtitle: "Log incoming detergents & bags", url: "/dashboard/inventory", badge: "Stock" },
  ],
  AGENT: [
    { title: "Open Optimized GPS Route", subtitle: "Navigate to closest customer pickup", url: "/dashboard/agent-routes", badge: "GPS" },
    { title: "Complete Delivery Dropoff", subtitle: "Mark order as delivered", url: "/dashboard/deliveries", badge: "Task" },
  ],
  CUSTOMER: [
    { title: "Schedule Doorstep Pickup", subtitle: "Book laundry in under 60 seconds", url: "/dashboard/book-services", badge: "Book" },
    { title: "Recharge Wallet Balance", subtitle: "Add funds via bKash, Nagad or Card", url: "/dashboard/wallet", badge: "Wallet" },
    { title: "Open Support Ticket", subtitle: "Get instant live assistance", url: "/dashboard/help-desk", badge: "Support" },
  ],
};

// ─── Main Component ───────────────────────────────────────────────────────────

export const NavbarSearch: React.FC<NavbarSearchProps> = ({ userRole = "CUSTOMER" }) => {
  const router = useRouter();
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Live database results
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

  useEffect(() => {
    try {
      const stored = localStorage.getItem("laundrix_recent_searches");
      if (stored) {
        setRecentSearches(JSON.parse(stored).slice(0, 5));
      }
    } catch {
      // Ignore
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

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Global ⌘K / Ctrl+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen(true);
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const normalizedRole = (userRole || "CUSTOMER").toUpperCase().replace(/\s+/g, "_");
  const navList = ALL_ROLE_ROUTES[normalizedRole] || ALL_ROLE_ROUTES.CUSTOMER;
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
            orders: (json.data.orders || []).map((o: any) => ({
              ...o,
              category: "orders",
              icon: getNavIcon("ShoppingBag"),
            })),
            users: (json.data.users || []).map((u: any) => ({
              ...u,
              category: "users",
              icon: getNavIcon("Users"),
            })),
            branches: (json.data.branches || []).map((b: any) => ({
              ...b,
              category: "branches",
              icon: getNavIcon("Building"),
            })),
            services: (json.data.services || []).map((s: any) => ({
              ...s,
              category: "services",
              icon: getNavIcon("Sparkles"),
            })),
            tickets: (json.data.tickets || []).map((t: any) => ({
              ...t,
              category: "tickets",
              icon: getNavIcon("Ticket"),
            })),
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

  // Static items filter
  const filteredNavItems = useMemo<SearchItem[]>(() => {
    const q = search.toLowerCase().trim();
    if (!q) {
      return navList.map((n, i) => ({
        id: `nav-${i}`,
        title: n.title,
        subtitle: n.subtitle,
        url: n.url,
        category: "navigation",
        icon: getNavIcon(n.icon),
      }));
    }
    return navList
      .filter((n) => n.title.toLowerCase().includes(q) || n.subtitle.toLowerCase().includes(q))
      .map((n, i) => ({
        id: `nav-${i}`,
        title: n.title,
        subtitle: n.subtitle,
        url: n.url,
        category: "navigation",
        icon: getNavIcon(n.icon),
      }));
  }, [search, navList]);

  const filteredPublicItems = useMemo<SearchItem[]>(() => {
    const q = search.toLowerCase().trim();
    if (!q) return [];
    return PUBLIC_PAGES.filter((p) => p.title.toLowerCase().includes(q) || p.subtitle.toLowerCase().includes(q)).map(
      (p, i) => ({
        id: `pub-${i}`,
        title: p.title,
        subtitle: p.subtitle,
        url: p.url,
        category: "public",
        badge: "Public",
        icon: getNavIcon(p.icon),
      })
    );
  }, [search]);

  const filteredActionItems = useMemo<SearchItem[]>(() => {
    const q = search.toLowerCase().trim();
    if (!q) {
      return actionsList.map((a, i) => ({
        id: `act-${i}`,
        title: a.title,
        subtitle: a.subtitle,
        url: a.url,
        badge: a.badge || "Action",
        category: "actions",
        icon: <ArrowRight size={14} className="text-blue-600 shrink-0" />,
      }));
    }
    return actionsList
      .filter((a) => a.title.toLowerCase().includes(q) || a.subtitle.toLowerCase().includes(q))
      .map((a, i) => ({
        id: `act-${i}`,
        title: a.title,
        subtitle: a.subtitle,
        url: a.url,
        badge: a.badge || "Action",
        category: "actions",
        icon: <ArrowRight size={14} className="text-blue-600 shrink-0" />,
      }));
  }, [search, actionsList]);

  // Combined Results
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
    if (activeCategory === "ALL") {
      list = [...list, ...filteredPublicItems];
    }

    return list;
  }, [activeCategory, filteredActionItems, filteredNavItems, filteredPublicItems, liveResults]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [combinedItems]);

  const handleSelect = useCallback(
    (item: SearchItem) => {
      saveRecentSearch({ title: item.title, url: item.url, query: search });
      setIsOpen(false);
      router.push(item.url);
    },
    [router, search]
  );

  // Keyboard navigation
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
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

  const CATEGORY_TABS = [
    { key: "ALL", label: "All" },
    { key: "NAVIGATION", label: "Pages" },
    { key: "ORDERS", label: "Orders" },
    { key: "USERS", label: "Users" },
    { key: "BRANCHES", label: "Branches & Services" },
    { key: "ACTIONS", label: "Actions" },
  ];

  return (
    <>
      {/* ── Dimmed Backdrop when search is active ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-30 pointer-events-auto"
          />
        )}
      </AnimatePresence>

      {/* ── Search Container (Stays Exactly In Navbar Position) ── */}
      <div ref={searchContainerRef} className="relative w-full max-w-md mx-auto z-40">
        
        {/* Search Input Bar */}
        <div
          className={`relative w-full rounded-full transition-all duration-200 ${
            isOpen
              ? "bg-white ring-4 ring-blue-500/15 border-blue-500 shadow-lg"
              : "bg-slate-100/80 hover:bg-white border-slate-200/70 hover:border-blue-400/60 shadow-xs"
          } border flex items-center`}
        >
          <Search
            size={16}
            className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors pointer-events-none ${
              isOpen ? "text-blue-600" : "text-slate-400"
            }`}
          />

          <input
            ref={inputRef}
            type="text"
            value={search}
            onFocus={() => setIsOpen(true)}
            onChange={(e) => {
              setSearch(e.target.value);
              if (!isOpen) setIsOpen(true);
            }}
            onKeyDown={handleInputKeyDown}
            placeholder={`Search ${normalizedRole.toLowerCase().replace("_", " ")} pages, orders, users...`}
            className="w-full pl-11 pr-24 py-2.5 bg-transparent text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none"
          />

          {/* Right Controls in Input */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  inputRef.current?.focus();
                }}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition"
              >
                <X size={12} />
              </button>
            )}

            <div className="flex items-center gap-0.5 px-2 py-0.5 bg-white border border-slate-200 rounded-lg text-[10px] font-semibold text-slate-400 shadow-2xs pointer-events-none">
              <span>⌘</span>
              <span>K</span>
            </div>
          </div>
        </div>

        {/* ── Dropdown Attached Directly Under Searchbar ── */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.98 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="absolute top-full mt-2.5 left-1/2 -translate-x-1/2 w-[580px] sm:w-[640px] md:w-[680px] max-w-[95vw] bg-white rounded-2xl shadow-[0_16px_48px_rgba(0,0,0,0.16)] border border-slate-200 z-50 overflow-hidden flex flex-col max-h-[72vh]"
            >
              {/* Header Info & Category Filter Tabs */}
              <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100 bg-slate-50/80">
                <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-0.5">
                  {CATEGORY_TABS.map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveCategory(tab.key)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                        activeCategory === tab.key
                          ? "bg-slate-900 text-white shadow-xs"
                          : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/70"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 shrink-0 pl-2">
                  {loadingLive && (
                    <div className="flex items-center gap-1 text-[11px] font-semibold text-blue-600">
                      <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
                      Searching…
                    </div>
                  )}
                  <span className="text-[9px] font-black font-mono uppercase bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md">
                    {normalizedRole.replace("_", " ")}
                  </span>
                </div>
              </div>

              {/* Scrollable Results List */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3 max-h-[50vh]">

                {/* Recent Searches (when query is empty) */}
                {!search.trim() && recentSearches.length > 0 && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between px-2 text-[10px] font-black uppercase tracking-wider text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock size={11} /> Recent Searches
                      </span>
                      <button
                        onClick={clearRecentSearches}
                        className="text-slate-400 hover:text-red-500 transition"
                      >
                        Clear History
                      </button>
                    </div>
                    {recentSearches.map((rec, rIdx) => (
                      <div
                        key={rIdx}
                        onClick={() => {
                          setIsOpen(false);
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
                )}

                {/* Main Results */}
                {combinedItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center text-slate-400">
                    <Search size={24} className="text-slate-300 mb-2" />
                    <p className="text-xs font-bold text-slate-700">No results found for &ldquo;{search}&rdquo;</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Try searching by page name, order ID, phone number or action.</p>
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
                              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                                isSelected ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {item.icon || <ArrowRight size={13} className={isSelected ? "text-white" : "text-slate-400"} />}
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

              {/* Footer Keyboard Navigation Shortcuts */}
              <div className="flex items-center justify-between px-4 py-2 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-500">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-mono shadow-2xs">↑</kbd>
                    <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-mono shadow-2xs">↓</kbd>
                    navigate
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-mono shadow-2xs">↵</kbd>
                    select
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-mono shadow-2xs">esc</kbd>
                    close
                  </span>
                </div>

                <span className="text-[10px] font-semibold text-slate-400">Laundrix Spotlight v2.1</span>
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};
