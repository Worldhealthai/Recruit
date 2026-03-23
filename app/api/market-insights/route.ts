import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type') ?? undefined
    const industry = searchParams.get('industry') ?? undefined
    const region = searchParams.get('region') ?? undefined

    const where: any = {}
    if (type) where.insight_type = type
    if (industry) where.industry = industry
    if (region) where.region = region

    const insights = await prisma.marketInsight.findMany({
      where,
      orderBy: { created_at: 'desc' },
    })

    return NextResponse.json({ data: insights })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const insight = await prisma.marketInsight.create({ data: body })
    return NextResponse.json(insight, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
