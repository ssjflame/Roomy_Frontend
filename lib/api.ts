import type {
  User,
  Wallet,
  AuthResponse,
  AuthData,
  ApiResponse,
  Group,
  Bill,
  Transaction,
  RegisterRequest,
  LoginRequest,
  RefreshTokenRequest,
  LogoutRequest,
  ChangePasswordRequest,
  CreateGroupRequest,
  CreateBillRequest,
  VoteRequest,
} from "./types"

// Backend API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api"

// Helper function to get auth token from localStorage
const getAuthToken = (): string | null => {
  if (typeof window === "undefined") return null
  return localStorage.getItem("auth_token")
}

// Helper function to get refresh token from localStorage
const getRefreshToken = (): string | null => {
  if (typeof window === "undefined") return null
  return localStorage.getItem("refresh_token")
}

// Helper function to refresh access token
const refreshAccessToken = async (): Promise<string | null> => {
  const refreshToken = getRefreshToken()
  if (!refreshToken) return null

  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    })

    const result: ApiResponse = await response.json()

    if (result.success && result.data) {
      const { accessToken } = result.data as { accessToken: string }
      localStorage.setItem("auth_token", accessToken)
      return accessToken
    }
  } catch (error) {
    console.error("Token refresh failed:", error)
  }

  // If refresh fails, clear tokens and redirect to login
  localStorage.removeItem("auth_token")
  localStorage.removeItem("refresh_token")
  return null
}

// Helper function to make authenticated requests with auto-refresh
async function fetchWithAuth<T = unknown>(url: string, options: RequestInit = {}): Promise<{ success: boolean; data: T } | { success: false; error: string; data: T }> {
  let token = getAuthToken()
  
  const makeRequest = async (authToken: string | null) => {
    const headers = new Headers(options.headers as HeadersInit)
    headers.set("Content-Type", "application/json")
    if (authToken) {
      headers.set("Authorization", `Bearer ${authToken}`)
    }

    try {
      const response = await fetch(`${API_BASE_URL}${url}`, {
        ...options,
        headers,
      })
      return response
    } catch (error) {
      const err = new Error("Network request failed")
      ;(err as any).cause = error
      ;(err as any).isNetworkError = true
      ;(err as any).url = `${API_BASE_URL}${url}`
      throw err
    }
  }

  // First attempt
  let response = await makeRequest(token)
  
  // If unauthorized and we have a refresh token, try to refresh
  if (response.status === 401 && getRefreshToken()) {
    const newToken = await refreshAccessToken()
    if (newToken) {
      // Retry with new token
      response = await makeRequest(newToken)
    }
  }

  let result: ApiResponse
  try {
    result = await response.json()
  } catch (jsonError) {
    const err = new Error("Invalid JSON response")
    ;(err as any).cause = jsonError
    ;(err as any).status = response.status
    throw err
  }

  if (!result.success) {
    // If unauthorized/expired, force logout and redirect without throwing noisy errors
    if (response.status === 401 || (result.error && /expired|unauthorized/i.test(result.error))) {
      try {
        if (typeof window !== "undefined") {
          try {
            localStorage.removeItem("auth_token")
            localStorage.removeItem("refresh_token")
            localStorage.setItem("session_expired", "1")
          } catch {}
          try {
            document.cookie = "auth_token=; Max-Age=0; Path=/; SameSite=Lax"
            document.cookie = "refresh_token=; Max-Age=0; Path=/; SameSite=Lax"
          } catch {}
          const url = new URL("/auth/login", window.location.origin)
          url.searchParams.set("expired", "1")
          window.location.href = url.toString()
        }
      } catch {}
      // Return a special envelope to avoid throwing an error
      return { success: false, error: "SESSION_EXPIRED", data: null as T }
    }

    const err = new Error(result.error || "Request failed")
    ;(err as any).errors = result.errors
    ;(err as any).status = response.status
    throw err
  }

  return result as { success: boolean; data: T }
}

// Helper function to make unauthenticated requests
async function fetchApi<T = unknown>(url: string, options: RequestInit = {}): Promise<{ success: boolean; data: T }> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  }

  try {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers,
    })

    let result: ApiResponse
    try {
      result = await response.json()
    } catch (jsonError) {
      const err = new Error("Invalid JSON response")
      ;(err as any).cause = jsonError
      ;(err as any).status = response.status
      throw err
    }

    if (!result.success) {
      const err = new Error(result.error || "Request failed")
      ;(err as any).errors = result.errors
      ;(err as any).status = response.status
      throw err
    }

    return result as { success: boolean; data: T }
  } catch (error) {
    const err = new Error("Network request failed")
    ;(err as any).cause = error
    ;(err as any).url = `${API_BASE_URL}${url}`
    throw err
  }
}

// ============================================================================
// USER / AUTH API
// ============================================================================

export const authApi = {
  /**
   * Register a new user
   */
  async register(data: RegisterRequest): Promise<AuthData> {
    const response = await fetchApi<AuthData>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    })
    return response.data
  },

  /**
   * Login user
   */
  async login(data: LoginRequest): Promise<AuthData> {
    const response = await fetchApi<AuthData>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    })
    return response.data
  },

  /**
   * Refresh access token
   */
  async refresh(data: RefreshTokenRequest): Promise<{ accessToken: string }> {
    const response = await fetchApi("/auth/refresh", {
      method: "POST",
      body: JSON.stringify(data),
    })
    return response.data as { accessToken: string }
  },

  /**
   * Logout user (invalidate refresh token)
   */
  async logout(data: LogoutRequest): Promise<void> {
    await fetchApi("/auth/logout", {
      method: "POST",
      body: JSON.stringify(data),
    })
  },

  /**
   * Logout from all devices
   */
  async logoutAll(): Promise<void> {
    await fetchWithAuth("/auth/logout-all", {
      method: "POST",
    })
  },

  /**
   * Change password
   */
  async changePassword(data: ChangePasswordRequest): Promise<void> {
    await fetchWithAuth("/auth/change-password", {
      method: "POST",
      body: JSON.stringify(data),
    })
  },

  /**
   * Get current user profile
   */
  async getProfile(): Promise<{ user: User; wallet?: Wallet }> {
    const response = await fetchWithAuth<{ user: User; wallet?: Wallet }>("/auth/me")
    return response.data
  },

  /**
   * Forgot password
   */
  async forgotPassword(email: string): Promise<void> {
    await fetchApi("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    })
  },

  /**
   * Reset password
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    await fetchApi("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, newPassword }),
    })
  },

  /**
   * Update user profile
   */
  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await fetchWithAuth<{ user: User }>("/users/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    })
    return response.data.user
  },

  /**
   * Delete user account
   */
  async deleteAccount(): Promise<void> {
    await fetchWithAuth("/users/account", {
      method: "DELETE",
    })
  },

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<User> {
    const response = await fetchWithAuth<{ user: User }>(`/users/${userId}`)
    return response.data.user
  },

  /**
   * Get user groups
   */
  async getUserGroups(): Promise<Group[]> {
    const response = await fetchWithAuth<Group[]>("/users/groups")
    return response.data
  },

  /**
   * Get user wallet
   */
  async getUserWallet(): Promise<Wallet> {
    const response = await fetchWithAuth<{ wallet: Wallet }>("/users/wallet")
    return response.data.wallet
  },

  /**
   * Provision user wallet
   */
  async provisionWallet(): Promise<Wallet> {
    const response = await fetchWithAuth<{ wallet: Wallet }>("/users/wallet/provision", {
      method: "POST",
    })
    return response.data.wallet
  },

  /**
   * Get user notifications
   */
  async getNotifications(): Promise<any[]> {
    const response = await fetchWithAuth<any[]>("/users/notifications")
    return response.data
  },

  /**
   * Mark notification as read
   */
  async markNotificationRead(notificationId: string): Promise<void> {
    await fetchWithAuth(`/users/notifications/${notificationId}/read`, {
      method: "PUT",
    })
  },

  /**
   * Mark all notifications as read
   */
  async markAllNotificationsRead(): Promise<void> {
    await fetchWithAuth("/auth/notifications/mark-all-read", {
      method: "POST",
    })
  },

  /**
   * Get current session information
   */
  async session(): Promise<{ user: User; wallet?: Wallet }> {
    const response = await fetchWithAuth<{ user: User; wallet?: Wallet }>("/auth/me")
    return response.data
  },
}

// ============================================================================
// GROUPS API
// ============================================================================

export const groupsApi = {
  /**
   * Create a new group
   */
  async create(data: CreateGroupRequest): Promise<Group> {
    const response = await fetchWithAuth<Group>("/groups", {
      method: "POST",
      body: JSON.stringify(data),
    })
    return response.data
  },
  /**
   * Get all groups
   */
  async getAll(): Promise<Group[]> {
    const response = await fetchWithAuth<Group[]>("/groups")
    return response.data || []
  },

  /**
   * Get group by ID
   */
  async getById(id: string): Promise<Group> {
    const response = await fetchWithAuth<Group>(`/groups/${id}`)
    return response.data
  },

  /**
   * Update group
   */
  async update(id: string, data: Partial<CreateGroupRequest>): Promise<Group> {
    const response = await fetchWithAuth<Group>(`/groups/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
    return response.data
  },

  /**
   * Delete group
   */
  async delete(id: string): Promise<void> {
    await fetchWithAuth(`/groups/${id}`, {
      method: "DELETE",
    })
  },

  /**
   * Invite members to group
   */
  async inviteMembers(groupId: string, emails: string[], role: string = "MEMBER"): Promise<void> {
    await fetchWithAuth(`/groups/${groupId}/invite`, {
      method: "POST",
      body: JSON.stringify({ emails, role }),
    })
  },

  /**
   * Join group
   */
  async joinGroup(groupId: string, inviteToken: string): Promise<void> {
    await fetchWithAuth(`/groups/${groupId}/join`, {
      method: "POST",
      body: JSON.stringify({ inviteToken }),
    })
  },

  /**
   * Get group members
   */
  async getMembers(groupId: string): Promise<any[]> {
    const response = await fetchWithAuth<any[]>(`/groups/${groupId}/members`)
    return response.data
  },

  /**
   * Add member to group
   */
  async addMember(groupId: string, memberData: any): Promise<void> {
    await fetchWithAuth(`/groups/${groupId}/members`, {
      method: "POST",
      body: JSON.stringify(memberData),
    })
  },

  /**
   * Update member role
   */
  async updateMemberRole(groupId: string, memberId: string, role: string): Promise<void> {
    await fetchWithAuth(`/groups/${groupId}/members/${memberId}`, {
      method: "PUT",
      body: JSON.stringify({ role }),
    })
  },

  /**
   * Remove member from group
   */
  async removeMember(groupId: string, memberId: string): Promise<void> {
    await fetchWithAuth(`/groups/${groupId}/members/${memberId}`, {
      method: "DELETE",
    })
  },

  /**
   * Get group bills
   */
  async getBills(groupId: string, page?: number, limit?: number): Promise<Bill[]> {
    const params = new URLSearchParams()
    if (page) params.append("page", page.toString())
    if (limit) params.append("limit", limit.toString())
    const queryString = params.toString() ? `?${params.toString()}` : ""
    const response = await fetchWithAuth<Bill[]>(`/groups/${groupId}/bills${queryString}`)
    return response.data || []
  },

  /**
   * Get group transactions
   */
  async getTransactions(groupId: string, page?: number, limit?: number): Promise<Transaction[]> {
    const query = new URLSearchParams()
    if (page) query.set("page", String(page))
    if (limit) query.set("limit", String(limit))
    const queryString = query.toString()
    const response = await fetchWithAuth<Transaction[]>(`/groups/${groupId}/transactions${queryString ? `?${queryString}` : ""}`)
    return response.data
  },

  /**
   * Get group proposals
   */
  async getProposals(groupId: string): Promise<any[]> {
    const response = await fetchWithAuth<any[]>(`/groups/${groupId}/proposals`)
    return response.data
  },
}

// ============================================================================
// BILLS API
// ============================================================================

export const billsApi = {
  /**
   * Create a new bill
   */
  async create(data: CreateBillRequest): Promise<Bill> {
    const response = await fetchWithAuth<Bill>("/bills", {
      method: "POST",
      body: JSON.stringify(data),
    })
    return response.data
  },

  /**
   * Get all bills for current user
   */
  async getAll(page?: number, limit?: number): Promise<{ bills: Bill[]; pagination?: any }> {
    const query = new URLSearchParams()
    if (page) query.set("page", String(page))
    if (limit) query.set("limit", String(limit))
    const queryString = query.toString()
    const response = await fetchWithAuth(`/bills${queryString ? `?${queryString}` : ""}`)
    return response.data as { bills: Bill[]; pagination?: any }
  },

  /**
   * Get group bills with pagination
   */
  async getByGroup(groupId: string, page?: number, limit?: number): Promise<Bill[]> {
    const query = new URLSearchParams()
    query.set("groupId", groupId)
    if (page) query.set("page", String(page))
    if (limit) query.set("limit", String(limit))
    const response = await fetchWithAuth(`/bills?${query.toString()}`)
    return (response.data as Bill[]) || []
  },

  /**
   * Get bill by ID
   */
  async getById(id: string): Promise<Bill> {
    const response = await fetchWithAuth<Bill>(`/bills/${id}`)
    return response.data
  },

  /**
   * Update bill
   */
  async update(id: string, data: Partial<CreateBillRequest>): Promise<Bill> {
    const response = await fetchWithAuth<Bill>(`/bills/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
    return response.data
  },

  /**
   * Delete bill
   */
  async delete(id: string): Promise<void> {
    await fetchWithAuth(`/bills/${id}`, {
      method: "DELETE",
    })
  },

  /**
   * Get bill transactions
   */
  async getTransactions(billId: string): Promise<Transaction[]> {
    const response = await fetchWithAuth(`/bills/${billId}/transactions`)
    return response.data as Transaction[]
  },
}

// ============================================================================
// PROPOSALS API
// ============================================================================

export const proposalsApi = {
  /**
   * Create a new proposal
   */
  async create(data: { billId: string; title: string; description?: string; votingDeadline: string }): Promise<any> {
    const response = await fetchWithAuth("/proposals", {
      method: "POST",
      body: JSON.stringify(data),
    })
    return response.data as any
  },

  /**
   * Get proposals for a group
   */
  async getByGroup(groupId: string): Promise<any[]> {
    const response = await fetchWithAuth(`/proposals/groups/${groupId}`)
    return response.data as any[]
  },

  /**
   * Get proposal by ID
   */
  async getById(id: string): Promise<any> {
    const response = await fetchWithAuth(`/proposals/${id}`)
    return response.data as any
  },

  /**
   * Vote on a proposal
   */
  async vote(proposalId: string, payload: { isApproved: boolean; comment?: string }): Promise<any> {
    const response = await fetchWithAuth(`/proposals/${proposalId}/votes`, {
      method: "POST",
      body: JSON.stringify(payload),
    })
    return response.data as any
  },

  /**
   * Execute proposal
   */
  async execute(proposalId: string): Promise<any> {
    const response = await fetchWithAuth(`/proposals/${proposalId}/execute`, {
      method: "POST",
    })
    return response.data as any
  },
}

// ============================================================================
// TRANSACTIONS API
// ============================================================================

export const transactionsApi = {
  /**
   * Create a transaction (deposit, withdrawal, payment)
   */
  async create(payload: {
    billId?: string;
    groupId?: string;
    amount: number;
    currency?: string;
    type: "DEPOSIT" | "WITHDRAWAL" | "TRANSFER" | "BILL_PAYMENT";
    toAddress?: string;
    description?: string;
  }): Promise<any> {
    const response = await fetchWithAuth("/transactions", {
      method: "POST",
      body: JSON.stringify(payload),
    })
    return response.data as any
  },

  /**
   * Get transaction by ID
   */
  async getById(transactionId: string): Promise<Transaction> {
    const response = await fetchWithAuth(`/transactions/${transactionId}`)
    return response.data as Transaction
  },

  /**
   * Check Openfort intent status by intentId
   */
  async getIntentStatus(intentId: string): Promise<any> {
    const response = await fetchWithAuth(`/transactions/intent/${intentId}/status`)
    return response.data as any
  },

  /**
   * Get transactions by group
   */
  async getByGroup(groupId: string, page?: number, limit?: number): Promise<Transaction[]> {
    const params = new URLSearchParams()
    if (page) params.append("page", page.toString())
    if (limit) params.append("limit", limit.toString())
    
    const response = await fetchWithAuth(`/transactions/group/${groupId}?${params.toString()}`)
    return response.data as Transaction[]
  },
}

// ============================================================================
// LOCAL NEXT.JS API HELPERS (app/api/*)
// ============================================================================

// Basic fetch to Next.js app routes (same-origin)
async function fetchLocal(url: string, options: RequestInit = {}) {
  try {
    const headers: HeadersInit = { "Content-Type": "application/json", ...(options.headers || {}) }
    const res = await fetch(url, { ...options, headers })
    const result = await res.json()
    if (!result?.success) {
      const err = new Error(result?.error || "Request failed")
      ;(err as any).status = res.status
      throw err
    }
    return result as ApiResponse
  } catch (error) {
    const err = new Error("Network request failed")
    ;(err as any).cause = error
    ;(err as any).url = url
    throw err
  }
}

import type { BudgetCategory } from "./store"
import type { RecurringBill } from "./store"

// Categories (Budget) - backend API
export const categoriesApi = {
  async getByGroup(groupId: string): Promise<BudgetCategory[]> {
    const response = await fetchWithAuth(`/budget/groups/${groupId}/categories`)
    return response.data as BudgetCategory[]
  },
  async create(payload: { groupId: string; name: string; color?: string; icon?: string; monthlyLimit: number }): Promise<BudgetCategory> {
    const response = await fetchWithAuth(`/budget/categories`, {
      method: "POST",
      body: JSON.stringify(payload),
    })
    return response.data as BudgetCategory
  },
  async update(categoryId: string, updates: Partial<BudgetCategory>): Promise<BudgetCategory> {
    const response = await fetchWithAuth(`/budget/categories/${categoryId}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    })
    return response.data as BudgetCategory
  },
  async delete(categoryId: string): Promise<void> {
    await fetchWithAuth(`/budget/categories/${categoryId}`, { method: "DELETE" })
  },
}

// Recurring Bills - backend API
export const recurringApi = {
  async getByGroup(groupId: string): Promise<RecurringBill[]> {
    const response = await fetchWithAuth(`/recurring/groups/${groupId}/recurring`)
    return response.data as RecurringBill[]
  },
  async create(payload: { groupId: string; title: string; amount: number; frequency: string; nextDueDate: string; categoryId?: string }): Promise<RecurringBill> {
    const response = await fetchWithAuth(`/recurring/recurring`, {
      method: "POST",
      body: JSON.stringify(payload),
    })
    return response.data as RecurringBill
  },
  async update(recurringId: string, updates: Partial<RecurringBill>): Promise<RecurringBill> {
    const response = await fetchWithAuth(`/recurring/recurring/${recurringId}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    })
    return response.data as RecurringBill
  },
  async delete(recurringId: string): Promise<void> {
    await fetchWithAuth(`/recurring/recurring/${recurringId}`, { method: "DELETE" })
  },
}

// Export fetchWithAuth for use in components
export { fetchWithAuth }
