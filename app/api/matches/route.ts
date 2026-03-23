import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') ?? '1')
    const limit = parseInt(searchParams.get('limit') ?? '20')
    const candidateId = searchParams.get('candidate_id') ?? undefined
    const jobId = searchParams.get('job_id') ?? undefined
    const minScore = parseFloat(searchParams.get('min_score') ?? '0')

    const where: any = {}
    if (candidateId) where.candidate_id = candidateId
    if (jobId) where.job_id = jobId
    if (minScore > 0) where.overall_score = { gte: minScore }

    const [matches, total] = await Promise.all([
      prisma.match.findMany({
        where,
        include: {
          candidate: { select: { id: true, first_name: true, last_name: true, current_title: true } },
          job: { select: { id: true, title: true, company: { select: { name: true } } } },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { overall_score: 'desc' },
      }),
      prisma.match.count({ where }),
    ])

    return NextResponse.json({ data: matches, total, page, limit })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const match = await prisma.match.create({ data: body })
    return NextResponse.json(match, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
