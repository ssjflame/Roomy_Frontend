import type {
  User,
  AuthResponse,
  Group,
  Bill,
  Transaction,
  RegisterRequest,
  LoginRequest,
  CreateGroupRequest,
  CreateBillRequest,
  VoteRequest,
} from "./types"

// TODO: Replace with your actual backend URL when deployed
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"

// Helper function to get auth token from localStorage
const getAuthToken = (): string | null => {
  if (typeof window === "undefined") return null
  return localStorage.getItem("auth_token")
}

// Helper function to make authenticated requests
async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = getAuthToken()
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "An error occurred" }))
    throw new Error(error.message || "Request failed")
  }

  return response.json()
}

// ============================================================================
// USER / AUTH API
// ============================================================================

export const authApi = {
  /**
   * Register a new user
   * TODO: Connect to POST /api/users/register endpoint
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    // TODO: Uncomment when backend is ready
    // return fetchWithAuth("/users/register", {
    //   method: "POST",
    //   body: JSON.stringify(data),
    // })

    // Mock response for now
    console.log("[v0] authApi.register called with:", data)
    return {
      user: {
        id: "mock-user-id",
        email: data.email,
        name: data.name,
        walletAddress: "0x" + Math.random().toString(16).slice(2, 42),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      token: "mock-jwt-token",
    }
  },

  /**
   * Login user
   * TODO: Connect to POST /api/users/login endpoint
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    // TODO: Uncomment when backend is ready
    // return fetchWithAuth("/users/login", {
    //   method: "POST",
    //   body: JSON.stringify(data),
    // })

    // Mock response for now
    console.log("[v0] authApi.login called with:", data)
    return {
      user: {
        id: "mock-user-id",
        email: data.email,
        name: "Mock User",
        walletAddress: "0x" + Math.random().toString(16).slice(2, 42),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      token: "mock-jwt-token",
    }
  },

  /**
   * Get current user profile
   * TODO: Connect to GET /api/users/profile endpoint
   */
  async getProfile(): Promise<User> {
    // TODO: Uncomment when backend is ready
    // return fetchWithAuth("/users/profile")

    // Mock response for now
    console.log("[v0] authApi.getProfile called")
    throw new Error("Not authenticated")
  },

  /**
   * Update user profile
   * TODO: Connect to PUT /api/users/profile endpoint
   */
  async updateProfile(data: Partial<User>): Promise<User> {
    // TODO: Uncomment when backend is ready
    // return fetchWithAuth("/users/profile", {
    //   method: "PUT",
    //   body: JSON.stringify(data),
    // })

    // Mock response for now
    console.log("[v0] authApi.updateProfile called with:", data)
    throw new Error("Not implemented")
  },
}

// ============================================================================
// GROUPS API
// ============================================================================

export const groupsApi = {
  /**
   * Create a new group
   * TODO: Connect to POST /api/groups endpoint
   */
  async create(data: CreateGroupRequest): Promise<Group> {
    // TODO: Uncomment when backend is ready
    // return fetchWithAuth("/groups", {
    //   method: "POST",
    //   body: JSON.stringify(data),
    // })

    // Mock response for now
    console.log("[v0] groupsApi.create called with:", data)
    throw new Error("Not implemented")
  },

  /**
   * Get all groups for current user
   * TODO: Connect to GET /api/groups endpoint
   */
  async getAll(): Promise<Group[]> {
    // TODO: Uncomment when backend is ready
    // return fetchWithAuth("/groups")

    // Mock response for now
    console.log("[v0] groupsApi.getAll called")
    return []
  },

  /**
   * Get group by ID
   * TODO: Connect to GET /api/groups/:id endpoint
   */
  async getById(id: string): Promise<Group> {
    // TODO: Uncomment when backend is ready
    // return fetchWithAuth(`/groups/${id}`)

    // Mock response for now
    console.log("[v0] groupsApi.getById called with:", id)
    throw new Error("Not implemented")
  },

  /**
   * Update group
   * TODO: Connect to PUT /api/groups/:id endpoint
   */
  async update(id: string, data: Partial<CreateGroupRequest>): Promise<Group> {
    // TODO: Uncomment when backend is ready
    // return fetchWithAuth(`/groups/${id}`, {
    //   method: "PUT",
    //   body: JSON.stringify(data),
    // })

    // Mock response for now
    console.log("[v0] groupsApi.update called with:", id, data)
    throw new Error("Not implemented")
  },

  /**
   * Delete group
   * TODO: Connect to DELETE /api/groups/:id endpoint
   */
  async delete(id: string): Promise<void> {
    // TODO: Uncomment when backend is ready
    // return fetchWithAuth(`/groups/${id}`, {
    //   method: "DELETE",
    // })

    // Mock response for now
    console.log("[v0] groupsApi.delete called with:", id)
    throw new Error("Not implemented")
  },
}

// ============================================================================
// BILLS API
// ============================================================================

export const billsApi = {
  /**
   * Create a new bill
   * TODO: Connect to POST /api/bills endpoint
   */
  async create(data: CreateBillRequest): Promise<Bill> {
    // TODO: Uncomment when backend is ready
    // return fetchWithAuth("/bills", {
    //   method: "POST",
    //   body: JSON.stringify(data),
    // })

    // Mock response for now
    console.log("[v0] billsApi.create called with:", data)
    throw new Error("Not implemented")
  },

  /**
   * Get all bills for current user
   * TODO: Connect to GET /api/bills endpoint
   */
  async getAll(): Promise<Bill[]> {
    // TODO: Uncomment when backend is ready
    // return fetchWithAuth("/bills")

    // Mock response for now
    console.log("[v0] billsApi.getAll called")
    return []
  },

  /**
   * Get bill by ID
   * TODO: Connect to GET /api/bills/:id endpoint
   */
  async getById(id: string): Promise<Bill> {
    // TODO: Uncomment when backend is ready
    // return fetchWithAuth(`/bills/${id}`)

    // Mock response for now
    console.log("[v0] billsApi.getById called with:", id)
    throw new Error("Not implemented")
  },

  /**
   * Update bill
   * TODO: Connect to PUT /api/bills/:id endpoint
   */
  async update(id: string, data: Partial<CreateBillRequest>): Promise<Bill> {
    // TODO: Uncomment when backend is ready
    // return fetchWithAuth(`/bills/${id}`, {
    //   method: "PUT",
    //   body: JSON.stringify(data),
    // })

    // Mock response for now
    console.log("[v0] billsApi.update called with:", id, data)
    throw new Error("Not implemented")
  },

  /**
   * Delete bill
   * TODO: Connect to DELETE /api/bills/:id endpoint
   */
  async delete(id: string): Promise<void> {
    // TODO: Uncomment when backend is ready
    // return fetchWithAuth(`/bills/${id}`, {
    //   method: "DELETE",
    // })

    // Mock response for now
    console.log("[v0] billsApi.delete called with:", id)
    throw new Error("Not implemented")
  },

  /**
   * Vote on a bill
   * TODO: Connect to POST /api/bills/:id/vote endpoint (or similar)
   */
  async vote(data: VoteRequest): Promise<Bill> {
    // TODO: Uncomment when backend is ready
    // return fetchWithAuth(`/bills/${data.billId}/vote`, {
    //   method: "POST",
    //   body: JSON.stringify({ vote: data.vote }),
    // })

    // Mock response for now
    console.log("[v0] billsApi.vote called with:", data)
    throw new Error("Not implemented")
  },
}

// ============================================================================
// TRANSACTIONS API (if needed)
// ============================================================================

export const transactionsApi = {
  /**
   * Get all transactions for a group
   * TODO: Add endpoint to backend if needed
   */
  async getByGroup(groupId: string): Promise<Transaction[]> {
    console.log("[v0] transactionsApi.getByGroup called with:", groupId)
    return []
  },
}
