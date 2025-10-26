"use client"

import type React from "react"
import { useState } from "react"
import { DashboardNav } from "@/components/dashboard-nav"
import { UserNav } from "@/components/user-nav"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Menu, X, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import { useStore } from "@/lib/store"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const { currentGroup } = useStore()

  return (
    <div className="min-h-screen flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 flex flex-col border-r bg-card transition-all duration-300 lg:relative lg:z-auto",
        // Mobile styles
        "w-64 lg:flex",
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        // Desktop collapsible styles
        sidebarCollapsed ? "lg:w-16" : "lg:w-64"
      )}>
        {/* Sidebar header with logo and collapse toggle */}
        <div className="flex items-center justify-between p-4 border-b">
          {/* Logo/Brand */}
          <div className={cn(
            "flex items-center space-x-2 transition-all duration-300",
            sidebarCollapsed ? "lg:opacity-0 lg:w-0 lg:overflow-hidden" : "lg:opacity-100"
          )}>
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">R</span>
            </div>
            <span className="font-semibold text-lg">Roomy</span>
          </div>

          {/* Collapse/Close buttons */}
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden lg:flex"
            >
              <Menu className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex-1 px-3 py-4 overflow-y-auto">
          <DashboardNav collapsed={sidebarCollapsed} />
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="flex items-center justify-between p-4 border-b bg-card lg:hidden">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-3">
            {/* Current Group Indicator */}
            <div className="flex items-center gap-2 px-3 py-1 bg-muted rounded-md">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">
                {currentGroup ? currentGroup.name : "No Group Selected"}
              </span>
            </div>
            <UserNav />
          </div>
        </header>

        {/* Desktop header */}
        <header className="hidden lg:flex items-center justify-end p-4 border-b bg-card">
          <div className="flex items-center gap-4">
            {/* Current Group Indicator */}
            <div className="flex items-center gap-2 px-3 py-1 bg-muted rounded-md">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">
                {currentGroup ? currentGroup.name : "No Group Selected"}
              </span>
            </div>
            <UserNav />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
