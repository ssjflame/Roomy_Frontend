import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { groupId, name, color, icon, monthlyLimit } = body || {}
    if (!groupId || !name) {
      return NextResponse.json({ success: false, error: "Missing required fields: groupId, name" }, { status: 400 })
    }
    const category = {
      id: `cat_${Date.now()}`,
      groupId,
      name,
      color: color || undefined,
      icon: icon || undefined,
      monthlyLimit: monthlyLimit ? Number(monthlyLimit) : undefined,
      isActive: true,
      createdAt: new Date().toISOString(),
    }
    return NextResponse.json({ success: true, data: { category } })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to create category" }, { status: 500 })
  }
}