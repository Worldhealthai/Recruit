import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const maxDuration = 15

const VALID_STATUSES = ['SUGGESTED', 'CONTACTED', 'SHORTLISTED', 'INTERVIEWING', 'OFFERED', 'REJECTED']

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { status, recruiter_notes } = await req.json()

    if (status && !VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` }, { status: 400 })
    }

    const data: Record<string, string> = {}
    if (status) data.status = status
    if (recruiter_notes) data.recruiter_notes = recruiter_notes

    const match = await prisma.match.update({
      where: { id: params.id },
      data,
      include: { candidate: { select: { first_name: true, last_name: true } }, job: { select: { title: true } } },
    })

    return NextResponse.json({ ok: true, match })
  } catch (err) {
    console.error('Match update error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.match.delete({ where: { id: params.id } })
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
