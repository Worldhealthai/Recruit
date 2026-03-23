import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') ?? '1')
    const limit = parseInt(searchParams.get('limit') ?? '20')
    const status = searchParams.get('status') ?? undefined
    const candidateId = searchParams.get('candidate_id') ?? undefined

    const where: any = {}
    if (status) where.status = status
    if (candidateId) where.candidate_id = candidateId

    const [calls, total] = await Promise.all([
      prisma.screeningCall.findMany({
        where,
        include: {
          candidate: { select: { id: true, first_name: true, last_name: true } },
          job: { select: { id: true, title: true } },
          questions: { orderBy: { order: 'asc' } },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      prisma.screeningCall.count({ where }),
    ])

    return NextResponse.json({ data: calls, total, page, limit })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const call = await prisma.screeningCall.create({ data: body })
    return NextResponse.json(call, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
