import { type NextRequest, NextResponse } from "next/server"
import { openfort } from "@/lib/openfort"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Authenticate with Openfort
    // Note: This is a simplified example. In production, you would:
    // 1. Verify credentials against your database
    // 2. Use Openfort's authentication methods
    // 3. Create a session token
    const authResult = await openfort.authenticateWithEmailPassword({
      email,
      password,
    })

    if (!authResult.user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Get or create wallet for user
    const wallets = await openfort.getWallets({ playerId: authResult.user.id })
    let wallet = wallets[0]

    if (!wallet) {
      wallet = await openfort.createWallet({
        playerId: authResult.user.id,
        chainId: 80002, // Polygon Amoy testnet
      })
    }

    return NextResponse.json({
      user: {
        id: authResult.user.id,
        email: authResult.user.email,
      },
      wallet: {
        address: wallet.address,
        chainId: wallet.chainId,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 })
  }
}
