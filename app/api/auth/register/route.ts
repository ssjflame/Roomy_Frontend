import { type NextRequest, NextResponse } from "next/server"
import Openfort from "@openfort/openfort-js"

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    const openfort = new Openfort({
      baseConfiguration: {
        publishableKey: process.env.OPENFORT_SECRET_KEY || "",
      },
    })

    // Create player (user) in Openfort
    const player = await openfort.createPlayer({
      name: name || email.split("@")[0],
      email,
    })

    // Create embedded wallet for the player
    const wallet = await openfort.createWallet({
      playerId: player.id,
      chainId: 80002, // Polygon Amoy testnet
    })

    // In production, you would also:
    // 1. Hash and store the password securely
    // 2. Send verification email
    // 3. Create session token

    return NextResponse.json({
      user: {
        id: player.id,
        email: player.email,
      },
      wallet: {
        address: wallet.address,
        chainId: wallet.chainId,
      },
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Registration failed" }, { status: 500 })
  }
}
