import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // TODO: Replace with actual backend API call
    // const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/login`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ email, password })
    // })
    // const data = await response.json()
    // if (!response.ok) {
    //   return NextResponse.json({ error: data.message }, { status: response.status })
    // }

    // Mock response for development
    const mockUser = {
      id: "user_" + Date.now(),
      email,
      name: email.split("@")[0],
      walletAddress: "0x" + Math.random().toString(16).substring(2, 42),
    }

    return NextResponse.json({
      user: mockUser,
      token: "mock_token_" + Date.now(),
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 })
  }
}
