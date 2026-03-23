import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') ?? '1')
    const limit = parseInt(searchParams.get('limit') ?? '20')
    const status = searchParams.get('status') ?? undefined
    const workMode = searchParams.get('work_mode') ?? undefined
    const seniority = searchParams.get('seniority') ?? undefined

    const where: any = {}
    if (status) where.status = status
    if (workMode) where.work_mode = workMode
    if (seniority) where.seniority_level = seniority

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        include: { company: true, skills: { include: { skill: true } } },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { posted_date: 'desc' },
      }),
      prisma.job.count({ where }),
    ])

    return NextResponse.json({ data: jobs, total, page, limit })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const job = await prisma.job.create({ data: body })
    return NextResponse.json(job, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
