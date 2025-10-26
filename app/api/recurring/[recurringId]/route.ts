import { NextResponse } from "next/server"

export async function PATCH(request: Request, { params }: { params: Promise<{ recurringId: string }> }) {
  try {
    const { recurringId } = await params
    const body = await request.json()
    const updated = { id: recurringId, ...body, updatedAt: new Date().toISOString() }
    return NextResponse.json({ success: true, data: { recurring: updated } })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to update recurring" }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ recurringId: string }> }) {
  try {
    const { recurringId } = await params
    return NextResponse.json({ success: true, data: { deleted: true, recurringId } })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to delete recurring" }, { status: 500 })
  }
}