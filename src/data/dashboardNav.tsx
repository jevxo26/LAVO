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
} from "lucide-react";

export interface NavItem {
  name: string;
  href?: string;
  icon: any;
  roles?: string[];
  children?: Omit<NavItem, "children">[];
}

export const dashboardNavItems: NavItem[] = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: [
      "SUPER_ADMIN",
      "ADMIN",
      "BRANCH_MANAGER",
      "EMPLOYEE",
      "DELIVERY_AGENT",
      "CUSTOMER",
    ],
  },
  {
    name: "Executive Analytics",
    href: "/dashboard/analytics",
    icon: CircleDollarSign,
    roles: ["SUPER_ADMIN", "ADMIN"],
    name: "Dashboard",
    href: "/dashboard/vendor/dashboard",
    icon: LayoutDashboard,
    roles: ["VENDOR"],
  },

  // =========================
  // Customer Menu
  // =========================
  {
    name: "Book Laundry",
    href: "/dashboard/book",
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
  // Admin Menu
  // =========================
  {
    name: "User Management",
    icon: Users,
    roles: ["SUPER_ADMIN", "ADMIN"],
    children: [
      {
        name: "Customer Management",
        href: "/dashboard/users",
        icon: Users,
        roles: ["SUPER_ADMIN", "ADMIN"],
      },
      {
        name: "Branch Employees",
        href: "/dashboard/branch/employees",
        icon: UsersRound,
        roles: ["SUPER_ADMIN", "ADMIN"],
      },
      {
        name: "Delivery Agents",
        href: "/dashboard/branch/delivery",
        icon: Truck,
        roles: ["SUPER_ADMIN", "ADMIN"],
      },
      {
        name: "Roles & Permissions",
        href: "/dashboard/users/roles",
        icon: ShieldAlert,
        roles: ["SUPER_ADMIN", "ADMIN"],
      },
    ],
  },
  {
    name: "Branches",
    href: "/dashboard/branches",
    icon: Building2,
    roles: ["SUPER_ADMIN", "ADMIN"],
  },
  {
    name: "Vendors",
    href: "/dashboard/vendors",
    icon: PackageCheck,
    roles: ["SUPER_ADMIN", "ADMIN"],
  },
  {
    name: "Laundry Services",
    href: "/dashboard/services",
    icon: Shirt,
    roles: ["SUPER_ADMIN", "ADMIN"],
  },
  {
    name: "Branch Operations",
    icon: Store,
    roles: ["SUPER_ADMIN", "ADMIN", "BRANCH_MANAGER"],
    children: [
      {
        name: "Overview",
        href: "/dashboard/branch/overview",
        icon: LayoutDashboard,
        roles: ["SUPER_ADMIN", "ADMIN", "BRANCH_MANAGER"],
      },
      {
        name: "Orders",
        href: "/dashboard/branch/orders",
        icon: ClipboardList,
        roles: ["SUPER_ADMIN", "ADMIN", "BRANCH_MANAGER"],
      },
      {
        name: "Employees",
        href: "/dashboard/branch/employees",
        icon: UsersRound,
        roles: ["SUPER_ADMIN", "ADMIN", "BRANCH_MANAGER"],
      },
      {
        name: "Inventory",
        href: "/dashboard/branch/inventory",
        icon: Boxes,
        roles: ["SUPER_ADMIN", "ADMIN", "BRANCH_MANAGER"],
      },
      {
        name: "Delivery Agents",
        href: "/dashboard/branch/delivery",
        icon: Truck,
        roles: ["SUPER_ADMIN", "ADMIN", "BRANCH_MANAGER"],
      },
      {
        name: "Analytics",
        href: "/dashboard/branch/analytics",
        icon: CircleDollarSign,
        roles: ["SUPER_ADMIN", "ADMIN", "BRANCH_MANAGER"],
      },
    ],
  },
  {
    name: "Delivery Logistics",
    href: "/dashboard/logistics",
    icon: Truck,
    roles: ["SUPER_ADMIN", "ADMIN"],
  },
  {
    name: "Financial Configuration",
    href: "/dashboard/finance",
    icon: CircleDollarSign,
    roles: ["SUPER_ADMIN", "ADMIN"],
  },
  {
    name: "Customer Support",
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
    name: "Website CMS",
    href: "/dashboard/cms",
    icon: LayoutDashboard,
    roles: ["SUPER_ADMIN", "ADMIN"],
  },
  {
    name: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
    roles: ["SUPER_ADMIN", "ADMIN"],
  },

  // =========================
  // Operations & Scanner Menu
  // =========================
  {
    name: "QR Scanner",
    href: "/scanner",
    icon: QrCode,
    roles: ["SUPER_ADMIN", "EMPLOYEE", "BRANCH_MANAGER"],
  },

  // =========================
  // Vendor Menu
  // =========================
  {
    name: "Vendor Operations",
    icon: Store,
    roles: ["VENDOR"],
    children: [
      {
        name: "Orders",
        href: "/dashboard/vendor/orders",
        icon: ClipboardList,
        roles: ["VENDOR"],
      },
      {
        name: "Services",
        href: "/dashboard/vendor/services",
        icon: Shirt,
        roles: ["VENDOR"],
      },
      {
        name: "Capacity",
        href: "/dashboard/vendor/capacity",
        icon: Gauge,
        roles: ["VENDOR"],
      },
      {
        name: "Employees",
        href: "/dashboard/vendor/employees",
        icon: UsersRound,
        roles: ["VENDOR"],
      },
      {
        name: "Wallet",
        href: "/dashboard/vendor/wallet",
        icon: Wallet,
        roles: ["VENDOR"],
      },
      {
        name: "Payouts",
        href: "/dashboard/vendor/payouts",
        icon: Banknote,
        roles: ["VENDOR"],
      },
      {
        name: "Performance",
        href: "/dashboard/vendor/performance",
        icon: TrendingUp,
        roles: ["VENDOR"],
      },
    ],
  },

  // =========================
  // Employee Menu
  // =========================
  {
    name: "Garment Intake & QR",
    href: "/dashboard/employee/orders",
    icon: PackageCheck,
    roles: ["EMPLOYEE"],
  },

  // =========================
  // Delivery Agent Menu
  // =========================
  {
    name: "Overview",
    href: "/dashboard/delivery-agent/overview",
    icon: LayoutDashboard,
    roles: ["DELIVERY_AGENT"],
  },
  {
    name: "Available Pickups",
    href: "/dashboard/delivery-agent/pickups",
    icon: PackageCheck,
    roles: ["DELIVERY_AGENT"],
  },
  {
    name: "Available Deliveries",
    href: "/dashboard/delivery-agent/deliveries",
    icon: Truck,
    roles: ["DELIVERY_AGENT"],
  },
  {
    name: "Optimized Routes",
    href: "/dashboard/delivery-agent/routes",
    icon: ClipboardList,
    roles: ["DELIVERY_AGENT"],
  },
  {
    name: "Verification",
    href: "/dashboard/delivery-agent/verification",
    icon: Users,
    roles: ["DELIVERY_AGENT"],
  },
  {
    name: "History",
    href: "/dashboard/delivery-agent/history",
    icon: Boxes,
    roles: ["DELIVERY_AGENT"],
  },
];