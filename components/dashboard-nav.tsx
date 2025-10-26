"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Receipt, 
  PieChart, 
  Repeat, 
  User, 
  Bell,
  Wallet
} from "lucide-react"
import { useStore } from "@/lib/store"
import { Badge } from "./ui/badge"

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Groups",
    href: "/dashboard/groups",
    icon: Users,
  },
  {
    name: "Bills",
    href: "/dashboard/bills",
    icon: FileText,
  },
  {
    name: "Transactions",
    href: "/dashboard/transactions",
    icon: Receipt,
  },
  {
    name: "Budget",
    href: "/dashboard/budget",
    icon: PieChart,
  },
  {
    name: "Recurring Bills",
    href: "/dashboard/recurring",
    icon: Repeat,
  },
  {
    name: "Profile",
    href: "/dashboard/profile",
    icon: User,
  },
  {
    name: "Notifications",
    href: "/dashboard/notifications",
    icon: Bell,
    badge: true,
  },
]

export function DashboardNav({ collapsed = false }: { collapsed?: boolean }) {
  const pathname = usePathname()
  const { notifications } = useStore()
  
  const unreadCount = notifications.filter((n) => !n.isRead).length

  return (
    <nav className="space-y-1">
      {navigation.map((item) => {
        const isActive = pathname === item.href
        const Icon = item.icon
        
        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              collapsed && "justify-center"
            )}
            title={collapsed ? item.name : undefined}
          >
            <Icon className="w-5 h-5 shrink-0" />
            {!collapsed && (
              <>
                <span className="flex-1">{item.name}</span>
                {item.badge && unreadCount > 0 && (
                  <Badge variant={isActive ? "secondary" : "default"} className="ml-auto">
                    {unreadCount}
                  </Badge>
                )}
              </>
            )}
            {collapsed && item.badge && unreadCount > 0 && (
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
            )}
          </Link>
        )
      })}
    </nav>
  )
}

