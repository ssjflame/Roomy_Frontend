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

// Bill types matching backend schema
export interface Bill {
  id: string
  groupId: string
  title: string
  description?: string
  amount: number
  createdBy: string
  status: "pending" | "approved" | "rejected" | "paid"
  dueDate?: string
  createdAt: string
  updatedAt: string
  votes: Vote[]
  creator: User
}

export interface Vote {
  id: string
  billId: string
  userId: string
  vote: "approve" | "reject"
  createdAt: string
  user: User
}

// Transaction types matching backend schema
export interface Transaction {
  id: string
  groupId: string
  billId?: string
  amount: number
  type: "deposit" | "withdrawal" | "payment"
  status: "pending" | "completed" | "failed"
  transactionHash?: string
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
}

export interface CreateBillRequest {
  groupId: string
  title: string
  description?: string
  amount: number
  dueDate?: string
}

export interface VoteRequest {
  billId: string
  vote: "approve" | "reject"
}
