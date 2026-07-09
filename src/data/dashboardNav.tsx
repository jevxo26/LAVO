import {
  Building2,
  CircleDollarSign,
  Headphones,
  LayoutDashboard,
  PackageCheck,
  Settings,
  Shirt,
  Truck,
  Users,
} from "lucide-react"

export const dashboardNavItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Users", href: "/dashboard/users", icon: Users },
  { name: "Branches", href: "/dashboard/branches", icon: Building2 },
  { name: "Vendors", href: "/dashboard/vendors", icon: PackageCheck },
  { name: "Laundry Services", href: "/dashboard/services", icon: Shirt },
  { name: "Delivery Logistics", href: "/dashboard/logistics", icon: Truck },
  {
    name: "Financial Configuration",
    href: "/dashboard/finance",
    icon: CircleDollarSign,
  },
  { name: "Customer Support", href: "/dashboard/support", icon: Headphones },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
]
