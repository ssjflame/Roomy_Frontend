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
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"

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
async function fetchWithAuth(url: string, options: RequestInit = {}) {
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

  const result: ApiResponse = await response.json()

  if (!result.success) {
    const err = new Error(result.error || "Request failed")
    ;(err as any).errors = result.errors
    ;(err as any).status = response.status
    throw err
  }

  return result
}

// Helper function to make unauthenticated requests
async function fetchApi(url: string, options: RequestInit = {}) {
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

    return result
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
    const response = await fetchApi("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    })
    return response.data as AuthData
  },

  /**
   * Login user
   */
  async login(data: LoginRequest): Promise<AuthData> {
    const response = await fetchApi("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    })
    return response.data as AuthData
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
    const response = await fetchWithAuth("/auth/me")
    return response.data as { user: User; wallet?: Wallet }
  },

  /**
   * Create/update session (get user and wallet)
   */
  async session(): Promise<{ user: User; wallet: Wallet }> {
    const response = await fetchWithAuth("/auth/session", {
      method: "POST",
    })
    return response.data as { user: User; wallet: Wallet }
  },

  /**
   * Update user profile
   */
  async updateProfile(data: Partial<User>): Promise<User> {
    // TODO: Implement when backend endpoint is available
    throw new Error("Not implemented")
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
    const response = await fetchWithAuth("/groups", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
    return response.data as Group
  },
  /**
   * Get all groups for current user
   */
  async getAll(): Promise<Group[]> {
    const response = await fetchWithAuth("/groups")
    return (response.data as Group[]) || []
  },

  /**
   * Get group by ID
   */
  async getById(id: string): Promise<Group> {
    const response = await fetchWithAuth(`/groups/${id}`)
    return response.data as Group
  },

  /**
   * Update group
   */
  async update(id: string, data: Partial<CreateGroupRequest>): Promise<Group> {
    const response = await fetchWithAuth(`/groups/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    })
    return response.data as Group
  },

  /**
   * Delete group
   */
  async delete(id: string): Promise<void> {
    await fetchWithAuth(`/groups/${id}`, {
      method: "DELETE",
    })
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
    const response = await fetchWithAuth("/bills", {
      method: "POST",
      body: JSON.stringify(data),
    })
    return response.data as Bill
  },

  /**
   * Get all bills for current user
   */
  async getAll(): Promise<Bill[]> {
    const response = await fetchWithAuth("/bills")
    const data = response.data as any
    return (data?.bills as Bill[]) || []
  },

  /**
   * Get group bills with pagination
   */
  async getByGroup(groupId: string, page?: number, limit?: number): Promise<Bill[]> {
    const query = new URLSearchParams()
    if (page) query.set("page", String(page))
    if (limit) query.set("limit", String(limit))
    const response = await fetchWithAuth(`/groups/${groupId}/bills${query.toString() ? `?${query.toString()}` : ""}`)
    const data = response.data as any
    return (data?.bills as Bill[]) || []
  },

  /**
   * Get bill by ID
   */
  async getById(id: string): Promise<Bill> {
    const response = await fetchWithAuth(`/bills/${id}`)
    return response.data as Bill
  },

  /**
   * Update bill
   */
  async update(id: string, data: Partial<CreateBillRequest>): Promise<Bill> {
    const response = await fetchWithAuth(`/bills/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    })
    return response.data as Bill
  },

  /**
   * Delete bill
   */
  async delete(id: string): Promise<void> {
    await fetchWithAuth(`/bills/${id}`, {
      method: "DELETE",
    })
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
    const response = await fetchWithAuth(`/groups/${groupId}/proposals`)
    return (response.data as any[]) || []
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
   * Get transactions by group
   */
  async getByGroup(groupId: string, page?: number, limit?: number): Promise<Transaction[]> {
    const query = new URLSearchParams()
    if (page) query.set("page", String(page))
    if (limit) query.set("limit", String(limit))
    const response = await fetchWithAuth(`/groups/${groupId}/transactions${query.toString() ? `?${query.toString()}` : ""}`)
    const data = response.data as any
    return (data?.transactions as Transaction[]) || []
  },

  /**
   * Create a transaction (deposit, withdrawal, payment)
   */
  async create(payload: any): Promise<any> {
    const response = await fetchWithAuth("/transactions", {
      method: "POST",
      body: JSON.stringify(payload),
    })
    return response.data as any
  },
}
