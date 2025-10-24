// User types matching backend schema
export interface User {
  id: string
  email: string
  name: string
  walletAddress?: string
  createdAt: string
  updatedAt: string
}

export interface AuthResponse {
  user: User
  token: string
}

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

// API request/response types
export interface RegisterRequest {
  email: string
  password: string
  name: string
}

export interface LoginRequest {
  email: string
  password: string
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
