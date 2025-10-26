import { NextResponse } from "next/server"

export async function PATCH(request: Request, { params }: { params: Promise<{ categoryId: string }> }) {
  try {
    const { categoryId } = await params
    const body = await request.json()
    const updated = { id: categoryId, ...body, updatedAt: new Date().toISOString() }
    return NextResponse.json({ success: true, data: { category: updated } })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to update category" }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ categoryId: string }> }) {
  try {
    const { categoryId } = await params
    return NextResponse.json({ success: true, data: { deleted: true, categoryId } })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to delete category" }, { status: 500 })
  }
}