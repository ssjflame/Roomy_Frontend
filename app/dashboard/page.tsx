"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useStore } from "@/lib/store"
import { UserNav } from "@/components/user-nav"
import { GroupBalance } from "@/components/group-balance"
import { GroupMembers } from "@/components/group-members"
import { ProposalsList } from "@/components/proposals-list"
import { StatsOverview } from "@/components/stats-overview"
import { VotingStats } from "@/components/voting-stats"
import { Wallet } from "lucide-react"
import { authApi, groupsApi, billsApi, proposalsApi, transactionsApi } from "@/lib/api"

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
  } = useStore()

  useEffect(() => {
    const init = async () => {
      // Ensure authenticated user exists; if not, try to hydrate from backend
      if (!user) {
        try {
          const profile = await authApi.getProfile()
          setUser({
            ...profile.user,
            isEmailVerified: profile.user.isEmailVerified ?? true,
            avatarUrl: profile.user.avatarUrl ?? undefined,
            lastLoginAt: profile.user.lastLoginAt ?? new Date().toISOString()
          })
          if (profile.wallet) setWallet(profile.wallet)
          
          // If wallet isn’t present yet, trigger session to provision it
          if (!profile.wallet) {
            try {
              const { wallet } = await authApi.session()
              if (wallet) setWallet(wallet)
            } catch (_) {}
          }
        } catch (e) {
          router.push("/")
          return
        }
      }

      try {
        const apiGroups = await groupsApi.getAll()
        const mappedGroups = (apiGroups || []).map((g: any) => ({
          id: g.id,
          name: g.name,
          description: g.description,
          imageUrl: g.imageUrl ?? undefined,
          smartAccountAddress: g.smartAccountAddress ?? g.walletAddress ?? undefined,
          isActive: g.isActive ?? true,
          votingThreshold: g.votingThreshold ?? 51,
          createdAt: g.createdAt,
          updatedAt: g.updatedAt,
        }))
        setGroups(mappedGroups as any)

        if (!mappedGroups || mappedGroups.length === 0) {
          setCurrentGroup(null)
          // No groups — UI will show empty-state
          return
        }

        const current = mappedGroups[0]
        setCurrentGroup(current as any)

        // Populate members if available from original API response
        const apiGroup = (apiGroups || [])[0]
        const members = (apiGroup as any)?.members
        if (members && Array.isArray(members)) {
          setGroupMembers(members as any)
        } else {
          // Fetch full group details if needed
          try {
            const fullGroup = await groupsApi.getById(current.id)
            const fullMembers = (fullGroup as any).members
            if (fullMembers && Array.isArray(fullMembers)) {
              setGroupMembers(fullMembers as any)
            }
          } catch (_) {}
        }

        // Load proposals for the group
        try {
          const rawProposals = await proposalsApi.getByGroup(current.id)
          const mappedProposals = (rawProposals || []).map((p: any) => ({
            id: p.id,
            billId: p.billId,
            groupId: p.groupId,
            createdBy: p.createdBy,
            title: p.title,
            description: p.description,
            status: String(p.status || "PENDING").toUpperCase(),
            votesFor: p.votesFor || 0,
            votesAgainst: p.votesAgainst || 0,
            votesAbstain: p.votesAbstain || 0,
            votingDeadline: p.votingDeadline || new Date().toISOString(),
            createdAt: p.createdAt || new Date().toISOString(),
            updatedAt: p.updatedAt || new Date().toISOString(),
          }))
          setProposals(mappedProposals as any)
        } catch (e) {
          setProposals([] as any)
        }

        // Load bills for the group
        try {
          const rawBills = await billsApi.getByGroup(current.id)
          const mappedBills = (rawBills || []).map((b: any) => ({
            id: b.id,
            groupId: b.groupId,
            createdBy: b.createdBy,
            title: b.title,
            description: b.description,
            totalAmount: b.amount ?? b.totalAmount ?? 0,
            currency: b.currency || "USDC",
            dueDate: b.dueDate,
            payeeAddress: b.payeeAddress || "",
            status: String(b.status || "DRAFT").toUpperCase(),
            createdAt: b.createdAt,
            updatedAt: b.updatedAt,
          }))
          setBills(mappedBills as any)
        } catch (e) {
          setBills([] as any)
        }

        // Load transactions for the group
        try {
          const txs = await transactionsApi.getByGroup(current.id)
          setTransactions(txs as any)
        } catch (e) {
          setTransactions([] as any)
        }
      } catch (error) {
        console.error("Failed to initialize dashboard:", error)
      }
    }

    init()
  }, [user, router, setUser, setWallet, setGroups, setCurrentGroup, setGroupMembers, setProposals, setBills, setTransactions])

  if (!user) {
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
              <h1 className="text-xl font-bold">Roomy</h1>
              <p className="text-sm text-muted-foreground">{currentGroup ? currentGroup.name : "No group selected"}</p>
            </div>
          </div>
          <UserNav />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {!currentGroup ? (
          <div className="grid gap-6">
            <div className="rounded-lg border bg-card p-6 text-center">
              <p className="text-lg font-semibold">No groups found</p>
              <p className="text-sm text-muted-foreground mt-1">Create or join a group to get started.</p>
            </div>
          </div>
        ) : (
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
        )}
      </main>
    </div>
  )
}
