import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type') ?? undefined
    const industry = searchParams.get('industry') ?? undefined
    const region = searchParams.get('region') ?? undefined

    const where: Prisma.MarketInsightWhereInput = {}
    if (type) where.insight_type = type as Prisma.EnumInsightTypeFilter
    if (industry) where.industry = industry
    if (region) where.region = region

    const insights = await prisma.marketInsight.findMany({
      where,
      orderBy: { created_at: 'desc' },
    })

    return NextResponse.json({ data: insights })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as Prisma.MarketInsightCreateInput
    const insight = await prisma.marketInsight.create({ data: body })
    return NextResponse.json(insight, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
