import { LayoutDashboard, Users, Settings, Building2, Store, Shirt, Truck, Wallet, MessageSquare } from "lucide-react";

export const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Users", href: "/dashboard/users", icon: Users },
  { name: "Branches", href: "/dashboard/branches", icon: Building2 },
  { name: "Vendor", href: "/dashboard/vendors", icon: Store },
  { name: "Services", href: "/dashboard/services", icon: Shirt },
  { name: "Delivery", href: "/dashboard/delivery", icon: Truck },
  { name: "Financial", href: "/dashboard/financial", icon: Wallet },
  { name: "Support", href: "/dashboard/support", icon: MessageSquare },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];
