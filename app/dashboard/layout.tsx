import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Dashboard - RoomDAO",
  description: "Manage your shared expenses and group wallet",
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
