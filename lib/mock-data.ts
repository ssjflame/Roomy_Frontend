import type { Proposal, Group } from "./store"

// Mock data for development and testing
export const mockGroup: Group = {
  id: "group-1",
  name: "Apartment 4B",
  walletAddress: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  balance: 2450.5,
  members: ["user-1", "user-2", "user-3", "user-4"],
}

export const mockProposals: Proposal[] = [
  {
    id: "prop-1",
    title: "Internet Bill - December",
    description: "Monthly internet service from Comcast",
    amount: 89.99,
    dueDate: "2025-12-15",
    status: "pending",
    createdBy: "user-1",
    createdAt: "2025-10-20T10:00:00Z",
    votes: {
      approve: 2,
      reject: 0,
      voters: ["user-1", "user-2"],
    },
  },
  {
    id: "prop-2",
    title: "Electricity Bill",
    description: "October electricity usage",
    amount: 145.32,
    dueDate: "2025-11-01",
    status: "approved",
    createdBy: "user-2",
    createdAt: "2025-10-18T14:30:00Z",
    votes: {
      approve: 4,
      reject: 0,
      voters: ["user-1", "user-2", "user-3", "user-4"],
    },
  },
  {
    id: "prop-3",
    title: "Cleaning Service",
    description: "Professional cleaning for common areas",
    amount: 200.0,
    dueDate: "2025-10-30",
    status: "paid",
    createdBy: "user-3",
    createdAt: "2025-10-15T09:00:00Z",
    votes: {
      approve: 3,
      reject: 1,
      voters: ["user-1", "user-2", "user-3", "user-4"],
    },
  },
  {
    id: "prop-4",
    title: "Water Bill",
    description: "Monthly water and sewage",
    amount: 67.5,
    dueDate: "2025-11-10",
    status: "pending",
    createdBy: "user-4",
    createdAt: "2025-10-22T16:45:00Z",
    votes: {
      approve: 1,
      reject: 0,
      voters: ["user-4"],
    },
  },
]

export const mockUser = {
  id: "user-1",
  email: "demo@roomdao.app",
  walletAddress: "0x1234567890abcdef1234567890abcdef12345678",
}
