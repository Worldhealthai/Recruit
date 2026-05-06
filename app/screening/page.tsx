import Link from 'next/link'
import PageShell from '../components/PageShell'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

async function getScreening() {
  try {
    return await prisma.screeningCall.findMany({
      include: {
        candidate: true,
        job: { include: { company: true } },
        questions: { orderBy: { order: 'asc' } },
      },
      take: 20,
      orderBy: { scheduled_at: 'desc' },
    })
  } catch {
    return []
  }
}

// ── Hardcoded demo calls shown when DB is empty ──────────────────────────────
const DEMO_CALLS = [
  {
    id: 'demo-1',
    status: 'COMPLETED',
    call_type: 'VIDEO',
    recommendation: 'STRONG_YES',
    candidate_interest_level: 'VERY_INTERESTED',
    salary_expectation_confirmed: 112000,
    notice_period_confirmed: 30,
    duration_seconds: 1920,
    scheduled_at: new Date('2026-03-01T10:00:00Z'),
    key_concerns: ['Wants Staff-level title confirmed within 18 months', 'Prefers hybrid min 2 days remote'],
    ai_summary: 'Completed 32-minute video screening. Alex demonstrated expert TypeScript and Node.js depth — detailed answers on event loop internals, query optimisation, and microservice observability. Very interested in the role, salary aligned at £112K, notice 30 days. No red flags. Strongly recommend fast-tracking to technical interview.',
    recommendation_reasoning: 'Alex Chen is an exceptional fit. His 6-year fintech career is almost entirely in TypeScript/Node.js. He led a full transaction feed rewrite at Monzo cutting P99 latency 40% — exactly the scale this role demands. Salary expectation (£112K) is within budget. Seniority is a direct match. Recommend immediate shortlist.',
    candidate: { id: 'demo-c1', first_name: 'Alex', last_name: 'Chen', current_title: 'Senior Software Engineer' },
    job: { id: 'demo-j1', title: 'Senior TypeScript Engineer', company: { name: 'Monzo Bank' } },
    questions: [
      { id: 'demo-q1', order: 1, question_text: 'Walk me through your current role and primary ownership areas.', answer_text: 'Owns the transaction feed service (TypeScript/Node.js/Postgres) at Monzo serving 8M users. Led full rewrite reducing P99 latency 40%. Runs code reviews and contributes to architecture RFCs.', ai_score: 0.95 },
      { id: 'demo-q2', order: 2, question_text: 'Describe the most technically challenging problem you solved end-to-end.', answer_text: 'N+1 query problem in enrichment layer. Batched merchant metadata fetches with Redis TTL cache. Reduced DB load 70%, P99 latency down 40%. Shipped safely behind feature flag on a live system serving 8M users.', ai_score: 0.98 },
      { id: 'demo-q3', order: 3, question_text: 'What are your salary expectations and notice period?', answer_text: 'Targeting £110–115K. Currently on £95K. Notice period 30 days contractually, ~4 weeks realistic. Will leave on good terms.', ai_score: 0.90 },
      { id: 'demo-q4', order: 4, question_text: 'What would cause you to decline an offer?', answer_text: 'No clear Staff progression path within 18 months would be a dealbreaker. Also requires hybrid working — minimum 2 days remote. Both appear satisfied by the JD.', ai_score: 0.85 },
    ],
  },
  {
    id: 'demo-2',
    status: 'COMPLETED',
    call_type: 'VIDEO',
    recommendation: 'YES',
    candidate_interest_level: 'INTERESTED',
    salary_expectation_confirmed: 118000,
    notice_period_confirmed: 30,
    duration_seconds: 1620,
    scheduled_at: new Date('2026-03-10T14:00:00Z'),
    key_concerns: ['B2B SaaS background — limited consumer product experience', 'Salary expectation at top of advertised range (£118K)'],
    ai_summary: 'Completed 27-minute video screening. Sofia demonstrated strong analytical rigour and data-first PM instincts. Business Accounts ownership at Wise (£180M ARR) is impressive. B2C experience lighter than ideal but addressed well with prior growth startup background. Salary at top of range — confirm client budget flexibility.',
    recommendation_reasoning: 'Sofia Martinez is a credible Senior PM candidate. SQL fluency, A/B testing track record, and ARR ownership demonstrate the analytical depth Deliveroo needs. The B2C gap is real but not disqualifying — she articulated consumer product thinking clearly when probed. Recommend advancing to hiring manager intro call.',
    candidate: { id: 'demo-c2', first_name: 'Sofia', last_name: 'Martinez', current_title: 'Senior Product Manager' },
    job: { id: 'demo-j2', title: 'Senior Product Manager', company: { name: 'Deliveroo' } },
    questions: [
      { id: 'demo-q5', order: 1, question_text: 'What is the most impactful product you have shipped and how did you measure success?', answer_text: 'Business Accounts at Wise — grew to £180M ARR. Measured activation rate, revenue per account, monthly active accounts. Ran 3 major feature bets including bulk payments and multi-user access.', ai_score: 0.92 },
      { id: 'demo-q6', order: 2, question_text: 'How do you approach a consumer experience differently from a B2B product?', answer_text: 'Consumer design turns on micro-moments and emotional stakes. I would lean heavily on session recordings, NPS segmentation, and cohort retention analysis rather than pure revenue metrics. The user psychology is fundamentally different.', ai_score: 0.82 },
      { id: 'demo-q7', order: 3, question_text: 'Describe how you have used data to make a difficult product decision.', answer_text: 'At Wise we debated removing a feature used by 15% of users but cited by 40% of churn feedback. I ran a holdout experiment. Removing it increased Day-30 retention by 3 points. Data beat intuition.', ai_score: 0.94 },
      { id: 'demo-q8', order: 4, question_text: 'Salary expectations and notice period?', answer_text: 'Targeting £118K — aware that is top of range. Open to conversation if total package compensates. Notice 30 days.', ai_score: 0.80 },
    ],
  },
  {
    id: 'demo-3',
    status: 'COMPLETED',
    call_type: 'VIDEO',
    recommendation: 'MAYBE',
    candidate_interest_level: 'INTERESTED',
    salary_expectation_confirmed: 75000,
    notice_period_confirmed: 30,
    duration_seconds: 1380,
    scheduled_at: new Date('2026-03-15T11:00:00Z'),
    key_concerns: ['Limited experience with dbt — cited in JD as required', 'Current scope narrower than the role implies', 'Salary expectation may be below market for senior scope'],
    ai_summary: 'Completed 23-minute video screening. Tom showed solid Python and SQL fundamentals and direct Checkout.com context is valuable. dbt and Airflow depth not fully validated in screening — requires a focused technical interview. Recommend a short take-home before committing.',
    recommendation_reasoning: 'Tom Wright is a reasonable candidate with real relevance — he built the 500M events/day analytics platform at Checkout.com. The skill gap on dbt and orchestration tools needs validating. Experience match is mid-level and the role needs senior scope. Recommend a focused technical screen before advancing.',
    candidate: { id: 'demo-c3', first_name: 'Tom', last_name: 'Wright', current_title: 'Data Engineer' },
    job: { id: 'demo-j3', title: 'Data Engineer', company: { name: 'Checkout.com' } },
    questions: [
      { id: 'demo-q9', order: 1, question_text: 'Describe your current data stack and what you personally own.', answer_text: 'Analytics platform processing 500M+ daily payment events at Checkout.com. Own Airflow pipelines, dbt models (basic), and Redshift warehouse used by 80+ analysts. Python and SQL daily.', ai_score: 0.82 },
      { id: 'demo-q10', order: 2, question_text: 'How do you approach data quality in a high-volume pipeline?', answer_text: 'Automated row count and null checks at each pipeline stage. Slack alerts on anomalies. Monthly data quality reviews with analytics team. I aim to catch issues before they reach dashboards.', ai_score: 0.78 },
    ],
  },
]

const outcomeColors: Record<string, string> = {
  STRONG_YES: '#22c55e', YES: '#86efac', MAYBE: '#f59e0b', NO: '#ef4444', STRONG_NO: '#b91c1c',
}
const statusColors: Record<string, string> = {
  PENDING: '#475569', SCHEDULED: '#3b82f6', IN_PROGRESS: '#f59e0b',
  COMPLETED: '#22c55e', NO_ANSWER: '#64748b', CANCELLED: '#64748b', FAILED: '#ef4444',
}
const interestColors: Record<string, string> = {
  VERY_INTERESTED: '#22c55e', INTERESTED: '#86efac', NEUTRAL: '#f59e0b', NOT_INTERESTED: '#ef4444',
}
const callStages = ['Intro & Consent', 'Role Verification', 'Technical Questions', 'Motivation & Fit', 'Salary & Notice', 'Wrap-up & Recommendation']

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CallCard({ call, isDemo }: { call: any; isDemo?: boolean }) {
  const candidateName = call.candidate ? `${call.candidate.first_name} ${call.candidate.last_name}` : '—'
  const outcome = call.recommendation
  const status = call.status
  const isCompleted = status === 'COMPLETED'

  return (
    <div style={{
      background: 'rgba(255,255,255,0.04)',
      border: `1px solid ${isCompleted ? 'rgba(99,102,241,0.25)' : 'rgba(255,255,255,0.08)'}`,
      borderRadius: '0.75rem', padding: '1.5rem',
      position: 'relative',
    }}>
      {isDemo && (
        <div style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: '0.3rem', padding: '0.1rem 0.5rem', fontSize: '0.65rem', color: '#6366f1', fontWeight: 700, letterSpacing: '0.05em' }}>
          DEMO
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.2rem' }}>
            {isDemo ? (
              <span style={{ fontWeight: 700, color: '#f8fafc' }}>{candidateName}</span>
            ) : (
              <Link href={`/candidates/${call.candidate?.id}`} style={{ fontWeight: 700, textDecoration: 'none', color: '#f8fafc' }}>{candidateName}</Link>
            )}
            <span style={{ color: '#475569', fontSize: '0.82rem' }}>→</span>
            {isDemo ? (
              <span style={{ color: '#94a3b8', fontSize: '0.88rem' }}>{call.job?.title} @ {call.job?.company?.name}</span>
            ) : (
              <Link href={`/jobs/${call.job?.id}`} style={{ color: '#94a3b8', fontSize: '0.88rem', textDecoration: 'none' }}>{call.job?.title} @ {call.job?.company?.name}</Link>
            )}
          </div>
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginTop: '0.4rem' }}>
            {call.scheduled_at && (
              <span style={{ color: '#475569', fontSize: '0.78rem' }}>
                📅 {new Date(call.scheduled_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            )}
            {call.duration_seconds && (
              <span style={{ color: '#475569', fontSize: '0.78rem' }}>⏱ {Math.round(call.duration_seconds / 60)} min</span>
            )}
            <span style={{ color: '#475569', fontSize: '0.78rem' }}>📹 {call.call_type}</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ background: `${statusColors[status] ?? '#64748b'}22`, color: statusColors[status] ?? '#64748b', border: `1px solid ${statusColors[status] ?? '#64748b'}44`, borderRadius: '0.3rem', padding: '0.2rem 0.6rem', fontSize: '0.72rem', fontWeight: 600 }}>{status}</span>
          {outcome && (
            <span style={{ background: `${outcomeColors[outcome] ?? '#64748b'}22`, color: outcomeColors[outcome] ?? '#64748b', border: `1px solid ${outcomeColors[outcome] ?? '#64748b'}44`, borderRadius: '0.3rem', padding: '0.2rem 0.6rem', fontSize: '0.72rem', fontWeight: 700 }}>{outcome.replace(/_/g, ' ')}</span>
          )}
        </div>
      </div>

      {/* Confirmed details row */}
      {isCompleted && (call.candidate_interest_level || call.salary_expectation_confirmed || call.notice_period_confirmed) && (
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '1rem', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '0.5rem' }}>
          {call.candidate_interest_level && (
            <div>
              <div style={{ color: '#475569', fontSize: '0.7rem', marginBottom: '0.1rem' }}>Interest</div>
              <div style={{ color: interestColors[call.candidate_interest_level] ?? '#f8fafc', fontWeight: 700, fontSize: '0.82rem' }}>{call.candidate_interest_level.replace(/_/g, ' ')}</div>
            </div>
          )}
          {call.salary_expectation_confirmed && (
            <div>
              <div style={{ color: '#475569', fontSize: '0.7rem', marginBottom: '0.1rem' }}>Confirmed salary</div>
              <div style={{ color: '#f8fafc', fontWeight: 700, fontSize: '0.82rem' }}>£{Number(call.salary_expectation_confirmed).toLocaleString()}</div>
            </div>
          )}
          {call.notice_period_confirmed && (
            <div>
              <div style={{ color: '#475569', fontSize: '0.7rem', marginBottom: '0.1rem' }}>Notice period</div>
              <div style={{ color: '#f8fafc', fontWeight: 700, fontSize: '0.82rem' }}>{call.notice_period_confirmed} days</div>
            </div>
          )}
        </div>
      )}

      {/* AI Summary */}
      {call.ai_summary && (
        <div style={{ borderLeft: '3px solid rgba(99,102,241,0.5)', paddingLeft: '0.9rem', marginBottom: '1rem' }}>
          <div style={{ color: '#a5b4fc', fontSize: '0.7rem', textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginBottom: '0.3rem' }}>AI Summary</div>
          <p style={{ color: '#94a3b8', fontSize: '0.86rem', lineHeight: 1.65, margin: 0 }}>{call.ai_summary}</p>
        </div>
      )}

      {/* Q&A */}
      {call.questions?.length > 0 && (
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ color: '#475569', fontSize: '0.7rem', textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginBottom: '0.6rem' }}>Q&amp;A — {call.questions.length} questions scored</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {call.questions.map((q: { id: string; order: number; question_text: string; answer_text?: string; ai_score?: number }) => (
              <div key={q.id} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '0.4rem', padding: '0.75rem 1rem' }}>
                <div style={{ color: '#a5b4fc', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Q{q.order}: {q.question_text}</div>
                {q.answer_text && <div style={{ color: '#94a3b8', fontSize: '0.8rem', lineHeight: 1.55 }}>→ {q.answer_text}</div>}
                {q.ai_score != null && (
                  <div style={{ marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '80px', height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '999px', overflow: 'hidden' }}>
                      <div style={{ width: `${Math.round(q.ai_score * 100)}%`, height: '100%', background: q.ai_score >= 0.85 ? '#22c55e' : q.ai_score >= 0.7 ? '#f59e0b' : '#ef4444', borderRadius: '999px' }} />
                    </div>
                    <span style={{ color: q.ai_score >= 0.85 ? '#4ade80' : q.ai_score >= 0.7 ? '#fbbf24' : '#f87171', fontSize: '0.75rem', fontWeight: 700 }}>{Math.round(q.ai_score * 100)}%</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Key concerns */}
      {call.key_concerns?.length > 0 && (
        <div style={{ padding: '0.6rem 0.9rem', background: 'rgba(245,158,11,0.07)', borderRadius: '0.4rem', border: '1px solid rgba(245,158,11,0.2)', marginBottom: '1rem' }}>
          <div style={{ color: '#f59e0b', fontSize: '0.72rem', fontWeight: 700, marginBottom: '0.3rem' }}>⚠ Concerns to probe at interview</div>
          {call.key_concerns.map((c: string) => <div key={c} style={{ color: '#fcd34d', fontSize: '0.8rem' }}>• {c}</div>)}
        </div>
      )}

      {/* Recommendation reasoning */}
      {call.recommendation_reasoning && (
        <div style={{ background: `${outcomeColors[outcome] ?? '#64748b'}0d`, border: `1px solid ${outcomeColors[outcome] ?? '#64748b'}22`, borderRadius: '0.5rem', padding: '0.9rem 1rem' }}>
          <div style={{ color: outcomeColors[outcome] ?? '#94a3b8', fontSize: '0.72rem', fontWeight: 700, marginBottom: '0.4rem' }}>Recommendation Reasoning</div>
          <p style={{ color: '#94a3b8', fontSize: '0.83rem', lineHeight: 1.65, margin: 0 }}>{call.recommendation_reasoning}</p>
        </div>
      )}
    </div>
  )
}

export default async function ScreeningPage() {
  const dbCalls = await getScreening()
  const isDemo  = dbCalls.length === 0
  const calls   = isDemo ? DEMO_CALLS : dbCalls

  const completed   = calls.filter(c => c.status === 'COMPLETED').length
  const strongYes   = calls.filter(c => c.recommendation === 'STRONG_YES').length
  const advanced    = calls.filter(c => c.recommendation === 'STRONG_YES' || c.recommendation === 'YES').length

  return (
    <PageShell
      active="/screening"
      title="AI Screening Calls"
      subtitle="Automated video screening — transcript, per-question scoring & hiring recommendation"
      badge="AI Screening Engine"
    >
      {isDemo && (
        <div style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '0.6rem', padding: '0.75rem 1.1rem', marginBottom: '1.5rem', fontSize: '0.82rem', color: '#a5b4fc', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span>👁</span>
          <span>Showing <strong>demo data</strong> — run the AI Screening Call from the Pipeline page to generate real records.</span>
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(155px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
        {[
          { label: 'Total Calls',   value: calls.length.toString(),  color: '#f8fafc' },
          { label: 'Completed',     value: completed.toString(),      color: '#22c55e' },
          { label: 'Strong Yes',    value: strongYes.toString(),      color: '#4ade80' },
          { label: 'Advanced',      value: advanced.toString(),       color: '#a5b4fc', sub: 'YES or STRONG YES' },
          { label: 'Advance Rate',  value: completed > 0 ? `${Math.round(advanced / completed * 100)}%` : '—', color: '#f59e0b' },
        ].map(({ label, value, sub, color }) => (
          <div key={label} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '0.75rem', padding: '1.1rem' }}>
            <div style={{ color: '#475569', fontSize: '0.7rem', textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: '0.3rem' }}>{label}</div>
            <div style={{ fontWeight: 800, fontSize: '1.4rem', color }}>{value}</div>
            {sub && <div style={{ color: '#475569', fontSize: '0.7rem', marginTop: '0.15rem' }}>{sub}</div>}
          </div>
        ))}
      </div>

      {/* Call flow stages */}
      <div style={{ background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: '0.75rem', padding: '1rem 1.25rem', marginBottom: '1.5rem', overflowX: 'auto' }}>
        <div style={{ fontSize: '0.7rem', color: '#475569', marginBottom: '0.6rem', textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>AI call flow</div>
        <div style={{ display: 'flex', gap: '0', minWidth: 'max-content', alignItems: 'center' }}>
          {callStages.map((stage, i) => (
            <div key={stage} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ padding: '0.3rem 0.7rem', borderRadius: '0.3rem', fontSize: '0.73rem', background: 'rgba(99,102,241,0.12)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.25)' }}>{stage}</div>
              {i < callStages.length - 1 && <div style={{ color: '#334155', padding: '0 0.15rem' }}>›</div>}
            </div>
          ))}
        </div>
      </div>

      {/* Call cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {calls.map(call => <CallCard key={call.id} call={call} isDemo={isDemo} />)}
      </div>
    </PageShell>
  )
}
