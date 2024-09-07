"use client";

import { Layout, Telescope   } from "lucide-react";
import { SidebarItem } from "./sidebar-item";

const guestRoutes = [
  {
    icon: Layout,
    label: "Dashboard",
    href: "/"
  },
  {
    icon: Telescope,
    label: "Explore",
    href: "/explore"
  },
]


export const SidebarRoutes = () => {
  const routes = guestRoutes;

  return (
    <div className="flex flex-col w-full">
      {routes.map((route)=>(
        <SidebarItem key={route.href} icon={route.icon} label={route.label} href={route.href} />
      )) }
    </div>
  )
}