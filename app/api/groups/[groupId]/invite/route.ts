import { NextResponse } from "next/server"

export async function POST(request: Request, { params }: { params: Promise<{ groupId: string }> }) {
  try {
    const { groupId } = await params
    const body = await request.json()
    const { emails } = body || {}
    if (!Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json({ success: false, error: "Provide one or more emails to invite" }, { status: 400 })
    }
    const token = `invite_${Math.random().toString(36).slice(2, 10)}`
    const links = emails.map((email: string) => ({ email, link: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/join?token=${token}&group=${groupId}&email=${encodeURIComponent(email)}` }))
    return NextResponse.json({ success: true, data: { token, links } })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to create invite" }, { status: 500 })
  }
}