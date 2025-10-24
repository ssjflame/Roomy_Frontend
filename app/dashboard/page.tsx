"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useStore } from "@/lib/store"
import { 
  mockUser, 
  mockWallets,
  mockGroup, 
  mockGroups,
  mockGroupMembers,
  mockProposals,
  mockBills,
  mockTransactions,
  mockBudgetCategories,
  mockRecurringBills,
  mockNotifications
} from "@/lib/mock-data"
import { UserNav } from "@/components/user-nav"
import { GroupBalance } from "@/components/group-balance"
import { GroupMembers } from "@/components/group-members"
import { ProposalsList } from "@/components/proposals-list"
import { StatsOverview } from "@/components/stats-overview"
import { VotingStats } from "@/components/voting-stats"
import { Wallet } from "lucide-react"

export default function DashboardPage() {
  const router = useRouter()
  const { 
    user, 
    currentGroup, 
    proposals, 
    setUser,
    setWallet,
    setCurrentGroup, 
    setGroups,
    setGroupMembers,
    setProposals,
    setBills,
    setTransactions,
    setBudgetCategories,
    setRecurringBills,
    setNotifications
  } = useStore()

  useEffect(() => {
    // Redirect to home if not authenticated
    if (!user) {
      router.push("/")
      return
    }

    // Load mock data if not already loaded
    if (!currentGroup) {
      setUser(mockUser)
      setWallet(mockWallets[0])
      setCurrentGroup(mockGroup)
      setGroups(mockGroups)
      setGroupMembers(mockGroupMembers)
      setProposals(mockProposals)
      setBills(mockBills)
      setTransactions(mockTransactions)
      setBudgetCategories(mockBudgetCategories)
      setRecurringBills(mockRecurringBills)
      setNotifications(mockNotifications)
    }
  }, [
    user, 
    currentGroup, 
    setUser,
    setWallet,
    setCurrentGroup, 
    setGroups,
    setGroupMembers,
    setProposals,
    setBills,
    setTransactions,
    setBudgetCategories,
    setRecurringBills,
    setNotifications,
    router
  ])

  if (!user || !currentGroup) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <Wallet className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold">RoomDAO</h1>
              <p className="text-sm text-muted-foreground">{currentGroup.name}</p>
            </div>
          </div>
          <UserNav />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6">
          {/* Stats Overview */}
          <StatsOverview />

          {/* Balance, Members, and Voting Stats Row */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <GroupBalance />
            <GroupMembers />
            <VotingStats />
          </div>

          {/* Proposals List */}
          <ProposalsList />
        </div>
      </main>
    </div>
  )
}
