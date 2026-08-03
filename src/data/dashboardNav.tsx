import {
  LayoutDashboard,
  Users,
  Settings,
  Truck,
  PackageCheck,
  Shirt,
  CircleDollarSign,
  Headphones,
  Building2,
  Store,
  ClipboardList,
  UsersRound,
  Boxes,
  Heart,
  Wallet,
  QrCode,
  ShieldAlert,
  Star,
  Gauge,
  TrendingUp,
  Banknote,
  FileCheck,
  Globe,
  FileText,
  Activity,
  Wrench,
  ShieldCheck,
  Megaphone,
} from "lucide-react";

export interface NavItem {
  name: string;
  href?: string;
  icon: any;
  roles?: string[];
  children?: Omit<NavItem, "children">[];
}

export const dashboardNavItems: NavItem[] = [
  // =========================
  // Primary Dashboard Overview (Available to ALL Roles)
  // =========================
  {
    name: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: [
      "SUPER_ADMIN",
      "ADMIN",
      "BRANCH_MANAGER",
      "EMPLOYEE",
      "DELIVERY_AGENT",
      "CUSTOMER",
      "VENDOR",
    ],
  },

  // =========================
  // Shared Admin & Super Admin Core Routes
  // =========================
  {
    name: "Financial Analytics",
    href: "/dashboard/financial-analytics",
    icon: TrendingUp,
    roles: ["SUPER_ADMIN", "ADMIN"],
  },

  // =========================
  // ADMIN & SUPER ADMIN Dropdowns
  // =========================
  {
    name: "Customer Ops",
    icon: Headphones,
    roles: ["SUPER_ADMIN", "ADMIN"],
    children: [
      {
        name: "Live Orders",
        href: "/dashboard/customer-ops/live-orders",
        icon: ClipboardList,
        roles: ["SUPER_ADMIN", "ADMIN"],
      },
      {
        name: "Support Tickets",
        href: "/dashboard/support",
        icon: Headphones,
        roles: ["SUPER_ADMIN", "ADMIN"],
      },
      {
        name: "Customer Reviews",
        href: "/dashboard/customer-reviews",
        icon: Star,
        roles: ["SUPER_ADMIN", "ADMIN"],
      },
      {
        name: "Wallet Transactions",
        href: "/dashboard/customer-ops/wallet-transactions",
        icon: Wallet,
        roles: ["SUPER_ADMIN", "ADMIN"],
      },
    ],
  },
  {
    name: "Branch Ops",
    icon: Building2,
    roles: ["SUPER_ADMIN", "ADMIN"],
    children: [
      {
        name: "Capacity Monitor",
        href: "/dashboard/branch-ops/capacity-monitor",
        icon: Gauge,
        roles: ["SUPER_ADMIN", "ADMIN"],
      },
      {
        name: "Machineries Status",
        href: "/dashboard/branch-ops/machineries-status",
        icon: Wrench,
        roles: ["SUPER_ADMIN", "ADMIN"],
      },
      {
        name: "Inventory Stock",
        href: "/dashboard/branch-ops/inventory-stock",
        icon: Boxes,
        roles: ["SUPER_ADMIN", "ADMIN"],
      },
    ],
  },
  {
    name: "Vendor Ops",
    icon: Store,
    roles: ["SUPER_ADMIN", "ADMIN"],
    children: [
      {
        name: "Capacity Monitor",
        href: "/dashboard/vendor-ops/capacity-monitor",
        icon: Gauge,
        roles: ["SUPER_ADMIN", "ADMIN"],
      },
      {
        name: "Processing Status",
        href: "/dashboard/vendor-ops/processing-status",
        icon: PackageCheck,
        roles: ["SUPER_ADMIN", "ADMIN"],
      },
      {
        name: "Commission History",
        href: "/dashboard/vendor-ops/commission-history",
        icon: Banknote,
        roles: ["SUPER_ADMIN", "ADMIN"],
      },
    ],
  },
  {
    name: "Agent Ops",
    icon: Truck,
    roles: ["SUPER_ADMIN", "ADMIN"],
    children: [
      {
        name: "Live Tracking",
        href: "/dashboard/agent-ops/live-tracking",
        icon: Truck,
        roles: ["SUPER_ADMIN", "ADMIN"],
      },
      {
        name: "Vehicle Status",
        href: "/dashboard/agent-ops/vehicle-status",
        icon: ShieldAlert,
        roles: ["SUPER_ADMIN", "ADMIN"],
      },
    ],
  },
  {
    name: "Employee Ops",
    icon: UsersRound,
    roles: ["SUPER_ADMIN", "ADMIN"],
    children: [
      {
        name: "Work Updates",
        href: "/dashboard/employee-ops/work-updates",
        icon: FileCheck,
        roles: ["SUPER_ADMIN", "ADMIN"],
      },
      {
        name: "Tasks",
        href: "/dashboard/employee-ops/tasks",
        icon: ClipboardList,
        roles: ["SUPER_ADMIN", "ADMIN"],
      },
    ],
  },
  {
    name: "Users Management",
    icon: Users,
    roles: ["SUPER_ADMIN", "ADMIN"],
    children: [
      {
        name: "Customers",
        href: "/dashboard/user-management/customers",
        icon: Users,
        roles: ["SUPER_ADMIN", "ADMIN"],
      },
      {
        name: "Branch Managers",
        href: "/dashboard/user-management/branch-managers",
        icon: UsersRound,
        roles: ["SUPER_ADMIN", "ADMIN"],
      },
      {
        name: "Vendors",
        href: "/dashboard/user-management/vendors",
        icon: Store,
        roles: ["SUPER_ADMIN", "ADMIN"],
      },
      {
        name: "Agents",
        href: "/dashboard/user-management/agents",
        icon: Truck,
        roles: ["SUPER_ADMIN", "ADMIN"],
      },
      {
        name: "Employees",
        href: "/dashboard/user-management/employees",
        icon: UsersRound,
        roles: ["SUPER_ADMIN", "ADMIN"],
      },
    ],
  },

  // =========================
  // SUPER ADMIN EXCLUSIVE ROUTES
  // =========================
  {
    name: "Audit Logs",
    href: "/dashboard/audit-logs",
    icon: Activity,
    roles: ["SUPER_ADMIN"],
  },
  {
    name: "Payout Approvals",
    href: "/dashboard/payout-approvals",
    icon: Banknote,
    roles: ["SUPER_ADMIN"],
  },
  {
    name: "Web CMS",
    icon: Globe,
    roles: ["SUPER_ADMIN"],
    children: [
      {
        name: "Pages & Content",
        href: "/dashboard/website-cms/pages-content",
        icon: Globe,
        roles: ["SUPER_ADMIN"],
      },
      {
        name: "Announcements",
        href: "/dashboard/website-cms/announcements",
        icon: Megaphone,
        roles: ["SUPER_ADMIN"],
      },
      {
        name: "Legal Documents",
        href: "/dashboard/website-cms/legal-documents",
        icon: FileText,
        roles: ["SUPER_ADMIN"],
      },
    ],
  },
  {
    name: "System Settings",
    icon: Settings,
    roles: ["SUPER_ADMIN"],
    children: [
      {
        name: "Pricing & Tax",
        href: "/dashboard/system-settings/pricing-tax",
        icon: CircleDollarSign,
        roles: ["SUPER_ADMIN"],
      },
      {
        name: "Delivery Charges",
        href: "/dashboard/system-settings/delivery-charges",
        icon: Truck,
        roles: ["SUPER_ADMIN"],
      },
      {
        name: "Feature Flags",
        href: "/dashboard/system-settings/feature-flags",
        icon: Settings,
        roles: ["SUPER_ADMIN"],
      },
    ],
  },
  {
    name: "Role Management",
    icon: ShieldCheck,
    roles: ["SUPER_ADMIN"],
    children: [
      {
        name: "Admin Access",
        href: "/dashboard/role-management/admin-access",
        icon: ShieldAlert,
        roles: ["SUPER_ADMIN"],
      },
    ],
  },

  // =========================
  // Non-Admin Customer Menu
  // =========================
  {
    name: "Book Laundry",
    href: "/dashboard/book-services",
    icon: Shirt,
    roles: ["CUSTOMER"],
  },
  {
    name: "My Orders",
    href: "/dashboard/my-orders",
    icon: ClipboardList,
    roles: ["CUSTOMER"],
  },
  {
    name: "Track Orders",
    href: "/dashboard/track-orders",
    icon: Truck,
    roles: ["CUSTOMER"],
  },
  {
    name: "My Wishlist",
    href: "/dashboard/wishlist",
    icon: Heart,
    roles: ["CUSTOMER"],
  },
  {
    name: "My Wallet",
    href: "/dashboard/wallet",
    icon: Wallet,
    roles: ["CUSTOMER"],
  },
  {
    name: "My Reviews",
    href: "/dashboard/my-reviews",
    icon: Star,
    roles: ["CUSTOMER"],
  },
  {
    name: "Help Desk",
    href: "/dashboard/help-desk",
    icon: Headphones,
    roles: ["CUSTOMER"],
  },

  // =========================
  // Branch Manager Menu
  // =========================
  {
    name: "Branch Orders",
    href: "/dashboard/branch-orders",
    icon: ClipboardList,
    roles: ["BRANCH_MANAGER"],
  },
  {
    name: "Branch Analytics",
    href: "/dashboard/branch-analytics",
    icon: TrendingUp,
    roles: ["BRANCH_MANAGER"],
  },
  {
    name: "Branch Employees",
    href: "/dashboard/branch-employees",
    icon: UsersRound,
    roles: ["BRANCH_MANAGER"],
  },
  {
    name: "Delivery Agents",
    href: "/dashboard/branch-delivery",
    icon: Truck,
    roles: ["BRANCH_MANAGER"],
  },
  {
    name: "Branch Inventory",
    href: "/dashboard/inventory",
    icon: Boxes,
    roles: ["BRANCH_MANAGER"],
  },
  {
    name: "Partner Vendors",
    href: "/dashboard/partner-vendors",
    icon: Store,
    roles: ["BRANCH_MANAGER"],
  },
  {
    name: "Partner Applications",
    href: "/dashboard/partner-applications",
    icon: FileCheck,
    roles: ["BRANCH_MANAGER"],
  },

  // =========================
  // Operations & Scanner
  // =========================
  {
    name: "QR Scanner",
    href: "/dashboard/scanner",
    icon: QrCode,
    roles: ["EMPLOYEE"],
  },

  // =========================
  // Vendor Menu
  // =========================
  {
    name: "Vendor Orders",
    href: "/dashboard/vendor-orders",
    icon: ClipboardList,
    roles: ["VENDOR"],
  },
  {
    name: "Vendor Services",
    href: "/dashboard/vendor-services",
    icon: Shirt,
    roles: ["VENDOR"],
  },
  {
    name: "Vendor Capacity",
    href: "/dashboard/vendor-capacity",
    icon: Gauge,
    roles: ["VENDOR"],
  },
  {
    name: "Vendor Wallet",
    href: "/dashboard/vendor-wallet",
    icon: Wallet,
    roles: ["VENDOR"],
  },
  {
    name: "Vendor Employees",
    href: "/dashboard/vendor-employees",
    icon: UsersRound,
    roles: ["VENDOR"],
  },
  {
    name: "Vendor Performance",
    href: "/dashboard/performance",
    icon: TrendingUp,
    roles: ["VENDOR"],
  },
  {
    name: "Vendor Payouts",
    href: "/dashboard/payouts",
    icon: Banknote,
    roles: ["VENDOR"],
  },

  // =========================
  // Employee Menu
  // =========================
  {
    name: "Garment Intake & QR",
    href: "/dashboard/intake-orders",
    icon: PackageCheck,
    roles: ["EMPLOYEE"],
  },

  // =========================
  // Delivery Agent Menu
  // =========================
  {
    name: "Available Pickups",
    href: "/dashboard/pickups",
    icon: PackageCheck,
    roles: ["DELIVERY_AGENT"],
  },
  {
    name: "Available Deliveries",
    href: "/dashboard/deliveries",
    icon: Truck,
    roles: ["DELIVERY_AGENT"],
  },
  {
    name: "Optimized Routes",
    href: "/dashboard/agent-routes",
    icon: ClipboardList,
    roles: ["DELIVERY_AGENT"],
  },
  {
    name: "Verification",
    href: "/dashboard/verification",
    icon: ShieldCheck,
    roles: ["DELIVERY_AGENT"],
  },
  {
    name: "Delivery History",
    href: "/dashboard/history",
    icon: ClipboardList,
    roles: ["DELIVERY_AGENT"],
  },
];