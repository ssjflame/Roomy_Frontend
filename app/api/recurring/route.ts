import { NextResponse } from "next/server"

type Frequency = "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY"

function nextDueFrom(startDate: string, frequency: Frequency) {
  const d = new Date(startDate)
  if (Number.isNaN(d.getTime())) return new Date().toISOString()
  switch (frequency) {
    case "DAILY": d.setDate(d.getDate() + 1); break
    case "WEEKLY": d.setDate(d.getDate() + 7); break
    case "MONTHLY": d.setMonth(d.getMonth() + 1); break
    case "YEARLY": d.setFullYear(d.getFullYear() + 1); break
    default: d.setMonth(d.getMonth() + 1)
  }
  return d.toISOString()
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { groupId, title, amount, currency, payeeAddress, frequency, startDate, autoPropose, categoryId } = body || {}
    if (!groupId || !title || !amount || !currency || !payeeAddress || !frequency || !startDate) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }
    const recurring = {
      id: `rec_${Date.now()}`,
      groupId,
      title,
      amount: Number(amount),
      currency,
      payeeAddress,
      frequency,
      startDate,
      nextDueDate: nextDueFrom(startDate, frequency),
      isActive: true,
      autoPropose: Boolean(autoPropose),
      categoryId: categoryId || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    return NextResponse.json({ success: true, data: { recurring } })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to create recurring" }, { status: 500 })
  }
}