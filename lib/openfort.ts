import { Openfort } from "@openfort/openfort-js"

const OPENFORT_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_OPENFORT_PUBLISHABLE_KEY || "pk_test_..."

// Initialize Openfort client
export const openfort = new Openfort({
  baseConfiguration: {
    publishableKey: OPENFORT_PUBLISHABLE_KEY,
  },
})

// Types for Openfort user and wallet
export interface OpenfortUser {
  id: string
  email?: string
  name?: string
}

export interface OpenfortWallet {
  id: string
  address: string
  chainId: number
  balance?: string
}

// Helper function to format wallet address
export function formatWalletAddress(address: string): string {
  if (!address) return ""
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
}

// Helper function to check if user is authenticated
export function isAuthenticated(user: { id: string; email: string; walletAddress: string } | null): boolean {
  return !!user && !!user.walletAddress
}
