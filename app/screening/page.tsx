import Link from 'next/link'
import PageShell from '../components/PageShell'
import EmptyState from '../components/EmptyState'
import { prisma } from '@/lib/prisma'

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

const outcomeColors: Record<string, string> = {
  STRONG_YES: '#22c55e', YES: '#86efac', MAYBE: '#f59e0b', NO: '#ef4444', STRONG_NO: '#b91c1c',
}
const statusColors: Record<string, string> = {
  PENDING: '#475569', SCHEDULED: '#3b82f6', IN_PROGRESS: '#f59e0b',
  COMPLETED: '#22c55e', NO_ANSWER: '#64748b', CANCELLED: '#64748b', FAILED: '#ef4444',
}
const interestColors: Record<string, string> = {
  VERY_INTERESTED: '#22c55e', INTERESTED: '#86efac', NEUTRAL: '#f59e0b',
  NOT_INTERESTED: '#ef4444',
}

// The AI call stages shown as a visual flow
const callStages = ['Intro & Consent', 'Role Verification', 'Technical Questions', 'Motivation & Fit', 'Salary & Notice', 'Wrap-up & Recommendation']

export default async function ScreeningPage() {
  const calls = await getScreening()

  const completed = calls.filter(c => c.status === 'COMPLETED').length
  const strongYes = calls.filter(c => c.recommendation === 'STRONG_YES').length
  const advanced = calls.filter(c => c.recommendation === 'STRONG_YES' || c.recommendation === 'YES').length

  return (
    <PageShell
      active="/screening"
      title="AI Screening Calls"
      subtitle="Automated video/voice screening with transcript, scoring & hiring recommendation"
      badge="AI Screening Engine"
    >
      {calls.length === 0 ? (
        <>
          {/* How it works — shown even when empty, as investor explainer */}
          <div style={{
            background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.2)',
            borderRadius: '0.75rem', padding: '1.75rem', marginBottom: '1.5rem',
          }}>
            <h2 style={{ margin: '0 0 1.25rem', fontSize: '1rem', fontWeight: 700, color: '#a5b4fc' }}>
              🤖 How the AI Screening Engine Works
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              {[
                { step: '1', title: 'Match Identified', desc: 'AI scores candidate ≥ 70% match → triggers screening invite automatically' },
                { step: '2', title: 'Call Scheduled', desc: 'Candidate books a 30-min slot. RecruitAI sends calendar invite + role brief' },
                { step: '3', title: 'AI Conducts Call', desc: 'GPT-4o voice agent asks 6–8 pre-set questions, adapts follow-ups in real time' },
                { step: '4', title: 'Transcript Generated', desc: 'Full transcript + per-question AI scores produced within 2 minutes of call end' },
                { step: '5', title: 'Recommendation', desc: 'STRONG YES / YES / MAYBE / NO with written reasoning sent to recruiter instantly' },
                { step: '6', title: 'Advance to Client', desc: 'Recruiter reviews and submits shortlisted candidates to client with one click' },
              ].map(({ step, title, desc }) => (
                <div key={step} style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ color: '#6366f1', fontWeight: 800, fontSize: '1.1rem', marginBottom: '0.3rem' }}>{step}</div>
                  <div style={{ fontWeight: 600, fontSize: '0.88rem', marginBottom: '0.3rem' }}>{title}</div>
                  <div style={{ color: '#64748b', fontSize: '0.8rem', lineHeight: 1.5 }}>{desc}</div>
                </div>
              ))}
            </div>
          </div>
          <EmptyState icon="📞" message="No screening calls yet" hint="Seed the database and AI screening calls will appear here." />
        </>
      ) : (
        <>
          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            {[
              { label: 'Total Calls', value: calls.length.toString(), color: '#f8fafc' },
              { label: 'Completed', value: completed.toString(), color: '#22c55e' },
              { label: 'Strong Yes', value: strongYes.toString(), color: '#4ade80' },
              { label: 'Advanced', value: advanced.toString(), sub: 'YES or STRONG YES', color: '#a5b4fc' },
              { label: 'Advance Rate', value: completed > 0 ? `${Math.round(advanced / completed * 100)}%` : '—', color: '#f59e0b' },
            ].map(({ label, value, sub, color }) => (
              <div key={label} style={{
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '0.75rem', padding: '1.1rem',
              }}>
                <div style={{ color: '#475569', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.3rem' }}>{label}</div>
                <div style={{ fontWeight: 800, fontSize: '1.4rem', color }}>{value}</div>
                {sub && <div style={{ color: '#475569', fontSize: '0.72rem', marginTop: '0.15rem' }}>{sub}</div>}
              </div>
            ))}
          </div>

          {/* How the AI call works — compact version */}
          <div style={{
            background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.15)',
            borderRadius: '0.75rem', padding: '1.25rem 1.5rem', marginBottom: '1.5rem',
            overflowX: 'auto',
          }}>
            <div style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>AI Call Flow</div>
            <div style={{ display: 'flex', gap: '0', minWidth: 'max-content', alignItems: 'center' }}>
              {callStages.map((stage, i) => (
                <div key={stage} style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{
                    padding: '0.35rem 0.75rem', borderRadius: '0.3rem', fontSize: '0.75rem',
                    background: 'rgba(99,102,241,0.12)', color: '#a5b4fc',
                    border: '1px solid rgba(99,102,241,0.25)',
                  }}>{stage}</div>
                  {i < callStages.length - 1 && (
                    <div style={{ color: '#334155', padding: '0 0.2rem' }}>›</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Call cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {calls.map((call) => {
              const candidate = call.candidate
              const job = call.job
              const outcome = call.recommendation
              const status = call.status
              const candidateName = candidate ? `${candidate.first_name} ${candidate.last_name}` : '—'
              const isCompleted = status === 'COMPLETED'

              return (
                <div key={call.id} style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: `1px solid ${isCompleted ? 'rgba(99,102,241,0.25)' : 'rgba(255,255,255,0.08)'}`,
                  borderRadius: '0.75rem', padding: '1.5rem',
                }}>
                  {/* Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.2rem' }}>
                        <Link href={`/candidates/${candidate?.id}`} style={{ fontWeight: 700, textDecoration: 'none', color: '#f8fafc' }}>
                          {candidateName}
                        </Link>
                        <span style={{ color: '#475569', fontSize: '0.82rem' }}>→</span>
                        <Link href={`/jobs/${job?.id}`} style={{ color: '#94a3b8', fontSize: '0.88rem', textDecoration: 'none' }}>
                          {job?.title} @ {job?.company?.name}
                        </Link>
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
                      <span style={{
                        background: `${statusColors[status] ?? '#64748b'}22`,
                        color: statusColors[status] ?? '#64748b',
                        border: `1px solid ${statusColors[status] ?? '#64748b'}44`,
                        borderRadius: '0.3rem', padding: '0.2rem 0.6rem', fontSize: '0.72rem', fontWeight: 600,
                      }}>{status}</span>
                      {outcome && (
                        <span style={{
                          background: `${outcomeColors[outcome] ?? '#64748b'}22`,
                          color: outcomeColors[outcome] ?? '#64748b',
                          border: `1px solid ${outcomeColors[outcome] ?? '#64748b'}44`,
                          borderRadius: '0.3rem', padding: '0.2rem 0.6rem', fontSize: '0.72rem', fontWeight: 700,
                        }}>{outcome.replace(/_/g, ' ')}</span>
                      )}
                    </div>
                  </div>

                  {/* Candidate interest + confirmed details */}
                  {isCompleted && (call.candidate_interest_level || call.salary_expectation_confirmed || call.notice_period_confirmed) && (
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '0.5rem' }}>
                      {call.candidate_interest_level && (
                        <div>
                          <span style={{ color: '#475569', fontSize: '0.75rem' }}>Interest  </span>
                          <span style={{ color: interestColors[call.candidate_interest_level] ?? '#f8fafc', fontWeight: 700, fontSize: '0.82rem' }}>
                            {call.candidate_interest_level.replace(/_/g, ' ')}
                          </span>
                        </div>
                      )}
                      {call.salary_expectation_confirmed && (
                        <div>
                          <span style={{ color: '#475569', fontSize: '0.75rem' }}>Confirmed salary  </span>
                          <span style={{ color: '#f8fafc', fontWeight: 700, fontSize: '0.82rem' }}>£{Number(call.salary_expectation_confirmed).toLocaleString()}</span>
                        </div>
                      )}
                      {call.notice_period_confirmed && (
                        <div>
                          <span style={{ color: '#475569', fontSize: '0.75rem' }}>Notice  </span>
                          <span style={{ color: '#f8fafc', fontWeight: 700, fontSize: '0.82rem' }}>{call.notice_period_confirmed} days</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* AI Summary */}
                  {call.ai_summary && (
                    <div style={{ borderLeft: '3px solid rgba(99,102,241,0.5)', paddingLeft: '0.9rem', marginBottom: '1rem' }}>
                      <div style={{ color: '#a5b4fc', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.3rem' }}>AI Summary</div>
                      <p style={{ color: '#94a3b8', fontSize: '0.86rem', lineHeight: 1.65, margin: 0 }}>{call.ai_summary}</p>
                    </div>
                  )}

                  {/* Questions & Answers */}
                  {call.questions.length > 0 && (
                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ color: '#475569', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.6rem' }}>
                        Q&A ({call.questions.length} questions)
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {call.questions.map((q) => (
                          <div key={q.id} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '0.4rem', padding: '0.75rem 1rem' }}>
                            <div style={{ color: '#a5b4fc', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>
                              Q{q.order}: {q.question_text}
                            </div>
                            {q.answer_text && (
                              <div style={{ color: '#94a3b8', fontSize: '0.8rem', lineHeight: 1.55 }}>→ {q.answer_text}</div>
                            )}
                            {q.ai_score != null && (
                              <div style={{ marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <div style={{ width: '60px', height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '999px', overflow: 'hidden' }}>
                                  <div style={{ width: `${Math.round(q.ai_score * 100)}%`, height: '100%', background: q.ai_score >= 0.8 ? '#22c55e' : '#f59e0b', borderRadius: '999px' }} />
                                </div>
                                <span style={{ color: '#64748b', fontSize: '0.72rem' }}>{Math.round(q.ai_score * 100)}%</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Key concerns */}
                  {call.key_concerns && call.key_concerns.length > 0 && (
                    <div style={{ padding: '0.6rem 0.9rem', background: 'rgba(245,158,11,0.08)', borderRadius: '0.4rem', border: '1px solid rgba(245,158,11,0.2)', marginBottom: '1rem' }}>
                      <div style={{ color: '#f59e0b', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.3rem' }}>⚠ Concerns to probe at interview</div>
                      {call.key_concerns.map((c) => (
                        <div key={c} style={{ color: '#fcd34d', fontSize: '0.8rem' }}>• {c}</div>
                      ))}
                    </div>
                  )}

                  {/* Recommendation reasoning */}
                  {call.recommendation_reasoning && (
                    <div style={{ background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.15)', borderRadius: '0.5rem', padding: '0.9rem 1rem' }}>
                      <div style={{ color: '#22c55e', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.4rem' }}>Recommendation Reasoning</div>
                      <p style={{ color: '#94a3b8', fontSize: '0.83rem', lineHeight: 1.65, margin: 0 }}>{call.recommendation_reasoning}</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </>
      )}
    </PageShell>
  )
}
