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
    roles: ["SUPER_ADMIN", "Admin", "Branch Manager", "Vendor", "Customer", "Employee", "Pickup Agent", "Delivery Agent"],
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
    roles: ["SUPER_ADMIN", "Admin", "Branch Manager"],
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
    roles: ["SUPER_ADMIN", "Admin", "Branch Manager"],
  },
  {
    name: "Delivery Logistics",
    href: "/dashboard/logistics",
    icon: Truck,
    roles: ["SUPER_ADMIN", "Admin", "Branch Manager", "Delivery Agent", "Pickup Agent"],
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
    roles: ["SUPER_ADMIN", "Admin", "Employee", "Branch Manager"],
  },
  {
    name: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
    roles: ["SUPER_ADMIN", "Admin"],
  },
];