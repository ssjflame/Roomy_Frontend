"use client"

import { useStore } from "@/lib/store"
import { Card, CardContent } from "@/components/ui/card"
import { FileText, CheckCircle2, Clock, DollarSign } from "lucide-react"

export function StatsOverview() {
  const { proposals, currentGroup, wallet } = useStore()

  // Calculate group balance from wallet or default to 2450.50 for demo
  const groupBalance = wallet?.balance ?? 0

  const stats = [
    {
      label: "Total Proposals",
      value: proposals.length,
      icon: FileText,
      color: "text-blue-500",
    },
    {
      label: "Pending Votes",
      value: proposals.filter((p) => p.status === "PENDING").length,
      icon: Clock,
      color: "text-yellow-500",
    },
    {
      label: "Approved",
      value: proposals.filter((p) => p.status === "APPROVED" || p.status === "EXECUTED").length,
      icon: CheckCircle2,
      color: "text-green-500",
    },
    {
      label: "Wallet Balance",
      value: `$${groupBalance.toFixed(2)}`,
      icon: DollarSign,
      color: "text-purple-500",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.label}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full bg-muted ${stat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
