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
 Wallet
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
    name:"Dashboard",
    href:"/dashboard",
    icon: LayoutDashboard,
    roles: ["SUPER_ADMIN", "Admin", "Branch Manager", "Vendor", "CUSTOMER", "Customer", "Employee", "Pickup Agent", "Delivery Agent"],
  },
  {
    name: "Book Laundry",
    href: "/dashboard/book",
    icon: Shirt,
    roles: ["CUSTOMER", "Customer"],
  },
  {
    name: "My Orders",
    href: "/dashboard/my-orders",
    icon: ClipboardList,
    roles: ["CUSTOMER", "Customer"],
  },
  {
    name: "Track Orders",
    href: "/dashboard/track-orders",
    icon: Truck,
    roles: ["CUSTOMER", "Customer"],
  },
  {
    name: "My Wishlist",
    href: "/dashboard/wishlist",
    icon: Heart,
    roles: ["CUSTOMER", "Customer"],
  },
  {
    name: "My Wallet",
    href: "/dashboard/wallet",
    icon: Wallet,
    roles: ["CUSTOMER", "Customer"],
  },
  {
    name: "Help Desk",
    href: "/dashboard/help-desk",
    icon: Headphones,
    roles: ["CUSTOMER", "Customer"],
  },
  {
    name:"User Management",
    icon:Users,
    roles: ["SUPER_ADMIN", "Admin"],
    children:[
      {
        name:"Users",
        href:"/dashboard/users",
        icon:Users,
        roles: ["SUPER_ADMIN", "Admin"],
      },
    ]
  },
  {
    name: "Branches",
    href: "/dashboard/branches",
    icon: Building2,
    roles: ["SUPER_ADMIN", "Admin"],
  },
  {
    name: "Vendors",
    href: "/dashboard/vendors",
    icon: PackageCheck,
    roles: ["SUPER_ADMIN", "Admin", "Vendor"],
  },
  {
    name: "Laundry Services",
    href: "/dashboard/services",
    icon: Shirt,
    roles: ["SUPER_ADMIN", "Admin"],
  },
  {
    name: "Branch Operations",
    icon: Store,
    roles: ["SUPER_ADMIN", "Admin", "Branch Manager"],
    children: [
      { name: "Overview", href: "/dashboard/branch/overview", icon: LayoutDashboard, roles: ["SUPER_ADMIN", "Admin", "Branch Manager"] },
      { name: "Orders", href: "/dashboard/branch/orders", icon: ClipboardList, roles: ["SUPER_ADMIN", "Admin", "Branch Manager"] },
      { name: "Employees", href: "/dashboard/branch/employees", icon: UsersRound, roles: ["SUPER_ADMIN", "Admin", "Branch Manager"] },
      { name: "Inventory", href: "/dashboard/branch/inventory", icon: Boxes, roles: ["SUPER_ADMIN", "Admin", "Branch Manager"] },
      { name: "Delivery Agents", href: "/dashboard/branch/delivery", icon: Truck, roles: ["SUPER_ADMIN", "Admin", "Branch Manager"] },
      { name: "Analytics", href: "/dashboard/branch/analytics", icon: CircleDollarSign, roles: ["SUPER_ADMIN", "Admin", "Branch Manager"] },
    ]
  },
  {
    name: "Delivery Logistics",
    href: "/dashboard/logistics",
    icon: Truck,
    roles: ["SUPER_ADMIN", "Admin", "Delivery Agent", "Pickup Agent"],
  },
  {
    name: "Financial Configuration",
    href: "/dashboard/finance",
    icon: CircleDollarSign,
    roles: ["SUPER_ADMIN", "Admin"],
  },
  {
    name: "Customer Support",
    href: "/dashboard/support",
    icon: Headphones,
    roles: ["SUPER_ADMIN", "Admin", "Employee"],
  },
  {
    name: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
    roles: ["SUPER_ADMIN", "Admin"],
  },
];