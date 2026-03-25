import Link from 'next/link'
import Nav from './components/Nav'
import { prisma } from '@/lib/prisma'

async function getStats() {
  try {
    const [candidates, jobs, companies, matches, placements, screeningCalls] = await Promise.all([
      prisma.candidate.count(),
      prisma.job.count({ where: { status: 'ACTIVE' } }),
      prisma.company.count(),
      prisma.match.count(),
      prisma.placement.findMany({ select: { recruiter_earnings: true, fee_total: true, invoice_status: true } }),
      prisma.screeningCall.count({ where: { status: 'COMPLETED' } }),
    ])

    const totalBillings = placements.reduce((s, p) => s + Number(p.fee_total), 0)
    const totalEarnings = placements.reduce((s, p) => s + Number(p.recruiter_earnings), 0)
    const placed = await prisma.match.count({ where: { status: 'PLACED' } })
    const activeMatches = await prisma.match.count({ where: { status: { in: ['SHORTLISTED', 'CONTACTED', 'SCREENING', 'INTERVIEW', 'OFFER'] } } })

    return { candidates, jobs, companies, matches, placements: placed, totalBillings, totalEarnings, screeningCalls, activeMatches }
  } catch {
    return null
  }
}

const pages = [
  { href: '/candidates',      label: 'Candidates',      desc: 'Search & filter talent profiles with AI match scoring',  icon: '👤' },
  { href: '/jobs',            label: 'Jobs',            desc: 'Active job listings with full JD, requirements & top matches', icon: '💼' },
  { href: '/companies',       label: 'Companies',       desc: 'Company profiles, tech stack, culture and open roles',    icon: '🏢' },
  { href: '/matches',         label: 'AI Matches',      desc: '6-dimension AI scoring with full reasoning per match',    icon: '🤝' },
  { href: '/screening',       label: 'AI Screening',    desc: 'Automated video calls with transcript, Q&A and STRONG YES/NO rec', icon: '📞' },
  { href: '/placements',      label: 'Placements',      desc: 'Confirmed hires, fee invoices, guarantee periods & net earnings', icon: '💰' },
  { href: '/market-insights', label: 'Market Insights', desc: 'Salary benchmarks, hiring trends and skill demand signals',icon: '📊' },
  { href: '/recruiters',      label: 'Recruiters',      desc: 'Portfolio dashboard: billings, pipeline value and KPIs',  icon: '🧑‍💼' },
]

export default async function Home() {
  const stats = await getStats()

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
      color: '#f8fafc',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <Nav />

      {/* Hero */}
      <section style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', padding: '5rem 2rem 2rem',
      }}>
        <div style={{
          display: 'inline-block',
          background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.4)',
          borderRadius: '999px', padding: '0.3rem 1rem',
          fontSize: '0.8rem', color: '#a5b4fc',
          marginBottom: '1.5rem', letterSpacing: '0.05em', textTransform: 'uppercase',
        }}>
          AI-Powered Recruitment Platform
        </div>

        <h1 style={{
          fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
          fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.04em',
          marginBottom: '1.25rem', maxWidth: '800px',
        }}>
          Find the right talent,{' '}
          <span style={{
            background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            10× faster
          </span>
        </h1>

        <p style={{ fontSize: '1.1rem', color: '#94a3b8', maxWidth: '580px', lineHeight: 1.7, marginBottom: '2rem' }}>
          AI screening calls, deep candidate matching, automated fee tracking and live market intelligence —
          the full recruitment lifecycle from sourcing to placement.
        </p>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '3rem' }}>
          <Link href="/candidates" style={{
            background: '#6366f1', color: '#fff',
            padding: '0.85rem 2rem', borderRadius: '0.625rem',
            fontSize: '1rem', fontWeight: 600, textDecoration: 'none',
          }}>Browse Candidates</Link>
          <Link href="/placements" style={{
            background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)',
            color: '#4ade80', padding: '0.85rem 2rem', borderRadius: '0.625rem',
            fontSize: '1rem', fontWeight: 600, textDecoration: 'none',
          }}>View Earnings</Link>
          <Link href="/jobs" style={{
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
            color: '#f8fafc', padding: '0.85rem 2rem', borderRadius: '0.625rem',
            fontSize: '1rem', fontWeight: 600, textDecoration: 'none',
          }}>Open Jobs</Link>
        </div>

        {/* Live stats bar */}
        {stats && (
          <div style={{
            display: 'flex', gap: '0', flexWrap: 'wrap', justifyContent: 'center',
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '0.75rem', overflow: 'hidden', maxWidth: '900px', width: '100%',
          }}>
            {[
              { label: 'Candidates', value: stats.candidates.toString() },
              { label: 'Active Jobs', value: stats.jobs.toString() },
              { label: 'AI Matches', value: stats.matches.toString() },
              { label: 'In Pipeline', value: stats.activeMatches.toString() },
              { label: 'Placed', value: stats.placements.toString() },
              { label: 'Screenings Done', value: stats.screeningCalls.toString() },
              { label: 'Total Billings', value: stats.totalBillings > 0 ? `£${Math.round(stats.totalBillings).toLocaleString()}` : '—' },
              { label: 'Net Earnings', value: stats.totalEarnings > 0 ? `£${Math.round(stats.totalEarnings).toLocaleString()}` : '—' },
            ].map(({ label, value }, i, arr) => (
              <div key={label} style={{
                flex: '1 1 100px', padding: '1.1rem 1rem', textAlign: 'center',
                borderRight: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.07)' : 'none',
              }}>
                <div style={{ fontWeight: 800, fontSize: '1.25rem', color: '#f8fafc' }}>{value}</div>
                <div style={{ color: '#475569', fontSize: '0.72rem', marginTop: '0.2rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* How it works */}
      <section style={{ padding: '3rem 2.5rem 1rem', maxWidth: '960px', margin: '0 auto', width: '100%' }}>
        <h2 style={{ textAlign: 'center', fontSize: '0.85rem', fontWeight: 600, color: '#475569', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
          The Full Recruitment Lifecycle
        </h2>
        <div style={{ display: 'flex', gap: '0', overflowX: 'auto', padding: '0.5rem 0', marginBottom: '2rem' }}>
          {[
            { n: '1', label: 'Source', desc: 'Ingest candidates from LinkedIn, Indeed, referrals' },
            { n: '2', label: 'Match', desc: 'AI scores fit across 6 dimensions' },
            { n: '3', label: 'Screen', desc: 'Automated call → transcript + recommendation' },
            { n: '4', label: 'Submit', desc: 'Shortlist sent to client with AI reasoning' },
            { n: '5', label: 'Interview', desc: 'Client interviews; recruiter manages process' },
            { n: '6', label: 'Offer', desc: 'Salary negotiation tracked in platform' },
            { n: '7', label: 'Place', desc: 'Placement confirmed, invoice raised' },
            { n: '8', label: 'Track', desc: 'Earnings, guarantee period & portfolio' },
          ].map(({ n, label, desc }, i, arr) => (
            <div key={n} style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
              <div style={{ textAlign: 'center', padding: '0.75rem 0.9rem', background: 'rgba(99,102,241,0.08)', borderRadius: '0.5rem', border: '1px solid rgba(99,102,241,0.2)', minWidth: '90px' }}>
                <div style={{ color: '#6366f1', fontWeight: 800, fontSize: '1rem' }}>{n}</div>
                <div style={{ color: '#f8fafc', fontWeight: 600, fontSize: '0.78rem' }}>{label}</div>
                <div style={{ color: '#475569', fontSize: '0.68rem', marginTop: '0.2rem', lineHeight: 1.3 }}>{desc}</div>
              </div>
              {i < arr.length - 1 && <div style={{ color: '#1e293b', padding: '0 0.2rem', fontSize: '1.2rem' }}>›</div>}
            </div>
          ))}
        </div>
      </section>

      {/* Page grid */}
      <section style={{ padding: '0 2.5rem 5rem', maxWidth: '960px', margin: '0 auto', width: '100%' }}>
        <h2 style={{ textAlign: 'center', fontSize: '0.85rem', fontWeight: 600, color: '#475569', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
          Explore the Platform
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.9rem' }}>
          {pages.map(({ href, label, desc, icon }) => (
            <Link key={href} href={href} className="hover-card" style={{
              display: 'block',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '0.75rem',
              padding: '1.25rem 1.5rem',
              textDecoration: 'none',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '1.2rem' }}>{icon}</span>
                <span style={{ fontWeight: 600, color: '#f1f5f9', fontSize: '0.9rem' }}>{label}</span>
              </div>
              <p style={{ color: '#64748b', fontSize: '0.8rem', margin: 0, lineHeight: 1.5 }}>{desc}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
