import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'
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

// Create axios instance with default configuration
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor for logging and authentication
axiosInstance.interceptors.request.use(
  (config) => {
    console.log('🚀 Axios Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`,
      headers: config.headers,
      data: config.data ? 'Present' : 'None',
      timeout: config.timeout,
    })
    return config
  },
  (error) => {
    console.error('❌ Axios Request Error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor for logging and error handling
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log('✅ Axios Response Success:', {
      status: response.status,
      statusText: response.statusText,
      url: response.config.url,
      method: response.config.method?.toUpperCase(),
      headers: response.headers,
      data: response.data,
    })
    return response
  },
  (error: AxiosError) => {
    console.error('💥 Axios Response Error:', {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      method: error.config?.method?.toUpperCase(),
      baseURL: error.config?.baseURL,
      fullURL: error.config ? `${error.config.baseURL}${error.config.url}` : 'Unknown',
      responseData: error.response?.data,
      requestData: error.config?.data,
      isNetworkError: !error.response,
      isTimeout: error.code === 'ECONNABORTED',
      stack: error.stack,
    })

    // Enhanced error messages for common network issues
    if (!error.response) {
      // Network error (no response received)
      if (error.code === 'ECONNREFUSED') {
        console.error('🚫 Connection Refused - Backend server may not be running on:', API_BASE_URL)
        error.message = 'Connection refused - Backend server may not be running'
      } else if (error.code === 'ENOTFOUND') {
        console.error('🔍 DNS Resolution Failed for:', API_BASE_URL)
        error.message = 'DNS resolution failed - Check API URL'
      } else if (error.code === 'ECONNABORTED') {
        console.error('⏰ Request Timeout for:', API_BASE_URL)
        error.message = 'Request timeout - Server took too long to respond'
      } else if (error.message.includes('Network Error')) {
        console.error('🌐 Network Error - Check connectivity to:', API_BASE_URL)
        error.message = 'Network error - Check internet connection and API URL'
      } else {
        console.error('🔌 Unknown Network Error:', error.message)
        error.message = `Network request failed: ${error.message}`
      }
    } else if (error.response.status >= 500) {
      console.error('🔥 Server Error:', error.response.status, error.response.statusText)
    } else if (error.response.status === 404) {
      console.error('🔍 Not Found:', error.config?.url)
    } else if (error.response.status === 401) {
      console.error('🔐 Unauthorized:', error.config?.url)
    } else if (error.response.status === 403) {
      console.error('🚫 Forbidden:', error.config?.url)
    }

    return Promise.reject(error)
  }
)

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
    const response = await axiosInstance.post('/auth/refresh', { refreshToken })
    const result: ApiResponse = response.data

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
async function fetchWithAuth<T = unknown>(url: string, options: AxiosRequestConfig = {}): Promise<{ success: boolean; data: T } | { success: false; error: string; data: T }> {
  let token = getAuthToken()
  
  const makeRequest = async (authToken: string | null) => {
    const config: AxiosRequestConfig = {
      ...options,
      url,
      headers: {
        ...options.headers,
      },
    }
    
    if (authToken) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${authToken}`,
      }
    }

    console.log('🔐 Making authenticated request to:', url)
    console.log('🎫 Token available:', !!authToken)

    try {
      const response = await axiosInstance.request(config)
      return response
    } catch (error) {
      console.error('🚨 Authenticated request failed:', error)
      throw error
    }
  }

  try {
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

    const result: ApiResponse = response.data

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
  } catch (error) {
    // Handle axios errors
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401 && getRefreshToken()) {
        // Try to refresh token on 401 error
        const newToken = await refreshAccessToken()
        if (newToken) {
          try {
            const response = await makeRequest(newToken)
            const result: ApiResponse = response.data
            
            if (result.success) {
              return result as { success: boolean; data: T }
            }
          } catch (retryError) {
            console.error('🔄 Token refresh retry failed:', retryError)
          }
        }
      }
      
      // Handle session expiration
      if (error.response?.status === 401) {
        try {
          if (typeof window !== "undefined") {
            localStorage.removeItem("auth_token")
            localStorage.removeItem("refresh_token")
            localStorage.setItem("session_expired", "1")
            const url = new URL("/auth/login", window.location.origin)
            url.searchParams.set("expired", "1")
            window.location.href = url.toString()
          }
        } catch {}
        return { success: false, error: "SESSION_EXPIRED", data: null as T }
      }
      
      // Re-throw axios errors for proper handling
      throw error
    }
    
    // Re-throw non-axios errors
    throw error
  }
}

// Helper function to make unauthenticated requests
async function fetchApi<T = unknown>(url: string, options: AxiosRequestConfig = {}): Promise<{ success: boolean; data: T }> {
  console.log('🌐 API_BASE_URL:', API_BASE_URL)
  console.log('📡 fetchApi request details:', {
    url: url,
    method: options.method || 'GET',
    headers: options.headers,
    hasData: !!options.data
  })

  try {
    const config: AxiosRequestConfig = {
      ...options,
      url,
    }

    const response = await axiosInstance.request(config)
    const result: ApiResponse = response.data

    if (!result.success) {
      console.error('❌ API request failed:', {
        error: result.error,
        errors: result.errors,
        status: response.status,
        url: url
      })
      const err = new Error(result.error || "Request failed")
      ;(err as any).errors = result.errors
      ;(err as any).status = response.status
      throw err
    }

    console.log('✅ fetchApi success:', result)
    return result as { success: boolean; data: T }
  } catch (error) {
    // Handle axios errors with enhanced logging
    if (axios.isAxiosError(error)) {
      console.error('💥 Axios error in fetchApi:', {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        statusText: error.response?.statusText,
        url: url,
        method: options.method || 'GET',
        responseData: error.response?.data,
        isNetworkError: !error.response,
        isTimeout: error.code === 'ECONNABORTED',
      })

      // If it's an axios error with response data, try to extract API error
      if (error.response?.data) {
        const apiError = error.response.data
        if (apiError.error) {
          const err = new Error(apiError.error)
          ;(err as any).errors = apiError.errors
          ;(err as any).status = error.response.status
          throw err
        }
      }

      // Re-throw axios error for interceptor handling
      throw error
    }

    // Handle non-axios errors
    console.error('💥 Non-axios error in fetchApi:', error)
    throw error
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
      data: data,
    })
    return response.data
  },

  /**
   * Login user
   */
  async login(data: LoginRequest): Promise<AuthData> {
    const response = await fetchApi<AuthData>("/auth/login", {
      method: "POST",
      data: data,
    })
    return response.data
  },

  /**
   * Refresh access token
   */
  async refresh(data: RefreshTokenRequest): Promise<{ accessToken: string }> {
    const response = await fetchApi("/auth/refresh", {
      method: "POST",
      data: data,
    })
    return response.data as { accessToken: string }
  },

  /**
   * Logout user (invalidate refresh token)
   */
  async logout(data: LogoutRequest): Promise<void> {
    await fetchApi("/auth/logout", {
      method: "POST",
      data: data,
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
      data: data,
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
      data: { email },
    })
  },

  /**
   * Reset password
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    await fetchApi("/auth/reset-password", {
      method: "POST",
      data: { token, newPassword },
    })
  },

  /**
   * Update user profile
   */
  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await fetchWithAuth<{ user: User }>("/users/profile", {
      method: "PUT",
      data: data,
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
    await fetchWithAuth("/users/notifications/mark-all-read", {
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
      data: data,
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
      data: data,
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
      data: { emails, role },
    })
  },

  /**
   * Join group
   */
  async joinGroup(groupId: string, inviteToken: string): Promise<void> {
    await fetchWithAuth(`/groups/${groupId}/join`, {
      method: "POST",
      data: { inviteToken },
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
      data: memberData,
    })
  },

  /**
   * Update member role
   */
  async updateMemberRole(groupId: string, memberId: string, role: string): Promise<void> {
    await fetchWithAuth(`/groups/${groupId}/members/${memberId}`, {
      method: "PUT",
      data: { role },
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
    console.log('🔍 billsApi.getByGroup called with:', { groupId, page, limit })
    
    const query = new URLSearchParams()
    query.set("groupId", groupId)
    if (page) query.set("page", String(page))
    if (limit) query.set("limit", String(limit))
    
    console.log('📋 Bills API query string:', query.toString())
    console.log('🌐 Full URL will be:', `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"}/bills?${query.toString()}`)
    
    try {
      const response = await fetchWithAuth(`/bills?${query.toString()}`)
      console.log('✅ Bills API response:', response)
      
      if (!response.success) {
        const errorMsg = 'error' in response ? response.error : 'Failed to fetch bills'
        console.error('❌ Bills API failed:', errorMsg)
        throw new Error(errorMsg)
      }
      
      // Handle response data - should be direct array according to API docs
      let bills: Bill[] = []
      
      if (Array.isArray(response.data)) {
        bills = response.data as Bill[]
        console.log('📊 Direct bills array received:', bills.length, 'bills')
      } else if (response.data && typeof response.data === 'object' && 'bills' in response.data) {
        // Fallback for paginated response structure
        bills = (response.data as any).bills || []
        console.log('📊 Bills extracted from paginated response:', bills.length, 'bills')
      } else {
        console.warn('⚠️ Unexpected response structure:', response.data)
        bills = []
      }
      
      // Validate bill status values
      bills.forEach((bill, index) => {
        const validStatuses = ['DRAFT', 'PROPOSED', 'APPROVED', 'REJECTED', 'PAID', 'CANCELLED']
        if (!validStatuses.includes(bill.status)) {
          console.warn(`⚠️ Bill ${index} has invalid status: ${bill.status}. Expected one of: ${validStatuses.join(', ')}`)
        }
      })
      
      return bills
    } catch (error) {
      console.error('💥 Bills API error:', error)
      console.error('🔍 Error details:', {
        message: (error as Error).message,
        cause: (error as any).cause,
        isNetworkError: (error as any).isNetworkError,
        url: (error as any).url
      })
      throw error
    }
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
      data: data,
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
    if (page) query.set("page", String(page))
    if (limit) query.set("limit", String(limit))
    
    const queryString = query.toString()
    const endpoint = `/groups/${groupId}/bills${queryString ? `?${queryString}` : ''}`
    
    console.log('📋 Bills API endpoint:', endpoint)
    console.log('🌐 Full URL will be:', `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"}${endpoint}`)
    
    try {
      const response = await fetchWithAuth(endpoint)
      console.log('✅ Bills API response:', response)
      
      if (!response.success) {
         const errorMsg = 'error' in response ? response.error : 'Failed to fetch bills'
         console.error('❌ Bills API failed:', errorMsg)
         throw new Error(errorMsg)
       }
      
      const bills = (response.data as Bill[]) || []
      console.log('📊 Bills fetched:', bills.length, 'bills')
      return bills
    } catch (error) {
      console.error('💥 Bills API error:', error)
      console.error('🔍 Error details:', {
        message: (error as Error).message,
        cause: (error as any).cause,
        isNetworkError: (error as any).isNetworkError,
        url: (error as any).url
      })
      throw error
    }
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
      data: data,
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
      data: data,
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
      data: payload,
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
      data: payload,
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
      data: payload,
    })
    return response.data as BudgetCategory
  },
  async update(categoryId: string, updates: Partial<BudgetCategory>): Promise<BudgetCategory> {
    const response = await fetchWithAuth(`/budget/categories/${categoryId}`, {
      method: "PATCH",
      data: updates,
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
      data: payload,
    })
    return response.data as RecurringBill
  },
  async update(recurringId: string, updates: Partial<RecurringBill>): Promise<RecurringBill> {
    const response = await fetchWithAuth(`/recurring/recurring/${recurringId}`, {
      method: "PATCH",
      data: updates,
    })
    return response.data as RecurringBill
  },
  async delete(recurringId: string): Promise<void> {
    await fetchWithAuth(`/recurring/recurring/${recurringId}`, { method: "DELETE" })
  },
}

// Export fetchWithAuth for use in components
export { fetchWithAuth }
