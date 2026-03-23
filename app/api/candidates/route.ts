import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') ?? '1')
    const limit = parseInt(searchParams.get('limit') ?? '20')
    const country = searchParams.get('country') ?? undefined
    const seniority = searchParams.get('seniority') ?? undefined
    const availability = searchParams.get('availability') ?? undefined

    const where: any = {}
    if (country) where.location_country = country
    if (seniority) where.seniority_level = seniority
    if (availability) where.availability_status = availability

    const [candidates, total] = await Promise.all([
      prisma.candidate.findMany({
        where,
        include: { skills: { include: { skill: true } }, current_company: true },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      prisma.candidate.count({ where }),
    ])

    return NextResponse.json({ data: candidates, total, page, limit })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const candidate = await prisma.candidate.create({ data: body })
    return NextResponse.json(candidate, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
