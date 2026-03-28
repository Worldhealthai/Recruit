import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') ?? '1')
    const limit = parseInt(searchParams.get('limit') ?? '20')
    const status = searchParams.get('status') ?? undefined
    const candidateId = searchParams.get('candidate_id') ?? undefined

    const where: Prisma.ScreeningCallWhereInput = {}
    if (status) where.status = status as Prisma.EnumCallStatusFilter
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
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ── Generate realistic screening content from candidate/job data ──────────────
function generateScreening(
  firstName: string,
  candidateTitle: string,
  jobTitle: string,
  companyName: string,
  yearsExp: number,
  salaryExpectation: number,
  noticeDays: number,
  skills: string[],
) {
  const salaryStr = `£${Math.round(salaryExpectation / 1000)}K`
  const noticeStr = noticeDays <= 7 ? 'immediate'
    : noticeDays <= 30 ? `${noticeDays} days`
    : `${Math.round(noticeDays / 30)} months`
  const topSkill = skills[0] ?? 'their field'
  const baseScore = Math.min(0.72 + yearsExp * 0.015, 0.97)

  const recommendation =
    baseScore >= 0.88 ? 'STRONG_YES' as const :
    baseScore >= 0.78 ? 'YES' as const :
    baseScore >= 0.65 ? 'MAYBE' as const : 'NO' as const

  const interestLevel =
    baseScore >= 0.85 ? 'VERY_INTERESTED' as const :
    baseScore >= 0.72 ? 'INTERESTED' as const : 'NEUTRAL' as const

  const durationSecs = Math.round(1200 + yearsExp * 80)

  const transcript = `AI Recruiter: Hi ${firstName}, thanks for joining. I'm the RecruitAI screening assistant — this call will take about 30 minutes. Are you happy to proceed?
${firstName}: Yes, absolutely.

AI Recruiter: Great. Walk me through your current role and what you own day-to-day.
${firstName}: I'm a ${candidateTitle} with around ${yearsExp} years of experience. Day-to-day I work on ${topSkill}, collaborate with cross-functional teams, and manage stakeholder expectations. I have strong end-to-end ownership in my current scope and I'm now looking for something with broader impact.

AI Recruiter: What specifically draws you to the ${jobTitle} role at ${companyName}?
${firstName}: The scope is meaningfully bigger than what I have now. ${companyName}'s positioning in the market is strong and the challenges described in the brief match exactly what I want to work on next. I've done my research and the culture looks genuinely aligned with how I like to operate.

AI Recruiter: Tell me about a challenging situation and how you handled it.
${firstName}: Last year I had two senior stakeholders with conflicting priorities who both needed resource immediately. Rather than escalating straight away, I facilitated a structured session to map business impact side by side. We agreed sequencing together. Both projects were delivered and both stakeholders felt their needs were respected. It was uncomfortable, but the outcome was right.

AI Recruiter: How do you keep your ${topSkill} skills current?
${firstName}: I'm deliberate about it — I set aside time weekly for reading, courses, or personal projects. I recently completed additional training in a related area and I try to apply new approaches at work wherever I can get sign-off to experiment.

AI Recruiter: What are your salary expectations?
${firstName}: I'm targeting around ${salaryStr} base. I'm open to a broader conversation if the package structure — especially variable or equity — is compelling, but base salary is the priority.

AI Recruiter: And your notice period?
${firstName}: Contractually ${noticeStr}. I'd honour it fully — I want to leave on good terms — but I'd discuss flexibility with my employer if there was a strong reason to start sooner.

AI Recruiter: Any aspects of the role you'd want to understand better before accepting an offer?
${firstName}: I'd want clarity on the team structure and decision-making authority, and the growth pathway beyond this role. Neither is a dealbreaker, just important context for making the right call.

AI Recruiter: Perfect — that covers everything. The recruiter will have the full report shortly. Anything to add?
${firstName}: No, that was a great structure. Thanks.`

  const questions = [
    {
      order: 1,
      question_text: 'Walk me through your current role and primary ownership areas.',
      answer_text: `${firstName} described their role as ${candidateTitle} with ${yearsExp} years of experience, covering ${topSkill} and cross-functional collaboration. Clear articulation of scope and ownership.`,
      ai_score: Math.min(baseScore + 0.02, 0.99),
    },
    {
      order: 2,
      question_text: `What specifically attracts you to the ${jobTitle} role at ${companyName}?`,
      answer_text: `Motivated by broader scope, ${companyName}'s market position, and cultural alignment. Framed as deliberate progression rather than reactive move. Strong pull motivation.`,
      ai_score: Math.min(baseScore + 0.01, 0.99),
    },
    {
      order: 3,
      question_text: 'Describe a challenging situation you navigated successfully.',
      answer_text: 'Managed competing stakeholder priorities via structured alignment session. Avoided unnecessary escalation; both projects delivered on time. Demonstrates EQ and practical leadership.',
      ai_score: baseScore,
    },
    {
      order: 4,
      question_text: 'Salary expectations and notice period?',
      answer_text: `Targeting ${salaryStr} base. Notice period ${noticeStr} — will honour contractually, some flexibility if business need justifies it.`,
      ai_score: 0.88,
    },
  ]

  const keyConcerns: string[] = []
  if (baseScore < 0.80) keyConcerns.push('Motivation could be stronger — some elements of push rather than pull')
  if (noticeDays > 60) keyConcerns.push(`Long notice period (${noticeStr}) — may delay start date`)
  if (baseScore < 0.75) keyConcerns.push('Domain depth not fully validated in screening — probe at interview')

  const reasoning =
    recommendation === 'STRONG_YES'
      ? `${firstName} is an exceptional fit. ${yearsExp} years directly relevant experience, clear pull motivation, strong cultural alignment signals. Salary expectation (${salaryStr}) within budget, notice manageable. No red flags. Fast-track to hiring manager interview.`
      : recommendation === 'YES'
      ? `${firstName} is a credible candidate. The ${topSkill} background is relevant and ${yearsExp} years of experience covers the minimum bar. Some gaps to probe at interview but nothing disqualifying. Salary aligned. Recommend advancing to intro call.`
      : recommendation === 'MAYBE'
      ? `${firstName} showed potential but gaps remain. Experience breadth is lighter than ideal and some answers lacked specificity. Salary aligned. Recommend a focused skills interview before committing further.`
      : `${firstName} is not a strong fit at this stage. The experience profile doesn't align closely enough with the requirements and role motivation was unclear. Not recommended to progress.`

  return { recommendation, interestLevel, baseScore, durationSecs, transcript, questions, keyConcerns, reasoning }
}

// ── POST: run a new AI screening call for a match ─────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const { matchId } = await req.json()
    if (!matchId) return NextResponse.json({ error: 'matchId required' }, { status: 400 })

    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        candidate: { include: { skills: { include: { skill: true }, take: 5 } } },
        job: { include: { company: true } },
        screening_calls: { take: 1 },
      },
    })
    if (!match) return NextResponse.json({ error: 'Match not found' }, { status: 404 })

    // Idempotent — return existing call if already screened
    if (match.screening_calls.length > 0) {
      return NextResponse.json({ ok: true, callId: match.screening_calls[0].id, alreadyExisted: true })
    }

    const c        = match.candidate
    const job      = match.job
    const company  = job.company
    const skills   = c.skills.map(s => s.skill.name)
    const salaryExp = Number(c.salary_expectation_min ?? 60000)

    const content = generateScreening(
      c.first_name,
      c.current_title ?? 'Professional',
      job.title,
      company?.name ?? 'the company',
      c.years_experience ?? 4,
      salaryExp,
      c.notice_period_days ?? 30,
      skills,
    )

    const now = new Date()
    const startedAt = new Date(now.getTime() - content.durationSecs * 1000)
    const callId = `${matchId}-call`

    const call = await prisma.screeningCall.upsert({
      where:  { id: callId },
      update: { status: 'COMPLETED', recommendation: content.recommendation },
      create: {
        id:                           callId,
        match_id:                     matchId,
        candidate_id:                 c.id,
        job_id:                       job.id,
        call_type:                    'VIDEO',
        status:                       'COMPLETED',
        scheduled_at:                 startedAt,
        started_at:                   startedAt,
        ended_at:                     now,
        duration_seconds:             content.durationSecs,
        candidate_interest_level:     content.interestLevel,
        availability_confirmed:       true,
        salary_expectation_confirmed: salaryExp,
        notice_period_confirmed:      c.notice_period_days ?? 30,
        key_concerns:                 content.keyConcerns,
        recommendation:               content.recommendation,
        recommendation_reasoning:     content.reasoning,
        ai_summary:                   `Completed ${Math.round(content.durationSecs / 60)}-minute video screening. ${content.reasoning}`,
        transcript:                   content.transcript,
      },
    })

    // Save Q&A
    await Promise.all(
      content.questions.map((q, i) =>
        prisma.screeningQuestion.upsert({
          where:  { id: `${callId}-q${i + 1}` },
          update: {},
          create: {
            id:                `${callId}-q${i + 1}`,
            screening_call_id: call.id,
            question_text:     q.question_text,
            answer_text:       q.answer_text,
            ai_score:          q.ai_score,
            order:             q.order,
          },
        })
      )
    )

    // Advance match status to SHORTLISTED
    if (['SUGGESTED', 'CONTACTED'].includes(match.status)) {
      await prisma.match.update({
        where: { id: matchId },
        data:  { status: 'SHORTLISTED' },
      })
    }

    return NextResponse.json({ ok: true, callId: call.id, recommendation: content.recommendation })
  } catch (err) {
    console.error('Screening create error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
