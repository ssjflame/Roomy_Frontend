import { NextResponse } from "next/server"

export async function GET(_req: Request, { params }: { params: Promise<{ groupId: string }> }) {
  try {
    const { groupId } = await params
    return NextResponse.json({ success: true, data: { transactions: [] }, message: `Transactions for group ${groupId}` })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch transactions" }, { status: 500 })
  }
}