import { create } from "zustand"
import { persist } from "zustand/middleware"

// ============================================
// ENUMS
// ============================================
export type MemberRole = "ADMIN" | "MEMBER" | "VIEWER"
export type BillStatus = "DRAFT" | "PROPOSED" | "APPROVED" | "REJECTED" | "PAID" | "CANCELLED"
export type ProposalStatus = "PENDING" | "APPROVED" | "REJECTED" | "EXECUTED" | "EXPIRED" | "CANCELLED"
export type VoteType = "FOR" | "AGAINST" | "ABSTAIN"
export type TransactionStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | "CANCELLED"
export type TransactionType = "BILL_PAYMENT" | "DEPOSIT" | "WITHDRAWAL" | "REFUND" | "TRANSFER"
export type RecurringFrequency = "DAILY" | "WEEKLY" | "BIWEEKLY" | "MONTHLY" | "QUARTERLY" | "YEARLY"
export type NotificationType = 
  | "BILL_PROPOSED" 
  | "VOTE_REQUESTED" 
  | "PROPOSAL_APPROVED" 
  | "PROPOSAL_REJECTED" 
  | "PAYMENT_COMPLETED" 
  | "PAYMENT_FAILED" 
  | "MEMBER_JOINED" 
  | "MEMBER_LEFT" 
  | "BUDGET_ALERT"

// ============================================
// USER & AUTHENTICATION
// ============================================
export interface User {
  id: string
  email: string
  username: string
  firstName?: string
  lastName?: string
  phoneNumber?: string
  avatarUrl?: string
  isEmailVerified: boolean
  lastLoginAt?: string
  createdAt: string
  updatedAt: string
}

// ============================================
// WALLET
// ============================================
export interface Wallet {
  id: string
  userId: string
  openfortPlayerId: string
  address: string
  chainId: number
  balance: number
  balances?: { eth: number; usdc: number }
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// ============================================
// GROUP & MEMBERS
// ============================================
export interface Group {
  id: string
  name: string
  description?: string
  imageUrl?: string
  smartAccountAddress?: string
  balance?: number
  balances?: { eth: number; usdc: number }
  isActive: boolean
  votingThreshold: number
  createdAt: string
  updatedAt: string
}

export interface GroupMember {
  id: string
  groupId: string
  userId: string
  role: MemberRole
  joinedAt: string
  isActive: boolean
  user?: User
}

// ============================================
// BILLS & EXPENSES
// ============================================
export interface BillItem {
  id: string
  billId: string
  description: string
  amount: number
  quantity: number
}

export interface Bill {
  id: string
  groupId: string
  createdBy: string
  title: string
  description?: string
  totalAmount: number
  currency: string
  dueDate?: string
  payeeAddress: string
  categoryId?: string
  attachmentUrl?: string
  status: BillStatus
  createdAt: string
  updatedAt: string
  items?: BillItem[]
  creator?: User
  category?: BudgetCategory
}

// ============================================
// PROPOSALS & VOTING
// ============================================
export interface Proposal {
  id: string
  billId: string
  groupId: string
  createdBy: string
  title: string
  description?: string
  status: ProposalStatus
  votesFor: number
  votesAgainst: number
  votesAbstain: number
  votingDeadline: string
  executedAt?: string
  createdAt: string
  updatedAt: string
  bill?: Bill
  creator?: User
  votes?: Vote[]
}

export interface Vote {
  id: string
  proposalId: string
  userId: string
  voteType: VoteType
  comment?: string
  votedAt: string
  voter?: User
}

// ============================================
// TRANSACTIONS
// ============================================
export interface Transaction {
  id: string
  billId?: string
  groupId?: string
  senderId?: string
  receiverId?: string
  amount: number
  currency: string
  txHash?: string
  status: TransactionStatus
  type: TransactionType
  description?: string
  metadata?: string
  createdAt: string
  updatedAt: string
  bill?: Bill
  sender?: User
  receiver?: User
}

// ============================================
// BUDGET & CATEGORIES
// ============================================
export interface BudgetCategory {
  id: string
  groupId: string
  name: string
  color?: string
  icon?: string
  monthlyLimit?: number
  isActive: boolean
  createdAt: string
}

// ============================================
// RECURRING BILLS
// ============================================
export interface RecurringBill {
  id: string
  groupId: string
  title: string
  description?: string
  amount: number
  currency: string
  payeeAddress: string
  frequency: RecurringFrequency
  startDate: string
  nextDueDate: string
  endDate?: string
  isActive: boolean
  autoPropose: boolean
  categoryId?: string
  createdAt: string
  updatedAt: string
  category?: BudgetCategory
}

// ============================================
// NOTIFICATIONS
// ============================================
export interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  message: string
  metadata?: string
  isRead: boolean
  createdAt: string
}

// ============================================
// APP STATE
// ============================================
interface AppState {
  // User state
  user: User | null
  wallet: Wallet | null
  setUser: (user: User | null) => void
  setWallet: (wallet: Wallet | null) => void

  // Groups state
  groups: Group[]
  currentGroup: Group | null
  groupMembers: GroupMember[]
  setGroups: (groups: Group[]) => void
  setCurrentGroup: (group: Group | null) => void
  setGroupMembers: (members: GroupMember[]) => void
  addGroup: (group: Group) => void
  updateCurrentGroupBalance: (balanceData: { balance?: number; balances?: { eth: number; usdc: number } }) => void

  // Bills state
  bills: Bill[]
  setBills: (bills: Bill[]) => void
  addBill: (bill: Bill) => void
  updateBill: (id: string, updates: Partial<Bill>) => void

  // Proposals state
  proposals: Proposal[]
  setProposals: (proposals: Proposal[]) => void
  addProposal: (proposal: Proposal) => void
  updateProposal: (id: string, updates: Partial<Proposal>) => void
  voteOnProposal: (proposalId: string, vote: VoteType, userId: string) => void

  // Transactions state
  transactions: Transaction[]
  setTransactions: (transactions: Transaction[]) => void
  addTransaction: (transaction: Transaction) => void

  // Budget categories state
  budgetCategories: BudgetCategory[]
  setBudgetCategories: (categories: BudgetCategory[]) => void
  addBudgetCategory: (category: BudgetCategory) => void

  // Recurring bills state
  recurringBills: RecurringBill[]
  setRecurringBills: (bills: RecurringBill[]) => void
  addRecurringBill: (bill: RecurringBill) => void

  // Notifications state
  notifications: Notification[]
  setNotifications: (notifications: Notification[]) => void
  addNotification: (notification: Notification) => void
  markNotificationAsRead: (id: string) => void

  // Loading states
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
  // User state
  user: null,
  wallet: null,
  setUser: (user) => set({ user }),
  setWallet: (wallet) => set({ wallet }),

  // Groups state
  groups: [],
  currentGroup: null,
  groupMembers: [],
  setGroups: (groups) => set({ groups }),
  setCurrentGroup: (group) => set({ currentGroup: group }),
  setGroupMembers: (members) => set({ groupMembers: members }),
  addGroup: (group) =>
    set((state) => ({
      groups: [group, ...state.groups],
    })),
  updateCurrentGroupBalance: (balanceData: { balance?: number; balances?: { eth: number; usdc: number } }) =>
    set((state) => ({
      currentGroup: state.currentGroup ? {
        ...state.currentGroup,
        balance: balanceData.balance ?? state.currentGroup.balance,
        balances: balanceData.balances ?? state.currentGroup.balances
      } : null
    })),

  // Bills state
  bills: [],
  setBills: (bills) => set({ bills }),
  addBill: (bill) =>
    set((state) => ({
      bills: [bill, ...state.bills],
    })),
  updateBill: (id, updates) =>
    set((state) => ({
      bills: state.bills.map((b) => (b.id === id ? { ...b, ...updates } : b)),
    })),

  // Proposals state
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

  voteOnProposal: (proposalId, voteType, userId) =>
    set((state) => {
      const { currentGroup, groupMembers } = get()
      const totalMembers = groupMembers.filter((m) => m.groupId === currentGroup?.id && m.isActive).length || 4
      const votesNeeded = Math.ceil((totalMembers * (currentGroup?.votingThreshold || 51)) / 100)

      return {
        proposals: state.proposals.map((p) => {
          if (p.id !== proposalId) {
            return p
          }

          // Check if user already voted
          const hasVoted = p.votes?.some((v) => v.userId === userId)
          if (hasVoted) {
            return p
          }

          // Create new vote entry
          const newVote: Vote = {
            id: `vote_${Date.now()}_${userId}`,
            proposalId: proposalId,
            userId: userId,
            voteType: voteType,
            votedAt: new Date().toISOString(),
          }

          const newVotesFor = p.votesFor + (voteType === "FOR" ? 1 : 0)
          const newVotesAgainst = p.votesAgainst + (voteType === "AGAINST" ? 1 : 0)
          const newVotesAbstain = p.votesAbstain + (voteType === "ABSTAIN" ? 1 : 0)
          const updatedVotes = [...(p.votes || []), newVote]

          // Automatically update status based on vote threshold
          let newStatus = p.status
          if (newVotesFor >= votesNeeded) {
            newStatus = "APPROVED"
          } else if (newVotesAgainst >= votesNeeded) {
            newStatus = "REJECTED"
          } else if (new Date(p.votingDeadline) < new Date()) {
            newStatus = "EXPIRED"
          }

          return {
            ...p,
            votesFor: newVotesFor,
            votesAgainst: newVotesAgainst,
            votesAbstain: newVotesAbstain,
            status: newStatus,
            votes: updatedVotes,
            updatedAt: new Date().toISOString(),
          }
        }),
      }
    }),

  // Transactions state
  transactions: [],
  setTransactions: (transactions) => set({ transactions }),
  addTransaction: (transaction) =>
    set((state) => ({
      transactions: [transaction, ...state.transactions],
    })),

  // Budget categories state
  budgetCategories: [],
  setBudgetCategories: (categories) => set({ budgetCategories: categories }),
  addBudgetCategory: (category) =>
    set((state) => ({
      budgetCategories: [category, ...state.budgetCategories],
    })),

  // Recurring bills state
  recurringBills: [],
  setRecurringBills: (bills) => set({ recurringBills: bills }),
  addRecurringBill: (bill) =>
    set((state) => ({
      recurringBills: [bill, ...state.recurringBills],
    })),

  // Notifications state
  notifications: [],
  setNotifications: (notifications) => set({ notifications }),
  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications],
    })),
  markNotificationAsRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    })),

  // Loading states
  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),
}),
    {
      name: "roomy-storage",
      partialize: (state) => ({ 
        currentGroup: state.currentGroup,
        bills: state.bills,
        user: state.user,
        wallet: state.wallet
      }),
    }
  )
)
