import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const maxDuration = 60

// Protect with a secret token — set SEED_SECRET env var in Vercel
// Call via browser: GET /api/seed?secret=<SEED_SECRET>
// Call via API:     POST /api/seed  with header  Authorization: Bearer <SEED_SECRET>
function checkAuth(secret: string | undefined, req: NextRequest): boolean {
  if (!secret) return true
  const querySecret = new URL(req.url).searchParams.get('secret')
  if (querySecret === secret) return true
  const auth = req.headers.get('authorization') ?? ''
  return auth === `Bearer ${secret}`
}

export async function GET(req: NextRequest) {
  return seedHandler(req)
}

export async function POST(req: NextRequest) {
  return seedHandler(req)
}

async function seedHandler(req: NextRequest) {
  const secret = process.env.SEED_SECRET
  if (!checkAuth(secret, req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // ─── Skills ──────────────────────────────────────────────────────────────
    const skills = await Promise.all([
      prisma.skill.upsert({ where: { name: 'TypeScript' },    update: {}, create: { name: 'TypeScript',    category: 'Engineering', subcategory: 'Languages',   aliases: ['TS'] } }),
      prisma.skill.upsert({ where: { name: 'Python' },        update: {}, create: { name: 'Python',        category: 'Engineering', subcategory: 'Languages',   aliases: ['py'] } }),
      prisma.skill.upsert({ where: { name: 'React' },         update: {}, create: { name: 'React',         category: 'Engineering', subcategory: 'Frontend',    aliases: ['ReactJS', 'React.js'] } }),
      prisma.skill.upsert({ where: { name: 'Node.js' },       update: {}, create: { name: 'Node.js',       category: 'Engineering', subcategory: 'Backend',     aliases: ['NodeJS', 'Node'] } }),
      prisma.skill.upsert({ where: { name: 'PostgreSQL' },    update: {}, create: { name: 'PostgreSQL',    category: 'Engineering', subcategory: 'Databases',   aliases: ['Postgres', 'psql'] } }),
      prisma.skill.upsert({ where: { name: 'AWS' },           update: {}, create: { name: 'AWS',           category: 'Engineering', subcategory: 'Cloud',       aliases: ['Amazon Web Services'] } }),
      prisma.skill.upsert({ where: { name: 'Docker' },        update: {}, create: { name: 'Docker',        category: 'Engineering', subcategory: 'DevOps',      aliases: ['containerisation'] } }),
      prisma.skill.upsert({ where: { name: 'Kubernetes' },    update: {}, create: { name: 'Kubernetes',    category: 'Engineering', subcategory: 'DevOps',      aliases: ['K8s'] } }),
      prisma.skill.upsert({ where: { name: 'Product Management' }, update: {}, create: { name: 'Product Management', category: 'Product', subcategory: 'Strategy', aliases: ['PM'] } }),
      prisma.skill.upsert({ where: { name: 'Data Analysis' }, update: {}, create: { name: 'Data Analysis', category: 'Data',        subcategory: 'Analytics',   aliases: ['Analytics'] } }),
      prisma.skill.upsert({ where: { name: 'Machine Learning' }, update: {}, create: { name: 'Machine Learning', category: 'Data', subcategory: 'AI/ML',    aliases: ['ML'] } }),
      prisma.skill.upsert({ where: { name: 'SQL' },           update: {}, create: { name: 'SQL',           category: 'Engineering', subcategory: 'Databases',   aliases: [] } }),
      prisma.skill.upsert({ where: { name: 'Java' },          update: {}, create: { name: 'Java',          category: 'Engineering', subcategory: 'Languages',   aliases: [] } }),
      prisma.skill.upsert({ where: { name: 'Go' },            update: {}, create: { name: 'Go',            category: 'Engineering', subcategory: 'Languages',   aliases: ['Golang'] } }),
      prisma.skill.upsert({ where: { name: 'Figma' },         update: {}, create: { name: 'Figma',         category: 'Design',      subcategory: 'UI/UX',       aliases: [] } }),
    ])

    const skillMap: Record<string, string> = {}
    skills.forEach(s => { skillMap[s.name] = s.id })

    // ─── Companies ───────────────────────────────────────────────────────────
    const companiesData = [
      { name: 'Monzo Bank', domain: 'monzo.com', industry: 'Fintech', sector: 'Financial Services', sub_sector: 'Digital Banking', company_size: 'MID_MARKET' as const, employee_count: 3000, headquarters_city: 'London', headquarters_country: 'United Kingdom', region: 'EMEA', tech_stack: ['Kubernetes', 'Go', 'PostgreSQL', 'Kafka'], culture_tags: ['remote-friendly', 'mission-driven', 'inclusive'], glassdoor_rating: 4.3, founded_year: 2015 },
      { name: 'Revolut', domain: 'revolut.com', industry: 'Fintech', sector: 'Financial Services', sub_sector: 'Payments', company_size: 'ENTERPRISE' as const, employee_count: 8000, headquarters_city: 'London', headquarters_country: 'United Kingdom', region: 'EMEA', tech_stack: ['Java', 'Kotlin', 'AWS', 'PostgreSQL'], culture_tags: ['fast-paced', 'high-performance', 'global'], glassdoor_rating: 3.8, founded_year: 2015 },
      { name: 'Deliveroo', domain: 'deliveroo.com', industry: 'Food Tech', sector: 'Technology', sub_sector: 'On-Demand Delivery', company_size: 'ENTERPRISE' as const, employee_count: 5000, headquarters_city: 'London', headquarters_country: 'United Kingdom', region: 'EMEA', tech_stack: ['Ruby', 'React', 'AWS', 'PostgreSQL', 'Python'], culture_tags: ['collaborative', 'data-driven', 'customer-first'], glassdoor_rating: 3.6, founded_year: 2013 },
      { name: 'Wise', domain: 'wise.com', industry: 'Fintech', sector: 'Financial Services', sub_sector: 'Remittances', company_size: 'MID_MARKET' as const, employee_count: 4500, headquarters_city: 'London', headquarters_country: 'United Kingdom', region: 'EMEA', tech_stack: ['Java', 'React', 'AWS', 'PostgreSQL'], culture_tags: ['transparent', 'customer-obsessed', 'global'], glassdoor_rating: 4.5, founded_year: 2011 },
      { name: 'Checkout.com', domain: 'checkout.com', industry: 'Fintech', sector: 'Financial Services', sub_sector: 'Payments Infrastructure', company_size: 'ENTERPRISE' as const, employee_count: 2500, headquarters_city: 'London', headquarters_country: 'United Kingdom', region: 'EMEA', tech_stack: ['Go', 'Kubernetes', 'AWS', 'React'], culture_tags: ['engineering-led', 'global', 'scale-up'], glassdoor_rating: 4.0, founded_year: 2012 },
    ]

    const companies = await Promise.all(
      companiesData.map(c => prisma.company.upsert({
        where: { domain: c.domain },
        update: {},
        create: c,
      }))
    )
    const companyMap: Record<string, string> = {}
    companies.forEach(c => { companyMap[c.domain] = c.id })

    // ─── Candidates ──────────────────────────────────────────────────────────
    const candidatesData = [
      { email: 'alex.chen@example.com', first_name: 'Alex', last_name: 'Chen', current_title: 'Senior Software Engineer', current_company_domain: 'monzo.com', seniority_level: 'SENIOR' as const, location_city: 'London', location_country: 'United Kingdom', region: 'EMEA', availability_status: 'OPEN_TO_OFFERS' as const, source: 'LINKEDIN' as const, years_experience: 6, salary_currency: 'GBP', salary_expectation_min: 90000, salary_expectation_max: 120000, is_remote_open: true, notice_period_days: 30, linkedin_url: 'https://linkedin.com/in/alex-chen-dev', github_url: 'https://github.com/alexchen', summary: 'Full-stack engineer with 6 years at fintech scale-ups. Deep expertise in TypeScript, React and Node.js microservices. Led the rebuild of Monzo\'s transaction feed serving 8M+ users, reducing P99 latency by 40%. Passionate about developer experience and system observability. Looking for a Staff-level opportunity with meaningful technical ownership.', skills: ['TypeScript', 'React', 'Node.js', 'PostgreSQL'] },
      { email: 'priya.sharma@example.com', first_name: 'Priya', last_name: 'Sharma', current_title: 'Staff Engineer', current_company_domain: 'revolut.com', seniority_level: 'SENIOR' as const, location_city: 'London', location_country: 'United Kingdom', region: 'EMEA', availability_status: 'ACTIVELY_LOOKING' as const, source: 'LINKEDIN' as const, years_experience: 9, salary_currency: 'GBP', salary_expectation_min: 130000, salary_expectation_max: 160000, is_remote_open: true, notice_period_days: 60, linkedin_url: 'https://linkedin.com/in/priya-sharma-eng', summary: 'Staff Engineer specialising in distributed payments infrastructure. At Revolut I own the core ledger service processing £2B+ daily. Before that I spent 4 years at Barclays building high-throughput Java/Kafka pipelines. I hold an AWS Solutions Architect Professional cert and am a CNCF contributor. Actively seeking a Principal or Staff IC role in a product-led fintech.', skills: ['Java', 'AWS', 'Kubernetes', 'PostgreSQL'] },
      { email: 'james.okonkwo@example.com', first_name: 'James', last_name: 'Okonkwo', current_title: 'Engineering Manager', current_company_domain: 'deliveroo.com', seniority_level: 'MANAGER' as const, location_city: 'London', location_country: 'United Kingdom', region: 'EMEA', availability_status: 'PASSIVE' as const, source: 'REFERRAL' as const, years_experience: 11, salary_currency: 'GBP', salary_expectation_min: 140000, salary_expectation_max: 170000, is_remote_open: false, notice_period_days: 90, linkedin_url: 'https://linkedin.com/in/james-okonkwo', summary: 'Engineering Manager leading Deliveroo\'s Demand ML team of 12 engineers. My team owns real-time demand forecasting models that optimise rider dispatch across 11 countries. I move between hands-on architecture and people leadership — I enjoy both. Background in Python/ML before moving into management. Open to senior EM or Director roles at mission-driven companies.', skills: ['Python', 'AWS', 'Docker', 'Machine Learning'] },
      { email: 'sofia.martinez@example.com', first_name: 'Sofia', last_name: 'Martinez', current_title: 'Product Manager', current_company_domain: 'wise.com', seniority_level: 'SENIOR' as const, location_city: 'London', location_country: 'United Kingdom', region: 'EMEA', availability_status: 'OPEN_TO_OFFERS' as const, source: 'LINKEDIN' as const, years_experience: 7, salary_currency: 'GBP', salary_expectation_min: 95000, salary_expectation_max: 125000, is_remote_open: true, notice_period_days: 30, linkedin_url: 'https://linkedin.com/in/sofia-martinez-pm', summary: 'Senior PM at Wise owning the Business Accounts product (£180M ARR). I combine strong data intuition with a customer-first mindset — I write SQL daily and ship with weekly OKR reviews. Previously led growth at a Series B SaaS startup from 0 to 40K paying users. Looking for a Head of Product or Group PM role where I can build and mentor a team.', skills: ['Product Management', 'Data Analysis', 'SQL'] },
      { email: 'tom.wright@example.com', first_name: 'Tom', last_name: 'Wright', current_title: 'Data Engineer', current_company_domain: 'checkout.com', seniority_level: 'MID' as const, location_city: 'London', location_country: 'United Kingdom', region: 'EMEA', availability_status: 'ACTIVELY_LOOKING' as const, source: 'INDEED' as const, years_experience: 4, salary_currency: 'GBP', salary_expectation_min: 70000, salary_expectation_max: 90000, is_remote_open: true, notice_period_days: 30, github_url: 'https://github.com/tomwright-data', summary: 'Data Engineer at Checkout.com building the analytics platform that processes 500M+ daily payment events. I design and maintain dbt models, Airflow pipelines, and a Redshift warehouse used by 80+ analysts. Proficient in Python, SQL, and AWS (Glue, S3, Lambda). Actively looking for a Senior DE role at a data-first company.', skills: ['Python', 'SQL', 'Data Analysis', 'AWS'] },
    ]

    const candidates = await Promise.all(
      candidatesData.map(async ({ current_company_domain, skills: candidateSkills, salary_expectation_min, salary_expectation_max, ...rest }) => {
        const candidate = await prisma.candidate.upsert({
          where: { email: rest.email },
          update: { summary: rest.summary, notice_period_days: rest.notice_period_days, linkedin_url: rest.linkedin_url, github_url: (rest as {github_url?: string}).github_url },
          create: {
            ...rest,
            current_company_id: companyMap[current_company_domain] ?? null,
            salary_expectation_min: salary_expectation_min ? salary_expectation_min : null,
            salary_expectation_max: salary_expectation_max ? salary_expectation_max : null,
          },
        })
        await Promise.all(
          candidateSkills.map(skillName =>
            skillMap[skillName]
              ? prisma.candidateSkill.upsert({
                  where: { candidate_id_skill_id: { candidate_id: candidate.id, skill_id: skillMap[skillName] } },
                  update: {},
                  create: { candidate_id: candidate.id, skill_id: skillMap[skillName], proficiency: 'ADVANCED' },
                })
              : Promise.resolve()
          )
        )
        return candidate
      })
    )

    // ─── Jobs ────────────────────────────────────────────────────────────────
    const jobsData = [
      { title: 'Senior TypeScript Engineer', company_domain: 'monzo.com', seniority_level: 'SENIOR' as const, employment_type: 'FULL_TIME' as const, work_mode: 'HYBRID' as const, location_city: 'London', location_country: 'United Kingdom', region: 'EMEA', salary_min: 90000, salary_max: 120000, salary_currency: 'GBP', status: 'ACTIVE' as const, source: 'COMPANY_WEBSITE' as const, urgency: 'HIGH' as const, posted_date: new Date('2026-02-01'), description: 'Join Monzo\'s Core Banking team to build the next generation of our account infrastructure serving 8 million+ customers. You\'ll own critical backend services written in TypeScript and Node.js, contribute to architectural decisions, and work closely with product and design to deliver features at scale.', requirements: '• 5+ years of professional software engineering experience\n• Expert-level TypeScript and Node.js\n• Strong PostgreSQL skills — query optimisation, schema design, indexing\n• Experience with cloud infrastructure (AWS or GCP)\n• Proven ability to design and own microservices in production\n• Strong communication skills — we write design docs and RFCs', responsibilities: '• Own and evolve core account management services\n• Design scalable APIs consumed by mobile and web clients\n• Lead code reviews and mentor junior engineers\n• Drive technical roadmap discussions with engineering leadership\n• Participate in on-call rotation (light — ~1 week per quarter)', skills: ['TypeScript', 'Node.js', 'PostgreSQL', 'AWS'] },
      { title: 'Staff Backend Engineer (Go)', company_domain: 'revolut.com', seniority_level: 'SENIOR' as const, employment_type: 'FULL_TIME' as const, work_mode: 'HYBRID' as const, location_city: 'London', location_country: 'United Kingdom', region: 'EMEA', salary_min: 130000, salary_max: 160000, salary_currency: 'GBP', status: 'ACTIVE' as const, source: 'LINKEDIN' as const, urgency: 'IMMEDIATE' as const, posted_date: new Date('2026-02-15'), description: 'Revolut is looking for a Staff Backend Engineer to lead architecture on our global payments routing platform. This role sits at the heart of Revolut\'s revenue engine — the systems you own process millions of cross-border transfers daily across 35+ currencies.', requirements: '• 8+ years backend engineering experience\n• Fluent in Go — you have built and operated Go services in production at scale\n• Deep knowledge of distributed systems, event-driven architectures, Kafka\n• Kubernetes and container orchestration experience\n• Strong PostgreSQL and Redis skills\n• Prior experience at a high-growth fintech or financial institution preferred', responsibilities: '• Define the technical vision for payments routing infrastructure\n• Lead a squad of 6 engineers across design, build, and operate phases\n• Own system reliability targets (99.99% uptime SLA)\n• Collaborate with Compliance and Risk on regulatory requirements\n• Represent engineering in cross-functional leadership forums', skills: ['Go', 'Kubernetes', 'PostgreSQL', 'AWS'] },
      { title: 'Senior Product Manager', company_domain: 'deliveroo.com', seniority_level: 'SENIOR' as const, employment_type: 'FULL_TIME' as const, work_mode: 'HYBRID' as const, location_city: 'London', location_country: 'United Kingdom', region: 'EMEA', salary_min: 95000, salary_max: 130000, salary_currency: 'GBP', status: 'ACTIVE' as const, source: 'LINKEDIN' as const, urgency: 'NORMAL' as const, posted_date: new Date('2026-02-20'), description: 'Drive the product strategy for Deliveroo\'s Consumer Experience team, responsible for the core ordering journey used by 8M+ monthly active users across 11 markets. You\'ll define what we build next, work with data science on personalisation, and ship features that meaningfully move GMV and retention.', requirements: '• 5+ years in product management, ideally at a consumer marketplace or platform\n• Strong analytical skills — comfortable writing SQL, interpreting A/B tests, building dashboards\n• Track record of shipping 0-to-1 features and iterating on core product loops\n• Excellent stakeholder communication — you can present to C-suite clearly\n• Experience working with ML/data science teams a strong plus', responsibilities: '• Define and own the Consumer Experience product roadmap\n• Run weekly prioritisation with engineering and design\n• Set up and analyse A/B experiments across the ordering funnel\n• Represent your area in monthly business reviews\n• Hire and mentor 1–2 associate PMs as the team grows', skills: ['Product Management', 'Data Analysis', 'SQL'] },
      { title: 'ML Engineer', company_domain: 'wise.com', seniority_level: 'MID' as const, employment_type: 'FULL_TIME' as const, work_mode: 'REMOTE' as const, location_city: 'London', location_country: 'United Kingdom', region: 'EMEA', salary_min: 80000, salary_max: 110000, salary_currency: 'GBP', status: 'ACTIVE' as const, source: 'COMPANY_WEBSITE' as const, urgency: 'NORMAL' as const, posted_date: new Date('2026-03-01'), description: 'Join Wise\'s Risk & Fraud team to build production ML models that protect customers and the business. Our models score every transfer in real-time — false positives cost us revenue, false negatives cost customers money and trust. Your work will directly impact fraud loss rates across 160+ countries.', requirements: '• 3+ years ML engineering experience in a production environment\n• Strong Python skills — PyTorch or TensorFlow, scikit-learn, pandas\n• Experience deploying and monitoring ML models in production (model serving, drift detection)\n• Solid SQL for feature engineering\n• Familiarity with AWS ML tooling (SageMaker, Lambda, S3)\n• Understanding of financial crime typologies is a bonus', responsibilities: '• Build, train, and deploy fraud detection models to production\n• Develop real-time feature pipelines using streaming data\n• Monitor model performance and retrain on drift signals\n• Partner with Risk Analysts to translate domain knowledge into features\n• Contribute to the team\'s ML platform and tooling', skills: ['Python', 'Machine Learning', 'SQL', 'AWS'] },
      { title: 'Data Engineer', company_domain: 'checkout.com', seniority_level: 'MID' as const, employment_type: 'FULL_TIME' as const, work_mode: 'HYBRID' as const, location_city: 'London', location_country: 'United Kingdom', region: 'EMEA', salary_min: 70000, salary_max: 95000, salary_currency: 'GBP', status: 'ACTIVE' as const, source: 'LINKEDIN' as const, urgency: 'NORMAL' as const, posted_date: new Date('2026-03-05'), description: 'Build and own the data infrastructure that powers analytics, reporting, and ML at Checkout.com. We process 500M+ payment events daily and our data team is the connective tissue between product, finance, and operations. You\'ll work on pipelines that finance teams and executives rely on every day.', requirements: '• 3+ years of data engineering experience\n• Strong Python and SQL\n• Experience with dbt, Airflow (or similar orchestrators), and a columnar warehouse (Redshift, BigQuery, or Snowflake)\n• Understanding of data modelling principles (Kimball, Data Vault)\n• Docker and basic AWS knowledge\n• Excellent attention to data quality and testing', responsibilities: '• Design and maintain ELT pipelines from 10+ source systems\n• Own dbt models and data documentation for the analytics layer\n• Build data quality checks and SLA monitoring\n• Collaborate with analysts to unblock their reporting needs\n• Contribute to the migration from legacy pipelines to our new lakehouse architecture', skills: ['Python', 'SQL', 'Data Analysis', 'Docker'] },
    ]

    const jobs = await Promise.all(
      jobsData.map(async ({ company_domain, skills: jobSkills, ...rest }) => {
        const job = await prisma.job.create({
          data: { ...rest, company_id: companyMap[company_domain] },
        }).catch(() => prisma.job.findFirst({ where: { title: rest.title, company_id: companyMap[company_domain] } })
          .then(j => j ? prisma.job.update({ where: { id: j.id }, data: { description: rest.description, requirements: rest.requirements, responsibilities: rest.responsibilities } }) : null))
        if (job) {
          await Promise.all(
            jobSkills.map(skillName =>
              skillMap[skillName]
                ? prisma.jobSkill.upsert({
                    where: { job_id_skill_id: { job_id: job.id, skill_id: skillMap[skillName] } },
                    update: {},
                    create: { job_id: job.id, skill_id: skillMap[skillName], importance: 'REQUIRED' },
                  })
                : Promise.resolve()
            )
          )
        }
        return job
      })
    )

    // ─── Matches ─────────────────────────────────────────────────────────────
    const matchPairs = [
      { candidateIdx: 0, jobIdx: 0, overall_score: 0.92, skill_match_score: 0.95, experience_match_score: 0.90, location_match_score: 1.0, seniority_match_score: 1.0, salary_match_score: 0.85, status: 'SHORTLISTED' as const, ai_reasoning: 'Alex Chen is an exceptionally strong match for the Senior TypeScript Engineer role at Monzo. His 6-year career has been spent almost entirely in TypeScript and Node.js within fintech, giving him direct domain relevance. The transaction feed rebuild he led at Monzo demonstrates he can own complex, high-scale systems — exactly what this role requires. Skill overlap is near-perfect: TypeScript ✓, Node.js ✓, PostgreSQL ✓, AWS ✓. His salary band (£90K–£120K) aligns precisely with the advertised range, eliminating a common drop-off risk. Seniority is a direct match (Senior IC). His stated preference for "Staff-level ownership" suggests he may grow into an L6 within 12–18 months, which Monzo can leverage for retention. The only minor gap is limited Go exposure, but Monzo\'s core stack is TypeScript so this is immaterial. Recommend immediate shortlist and first-round technical screen.' },
      { candidateIdx: 1, jobIdx: 1, overall_score: 0.88, skill_match_score: 0.80, experience_match_score: 0.95, location_match_score: 1.0, seniority_match_score: 0.90, salary_match_score: 0.85, status: 'SUGGESTED' as const, ai_reasoning: 'Priya Sharma presents a compelling profile for the Staff Backend Engineer (Go) role at Revolut. Her 9 years of experience — including ownership of the Revolut core ledger at scale — demonstrates the exact distributed systems depth required. Experience match is outstanding (0.95): she has operated high-throughput payment infrastructure at Revolut itself, meaning onboarding friction is minimal. The primary skill gap is Go: her background is Java/Kafka, and the role requires Go fluency. However, engineers with strong JVM distributed systems experience typically transition to Go within 3–6 months. AWS Solutions Architect Professional cert confirms cloud infrastructure depth. Kubernetes experience is confirmed. Salary expectations (£130K–£160K) align with the top of the advertised range — worth confirming flexibility early. Seniority is near-match (Staff vs the role\'s implied Principal level). Suggest a technical screen with a Go take-home to de-risk the language gap before advancing.' },
      { candidateIdx: 3, jobIdx: 2, overall_score: 0.85, skill_match_score: 0.90, experience_match_score: 0.82, location_match_score: 1.0, seniority_match_score: 1.0, salary_match_score: 0.80, status: 'CONTACTED' as const, ai_reasoning: 'Sofia Martinez is a strong candidate for the Senior Product Manager role at Deliveroo. Her ownership of the Wise Business Accounts product (£180M ARR) shows she can handle large, complex product surfaces. The skill match is high (0.90): she actively uses SQL for analytics, has A/B testing experience, and has demonstrated growth PM instincts. Her aspiration to build a team aligns with the role\'s mention of mentoring associate PMs. The experience match is slightly lower (0.82) because her background is in B2B SaaS (Wise Business) whereas this role focuses on B2C consumer experience — a different user psychology and different KPIs. That said, her pre-Wise experience at a B2C growth startup partially bridges this. Salary expectations (£95K–£125K) are within range. She has been contacted; recommend scheduling an intro call focusing on her consumer product experience and growth mindset.' },
      { candidateIdx: 4, jobIdx: 4, overall_score: 0.78, skill_match_score: 0.85, experience_match_score: 0.75, location_match_score: 1.0, seniority_match_score: 1.0, salary_match_score: 0.70, status: 'SUGGESTED' as const, ai_reasoning: 'Tom Wright is a reasonable match for the Data Engineer role at Checkout.com, though there are gaps worth probing. He has direct fintech data engineering experience at Checkout.com itself (building the 500M events/day analytics platform), which is unique context. Python and SQL skills are confirmed, and his AWS experience covers the core stack. The skill gap (0.85 not higher) is dbt and Airflow — the job lists these explicitly and Tom\'s resume doesn\'t confirm them, only citing general "Airflow pipelines." Experience match (0.75) reflects that he is currently mid-level and the role implies a more senior scope than his current position. Salary is a potential friction point: his expectations (£70K–£90K) may be below what a more senior hire commands, creating a risk of him feeling underleveled. Recommend a short technical screen covering dbt modelling and pipeline design to validate depth before advancing.' },
    ]

    await Promise.all(
      matchPairs.map(({ candidateIdx, jobIdx, ...scores }) => {
        const c = candidates[candidateIdx]
        const j = jobs[jobIdx]
        if (!c || !j) return Promise.resolve()
        return prisma.match.upsert({
          where: { candidate_id_job_id: { candidate_id: c.id, job_id: j.id } },
          update: { ai_reasoning: scores.ai_reasoning, overall_score: scores.overall_score, status: scores.status },
          create: { candidate_id: c.id, job_id: j.id, ...scores },
        })
      })
    )

    // ─── Recruiter ───────────────────────────────────────────────────────────
    await prisma.recruiter.upsert({
      where: { email: 'admin@recruitai.com' },
      update: {},
      create: {
        email: 'admin@recruitai.com',
        first_name: 'Sarah',
        last_name: 'Thompson',
        company_name: 'RecruitAI',
        role: 'ADMIN',
        subscription_tier: 'PROFESSIONAL',
        subscription_status: 'ACTIVE',
        max_searches_per_month: 500,
        max_screening_calls_per_month: 100,
        max_candidates_saved: 2000,
      },
    })

    // ─── Market Insights ─────────────────────────────────────────────────────
    await prisma.marketInsight.createMany({
      skipDuplicates: true,
      data: [
        {
          insight_type: 'SALARY_BENCHMARK',
          title: 'Senior TypeScript Engineer — London 2026',
          description: 'Median base salary for Senior TypeScript Engineers in London is £105,000, up 8% YoY.',
          data_json: { median: 105000, p25: 90000, p75: 125000, currency: 'GBP' },
          industry: 'Fintech',
          region: 'EMEA',
          seniority_level: 'SENIOR',
          valid_from: new Date('2026-01-01'),
          source: 'Job posting analysis',
        },
        {
          insight_type: 'SKILL_DEMAND',
          title: 'Go Engineers in High Demand — UK Fintech',
          description: 'Demand for Go engineers in UK fintech has grown 34% in 12 months, driven by microservices migration at challenger banks.',
          data_json: { growth_rate_yoy: 0.34, top_hirers: ['Monzo', 'Starling', 'Revolut'] },
          industry: 'Fintech',
          region: 'EMEA',
          valid_from: new Date('2026-01-01'),
          source: 'Job posting analysis — 8,200 postings',
        },
        {
          insight_type: 'HIRING_TREND',
          title: 'Fintech ML Hiring Accelerating Q1 2026',
          description: 'Machine learning and AI engineering roles in UK fintech increased 52% YoY in Q1 2026, with fraud detection as the primary use case.',
          data_json: { growth_rate_yoy: 0.52, top_use_cases: ['fraud_detection', 'credit_risk'] },
          industry: 'Fintech',
          region: 'EMEA',
          valid_from: new Date('2026-01-01'),
          source: 'Recruiter survey — 340 respondents',
        },
      ],
    })

    // ─── Screening Calls ─────────────────────────────────────────────────────
    // Get matches to attach screening calls to
    const allMatches = await prisma.match.findMany({
      include: { candidate: true, job: true },
    })

    // Screening call + questions for Alex Chen (match[0]: SHORTLISTED → will be PLACED)
    const alexMatch = allMatches.find(m => m.candidate.email === 'alex.chen@example.com')
    const sofiaMatch = allMatches.find(m => m.candidate.email === 'sofia.martinez@example.com')

    if (alexMatch) {
      const call = await prisma.screeningCall.upsert({
        where: { id: alexMatch.id + '-call' },
        update: { status: 'COMPLETED', recommendation: 'STRONG_YES', candidate_interest_level: 'VERY_INTERESTED' },
        create: {
          id: alexMatch.id + '-call',
          match_id: alexMatch.id,
          candidate_id: alexMatch.candidate_id,
          job_id: alexMatch.job_id,
          call_type: 'VIDEO',
          status: 'COMPLETED',
          scheduled_at: new Date('2026-03-01T10:00:00Z'),
          started_at: new Date('2026-03-01T10:02:00Z'),
          ended_at: new Date('2026-03-01T10:34:00Z'),
          duration_seconds: 1920,
          candidate_interest_level: 'VERY_INTERESTED',
          availability_confirmed: true,
          salary_expectation_confirmed: 112000,
          notice_period_confirmed: 30,
          key_concerns: ['Wants Staff-level title within 18 months', 'Prefers hybrid 2–3 days office'],
          recommendation: 'STRONG_YES',
          recommendation_reasoning: 'Alex is an exceptional fit. His TypeScript depth is genuinely expert-level — he gave detailed answers on event loop internals, database indexing strategy, and microservice observability patterns. He is very interested in the role and confirmed availability in 30 days. Salary expectations (£112K) are within budget. No red flags. Recommend fast-tracking to technical interview immediately.',
          ai_summary: 'Completed 32-minute video screening. Candidate demonstrated expert TypeScript and Node.js knowledge, validated 6 years of fintech experience, and confirmed strong interest in the Monzo role. Salary aligned. Notice period 30 days. Strongly recommend to advance.',
          transcript: `AI Recruiter: Hi Alex, thanks for joining — I\'m the RecruitAI screening assistant. This call will take about 30 minutes. Is that okay?
Alex Chen: Absolutely, happy to chat.

AI Recruiter: Great. Can you walk me through your current role and what you own day-to-day at Monzo?
Alex Chen: Sure. I\'m a Senior SWE on the Core Banking team. Day-to-day I own the transaction feed service — it\'s TypeScript and Node.js, Postgres backend, sitting behind an API that serves about 8 million users. I led a full rewrite last year that took our P99 latency from 340ms down to 200ms. I also run code reviews for the two mid-level engineers on my team and contribute to architecture RFCs.

AI Recruiter: What draws you to this particular opportunity at Revolut — sorry, at Monzo\'s TypeScript Engineer opening?
Alex Chen: Actually I\'m already at Monzo, so this would be a move. I\'m looking at the Revolut Staff role and this Monzo opening. Honestly, the Monzo role is compelling because of the ownership scope — the JD mentions full ownership of the account infrastructure, not just a component. That\'s what I want next.

AI Recruiter: Understood. Tell me about a technically challenging problem you\'ve solved recently.
Alex Chen: The latency project I mentioned. The bottleneck turned out to be N+1 queries in the enrichment layer — we were hitting the database once per transaction to fetch merchant metadata. I redesigned the query to batch-fetch and cache with a 60-second TTL in Redis. The change reduced database load by 70% and dropped that P99 by 40%. The tricky part was doing it safely behind a feature flag across a live system.

AI Recruiter: What are your salary expectations?
Alex Chen: I\'m currently on £95K. I\'d be looking at £110–115K for the right role, with clear progression to Staff level within 18 months.

AI Recruiter: And your notice period?
Alex Chen: Contractually 30 days but I\'d expect to leave on good terms so realistically 4 weeks.

AI Recruiter: Any concerns about the role or reasons you might turn down an offer?
Alex Chen: Mainly around title. If the offer comes in as Senior with no clear Staff pathway, that\'s a dealbreaker. And I want hybrid — at least 2 days remote — which the JD suggests is fine.`,
        },
      })

      await Promise.all([
        prisma.screeningQuestion.upsert({
          where: { id: alexMatch.id + '-q1' },
          update: {},
          create: {
            id: alexMatch.id + '-q1',
            screening_call_id: call.id,
            question_text: 'Walk me through your current role and primary ownership areas.',
            answer_text: 'Owns the transaction feed service (TypeScript/Node.js/Postgres) at Monzo serving 8M users. Led rewrite that reduced P99 latency 40%. Runs code reviews and contributes to architecture RFCs.',
            ai_score: 0.95,
            order: 1,
          },
        }),
        prisma.screeningQuestion.upsert({
          where: { id: alexMatch.id + '-q2' },
          update: {},
          create: {
            id: alexMatch.id + '-q2',
            screening_call_id: call.id,
            question_text: 'Describe a technically complex problem you solved end-to-end.',
            answer_text: 'N+1 query problem in enrichment layer. Batched merchant metadata fetches with Redis TTL cache, reduced DB load 70%, P99 latency down 40%. Shipped safely behind feature flag.',
            ai_score: 0.98,
            order: 2,
          },
        }),
        prisma.screeningQuestion.upsert({
          where: { id: alexMatch.id + '-q3' },
          update: {},
          create: {
            id: alexMatch.id + '-q3',
            screening_call_id: call.id,
            question_text: 'What are your salary expectations and notice period?',
            answer_text: 'Expects £110–115K. Currently on £95K. Notice period 30 days contractually, ~4 weeks realistic.',
            ai_score: 0.90,
            order: 3,
          },
        }),
        prisma.screeningQuestion.upsert({
          where: { id: alexMatch.id + '-q4' },
          update: {},
          create: {
            id: alexMatch.id + '-q4',
            screening_call_id: call.id,
            question_text: 'What would cause you to decline an offer?',
            answer_text: 'No clear Staff progression path (dealbreaker). Also requires hybrid working (min 2 days remote).',
            ai_score: 0.85,
            order: 4,
          },
        }),
      ])

      // Upgrade Alex's match to PLACED for the placement record
      await prisma.match.update({
        where: { id: alexMatch.id },
        data: { status: 'PLACED' },
      })
    }

    // Screening call for Sofia Martinez (CONTACTED)
    if (sofiaMatch) {
      const sofiaCall = await prisma.screeningCall.upsert({
        where: { id: sofiaMatch.id + '-call' },
        update: { status: 'COMPLETED', recommendation: 'YES' },
        create: {
          id: sofiaMatch.id + '-call',
          match_id: sofiaMatch.id,
          candidate_id: sofiaMatch.candidate_id,
          job_id: sofiaMatch.job_id,
          call_type: 'VIDEO',
          status: 'COMPLETED',
          scheduled_at: new Date('2026-03-10T14:00:00Z'),
          started_at: new Date('2026-03-10T14:01:00Z'),
          ended_at: new Date('2026-03-10T14:28:00Z'),
          duration_seconds: 1620,
          candidate_interest_level: 'INTERESTED',
          availability_confirmed: true,
          salary_expectation_confirmed: 118000,
          notice_period_confirmed: 30,
          key_concerns: ['Primarily B2B SaaS background — limited consumer product experience', 'Wants salary at top of range (£118K)'],
          recommendation: 'YES',
          recommendation_reasoning: 'Sofia is a credible Senior PM candidate. Her analytical rigour and data-first approach are exactly what Deliveroo needs. The B2C experience gap is real but she had strong answers around consumer growth mechanics. Salary expectation (£118K) is at the top of range — confirm budget flexibility before advancing.',
          ai_summary: 'Strong PM candidate with deep analytics skills and proven ARR ownership. B2C experience lighter than ideal but addressed well. Salary top of range. Recommend advancing to hiring manager intro call.',
        },
      })

      await Promise.all([
        prisma.screeningQuestion.upsert({
          where: { id: sofiaMatch.id + '-q1' },
          update: {},
          create: {
            id: sofiaMatch.id + '-q1',
            screening_call_id: sofiaCall.id,
            question_text: 'What is the most impactful product you\'ve shipped and how did you measure success?',
            answer_text: 'Business Accounts at Wise — grew to £180M ARR. Measured by activation rate, revenue per account, and monthly active accounts. Ran 3 major feature bets including bulk payments and multi-user access.',
            ai_score: 0.92,
            order: 1,
          },
        }),
        prisma.screeningQuestion.upsert({
          where: { id: sofiaMatch.id + '-q2' },
          update: {},
          create: {
            id: sofiaMatch.id + '-q2',
            screening_call_id: sofiaCall.id,
            question_text: 'How do you approach a consumer experience with millions of users differently from a B2B product?',
            answer_text: 'Key difference is breadth of user personas and emotional stakes. In consumer, you\'re designing for someone ordering food when hungry — micro-moments matter more. I\'d lean more on session recordings, NPS segmentation, and cohort retention rather than pure revenue metrics.',
            ai_score: 0.82,
            order: 2,
          },
        }),
      ])
    }

    // ─── Placements ──────────────────────────────────────────────────────────
    const recruiter = await prisma.recruiter.findUnique({ where: { email: 'admin@recruitai.com' } })
    const placedMatch = allMatches.find(m => m.candidate.email === 'alex.chen@example.com')

    if (recruiter && placedMatch) {
      const agreedSalary = 112000
      const feePercentage = 0.20          // 20% — standard UK fintech perm fee
      const feeTotal = agreedSalary * feePercentage  // £22,400
      const platformFeePct = 0.10         // platform takes 10% of gross fee
      const recruiterEarnings = feeTotal * (1 - platformFeePct)  // £20,160

      const startDate = new Date('2026-04-14')
      const guaranteeExpires = new Date(startDate)
      guaranteeExpires.setDate(guaranteeExpires.getDate() + 90)

      await prisma.placement.upsert({
        where: { match_id: placedMatch.id },
        update: { invoice_status: 'PAID', status: 'ACTIVE' },
        create: {
          match_id: placedMatch.id,
          candidate_id: placedMatch.candidate_id,
          job_id: placedMatch.job_id,
          recruiter_id: recruiter.id,
          start_date: startDate,
          agreed_salary: agreedSalary,
          salary_currency: 'GBP',
          fee_type: 'CONTINGENCY',
          fee_percentage: feePercentage,
          fee_total: feeTotal,
          platform_fee_pct: platformFeePct,
          recruiter_earnings: recruiterEarnings,
          invoice_status: 'PAID',
          invoice_number: 'INV-2026-0041',
          invoice_date: new Date('2026-04-14'),
          payment_due_date: new Date('2026-05-14'),
          payment_date: new Date('2026-05-06'),
          guarantee_days: 90,
          guarantee_expires: guaranteeExpires,
          status: 'ACTIVE',
          notes: 'Smooth placement. Client (Monzo) was very happy with the quality of the shortlist. Alex accepted offer on first round — no counter-offer negotiation required. Invoice paid 8 days early.',
        },
      })
    }

    // Second historical placement — Sofia at Deliveroo (for portfolio richness)
    if (recruiter && sofiaMatch) {
      const sofiaAgreedSalary = 118000
      const sofiaFee = sofiaAgreedSalary * 0.18   // 18% fee
      const sofiaRecruiterEarnings = sofiaFee * 0.90

      const sofiaStart = new Date('2026-05-05')
      const sofiaGuaranteeExpires = new Date(sofiaStart)
      sofiaGuaranteeExpires.setDate(sofiaGuaranteeExpires.getDate() + 90)

      await prisma.placement.upsert({
        where: { match_id: sofiaMatch.id },
        update: { invoice_status: 'INVOICED' },
        create: {
          match_id: sofiaMatch.id,
          candidate_id: sofiaMatch.candidate_id,
          job_id: sofiaMatch.job_id,
          recruiter_id: recruiter.id,
          start_date: sofiaStart,
          agreed_salary: sofiaAgreedSalary,
          salary_currency: 'GBP',
          fee_type: 'CONTINGENCY',
          fee_percentage: 0.18,
          fee_total: sofiaFee,
          platform_fee_pct: 0.10,
          recruiter_earnings: sofiaRecruiterEarnings,
          invoice_status: 'INVOICED',
          invoice_number: 'INV-2026-0048',
          invoice_date: new Date('2026-05-05'),
          payment_due_date: new Date('2026-06-04'),
          guarantee_days: 90,
          guarantee_expires: sofiaGuaranteeExpires,
          status: 'ACTIVE',
          notes: 'Placed after 2-interview process. Deliveroo stretched to top of range (£118K). Invoice raised on start date, payment due in 30 days.',
        },
      })

      // Update Sofia's match to PLACED
      await prisma.match.update({
        where: { id: sofiaMatch.id },
        data: { status: 'PLACED' },
      })
    }

    return NextResponse.json({
      ok: true,
      counts: {
        skills: skills.length,
        companies: companies.length,
        candidates: candidates.length,
        jobs: jobs.filter(Boolean).length,
      },
    })
  } catch (err) {
    console.error('Seed error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
