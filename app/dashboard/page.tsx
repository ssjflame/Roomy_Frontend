"use client"

import { useEffect, useState } from "react"
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
  const [isInitialized, setIsInitialized] = useState(false)
  const [isLoadingGroupData, setIsLoadingGroupData] = useState(false)
  const [error, setError] = useState<string | null>(null)
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

  // Helper function to fetch group-specific data with parallel API calls and retry logic
  const fetchGroupData = async (groupId: string, retryCount = 0) => {
    console.log("Dashboard: Fetching data for group", groupId, retryCount > 0 ? `(retry ${retryCount})` : '')
    setIsLoadingGroupData(true)
    
    const maxRetries = 2
    const retryDelay = 1000 * (retryCount + 1) // Progressive delay: 1s, 2s, 3s
    
    try {
      // Execute all API calls in parallel for better performance with timeout
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 10000) // 10 second timeout
      )

      const [billsResult, proposalsResult, transactionsResult] = await Promise.allSettled([
        Promise.race([billsApi.getByGroup(groupId), timeoutPromise]),
        Promise.race([proposalsApi.getByGroup(groupId), timeoutPromise]),
        Promise.race([transactionsApi.getByGroup(groupId), timeoutPromise])
      ])

      // Handle bills result
      if (billsResult.status === 'fulfilled') {
        setBills(billsResult.value as any)
      } else {
        console.warn("Failed to fetch bills:", billsResult.reason)
        setBills([] as any)
      }

      // Handle proposals result
      if (proposalsResult.status === 'fulfilled') {
        setProposals(proposalsResult.value as any)
      } else {
        console.warn("Failed to fetch proposals:", proposalsResult.reason)
        setProposals([] as any)
      }

      // Handle transactions result
      if (transactionsResult.status === 'fulfilled') {
        setTransactions(transactionsResult.value as any)
      } else {
        console.warn("Failed to fetch transactions:", transactionsResult.reason)
        setTransactions([] as any)
      }

      console.log("Dashboard: Group data fetching completed")
    } catch (error) {
      console.error("Dashboard: Error during group data fetch:", error)
      
      // Retry logic for network failures
      if (retryCount < maxRetries && (
        error instanceof Error && (
          error.message.includes('fetch') || 
          error.message.includes('network') ||
          error.message.includes('timeout')
        )
      )) {
        console.log(`Dashboard: Retrying in ${retryDelay}ms...`)
        setTimeout(() => {
          fetchGroupData(groupId, retryCount + 1)
        }, retryDelay)
        return // Don't set loading to false yet
      }
      
      // Set empty arrays as fallback after all retries failed
      setBills([] as any)
      setProposals([] as any)
      setTransactions([] as any)
    } finally {
      // Only set loading to false if we're not retrying
      if (retryCount >= maxRetries) {
        setIsLoadingGroupData(false)
      } else {
        setIsLoadingGroupData(false)
      }
    }
  }

  // Initial setup effect - runs once when component mounts or user changes
  useEffect(() => {
    console.log("Dashboard: Initial setup useEffect triggered", { user })
    
    const init = async () => {
      // Check if authentication token exists before making any API calls
      const authToken = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null
      
      if (!authToken) {
        console.log("Dashboard: No authentication token found, redirecting to login")
        setError("Authentication required. Please log in.")
        router.push("/auth/login")
        return
      }

      // Check if user is authenticated
      if (!user) {
        console.log("Dashboard: No user found, attempting to get profile")
        
        try {
          const profile = await authApi.getProfile()
          console.log("Dashboard: Profile retrieved from backend", profile)
          setUser({
            ...profile.user,
            isEmailVerified: profile.user.isEmailVerified ?? true,
            avatarUrl: profile.user.avatarUrl ?? undefined,
            lastLoginAt: profile.user.lastLoginAt ?? new Date().toISOString()
          })
          if (profile.wallet) setWallet(profile.wallet)
          
          // If wallet isn't present yet, trigger session to provision it
          if (!profile.wallet) {
            try {
              const { wallet } = await authApi.session()
              if (wallet) setWallet(wallet)
            } catch (_) {}
          }
        } catch (e) {
          console.error("Dashboard: Failed to get user profile", e)
          setError("Authentication required. Please log in.")
          // Clear invalid tokens and redirect to login
          localStorage.removeItem("auth_token")
          localStorage.removeItem("refresh_token")
          router.push("/auth/login")
          return
        }
      }

      try {
        console.log("Dashboard: Fetching groups")
        
        const apiGroups = await groupsApi.getAll()
        console.log("Dashboard: Groups fetched from backend", apiGroups)
        const mappedGroups = (apiGroups || []).map((g: any) => ({
          id: g.id,
          name: g.name,
          description: g.description,
          imageUrl: g.imageUrl ?? undefined,
          smartAccountAddress: g.smartAccountAddress ?? g.walletAddress ?? undefined,
          isActive: g.isActive ?? true,
          votingThreshold: g.votingThreshold ?? 51,
          balance: g.balance ?? 0,
          balances: g.balances ?? { eth: 0, usdc: 0 },
          createdAt: g.createdAt,
          updatedAt: g.updatedAt,
        }))
        setGroups(mappedGroups as any)

        if (!mappedGroups || mappedGroups.length === 0) {
          console.log("Dashboard: No groups found from backend")
          setCurrentGroup(null)
          setIsInitialized(true)
          return
        }

        // Only set a default group if no group is currently selected
        let current = currentGroup
        if (!current || !mappedGroups.find(g => g.id === current?.id)) {
          current = mappedGroups[0]
          console.log("Dashboard: Set current group from backend", current)
        }

        // Fetch complete group data including balance for the current group
        if (current) {
          try {
            console.log("Dashboard: Fetching complete group data with balance for", current.id)
            const completeGroupData = await groupsApi.getById(current.id)
            console.log("Dashboard: Complete group data fetched", completeGroupData)
            
            // Update the current group with complete data including balance
            const updatedGroup = {
              ...current,
              balance: completeGroupData.balance || 0,
              balances: completeGroupData.balances || { eth: 0, usdc: 0 }
            }
            setCurrentGroup(updatedGroup as any)
            console.log("Dashboard: Updated current group with balance data", updatedGroup)
            
            await fetchGroupData(current.id)
          } catch (error) {
            console.error("Dashboard: Failed to fetch complete group data:", error)
            setCurrentGroup(current as any)
            await fetchGroupData(current.id)
          }
        }
          
      } catch (error) {
        console.error("Failed to load groups:", error)
        
        // Check if it's an authentication error
        if (error && typeof error === 'object' && 'response' in error) {
          const axiosError = error as any
          if (axiosError.response?.status === 401) {
            console.log("Dashboard: Authentication error while fetching groups, redirecting to login")
            localStorage.removeItem("auth_token")
            localStorage.removeItem("refresh_token")
            router.push("/auth/login")
            return
          }
        }
        
        setError("Failed to load groups. Please try again.")
        // Set empty groups instead of mock data
        setGroups([])
        setCurrentGroup(null)
      }
      
      setIsInitialized(true)
    }

    init()
  }, [user]) // Simplified dependencies to prevent unnecessary re-renders

  // Group change effect - runs when currentGroup changes
  useEffect(() => {
    console.log("Dashboard: Group change useEffect triggered", { currentGroup, isInitialized })
    
    if (isInitialized && currentGroup) {
      fetchGroupData(currentGroup.id)
    }
  }, [currentGroup, isInitialized]) // Keep these dependencies as they're essential for group switching

  console.log("Dashboard: Rendering", { user: !!user, currentGroup: !!currentGroup, isInitialized })

  if (!isInitialized) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    console.log("Dashboard: No user, returning null")
    return null
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {!currentGroup ? (
        <div className="grid gap-6">
          <div className="rounded-lg border bg-card p-6 text-center">
            <p className="text-lg font-semibold">No groups found</p>
            <p className="text-sm text-muted-foreground mt-1">Create or join a group to get started.</p>
          </div>
        </div>
      ) : isLoadingGroupData ? (
        <div className="grid gap-4 sm:gap-6">
          {/* Loading state for group data */}
          <div className="flex items-center justify-center min-h-[200px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading group data...</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:gap-6">
          {/* Stats Overview */}
          <StatsOverview />

          {/* Balance, Members, and Voting Stats Row */}
          <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <GroupBalance />
            <GroupMembers />
            <VotingStats />
          </div>

          {/* Proposals List */}
          <ProposalsList />
        </div>
      )}
    </div>
  )
}

