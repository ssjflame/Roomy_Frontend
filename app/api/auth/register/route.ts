import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Mock registration - create a new user
    const username = email.split("@")[0]
    const nameParts = (name || username).split(" ")
    const firstName = nameParts[0] || username
    const lastName = nameParts[1] || ""

    // Generate mock user ID
    const userId = `user-${Date.now()}`
    
    // Generate mock wallet address
    const walletAddress = `0x${Math.random().toString(16).slice(2, 42)}`

    // Return mock user and wallet data
    return NextResponse.json({
      user: {
        id: userId,
        email,
        username,
        firstName,
        lastName,
      },
      wallet: {
        address: walletAddress,
        chainId: 80002, // Polygon Amoy testnet
      },
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Registration failed" }, { status: 500 })
  }
}
