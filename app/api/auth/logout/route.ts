import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    // In production, you would:
    // 1. Invalidate the session token
    // 2. Clear cookies
    // 3. Log the logout event

    const res = NextResponse.json({ success: true })
    // Clear client cookies so middleware sees unauthenticated state
    res.cookies.set("auth_token", "", { maxAge: 0, path: "/", sameSite: "lax" })
    res.cookies.set("refresh_token", "", { maxAge: 0, path: "/", sameSite: "lax" })
    return res
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json({ error: "Logout failed" }, { status: 500 })
  }
}
