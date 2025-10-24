import { type NextRequest, NextResponse } from "next/server"

// Mock user data for development
const mockUsers = {
  "john.doe@example.com": {
    id: "user-1",
    email: "john.doe@example.com",
    username: "johndoe",
    firstName: "John",
    lastName: "Doe",
    walletAddress: "0x1234567890abcdef1234567890abcdef12345678",
  },
  "jane.smith@example.com": {
    id: "user-2",
    email: "jane.smith@example.com",
    username: "janesmith",
    firstName: "Jane",
    lastName: "Smith",
    walletAddress: "0x2345678901bcdef2345678901bcdef234567890",
  },
  "demo@roomdao.app": {
    id: "user-1",
    email: "john.doe@example.com",
    username: "johndoe",
    firstName: "John",
    lastName: "Doe",
    walletAddress: "0x1234567890abcdef1234567890abcdef12345678",
  },
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Mock authentication - accept any password for demo purposes
    const user = mockUsers[email as keyof typeof mockUsers]

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Return mock user and wallet data
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      wallet: {
        address: user.walletAddress,
        chainId: 80002, // Polygon Amoy testnet
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 })
  }
}
