import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // In production, fetch proposals from database
    // const proposals = await db.proposals.findMany({ where: { groupId } })

    return NextResponse.json({ proposals: [] })
  } catch (error) {
    console.error("Get proposals error:", error)
    return NextResponse.json({ error: "Failed to fetch proposals" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, amount, dueDate, groupId, userId } = body

    // Validate inputs
    if (!title || !description || !amount || !dueDate || !groupId || !userId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // In production, save to database
    // const proposal = await db.proposals.create({ data: { ... } })

    const proposal = {
      id: `prop-${Date.now()}`,
      title,
      description,
      amount: Number.parseFloat(amount),
      dueDate,
      status: "pending",
      createdBy: userId,
      createdAt: new Date().toISOString(),
      votes: {
        approve: 0,
        reject: 0,
        voters: [],
      },
    }

    return NextResponse.json({ proposal })
  } catch (error) {
    console.error("Create proposal error:", error)
    return NextResponse.json({ error: "Failed to create proposal" }, { status: 500 })
  }
}
