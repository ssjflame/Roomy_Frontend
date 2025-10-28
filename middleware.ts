import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const { nextUrl, cookies } = req
  const pathname = nextUrl.pathname

  const accessToken = cookies.get("auth_token")?.value
  const refreshToken = cookies.get("refresh_token")?.value

  // Try to refresh access token using refresh token for 7-day persistence
  let newAccessToken: string | null = null
  if (!accessToken && refreshToken) {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      })
      if (res.ok) {
        const json = await res.json()
        newAccessToken = json?.data?.accessToken || json?.accessToken || null
      }
    } catch (e) {
      console.warn("Middleware refresh attempt failed:", e)
    }
  }

  const isAuthed = Boolean(accessToken || refreshToken || newAccessToken)
  const isRoot = pathname === "/"
  const isAuthPage = pathname.startsWith("/auth")

  // Build base response and set refreshed cookie if present
  const baseResponse = NextResponse.next()
  if (newAccessToken) {
    baseResponse.cookies.set("auth_token", newAccessToken, {
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    })
  }

  if (isAuthed) {
    // Logged in users should not access root or auth pages
    if (isRoot || isAuthPage) {
      const url = nextUrl.clone()
      url.pathname = "/dashboard"
      const res = NextResponse.redirect(url)
      if (newAccessToken) {
        res.cookies.set("auth_token", newAccessToken, {
          maxAge: 60 * 60 * 24 * 7,
          path: "/",
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
        })
      }
      return res
    }
    // For authenticated users on valid dashboard pages, just continue
    return baseResponse
  }

  // Unauthenticated users: allow root and auth pages, block others
  if (isRoot || isAuthPage) {
    return baseResponse
  }

  const url = nextUrl.clone()
  url.pathname = "/"
  return NextResponse.redirect(url)
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|images|public|api).*)",
  ],
}