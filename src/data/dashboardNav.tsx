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


export const dashboardNavItems = [
  {
    name:"Dashboard",
    href:"/dashboard",
    icon: LayoutDashboard,
  },

  {
    name:"User Management",
    icon:Users,
    children:[
      {
        name:"Users",
        href:"/dashboard/users",
        icon:Users,
      },
    ]
  },


   {
    name: "Branches",
    href: "/dashboard/branches",
    icon: Building2,
  },

  {
    name: "Vendors",
    href: "/dashboard/vendors",
    icon: PackageCheck,
  },

  {
    name: "Laundry Services",
    href: "/dashboard/services",
    icon: Shirt,
  },

  {
    name: "Delivery Logistics",
    href: "/dashboard/logistics",
    icon: Truck,
  },

  {
    name: "Financial Configuration",
    href: "/dashboard/finance",
    icon: CircleDollarSign,
  },

  {
    name: "Customer Support",
    href: "/dashboard/support",
    icon: Headphones,
  },

  {
    name: "Settings",
    href: "/dashboard/settings",
    icon: Settings,

    // children: [
      // Future e ekhane add korba
      // {
      //   name: "System Setting",
      //   href: "/dashboard/settings/system",
      //   icon: Settings,
      // },
    // ],
  },
]