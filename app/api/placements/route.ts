import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { matchId, candidateId, jobId, feeType, startDate } = body

    if (!matchId || !candidateId || !jobId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // ── Sanitise numbers ──────────────────────────────────────────────────
    const agreedSalary = Math.round(Number(body.agreedSalary) || 0)
    if (agreedSalary <= 0 || agreedSalary > 9_999_999) {
      return NextResponse.json({ error: 'Agreed salary must be between £1 and £9,999,999' }, { status: 400 })
    }

    // Accept both whole-number percent (20) and decimal form (0.20)
    let feePercentage = Number(body.feePercentage)
    if (isNaN(feePercentage) || feePercentage <= 0) {
      return NextResponse.json({ error: 'Invalid fee percentage' }, { status: 400 })
    }
    if (feePercentage > 1) feePercentage = feePercentage / 100   // normalise 20 → 0.20
    if (feePercentage > 0.5) {
      return NextResponse.json({ error: 'Fee percentage cannot exceed 50%' }, { status: 400 })
    }

    // ── Calculate fees (rounded to 2dp to stay within Decimal(12,2)) ─────
    const platformFeePct    = 0.10
    const feeTotal          = Math.round(agreedSalary * feePercentage * 100) / 100
    const recruiterEarnings = Math.round(feeTotal * (1 - platformFeePct) * 100) / 100

    // ── Guard: match must exist and not already be placed ─────────────────
    const match = await prisma.match.findUnique({ where: { id: matchId }, include: { placement: true } })
    if (!match) return NextResponse.json({ error: 'Match not found' }, { status: 404 })
    if (match.placement) return NextResponse.json({ error: 'Match already has a placement' }, { status: 409 })

    const recruiter = await prisma.recruiter.findFirst()
    if (!recruiter) return NextResponse.json({ error: 'No recruiter found' }, { status: 404 })

    const start = new Date(startDate)
    if (isNaN(start.getTime())) {
      return NextResponse.json({ error: 'Invalid start date' }, { status: 400 })
    }
    const guaranteeExpires = new Date(start)
    guaranteeExpires.setDate(guaranteeExpires.getDate() + 90)

    const count = await prisma.placement.count()
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(count + 100).padStart(4, '0')}`

    const [placement] = await prisma.$transaction([
      prisma.placement.create({
        data: {
          match_id:           matchId,
          candidate_id:       candidateId,
          job_id:             jobId,
          recruiter_id:       recruiter.id,
          start_date:         start,
          agreed_salary:      agreedSalary,
          salary_currency:    'GBP',
          fee_type:           feeType ?? 'CONTINGENCY',
          fee_percentage:     feePercentage,
          fee_total:          feeTotal,
          platform_fee_pct:   platformFeePct,
          recruiter_earnings: recruiterEarnings,
          invoice_status:     'PENDING',
          invoice_number:     invoiceNumber,
          invoice_date:       start,
          payment_due_date:   new Date(start.getTime() + 30 * 24 * 60 * 60 * 1000),
          guarantee_days:     90,
          guarantee_expires:  guaranteeExpires,
          status:             'ACTIVE',
          notes:              `Placement created via pipeline on ${new Date().toLocaleDateString('en-GB')}.`,
        },
      }),
      prisma.match.update({
        where: { id: matchId },
        data:  { status: 'PLACED' },
      }),
    ])

    return NextResponse.json({ ok: true, placementId: placement.id, invoiceNumber })
  } catch (err) {
    console.error('Placement create error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
