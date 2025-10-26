// import type { User, Wallet, Group, GroupMember, Bill, Proposal, Transaction, BudgetCategory } from "./store"

// // Mock user data for development
// export const mockUser: User = {
//   id: "mock-user-1",
//   email: "dev@example.com",
//   username: "devuser",
//   firstName: "Development",
//   lastName: "User",
//   phoneNumber: "+1234567890",
//   avatarUrl: undefined,
//   isEmailVerified: true,
//   lastLoginAt: new Date().toISOString(),
//   createdAt: "2024-01-01T00:00:00Z",
//   updatedAt: new Date().toISOString(),
// }

// // Mock wallet data
// export const mockWallet: Wallet = {
//   id: "mock-wallet-1",
//   userId: "mock-user-1",
//   openfortPlayerId: "mock-player-1",
//   address: "0x1234567890123456789012345678901234567890",
//   chainId: 1,
//   balance: 1000.50,
//   isActive: true,
//   createdAt: "2024-01-01T00:00:00Z",
//   updatedAt: new Date().toISOString(),
// }

// // Mock group data
// export const mockGroup: Group = {
//   id: "mock-group-1",
//   name: "Development Team",
//   description: "Mock group for frontend development",
//   imageUrl: undefined,
//   smartAccountAddress: "0x9876543210987654321098765432109876543210",
//   isActive: true,
//   votingThreshold: 60,
//   createdAt: "2024-01-01T00:00:00Z",
//   updatedAt: new Date().toISOString(),
// }

// // Mock group members
// export const mockGroupMembers: GroupMember[] = [
//   {
//     id: "mock-member-1",
//     groupId: "mock-group-1",
//     userId: "mock-user-1",
//     role: "ADMIN",
//     joinedAt: "2024-01-01T00:00:00Z",
//     isActive: true,
//     user: mockUser,
//   },
//   {
//     id: "mock-member-2",
//     groupId: "mock-group-1",
//     userId: "mock-user-2",
//     role: "MEMBER",
//     joinedAt: "2024-01-02T00:00:00Z",
//     isActive: true,
//     user: {
//       id: "mock-user-2",
//       email: "alice@example.com",
//       username: "alice",
//       firstName: "Alice",
//       lastName: "Johnson",
//       isEmailVerified: true,
//       createdAt: "2024-01-02T00:00:00Z",
//       updatedAt: "2024-01-02T00:00:00Z",
//     },
//   },
//   {
//     id: "mock-member-3",
//     groupId: "mock-group-1",
//     userId: "mock-user-3",
//     role: "MEMBER",
//     joinedAt: "2024-01-03T00:00:00Z",
//     isActive: true,
//     user: {
//       id: "mock-user-3",
//       email: "bob@example.com",
//       username: "bob",
//       firstName: "Bob",
//       lastName: "Smith",
//       isEmailVerified: true,
//       createdAt: "2024-01-03T00:00:00Z",
//       updatedAt: "2024-01-03T00:00:00Z",