import type React from "react"
import type { Metadata } from "next"
import { DashboardNav } from "@/components/dashboard-nav"
import { UserNav } from "@/components/user-nav"
import { Wallet } from "lucide-react"

export const metadata: Metadata = {
  title: "Dashboard - RoomDAO",
  description: "Manage your shared expenses and group wallet",
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 border-r bg-card">
        <div className="flex items-center gap-3 px-6 py-4 border-b">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
            <Wallet className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold">RoomDAO</h1>
          </div>
        </div>
        <div className="flex-1 px-3 py-4 overflow-y-auto">
          <DashboardNav />
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {children}
      </div>
    </div>
  )
}
