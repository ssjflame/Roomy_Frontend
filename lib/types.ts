// Backend API Response Envelope
export interface ApiResponse<T = unknown> {
  success: boolean
  message?: string
  data?: T
  error?: string
  errors?: Record<string, string[]> // for validation errors
}

// User types matching backend schema
export interface User {
  id: string
  email: string
  username: string
  firstName?: string
  lastName?: string
  phoneNumber?: string
  walletAddress?: string
  avatarUrl?: string
  isEmailVerified: boolean
  lastLoginAt?: string
  createdAt: string
  updatedAt: string
}

// Wallet type for Openfort integration
export interface Wallet {
  id: string
  userId: string
  openfortPlayerId: string
  address: string
  chainId: number
  balance: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// Auth response data structure
export interface AuthData {
  user: User
  accessToken: string
  refreshToken: string
  wallet?: Wallet
}

export interface AuthResponse extends ApiResponse<AuthData> {}

// Group types matching backend schema
export interface Group {
  id: string
  name: string
  description?: string
  walletAddress: string
  balance: number
  createdAt: string
  updatedAt: string
  members: GroupMember[]
}

export interface GroupMember {
  id: string
  userId: string
  groupId: string
  role: "admin" | "member"
  joinedAt: string
  user: User
}

// Bill items
export interface BillItem {
  id: string
  description: string
  amount: number
  quantity: number
}

// Bill types matching backend schema
export interface Bill {
  id: string
  groupId: string
  createdBy: string
  title: string
  description?: string
  totalAmount: number
  currency: "USDC" | "ETH" | "MATIC"
  dueDate?: string
  payeeAddress: string
  categoryId?: string
  attachmentUrl?: string
  status: "DRAFT" | "PROPOSED" | "APPROVED" | "REJECTED" | "PAID" | "CANCELLED"
  createdAt: string
  updatedAt: string
  items?: BillItem[]
  creator?: { id: string; username: string; email: string }
  category?: { id: string; name: string; color?: string }
  group?: { id: string; name: string }
  proposal?: Proposal
  transactions?: Transaction[]
}

// Proposals & votes
export interface Proposal {
  id: string
  billId: string
  groupId: string
  createdBy: string
  title: string
  description?: string
  status: "PENDING" | "APPROVED" | "REJECTED" | "EXECUTED" | "EXPIRED" | "CANCELLED"
  votesFor: number
  votesAgainst: number
  votesAbstain: number
  votingDeadline: string
  executedAt?: string
  createdAt: string
  updatedAt: string
  votes?: ProposalVote[]
}

export interface ProposalVote {
  id: string
  proposalId: string
  userId: string
  voteType: "FOR" | "AGAINST" | "ABSTAIN"
  comment?: string
  votedAt: string
  voter?: { id: string; username: string; email: string }
}

// Transaction types matching backend schema
export interface Transaction {
  id: string
  billId?: string
  groupId?: string
  senderId?: string
  receiverId?: string
  amount: number
  currency: "USDC" | "ETH" | "MATIC"
  txHash?: string
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | "CANCELLED"
  type: "BILL_PAYMENT" | "DEPOSIT" | "WITHDRAWAL" | "REFUND" | "TRANSFER"
  description?: string
  metadata?: string
  createdAt: string
  updatedAt: string
}

// API request types matching backend specification
export interface RegisterRequest {
  email: string
  username: string
  password: string
  firstName?: string
  lastName?: string
  phoneNumber?: string
}

export interface LoginRequest {
  emailOrUsername: string
  password: string
}

export interface RefreshTokenRequest {
  refreshToken: string
}

export interface LogoutRequest {
  refreshToken: string
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}

export interface CreateGroupRequest {
  name: string
  description?: string
  smartAccountAddress?: string
}

export interface CreateBillRequest {
  groupId: string
  title: string
  description?: string
  totalAmount: number
  currency?: "USDC" | "ETH" | "MATIC"
  dueDate?: string
  payeeAddress: string
  categoryId?: string
  attachmentUrl?: string
  items?: { description: string; amount: number; quantity?: number }[]
}

export interface VoteRequest {
  isApproved: boolean
  comment?: string
}
