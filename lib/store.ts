import { create } from "zustand"

export type ProposalStatus = "pending" | "approved" | "rejected" | "paid"

export interface Proposal {
  id: string
  title: string
  description: string
  amount: number
  dueDate: string
  status: ProposalStatus
  createdBy: string
  createdAt: string
  votes: {
    approve: number
    reject: number
    voters: string[]
  }
}

export interface Group {
  id: string
  name: string
  walletAddress: string
  balance: number
  members: string[]
}

interface AppState {
  // User state
  user: {
    id: string
    email: string
    walletAddress: string
  } | null
  setUser: (user: AppState["user"]) => void

  // Group state
  currentGroup: Group | null
  setCurrentGroup: (group: Group | null) => void

  // Proposals state
  proposals: Proposal[]
  setProposals: (proposals: Proposal[]) => void
  addProposal: (proposal: Proposal) => void
  updateProposal: (id: string, updates: Partial<Proposal>) => void

  // Vote on proposal
  voteOnProposal: (proposalId: string, vote: "approve" | "reject", userId: string) => void

  // Loading states
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
}

export const useStore = create<AppState>((set, get) => ({
  user: null,
  setUser: (user) => set({ user }),

  currentGroup: null,
  setCurrentGroup: (group) => set({ currentGroup: group }),

  proposals: [],
  setProposals: (proposals) => set({ proposals }),
  addProposal: (proposal) =>
    set((state) => ({
      proposals: [proposal, ...state.proposals],
    })),
  updateProposal: (id, updates) =>
    set((state) => ({
      proposals: state.proposals.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    })),

  voteOnProposal: (proposalId, vote, userId) =>
    set((state) => {
      const { currentGroup } = get()
      const totalMembers = currentGroup?.members.length || 4
      const votesNeeded = Math.ceil(totalMembers / 2)

      return {
        proposals: state.proposals.map((p) => {
          if (p.id !== proposalId || p.votes.voters.includes(userId)) {
            return p
          }

          const newVotes = {
            approve: p.votes.approve + (vote === "approve" ? 1 : 0),
            reject: p.votes.reject + (vote === "reject" ? 1 : 0),
            voters: [...p.votes.voters, userId],
          }

          // Automatically update status based on vote threshold
          let newStatus = p.status
          if (newVotes.approve >= votesNeeded) {
            newStatus = "approved"
          } else if (newVotes.reject >= votesNeeded) {
            newStatus = "rejected"
          }

          return {
            ...p,
            votes: newVotes,
            status: newStatus,
          }
        }),
      }
    }),

  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),
}))
