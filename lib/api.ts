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
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    }

    if (authToken) {
      headers["Authorization"] = `Bearer ${authToken}`
    }

    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers,
    })

    return response
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
    throw new Error(result.error || "Request failed")
  }

  return result
}

// Helper function to make unauthenticated requests
async function fetchApi(url: string, options: RequestInit = {}) {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  }

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  })

  const result: ApiResponse = await response.json()

  if (!result.success) {
    throw new Error(result.error || "Request failed")
  }

  return result
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
    // TODO: Connect to backend endpoint when available
    throw new Error("Not implemented")
  },

  /**
   * Get all groups for current user
   */
  async getAll(): Promise<Group[]> {
    // TODO: Connect to backend endpoint when available
    return []
  },

  /**
   * Get group by ID
   */
  async getById(id: string): Promise<Group> {
    // TODO: Connect to backend endpoint when available
    throw new Error("Not implemented")
  },

  /**
   * Update group
   */
  async update(id: string, data: Partial<CreateGroupRequest>): Promise<Group> {
    // TODO: Connect to backend endpoint when available
    throw new Error("Not implemented")
  },

  /**
   * Delete group
   */
  async delete(id: string): Promise<void> {
    // TODO: Connect to backend endpoint when available
    throw new Error("Not implemented")
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
    // TODO: Connect to backend endpoint when available
    throw new Error("Not implemented")
  },

  /**
   * Get all bills for current user
   */
  async getAll(): Promise<Bill[]> {
    // TODO: Connect to backend endpoint when available
    return []
  },

  /**
   * Get bill by ID
   */
  async getById(id: string): Promise<Bill> {
    // TODO: Connect to backend endpoint when available
    throw new Error("Not implemented")
  },

  /**
   * Update bill
   */
  async update(id: string, data: Partial<CreateBillRequest>): Promise<Bill> {
    // TODO: Connect to backend endpoint when available
    throw new Error("Not implemented")
  },

  /**
   * Delete bill
   */
  async delete(id: string): Promise<void> {
    // TODO: Connect to backend endpoint when available
    throw new Error("Not implemented")
  },

  /**
   * Vote on bill
   */
  async vote(data: VoteRequest): Promise<Bill> {
    // TODO: Connect to backend endpoint when available
    throw new Error("Not implemented")
  },
}

// ============================================================================
// TRANSACTIONS API
// ============================================================================

export const transactionsApi = {
  /**
   * Get transactions by group
   */
  async getByGroup(groupId: string): Promise<Transaction[]> {
    // TODO: Connect to backend endpoint when available
    return []
  },
}
