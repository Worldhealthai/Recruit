import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') ?? '1')
    const limit = parseInt(searchParams.get('limit') ?? '20')
    const industry = searchParams.get('industry') ?? undefined
    const size = searchParams.get('size') ?? undefined

    const where: Prisma.CompanyWhereInput = {}
    if (industry) where.industry = industry
    if (size) where.company_size = size as Prisma.EnumCompanySizeFilter

    const [companies, total] = await Promise.all([
      prisma.company.findMany({
        where,
        include: { _count: { select: { jobs: true, candidates: true } } },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      prisma.company.count({ where }),
    ])

    return NextResponse.json({ data: companies, total, page, limit })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as Prisma.CompanyCreateInput
    const company = await prisma.company.create({ data: body })
    return NextResponse.json(company, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
