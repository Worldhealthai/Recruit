import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const recruiters = await prisma.recruiter.findMany({
      include: { _count: { select: { saved_searches: true, activities: true } } },
      orderBy: { created_at: 'desc' },
    })
    return NextResponse.json({ data: recruiters })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as Prisma.RecruiterCreateInput
    const recruiter = await prisma.recruiter.create({ data: body })
    return NextResponse.json(recruiter, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
