import { NextResponse } from "next/server"

export async function GET(_req: Request, { params }: { params: Promise<{ transactionId: string }> }) {
  try {
    const { transactionId } = await params
    const tx = { id: transactionId, status: "PENDING" }
    return NextResponse.json({ success: true, data: { transaction: tx } })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch transaction" }, { status: 500 })
  }
}