import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

// ── Companies ────────────────────────────────────────────────────────────────
const COMPANIES = [
  { name: 'Revolut',          domain: 'revolut.com',         industry: 'Financial Services',    sector: 'Fintech',          size: 'ENTERPRISE', city: 'London',     country: 'United Kingdom', region: 'Greater London' },
  { name: 'Monzo Bank',       domain: 'monzo.com',           industry: 'Financial Services',    sector: 'Fintech',          size: 'MID_MARKET', city: 'London',     country: 'United Kingdom', region: 'Greater London' },
  { name: 'Deliveroo',        domain: 'deliveroo.co.uk',     industry: 'Technology & Software', sector: 'Food Tech',        size: 'ENTERPRISE', city: 'London',     country: 'United Kingdom', region: 'Greater London' },
  { name: 'Wise',             domain: 'wise.com',            industry: 'Financial Services',    sector: 'Fintech',          size: 'ENTERPRISE', city: 'London',     country: 'United Kingdom', region: 'Greater London' },
  { name: 'Checkout.com',     domain: 'checkout.com',        industry: 'Financial Services',    sector: 'Payments',         size: 'ENTERPRISE', city: 'London',     country: 'United Kingdom', region: 'Greater London' },
  { name: 'Babylon Health',   domain: 'babylonhealth.com',   industry: 'Healthcare',            sector: 'Health Tech',      size: 'MID_MARKET', city: 'London',     country: 'United Kingdom', region: 'Greater London' },
  { name: 'Auto Trader UK',   domain: 'autotrader.co.uk',   industry: 'Technology & Software', sector: 'Automotive Tech',  size: 'ENTERPRISE', city: 'Manchester', country: 'United Kingdom', region: 'North West' },
  { name: 'OVO Energy',       domain: 'ovoenergy.com',       industry: 'Energy',                sector: 'Clean Energy',     size: 'ENTERPRISE', city: 'Bristol',    country: 'United Kingdom', region: 'South West' },
  { name: 'Ocado Group',      domain: 'ocado.com',           industry: 'Ecommerce',             sector: 'Retail Tech',      size: 'ENTERPRISE', city: 'Hatfield',   country: 'United Kingdom', region: 'East of England' },
  { name: 'Darktrace',        domain: 'darktrace.com',       industry: 'Technology & Software', sector: 'Cybersecurity',    size: 'MID_MARKET', city: 'Cambridge',  country: 'United Kingdom', region: 'East of England' },
  { name: 'FreshBooks UK',    domain: 'freshbooks.com',      industry: 'Technology & Software', sector: 'SaaS',             size: 'MID_MARKET', city: 'London',     country: 'United Kingdom', region: 'Greater London' },
  { name: 'Starling Bank',    domain: 'starlingbank.com',    industry: 'Financial Services',    sector: 'Fintech',          size: 'MID_MARKET', city: 'London',     country: 'United Kingdom', region: 'Greater London' },
  { name: 'Bulb Energy',      domain: 'bulb.co.uk',          industry: 'Energy',                sector: 'Renewables',       size: 'SME',        city: 'London',     country: 'United Kingdom', region: 'Greater London' },
  { name: 'Cazoo',            domain: 'cazoo.co.uk',         industry: 'Ecommerce',             sector: 'Automotive',       size: 'ENTERPRISE', city: 'London',     country: 'United Kingdom', region: 'Greater London' },
  { name: 'Permira',          domain: 'permira.com',         industry: 'Financial Services',    sector: 'Private Equity',   size: 'MID_MARKET', city: 'London',     country: 'United Kingdom', region: 'Greater London' },
  { name: 'abrdn',            domain: 'abrdn.com',           industry: 'Asset Management',      sector: 'Investment Mgmt',  size: 'ENTERPRISE', city: 'Edinburgh',  country: 'United Kingdom', region: 'Scotland' },
  { name: 'Rolls-Royce',      domain: 'rolls-royce.com',     industry: 'Aerospace & Defence',   sector: 'Engineering',      size: 'MEGA_CORP',  city: 'Derby',      country: 'United Kingdom', region: 'East Midlands' },
  { name: 'GSK',              domain: 'gsk.com',             industry: 'Pharmaceuticals',       sector: 'Life Sciences',    size: 'MEGA_CORP',  city: 'London',     country: 'United Kingdom', region: 'Greater London' },
  { name: 'PwC UK',           domain: 'pwc.co.uk',           industry: 'Consulting',            sector: 'Professional Svcs',size: 'MEGA_CORP',  city: 'London',     country: 'United Kingdom', region: 'Greater London' },
  { name: 'Sky UK',           domain: 'sky.com',             industry: 'Media & Entertainment', sector: 'Broadcasting',     size: 'MEGA_CORP',  city: 'London',     country: 'United Kingdom', region: 'Greater London' },
  { name: 'JustEat',          domain: 'just-eat.co.uk',      industry: 'Technology & Software', sector: 'Food Tech',        size: 'ENTERPRISE', city: 'London',     country: 'United Kingdom', region: 'Greater London' },
  { name: 'Arm Holdings',     domain: 'arm.com',             industry: 'Technology & Software', sector: 'Semiconductors',   size: 'ENTERPRISE', city: 'Cambridge',  country: 'United Kingdom', region: 'East of England' },
  { name: 'Trainline',        domain: 'thetrainline.com',    industry: 'Technology & Software', sector: 'Travel Tech',      size: 'MID_MARKET', city: 'London',     country: 'United Kingdom', region: 'Greater London' },
  { name: 'Funding Circle',   domain: 'fundingcircle.com',   industry: 'Financial Services',    sector: 'Fintech',          size: 'MID_MARKET', city: 'London',     country: 'United Kingdom', region: 'Greater London' },
  { name: 'N Brown Group',    domain: 'nbrown.co.uk',        industry: 'Retail',                sector: 'Fashion Retail',   size: 'ENTERPRISE', city: 'Manchester', country: 'United Kingdom', region: 'North West' },
]

// ── Job templates ─────────────────────────────────────────────────────────────
const JOBS: Array<{
  title: string; department: string; seniority: string; type: string; mode: string
  salMin: number; salMax: number; city: string; region: string
  skills: string[]; desc: string; urgency?: string
}> = [
  // Sales & BD
  { title: 'Senior Sales Executive',         department: 'Sales', seniority: 'SENIOR',   type: 'FULL_TIME', mode: 'HYBRID',  salMin: 55000,  salMax: 75000,  city: 'London',     region: 'Greater London', skills: ['Salesforce', 'HubSpot', 'Stakeholder Management'], desc: 'Drive new business acquisition across enterprise accounts in the UK market. You will own the full sales cycle from prospecting to close, building strong relationships with C-level stakeholders.' },
  { title: 'Business Development Manager',   department: 'Sales', seniority: 'MANAGER',  type: 'FULL_TIME', mode: 'HYBRID',  salMin: 60000,  salMax: 85000,  city: 'London',     region: 'Greater London', skills: ['Business Development', 'Stakeholder Management', 'CRM'], desc: 'Lead strategic business development initiatives, identifying and converting new enterprise opportunities. You will build and manage a pipeline of high-value accounts.' },
  { title: 'Account Executive',              department: 'Sales', seniority: 'MID',      type: 'FULL_TIME', mode: 'HYBRID',  salMin: 45000,  salMax: 60000,  city: 'Manchester', region: 'North West',     skills: ['Salesforce', 'Stakeholder Management'], desc: 'Own a portfolio of mid-market accounts, driving expansion revenue and managing renewals. You will be the primary point of contact for 30–50 accounts.' },
  { title: 'Sales Director',                 department: 'Sales', seniority: 'DIRECTOR', type: 'FULL_TIME', mode: 'HYBRID',  salMin: 120000, salMax: 160000, city: 'London',     region: 'Greater London', skills: ['Business Development', 'People Management', 'Salesforce', 'Strategy & Consulting'], desc: 'Lead a team of 15+ sales professionals, setting strategy and owning the P&L for the UK commercial division. Report directly to the Chief Revenue Officer.', urgency: 'HIGH' },
  { title: 'Inside Sales Representative',    department: 'Sales', seniority: 'JUNIOR',   type: 'FULL_TIME', mode: 'ONSITE',  salMin: 28000,  salMax: 38000,  city: 'Leeds',      region: 'Yorkshire and the Humber', skills: ['HubSpot', 'Salesforce'], desc: 'Generate and qualify leads through outbound prospecting (calls, email, LinkedIn). You will set up demos for the field sales team and work to monthly targets.' },
  { title: 'Enterprise Account Manager',     department: 'Sales', seniority: 'SENIOR',   type: 'FULL_TIME', mode: 'HYBRID',  salMin: 70000,  salMax: 95000,  city: 'London',     region: 'Greater London', skills: ['Salesforce', 'Stakeholder Management', 'Business Development'], desc: 'Manage a portfolio of FTSE 500 enterprise accounts, driving upsell and cross-sell. Deep relationship management with multiple stakeholders across each account.', urgency: 'HIGH' },

  // Marketing
  { title: 'Digital Marketing Manager',      department: 'Marketing', seniority: 'MANAGER',  type: 'FULL_TIME', mode: 'HYBRID',  salMin: 55000,  salMax: 70000,  city: 'London',     region: 'Greater London', skills: ['Google Ads', 'Meta Ads', 'Google Analytics', 'HubSpot'], desc: 'Own digital acquisition channels including paid search, paid social, and SEO. Manage a £2M annual media budget and a team of 4 specialists.' },
  { title: 'Content Marketing Lead',         department: 'Marketing', seniority: 'LEAD',     type: 'FULL_TIME', mode: 'REMOTE',  salMin: 50000,  salMax: 65000,  city: 'London',     region: 'Greater London', skills: ['SEO', 'HubSpot', 'Google Analytics'], desc: 'Lead content strategy across blog, social, email and thought leadership. Drive organic traffic growth and build a content team of writers and designers.' },
  { title: 'Growth Marketing Manager',       department: 'Marketing', seniority: 'MANAGER',  type: 'FULL_TIME', mode: 'HYBRID',  salMin: 60000,  salMax: 80000,  city: 'London',     region: 'Greater London', skills: ['Google Analytics', 'Meta Ads', 'Google Ads', 'SQL'], desc: 'Own full-funnel growth strategy from awareness to activation. Run rigorous A/B experiments, analyse cohort data, and scale what works across paid and owned channels.' },
  { title: 'Brand Manager',                  department: 'Marketing', seniority: 'MID',      type: 'FULL_TIME', mode: 'HYBRID',  salMin: 42000,  salMax: 58000,  city: 'Manchester', region: 'North West',     skills: ['Google Analytics', 'Figma'], desc: 'Develop and execute brand campaigns across TV, OOH and digital. Manage agency relationships and ensure brand consistency across all consumer touchpoints.' },

  // Engineering
  { title: 'Senior Software Engineer',       department: 'Engineering', seniority: 'SENIOR',   type: 'FULL_TIME', mode: 'HYBRID',  salMin: 90000,  salMax: 120000, city: 'London',    region: 'Greater London', skills: ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'AWS'], desc: 'Build and scale core product features used by millions of customers. You will own significant technical areas, contribute to architecture decisions, and mentor junior engineers.' },
  { title: 'Backend Engineer',               department: 'Engineering', seniority: 'MID',      type: 'FULL_TIME', mode: 'HYBRID',  salMin: 70000,  salMax: 95000,  city: 'London',    region: 'Greater London', skills: ['Python', 'PostgreSQL', 'AWS', 'Docker', 'Kafka'], desc: 'Design and build high-throughput APIs and data pipelines. Work closely with product and data teams to deliver robust backend services at scale.' },
  { title: 'Staff Engineer',                 department: 'Engineering', seniority: 'LEAD',     type: 'FULL_TIME', mode: 'HYBRID',  salMin: 130000, salMax: 170000, city: 'London',    region: 'Greater London', skills: ['TypeScript', 'Go', 'Kubernetes', 'AWS', 'Microservices'], desc: 'Drive technical direction across multiple engineering teams. Define architectural standards, lead major technical initiatives, and act as a force multiplier for the organisation.', urgency: 'HIGH' },
  { title: 'Frontend Engineer',              department: 'Engineering', seniority: 'MID',      type: 'FULL_TIME', mode: 'HYBRID',  salMin: 65000,  salMax: 90000,  city: 'Cambridge', region: 'East of England', skills: ['TypeScript', 'React', 'Next.js', 'CSS'], desc: 'Build beautiful, performant user interfaces used by millions. You care deeply about UX, accessibility, and writing maintainable component libraries.' },
  { title: 'DevOps Engineer',                department: 'Engineering', seniority: 'SENIOR',   type: 'FULL_TIME', mode: 'HYBRID',  salMin: 85000,  salMax: 110000, city: 'London',    region: 'Greater London', skills: ['AWS', 'Kubernetes', 'Terraform', 'Docker', 'CI/CD'], desc: 'Own cloud infrastructure on AWS, drive Kubernetes adoption, and build CI/CD pipelines that let 100+ engineers ship with confidence.' },
  { title: 'Engineering Manager',            department: 'Engineering', seniority: 'MANAGER',  type: 'FULL_TIME', mode: 'HYBRID',  salMin: 110000, salMax: 145000, city: 'London',    region: 'Greater London', skills: ['People Management', 'Agile', 'TypeScript', 'Stakeholder Management'], desc: 'Lead a team of 8–12 engineers, partnering with product and design to deliver impactful features. Focus 60% on people leadership, 40% on technical contribution.' },

  // Product
  { title: 'Senior Product Manager',         department: 'Product', seniority: 'SENIOR',   type: 'FULL_TIME', mode: 'HYBRID',  salMin: 85000,  salMax: 115000, city: 'London',     region: 'Greater London', skills: ['Product Management', 'SQL', 'Figma', 'Agile'], desc: 'Own a major product area end-to-end from discovery through delivery. Define the roadmap, work daily with engineering and design, and use data to make every decision.' },
  { title: 'Product Director',               department: 'Product', seniority: 'DIRECTOR', type: 'FULL_TIME', mode: 'HYBRID',  salMin: 140000, salMax: 180000, city: 'London',     region: 'Greater London', skills: ['Product Management', 'Strategy & Consulting', 'Stakeholder Management'], desc: 'Set product vision and strategy for a suite of products. Manage a team of PMs, collaborate closely with the C-suite, and drive alignment across engineering, design and commercial.', urgency: 'HIGH' },
  { title: 'Associate Product Manager',      department: 'Product', seniority: 'JUNIOR',   type: 'FULL_TIME', mode: 'HYBRID',  salMin: 45000,  salMax: 60000,  city: 'London',     region: 'Greater London', skills: ['Product Management', 'Figma', 'SQL'], desc: 'Kick-start your PM career working alongside senior PMs on high-growth consumer products. You will own small features end-to-end and build your product craft fast.' },

  // Finance
  { title: 'Financial Controller',           department: 'Finance', seniority: 'MANAGER',  type: 'FULL_TIME', mode: 'HYBRID',  salMin: 80000,  salMax: 105000, city: 'London',     region: 'Greater London', skills: ['Financial Modelling', 'Excel (Advanced)', 'Management Accounts', 'SAP'], desc: 'Own the month-end close process, statutory accounts, and management reporting for a £200M revenue business. Lead a team of 6 finance professionals.' },
  { title: 'FP&A Manager',                   department: 'Finance', seniority: 'MANAGER',  type: 'FULL_TIME', mode: 'HYBRID',  salMin: 75000,  salMax: 100000, city: 'London',     region: 'Greater London', skills: ['Financial Modelling', 'Excel (Advanced)', 'Management Accounts', 'SQL'], desc: 'Lead financial planning and analysis, owning the annual budget, quarterly forecasts, and board reporting. Partner with senior leaders to provide commercial insight.' },
  { title: 'Finance Director',               department: 'Finance', seniority: 'DIRECTOR', type: 'FULL_TIME', mode: 'HYBRID',  salMin: 150000, salMax: 200000, city: 'London',     region: 'Greater London', skills: ['Financial Modelling', 'Management Accounts', 'CIMA', 'Stakeholder Management'], desc: 'Serve as the senior financial leader for the UK business, reporting to the CFO. Own financial strategy, investor relations support, and the finance function of 20+ people.', urgency: 'HIGH' },
  { title: 'Management Accountant',          department: 'Finance', seniority: 'MID',      type: 'FULL_TIME', mode: 'HYBRID',  salMin: 45000,  salMax: 60000,  city: 'Birmingham', region: 'West Midlands',  skills: ['Management Accounts', 'Excel (Advanced)', 'SAP'], desc: 'Prepare monthly management accounts, variance analysis, and business partner with operational teams. Study support provided for CIMA/ACCA.' },

  // HR & People
  { title: 'HR Business Partner',            department: 'HR & People', seniority: 'SENIOR',   type: 'FULL_TIME', mode: 'HYBRID',  salMin: 60000,  salMax: 80000,  city: 'London',     region: 'Greater London', skills: ['HR Management', 'CIPD', 'Employment Law', 'Stakeholder Management'], desc: 'Trusted HR partner to 2–3 business units across the UK, advising on ER, organisational design, talent planning, and change management. CIPD Level 7 preferred.' },
  { title: 'Head of Talent Acquisition',     department: 'HR & People', seniority: 'MANAGER',  type: 'FULL_TIME', mode: 'HYBRID',  salMin: 85000,  salMax: 110000, city: 'London',     region: 'Greater London', skills: ['Talent Acquisition', 'HR Management', 'Stakeholder Management'], desc: 'Build and lead a TA function capable of hiring 200+ roles per year. Own employer brand, sourcing strategy, and hiring manager experience end-to-end.', urgency: 'HIGH' },
  { title: 'People Operations Manager',      department: 'HR & People', seniority: 'MANAGER',  type: 'FULL_TIME', mode: 'HYBRID',  salMin: 55000,  salMax: 72000,  city: 'London',     region: 'Greater London', skills: ['HR Management', 'Workday', 'CIPD'], desc: 'Own the people operations function including payroll, onboarding, HRIS (Workday), and HR compliance. Build scalable processes for a fast-growing team.' },
  { title: 'L&D Manager',                    department: 'HR & People', seniority: 'MANAGER',  type: 'FULL_TIME', mode: 'HYBRID',  salMin: 58000,  salMax: 75000,  city: 'Manchester', region: 'North West',     skills: ['HR Management', 'Stakeholder Management'], desc: 'Design and deliver L&D programmes from onboarding to leadership development. Partner with HRBPs and managers to identify capability gaps and build learning solutions.' },

  // Data
  { title: 'Data Engineer',                  department: 'Data & Analytics', seniority: 'MID',    type: 'FULL_TIME', mode: 'HYBRID',  salMin: 65000,  salMax: 85000,  city: 'London',    region: 'Greater London', skills: ['Python', 'SQL', 'dbt', 'Airflow', 'Spark', 'AWS'], desc: 'Build and maintain data pipelines that power analytics and ML across the business. Own the data warehouse (Snowflake/BigQuery), build dbt models, and ensure data quality.' },
  { title: 'Senior Data Scientist',          department: 'Data & Analytics', seniority: 'SENIOR', type: 'FULL_TIME', mode: 'HYBRID',  salMin: 90000,  salMax: 120000, city: 'London',    region: 'Greater London', skills: ['Python', 'Machine Learning', 'SQL', 'PyTorch', 'scikit-learn'], desc: 'Apply ML to high-impact business problems including pricing optimisation, fraud detection, and personalisation. Own models from ideation through production deployment.' },
  { title: 'Analytics Engineer',             department: 'Data & Analytics', seniority: 'MID',    type: 'FULL_TIME', mode: 'HYBRID',  salMin: 60000,  salMax: 80000,  city: 'London',    region: 'Greater London', skills: ['SQL', 'dbt', 'Python', 'Looker'], desc: 'Bridge the gap between data engineering and analytics. Build clean, documented dbt models, define metrics, and enable self-serve analytics across the business.' },

  // Customer Success
  { title: 'Customer Success Manager',       department: 'Customer Success', seniority: 'MID',    type: 'FULL_TIME', mode: 'HYBRID',  salMin: 45000,  salMax: 62000,  city: 'London',    region: 'Greater London', skills: ['Salesforce', 'Stakeholder Management', 'HubSpot'], desc: 'Own the post-sale relationship for a portfolio of 50–80 mid-market customers. Drive adoption, deliver QBRs, and partner with sales on renewals and expansion.' },
  { title: 'Head of Customer Success',       department: 'Customer Success', seniority: 'MANAGER',type: 'FULL_TIME', mode: 'HYBRID',  salMin: 90000,  salMax: 120000, city: 'London',    region: 'Greater London', skills: ['Stakeholder Management', 'Salesforce', 'People Management'], desc: 'Build and lead a 15-person CS team, define the playbook for onboarding and expansion, and own net revenue retention as a core business metric.', urgency: 'HIGH' },
  { title: 'Customer Support Lead',          department: 'Customer Success', seniority: 'LEAD',   type: 'FULL_TIME', mode: 'HYBRID',  salMin: 38000,  salMax: 50000,  city: 'Edinburgh', region: 'Scotland',       skills: ['Stakeholder Management', 'Salesforce'], desc: 'Lead a team of 8 support agents, drive CSAT and resolution time improvements, and build escalation processes for complex issues.' },

  // Operations
  { title: 'Operations Manager',             department: 'Operations', seniority: 'MANAGER',  type: 'FULL_TIME', mode: 'ONSITE',  salMin: 55000,  salMax: 72000,  city: 'Bristol',    region: 'South West',     skills: ['Lean / Six Sigma', 'Supply Chain Management', 'Stakeholder Management'], desc: 'Drive operational efficiency across fulfilment and logistics. Own KPIs including cost per unit, on-time delivery, and SLA adherence. Lean/Six Sigma experience preferred.' },
  { title: 'Supply Chain Manager',           department: 'Operations', seniority: 'MANAGER',  type: 'FULL_TIME', mode: 'HYBRID',  salMin: 65000,  salMax: 85000,  city: 'London',     region: 'Greater London', skills: ['Supply Chain Management', 'Procurement', 'Excel (Advanced)'], desc: 'Manage end-to-end supply chain including sourcing, supplier relationships, inventory, and logistics. Drive cost reduction and resilience across a complex global supply base.' },

  // Legal & Compliance
  { title: 'Senior Legal Counsel',           department: 'Legal', seniority: 'SENIOR',   type: 'FULL_TIME', mode: 'HYBRID',  salMin: 100000, salMax: 135000, city: 'London',     region: 'Greater London', skills: ['Contract Law', 'Employment Law', 'GDPR', 'Compliance'], desc: 'Provide legal support across commercial contracts, employment matters, and regulatory compliance. You will partner with the business to manage legal risk pragmatically.' },
  { title: 'Compliance Manager',             department: 'Legal', seniority: 'MANAGER',  type: 'FULL_TIME', mode: 'HYBRID',  salMin: 70000,  salMax: 90000,  city: 'London',     region: 'Greater London', skills: ['Compliance', 'GDPR', 'AML / KYC', 'Stakeholder Management'], desc: 'Own FCA compliance framework for a regulated fintech. Build policies, conduct training, manage audits, and act as the key liaison with regulators.' },

  // Contract roles
  { title: 'Interim CFO',                    department: 'Finance', seniority: 'C_SUITE',  type: 'CONTRACT',  mode: 'HYBRID',  salMin: 1200,   salMax: 1800,   city: 'London',     region: 'Greater London', skills: ['Financial Modelling', 'Management Accounts', 'Stakeholder Management'], desc: '6-month interim CFO engagement to lead the business through a Series C fundraise and first-year post-raise scaling. Big 4 background preferred.' },
  { title: 'Contract Data Engineer',         department: 'Data & Analytics', seniority: 'SENIOR', type: 'CONTRACT', mode: 'REMOTE', salMin: 550, salMax: 750, city: 'London', region: 'Greater London', skills: ['Python', 'dbt', 'Airflow', 'SQL', 'Spark'], desc: '3-month contract to migrate legacy ETL pipelines to dbt + Airflow. Must be available to start within 2 weeks.' },
  { title: 'Freelance UX Designer',          department: 'Design & UX', seniority: 'MID',    type: 'FREELANCE', mode: 'REMOTE',  salMin: 400,    salMax: 600,    city: 'London',     region: 'Greater London', skills: ['Figma', 'Design & UX'], desc: 'Ongoing freelance engagement designing new mobile flows for our consumer app. Must have fintech or consumer app portfolio. Figma required.' },
]

export async function GET() {
  try {
    let companiesCreated = 0
    let jobsCreated = 0
    const errors: string[] = []

    // ── Upsert companies ──────────────────────────────────────────────────────
    const companyMap = new Map<string, string>()

    for (const c of COMPANIES) {
      try {
        const company = await prisma.company.upsert({
          where: { domain: c.domain },
          create: {
            name: c.name, domain: c.domain, industry: c.industry,
            sector: c.sector, company_size: c.size as never,
            headquarters_city: c.city, headquarters_country: c.country, region: c.region,
          },
          update: { industry: c.industry, sector: c.sector },
        })
        companyMap.set(c.name, company.id)
        companiesCreated++
      } catch (err) {
        errors.push(`Company ${c.name}: ${err instanceof Error ? err.message : err}`)
      }
    }

    // ── Upsert skills ─────────────────────────────────────────────────────────
    const allSkillNames = Array.from(new Set(JOBS.flatMap(j => j.skills)))
    const skillMap = new Map<string, string>()

    for (const name of allSkillNames) {
      const s = await prisma.skill.upsert({
        where: { name },
        create: { name, category: 'General', is_verified: true },
        update: {},
      })
      skillMap.set(name, s.id)
    }

    // ── Create jobs ───────────────────────────────────────────────────────────
    const companyNames = Array.from(companyMap.keys())

    for (const job of JOBS) {
      try {
        // Pick a random company if no specific match
        const companyName = companyNames[Math.floor(Math.random() * companyNames.length)]
        const companyId = companyMap.get(companyName)!

        // Detect day-rate (small numbers) vs annual salary
        const isDaily = job.salMin < 2000
        const salaryPeriod = isDaily ? 'DAILY' : 'ANNUAL'

        // Check if already exists
        const exists = await prisma.job.findFirst({
          where: { title: job.title, company_id: companyId },
        })
        if (exists) continue

        const created = await prisma.job.create({
          data: {
            title:            job.title,
            company_id:       companyId,
            description:      job.desc,
            seniority_level:  job.seniority as never,
            employment_type:  job.type as never,
            work_mode:        job.mode as never,
            location_city:    job.city,
            location_country: 'United Kingdom',
            region:           job.region,
            salary_min:       job.salMin,
            salary_max:       job.salMax,
            salary_currency:  'GBP',
            salary_period:    salaryPeriod as never,
            source:           'RECRUITER_POSTED',
            posted_date:      randomRecentDate(),
            status:           'ACTIVE',
            urgency:          (job.urgency ?? 'NORMAL') as never,
            visa_sponsorship: Math.random() > 0.7,
            equity_offered:   Math.random() > 0.6,
            skills: {
              create: job.skills.map((skillName, i) => ({
                skill_id:   skillMap.get(skillName)!,
                importance: (i === 0 ? 'REQUIRED' : 'PREFERRED') as never,
              })).filter(s => s.skill_id),
            },
          },
        })

        companyMap.set(companyName, companyId)
        jobsCreated++
        void created
      } catch (err) {
        errors.push(`Job "${job.title}": ${err instanceof Error ? err.message : err}`)
      }
    }

    return NextResponse.json({
      success: true,
      companiesCreated,
      jobsCreated,
      errors: errors.length ? errors : undefined,
    })
  } catch (err) {
    console.error('[seed-jobs]', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

function randomRecentDate(): Date {
  const msAgo = Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000) // up to 30 days
  return new Date(Date.now() - msAgo)
}
