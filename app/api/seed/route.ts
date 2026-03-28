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
      // Non-tech / cross-industry skills
      prisma.skill.upsert({ where: { name: 'Event Management' },       update: {}, create: { name: 'Event Management',       category: 'Events',        subcategory: 'Planning',         aliases: ['Events', 'Event Planning'] } }),
      prisma.skill.upsert({ where: { name: 'Hospitality Management' }, update: {}, create: { name: 'Hospitality Management', category: 'Hospitality',   subcategory: 'Operations',       aliases: ['Hospitality'] } }),
      prisma.skill.upsert({ where: { name: 'Food & Beverage' },        update: {}, create: { name: 'Food & Beverage',        category: 'Hospitality',   subcategory: 'F&B',              aliases: ['F&B', 'Food and Beverage'] } }),
      prisma.skill.upsert({ where: { name: 'Quantity Surveying' },     update: {}, create: { name: 'Quantity Surveying',     category: 'Construction',  subcategory: 'Cost Management',  aliases: ['QS', 'Cost Planning'] } }),
      prisma.skill.upsert({ where: { name: 'AutoCAD' },                update: {}, create: { name: 'AutoCAD',                category: 'Construction',  subcategory: 'Design Software',  aliases: ['CAD'] } }),
      prisma.skill.upsert({ where: { name: 'BIM' },                    update: {}, create: { name: 'BIM',                    category: 'Construction',  subcategory: 'Digital Design',   aliases: ['Building Information Modelling'] } }),
      prisma.skill.upsert({ where: { name: 'Construction Management' },update: {}, create: { name: 'Construction Management',category: 'Construction',  subcategory: 'Project Delivery', aliases: ['Site Management'] } }),
      prisma.skill.upsert({ where: { name: 'Clinical Research' },      update: {}, create: { name: 'Clinical Research',      category: 'Healthcare',    subcategory: 'Research',         aliases: ['Clinical Trials', 'ClinRes'] } }),
      prisma.skill.upsert({ where: { name: 'Pharmacovigilance' },      update: {}, create: { name: 'Pharmacovigilance',      category: 'Healthcare',    subcategory: 'Drug Safety',      aliases: ['PV', 'Drug Safety'] } }),
      prisma.skill.upsert({ where: { name: 'Brand Management' },       update: {}, create: { name: 'Brand Management',       category: 'Marketing',     subcategory: 'Brand',            aliases: ['Branding'] } }),
      prisma.skill.upsert({ where: { name: 'Buying & Merchandising' }, update: {}, create: { name: 'Buying & Merchandising', category: 'Retail',        subcategory: 'Buying',           aliases: ['Buying', 'Merchandising'] } }),
      prisma.skill.upsert({ where: { name: 'Legal Research' },         update: {}, create: { name: 'Legal Research',         category: 'Legal',         subcategory: 'Research',         aliases: [] } }),
      prisma.skill.upsert({ where: { name: 'Contract Law' },           update: {}, create: { name: 'Contract Law',           category: 'Legal',         subcategory: 'Practice Area',    aliases: ['Contracts'] } }),
      prisma.skill.upsert({ where: { name: 'Compliance' },             update: {}, create: { name: 'Compliance',             category: 'Legal',         subcategory: 'Regulatory',       aliases: ['Regulatory Compliance'] } }),
      prisma.skill.upsert({ where: { name: 'GDPR' },                   update: {}, create: { name: 'GDPR',                   category: 'Legal',         subcategory: 'Data Privacy',     aliases: ['Data Protection', 'UK GDPR'] } }),
      prisma.skill.upsert({ where: { name: 'Talent Acquisition' },     update: {}, create: { name: 'Talent Acquisition',     category: 'HR',            subcategory: 'Recruitment',      aliases: ['TA', 'Recruiting'] } }),
      prisma.skill.upsert({ where: { name: 'HR Management' },          update: {}, create: { name: 'HR Management',          category: 'HR',            subcategory: 'Generalist',       aliases: ['HRM', 'Human Resources'] } }),
      prisma.skill.upsert({ where: { name: 'SEO' },                    update: {}, create: { name: 'SEO',                    category: 'Marketing',     subcategory: 'Digital',          aliases: ['Search Engine Optimisation'] } }),
      prisma.skill.upsert({ where: { name: 'PPC' },                    update: {}, create: { name: 'PPC',                    category: 'Marketing',     subcategory: 'Paid Media',       aliases: ['Paid Search', 'Google Ads'] } }),
      prisma.skill.upsert({ where: { name: 'Content Marketing' },      update: {}, create: { name: 'Content Marketing',      category: 'Marketing',     subcategory: 'Content',          aliases: ['Content Strategy'] } }),
      prisma.skill.upsert({ where: { name: 'Salesforce' },             update: {}, create: { name: 'Salesforce',             category: 'CRM',           subcategory: 'Platform',         aliases: ['SFDC'] } }),
      prisma.skill.upsert({ where: { name: 'Agile' },                  update: {}, create: { name: 'Agile',                  category: 'Methodology',   subcategory: 'Delivery',         aliases: ['Agile Methodology'] } }),
      prisma.skill.upsert({ where: { name: 'Nursing' },                update: {}, create: { name: 'Nursing',                category: 'Healthcare',    subcategory: 'Clinical',         aliases: ['RN', 'Registered Nurse'] } }),
      prisma.skill.upsert({ where: { name: 'Supply Chain Management' },update: {}, create: { name: 'Supply Chain Management',category: 'Logistics',     subcategory: 'Supply Chain',     aliases: ['Supply Chain', 'SCM'] } }),
      prisma.skill.upsert({ where: { name: 'Broadcast Production' },   update: {}, create: { name: 'Broadcast Production',   category: 'Media',         subcategory: 'Production',       aliases: ['TV Production', 'Broadcasting'] } }),
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
      // Diverse UK companies across industries
      { name: 'Marriott Hotels UK', domain: 'marriott.co.uk', industry: 'Hospitality & Hotels', sector: 'Hospitality', sub_sector: 'Luxury Hotels', company_size: 'ENTERPRISE' as const, employee_count: 12000, headquarters_city: 'London', headquarters_country: 'United Kingdom', region: 'EMEA', tech_stack: ['Opera PMS', 'Salesforce', 'Oracle'], culture_tags: ['service-excellence', 'people-first', 'global-brand'], glassdoor_rating: 3.9, founded_year: 1927 },
      { name: 'ExCeL London', domain: 'excel.london', industry: 'Events & Conferences', sector: 'Events', sub_sector: 'Exhibition & Convention Centres', company_size: 'MID_MARKET' as const, employee_count: 800, headquarters_city: 'London', headquarters_country: 'United Kingdom', region: 'EMEA', tech_stack: ['Ungerboeck', 'Salesforce', 'Microsoft 365'], culture_tags: ['event-excellence', 'collaborative', 'client-focused'], glassdoor_rating: 4.1, founded_year: 2000 },
      { name: 'Marks & Spencer', domain: 'marksandspencer.com', industry: 'Retail', sector: 'Retail', sub_sector: 'Clothing & Food', company_size: 'ENTERPRISE' as const, employee_count: 64000, headquarters_city: 'London', headquarters_country: 'United Kingdom', region: 'EMEA', tech_stack: ['SAP', 'Salesforce', 'Azure', 'React'], culture_tags: ['heritage-brand', 'customer-focused', 'sustainability'], glassdoor_rating: 3.7, founded_year: 1884 },
      { name: 'ASOS', domain: 'asos.com', industry: 'Retail & E-commerce', sector: 'Technology', sub_sector: 'Fashion E-commerce', company_size: 'ENTERPRISE' as const, employee_count: 3600, headquarters_city: 'London', headquarters_country: 'United Kingdom', region: 'EMEA', tech_stack: ['React', 'Node.js', 'AWS', 'Elasticsearch', 'Python'], culture_tags: ['fashion-forward', 'data-driven', 'inclusive'], glassdoor_rating: 3.8, founded_year: 2000 },
      { name: 'AstraZeneca', domain: 'astrazeneca.com', industry: 'Chemical & Pharmaceutical', sector: 'Life Sciences', sub_sector: 'Biopharmaceuticals', company_size: 'ENTERPRISE' as const, employee_count: 83100, headquarters_city: 'Cambridge', headquarters_country: 'United Kingdom', region: 'EMEA', tech_stack: ['Veeva', 'SAS', 'Python', 'AWS', 'R'], culture_tags: ['science-led', 'patient-focused', 'innovation'], glassdoor_rating: 4.2, founded_year: 1999 },
      { name: 'Barratt Developments', domain: 'barratthomes.co.uk', industry: 'Building & Construction', sector: 'Construction', sub_sector: 'Housebuilding', company_size: 'ENTERPRISE' as const, employee_count: 6800, headquarters_city: 'London', headquarters_country: 'United Kingdom', region: 'EMEA', tech_stack: ['AutoCAD', 'Revit', 'Microsoft Project', 'Oracle'], culture_tags: ['quality-build', 'community', 'safety-first'], glassdoor_rating: 3.6, founded_year: 1958 },
      { name: 'Publicis Sapient', domain: 'publicissapient.com', industry: 'Advertising & PR', sector: 'Marketing & Advertising', sub_sector: 'Digital Transformation', company_size: 'ENTERPRISE' as const, employee_count: 20000, headquarters_city: 'London', headquarters_country: 'United Kingdom', region: 'EMEA', tech_stack: ['React', 'Salesforce', 'Adobe Experience Cloud', 'AWS'], culture_tags: ['creative', 'digital-first', 'global'], glassdoor_rating: 3.9, founded_year: 1996 },
      { name: 'Allen & Overy', domain: 'allenovery.com', industry: 'Legal', sector: 'Professional Services', sub_sector: 'International Law', company_size: 'ENTERPRISE' as const, employee_count: 5500, headquarters_city: 'London', headquarters_country: 'United Kingdom', region: 'EMEA', tech_stack: ['iManage', 'HighQ', 'Microsoft 365'], culture_tags: ['excellence', 'client-service', 'inclusive'], glassdoor_rating: 4.0, founded_year: 1930 },
      { name: 'ITV', domain: 'itv.com', industry: 'Broadcasting & Media', sector: 'Media', sub_sector: 'Television Broadcasting', company_size: 'ENTERPRISE' as const, employee_count: 6500, headquarters_city: 'London', headquarters_country: 'United Kingdom', region: 'EMEA', tech_stack: ['AWS', 'React', 'Python', 'Akamai'], culture_tags: ['creative', 'storytelling', 'diverse-voices'], glassdoor_rating: 3.8, founded_year: 1955 },
      { name: 'NHS England', domain: 'england.nhs.uk', industry: 'Healthcare & NHS', sector: 'Public Sector', sub_sector: 'National Health Service', company_size: 'ENTERPRISE' as const, employee_count: 1400000, headquarters_city: 'London', headquarters_country: 'United Kingdom', region: 'EMEA', tech_stack: ['EMIS', 'System One', 'Microsoft 365', 'Azure'], culture_tags: ['patient-care', 'public-service', 'mission-driven'], glassdoor_rating: 3.5, founded_year: 1948 },
      { name: 'Amazon UK', domain: 'amazon.co.uk', industry: 'Logistics & Transport', sector: 'Technology', sub_sector: 'E-commerce & Logistics', company_size: 'ENTERPRISE' as const, employee_count: 75000, headquarters_city: 'London', headquarters_country: 'United Kingdom', region: 'EMEA', tech_stack: ['AWS', 'Java', 'Python', 'React', 'Kotlin'], culture_tags: ['customer-obsessed', 'data-driven', 'high-performance'], glassdoor_rating: 3.4, founded_year: 1998 },
      { name: 'Compass Group UK', domain: 'compass-group.co.uk', industry: 'Food & Beverage', sector: 'Hospitality', sub_sector: 'Contract Catering', company_size: 'ENTERPRISE' as const, employee_count: 45000, headquarters_city: 'Chertsey', headquarters_country: 'United Kingdom', region: 'EMEA', tech_stack: ['SAP', 'Salesforce', 'Microsoft 365'], culture_tags: ['food-passion', 'people-first', 'sustainability'], glassdoor_rating: 3.6, founded_year: 1941 },
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
      // Diverse candidates across UK industries
      { email: 'emma.walsh@example.com', first_name: 'Emma', last_name: 'Walsh', current_title: 'Senior Events Manager', current_company_domain: 'excel.london', seniority_level: 'SENIOR' as const, location_city: 'London', location_country: 'United Kingdom', region: 'EMEA', availability_status: 'ACTIVELY_LOOKING' as const, source: 'LINKEDIN' as const, years_experience: 8, salary_currency: 'GBP', salary_expectation_min: 55000, salary_expectation_max: 70000, is_remote_open: false, is_relocation_open: false, notice_period_days: 30, linkedin_url: 'https://linkedin.com/in/emma-walsh-events', summary: 'Senior Events Manager at ExCeL London with 8 years delivering large-scale exhibitions and corporate events. I\'ve managed events with up to 80,000 attendees, overseeing £3M+ annual event budgets and coordinating 50+ vendor relationships. Expert in Ungerboeck venue management software and Salesforce CRM. Proven track record in client-facing roles and cross-functional team leadership. Looking for a Head of Events or Events Director role at a prestigious venue or corporate events business.', skills: ['Event Management', 'Salesforce'] },
      { email: 'marcus.brown@example.com', first_name: 'Marcus', last_name: 'Brown', current_title: 'Hotel Operations Manager', current_company_domain: 'marriott.co.uk', seniority_level: 'MANAGER' as const, location_city: 'London', location_country: 'United Kingdom', region: 'EMEA', availability_status: 'OPEN_TO_OFFERS' as const, source: 'LINKEDIN' as const, years_experience: 12, salary_currency: 'GBP', salary_expectation_min: 65000, salary_expectation_max: 85000, is_remote_open: false, is_relocation_open: true, notice_period_days: 60, linkedin_url: 'https://linkedin.com/in/marcus-brown-hospitality', summary: 'Hotel Operations Manager at Marriott London with 12 years of luxury hospitality experience across 5-star properties. Currently responsible for a 350-room property generating £18M annual revenue, managing a 120-person team across Rooms, F&B, and Guest Services. Certified by the Institute of Hospitality. Track record of improving TripAdvisor ratings from 4.1 to 4.7 and RevPAR by 22% over three years. Open to General Manager opportunities in London or internationally.', skills: ['Hospitality Management', 'Food & Beverage'] },
      { email: 'zoe.henderson@example.com', first_name: 'Zoe', last_name: 'Henderson', current_title: 'Senior Buyer — Womenswear', current_company_domain: 'marksandspencer.com', seniority_level: 'SENIOR' as const, location_city: 'London', location_country: 'United Kingdom', region: 'EMEA', availability_status: 'ACTIVELY_LOOKING' as const, source: 'LINKEDIN' as const, years_experience: 9, salary_currency: 'GBP', salary_expectation_min: 60000, salary_expectation_max: 80000, is_remote_open: true, is_relocation_open: false, notice_period_days: 30, linkedin_url: 'https://linkedin.com/in/zoe-henderson-buying', summary: 'Senior Buyer at M&S owning Womenswear Own Brand with a £45M seasonal OTB. I manage end-to-end buying from trend analysis and supplier selection to range review and markdown strategy. Experienced in sourcing across UK, Europe, and Far East. Strong cross-functional collaborator working closely with Merchandising, Design, and Supply Chain. Looking for a Buying Manager or Head of Buying role in fashion retail or e-commerce.', skills: ['Buying & Merchandising'] },
      { email: 'raj.patel@example.com', first_name: 'Raj', last_name: 'Patel', current_title: 'Clinical Data Manager', current_company_domain: 'astrazeneca.com', seniority_level: 'MID' as const, location_city: 'Cambridge', location_country: 'United Kingdom', region: 'EMEA', availability_status: 'OPEN_TO_OFFERS' as const, source: 'LINKEDIN' as const, years_experience: 6, salary_currency: 'GBP', salary_expectation_min: 55000, salary_expectation_max: 75000, is_remote_open: true, is_relocation_open: true, notice_period_days: 30, linkedin_url: 'https://linkedin.com/in/raj-patel-clinical', summary: 'Clinical Data Manager at AstraZeneca with 6 years in late-phase oncology and respiratory clinical trials. Oversee data integrity and EDC management (Medidata Rave) for Phase III studies with 2,000+ patient datasets. ICH E6(R2) GCP certified. Skilled in SAS and R for statistical data review and medical coding (MedDRA, WHODrug). Looking for a Senior CDM or Data Management Lead role in a fast-moving biotech or CRO.', skills: ['Clinical Research', 'SQL', 'Data Analysis'] },
      { email: 'charlotte.davies@example.com', first_name: 'Charlotte', last_name: 'Davies', current_title: 'Brand Marketing Director', current_company_domain: 'publicissapient.com', seniority_level: 'DIRECTOR' as const, location_city: 'London', location_country: 'United Kingdom', region: 'EMEA', availability_status: 'PASSIVE' as const, source: 'REFERRAL' as const, years_experience: 14, salary_currency: 'GBP', salary_expectation_min: 110000, salary_expectation_max: 140000, is_remote_open: true, is_relocation_open: false, notice_period_days: 60, linkedin_url: 'https://linkedin.com/in/charlotte-davies-brand', summary: 'Brand Marketing Director with 14 years building iconic UK and global brands. Currently at Publicis Sapient leading a 25-person team delivering integrated campaigns for FTSE 100 clients across automotive, retail, and financial services. Expert in brand strategy, consumer insights, and multi-channel campaign execution. Prior roles include Brand Director at Unilever (Dove global) and Marketing Lead at TfL. Passive — open to CMO or VP Marketing conversations at consumer-facing businesses.', skills: ['Brand Management', 'Content Marketing', 'Salesforce'] },
      { email: 'oliver.jenkins@example.com', first_name: 'Oliver', last_name: 'Jenkins', current_title: 'Quantity Surveyor', current_company_domain: 'barratthomes.co.uk', seniority_level: 'MID' as const, location_city: 'Birmingham', location_country: 'United Kingdom', region: 'EMEA', availability_status: 'ACTIVELY_LOOKING' as const, source: 'INDEED' as const, years_experience: 5, salary_currency: 'GBP', salary_expectation_min: 45000, salary_expectation_max: 60000, is_remote_open: false, is_relocation_open: true, notice_period_days: 30, linkedin_url: 'https://linkedin.com/in/oliver-jenkins-qs', summary: 'Quantity Surveyor at Barratt Developments with 5 years on residential new-build projects across the Midlands. Currently managing cost plans on a 280-unit housing development (GDV £62M), responsible for procurement, subcontractor accounts, and monthly cost reporting to the Board. MRICS (APC) qualified. Proficient in CostX, Causeway Tradex, and AutoCAD. Looking for a Senior QS or Commercial Manager role on larger-scale mixed-use or commercial projects.', skills: ['Quantity Surveying', 'AutoCAD', 'Construction Management'] },
      { email: 'aisha.okafor@example.com', first_name: 'Aisha', last_name: 'Okafor', current_title: 'Head of People & Culture', current_company_domain: 'asos.com', seniority_level: 'SENIOR' as const, location_city: 'London', location_country: 'United Kingdom', region: 'EMEA', availability_status: 'ACTIVELY_LOOKING' as const, source: 'LINKEDIN' as const, years_experience: 10, salary_currency: 'GBP', salary_expectation_min: 85000, salary_expectation_max: 110000, is_remote_open: true, is_relocation_open: false, notice_period_days: 30, linkedin_url: 'https://linkedin.com/in/aisha-okafor-hr', summary: 'Head of People & Culture at ASOS overseeing a global workforce of 3,600 across UK, US, and EU. Owns end-to-end people strategy including talent acquisition, L&D, DEI programmes, and total reward. Built ASOS\'s graduate scheme from scratch, now onboarding 120 graduates annually. Led the transition to hybrid working affecting 2,200 office-based employees. CIPD Level 7 qualified. Passionate about building inclusive cultures and data-driven HR. Seeking a CPO or VP People role.', skills: ['HR Management', 'Talent Acquisition', 'Agile'] },
      { email: 'jack.morrison@example.com', first_name: 'Jack', last_name: 'Morrison', current_title: 'Senior Broadcast Producer', current_company_domain: 'itv.com', seniority_level: 'SENIOR' as const, location_city: 'London', location_country: 'United Kingdom', region: 'EMEA', availability_status: 'OPEN_TO_OFFERS' as const, source: 'LINKEDIN' as const, years_experience: 9, salary_currency: 'GBP', salary_expectation_min: 65000, salary_expectation_max: 85000, is_remote_open: false, is_relocation_open: false, notice_period_days: 30, linkedin_url: 'https://linkedin.com/in/jack-morrison-tv', summary: 'Senior Broadcast Producer at ITV with 9 years producing primetime factual and entertainment content. Executive producer credits include a BAFTA-nominated documentary series (viewing figures 3.2M peak) and a flagship weeknight news programme. Skilled in multi-platform commissioning, post-production workflow, and managing production budgets up to £2.5M per series. Strong editorial judgement and talent relationships across UK broadcasting. Open to Series Producer or Executive Producer opportunities at streaming platforms or independents.', skills: ['Broadcast Production', 'Content Marketing'] },
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
      // ── Diverse industry jobs ──
      { title: 'Head of Events', company_domain: 'excel.london', seniority_level: 'SENIOR' as const, employment_type: 'FULL_TIME' as const, work_mode: 'ONSITE' as const, location_city: 'London', location_country: 'United Kingdom', region: 'EMEA', salary_min: 65000, salary_max: 80000, salary_currency: 'GBP', status: 'ACTIVE' as const, source: 'COMPANY_WEBSITE' as const, urgency: 'HIGH' as const, posted_date: new Date('2026-03-10'), description: 'Lead the Events team at ExCeL London — one of Europe\'s largest exhibition and conference venues hosting 400+ events per year, 4 million visitors, and £500M+ economic contribution to London. You will own the full event lifecycle from sales handover through planning, delivery, and post-event review, managing a team of 15 and a combined annual portfolio of £25M in event revenue.', requirements: '• 8+ years of events management experience, with at least 3 in a senior leadership role\n• Proven experience managing large-scale exhibitions or corporate events (5,000+ attendees)\n• Strong budget management skills — £5M+ budgets\n• Experience with venue management software (Ungerboeck preferred)\n• Outstanding client relationship and stakeholder management skills\n• Experience managing large, diverse teams', responsibilities: '• Own delivery of the annual events calendar including major exhibitions, conferences, and corporate events\n• Lead, develop, and mentor a team of 15 event professionals\n• Build and maintain strategic relationships with key clients and show organisers\n• Drive continuous improvement in delivery processes and client satisfaction scores\n• Collaborate with Sales, Marketing, and Operations to maximise venue utilisation\n• Set and manage annual departmental budget', skills: ['Event Management', 'Salesforce'] },
      { title: 'Hotel General Manager', company_domain: 'marriott.co.uk', seniority_level: 'SENIOR' as const, employment_type: 'FULL_TIME' as const, work_mode: 'ONSITE' as const, location_city: 'Manchester', location_country: 'United Kingdom', region: 'EMEA', salary_min: 75000, salary_max: 100000, salary_currency: 'GBP', status: 'ACTIVE' as const, source: 'COMPANY_WEBSITE' as const, urgency: 'HIGH' as const, posted_date: new Date('2026-02-28'), description: 'Lead the flagship Marriott Manchester property — a 4-star, 298-room hotel with 8 meeting suites, a destination restaurant, and spa generating £22M annual revenue. As General Manager you will set the commercial and operational strategy, lead a 160-person team, and maintain Marriott\'s brand standards across all guest touchpoints.', requirements: '• 10+ years hotel operations experience, with at least 3 years as GM or Deputy GM of a 4/5-star property\n• Degree in Hospitality Management or equivalent professional qualification\n• Track record of improving RevPAR, NPS, and TripAdvisor rankings\n• Strong P&L management — full ownership of hotel financials\n• Experience with Opera PMS and revenue management systems\n• Exceptional people leadership — you inspire loyalty in your team', responsibilities: '• Set and execute the hotel\'s annual business plan and budget (£22M revenue)\n• Lead recruitment, development, and performance management for 160 staff\n• Drive guest satisfaction (target: top quartile TripAdvisor ranking)\n• Oversee all operational departments: Rooms, F&B, Spa, Meetings & Events\n• Build relationships with corporate clients, travel agents, and local partners\n• Report monthly to UK Regional VP on commercial performance', skills: ['Hospitality Management', 'Food & Beverage'] },
      { title: 'Buying Manager — Womenswear', company_domain: 'asos.com', seniority_level: 'MANAGER' as const, employment_type: 'FULL_TIME' as const, work_mode: 'HYBRID' as const, location_city: 'London', location_country: 'United Kingdom', region: 'EMEA', salary_min: 65000, salary_max: 85000, salary_currency: 'GBP', status: 'ACTIVE' as const, source: 'LINKEDIN' as const, urgency: 'NORMAL' as const, posted_date: new Date('2026-03-01'), description: 'Join ASOS as Buying Manager for Womenswear Own Brand — one of our highest-revenue product categories with £120M annual OTB across 2,000+ SKUs. You will lead a team of 6 Buyers and Assistant Buyers to deliver a commercially compelling, trend-right range that resonates with our 26 million active customers globally.', requirements: '• 7+ years of buying experience in a fast fashion or online retail environment\n• Proven experience managing buying teams (3+ direct reports)\n• Strong commercial acumen — OTB management, markdown strategy, supplier negotiation\n• Excellent trend awareness and customer insight\n• Experience with global sourcing (UK, Europe, Far East)\n• Comfortable with data and performance analytics (Excel / BI tools)', responsibilities: '• Own the Womenswear OB buying strategy and seasonal range plan\n• Lead, develop, and performance-manage a team of 6 buyers\n• Drive supplier relationships — negotiation, performance, and ethical sourcing\n• Collaborate with Merchandising on OTB allocation and trade decisions\n• Present range reviews to C-Suite and commercial leadership\n• Monitor sell-through, react quickly to trade, and manage end-of-season stock positions', skills: ['Buying & Merchandising'] },
      { title: 'Senior Clinical Data Manager', company_domain: 'astrazeneca.com', seniority_level: 'SENIOR' as const, employment_type: 'FULL_TIME' as const, work_mode: 'HYBRID' as const, location_city: 'Cambridge', location_country: 'United Kingdom', region: 'EMEA', salary_min: 60000, salary_max: 80000, salary_currency: 'GBP', status: 'ACTIVE' as const, source: 'COMPANY_WEBSITE' as const, urgency: 'NORMAL' as const, posted_date: new Date('2026-02-20'), description: 'Lead data management activities for late-phase oncology clinical trials at AstraZeneca\'s global R&D headquarters in Cambridge. As Senior CDM you will be accountable for data quality, EDC build and validation, and regulatory submission-ready datasets on programmes targeting lung and breast cancer — conditions where our pipeline has significant near-term commercial potential.', requirements: '• 5+ years of clinical data management in pharma, biotech, or CRO\n• Solid experience with Medidata Rave or equivalent EDC platform\n• Strong understanding of CDISC standards (CDASH, SDTM)\n• ICH E6(R2) GCP certification required\n• Medical coding experience (MedDRA, WHODrug)\n• Excellent attention to detail and regulatory awareness', responsibilities: '• Lead CDM activities for 2–3 concurrent Phase II/III oncology studies\n• Build and validate EDC databases in Medidata Rave\n• Author and review DM Plans, Data Validation Specifications, and SAE reconciliation reports\n• Manage CRF completion rates and resolve data queries with sites\n• Prepare CDISC-compliant SDTM datasets for regulatory submissions\n• Mentor junior CDMs and contribute to departmental process improvement', skills: ['Clinical Research', 'SQL', 'Data Analysis'] },
      { title: 'Senior Quantity Surveyor', company_domain: 'barratthomes.co.uk', seniority_level: 'SENIOR' as const, employment_type: 'FULL_TIME' as const, work_mode: 'ONSITE' as const, location_city: 'Birmingham', location_country: 'United Kingdom', region: 'EMEA', salary_min: 55000, salary_max: 72000, salary_currency: 'GBP', status: 'ACTIVE' as const, source: 'INDEED' as const, urgency: 'HIGH' as const, posted_date: new Date('2026-03-05'), description: 'Join Barratt\'s Midlands Division as Senior QS on an exciting mixed-tenure residential development — 350 homes including affordable and private sale units with a GDV of £78M. You\'ll be central to the commercial success of the project, owning procurement strategy, subcontractor management, and monthly cost reporting throughout the build programme.', requirements: '• 5+ years QS experience on residential or mixed-use development\n• MRICS qualification (or working towards APC) preferred\n• Experience managing subcontractor packages from procurement to final account\n• Proficient in CostX or equivalent cost management software\n• Strong understanding of JCT contract forms\n• Ability to produce clear Board-level cost reports', responsibilities: '• Prepare and manage project cost plans, cashflow forecasts, and monthly Cost Value Reconciliation reports\n• Lead procurement strategy for all major subcontract packages\n• Assess and agree subcontractor interim and final accounts\n• Identify and manage commercial risks and opportunities\n• Support the Project Manager in programme and change management\n• Mentor and develop a junior QS within the team', skills: ['Quantity Surveying', 'AutoCAD', 'Construction Management'] },
      { title: 'Brand Marketing Director', company_domain: 'asos.com', seniority_level: 'DIRECTOR' as const, employment_type: 'FULL_TIME' as const, work_mode: 'HYBRID' as const, location_city: 'London', location_country: 'United Kingdom', region: 'EMEA', salary_min: 110000, salary_max: 140000, salary_currency: 'GBP', status: 'ACTIVE' as const, source: 'LINKEDIN' as const, urgency: 'IMMEDIATE' as const, posted_date: new Date('2026-02-15'), description: 'ASOS is searching for a Brand Marketing Director to define and champion how ASOS shows up to its 26 million global customers. Reporting to the CMO, you will own the brand strategy, global campaign calendar, and creative direction across all paid and owned channels. This is a rare opportunity to shape one of the UK\'s most recognised digital fashion brands at a pivotal moment of commercial repositioning.', requirements: '• 12+ years marketing experience with 5+ at Director level\n• Proven brand-building track record — ideally global consumer brand\n• Deep expertise in integrated campaign development across TV, digital, and social\n• Experience managing large creative agencies and in-house teams\n• Strong commercial acumen — you understand the relationship between brand health and revenue\n• Excellent executive communication and Board-level presentation skills', responsibilities: '• Define ASOS brand strategy and visual identity guidelines\n• Own the annual marketing calendar and £40M brand budget\n• Lead global integrated campaign development and execution\n• Drive brand health metrics (awareness, consideration, preference) across 11 markets\n• Manage relationships with creative, media, and PR agency partners\n• Build and develop a high-performing brand team of 30+', skills: ['Brand Management', 'Content Marketing'] },
      { title: 'Senior Solicitor — Corporate M&A', company_domain: 'allenovery.com', seniority_level: 'SENIOR' as const, employment_type: 'FULL_TIME' as const, work_mode: 'HYBRID' as const, location_city: 'London', location_country: 'United Kingdom', region: 'EMEA', salary_min: 100000, salary_max: 135000, salary_currency: 'GBP', status: 'ACTIVE' as const, source: 'LINKEDIN' as const, urgency: 'NORMAL' as const, posted_date: new Date('2026-02-10'), description: 'Allen & Overy\'s Corporate M&A team is one of the most decorated in the Magic Circle — ranked Tier 1 by Legal 500 and Chambers for UK and cross-border M&A. We are seeking a Senior Solicitor (3–6 PQE) to join our London team, advising on high-value public and private M&A transactions, joint ventures, and private equity deals across Europe, the Middle East, and Asia.', requirements: '• 3–6 years PQE in corporate M&A at a top-tier UK or international law firm\n• Strong technical knowledge of UK company law, takeover code, and deal mechanics\n• Experience advising on cross-border transactions is highly desirable\n• Excellent drafting and negotiation skills\n• Ability to manage multiple high-pressure transactions simultaneously\n• Strong academic record — 2:1 or above from a leading university', responsibilities: '• Advise on full spectrum of corporate transactions: public and private M&A, PE buyouts, joint ventures\n• Draft and negotiate transaction documents including SPAs, investment agreements, and shareholder deeds\n• Lead due diligence processes and coordinate specialist legal workstreams\n• Manage client relationships day-to-day, with partner oversight\n• Supervise and develop trainee solicitors and junior associates\n• Contribute to business development activities and thought leadership', skills: ['Contract Law', 'Legal Research', 'Compliance'] },
      { title: 'Series Producer — Factual Entertainment', company_domain: 'itv.com', seniority_level: 'SENIOR' as const, employment_type: 'FULL_TIME' as const, work_mode: 'ONSITE' as const, location_city: 'London', location_country: 'United Kingdom', region: 'EMEA', salary_min: 65000, salary_max: 90000, salary_currency: 'GBP', status: 'ACTIVE' as const, source: 'COMPANY_WEBSITE' as const, urgency: 'NORMAL' as const, posted_date: new Date('2026-03-08'), description: 'ITV Studios is developing a new slate of primetime factual entertainment formats for ITV1 and ITVX. We are looking for an experienced Series Producer to lead the production of a 6-part documentary series from development through delivery. You will have full editorial and production management responsibility, working closely with the Commissioning Editor and a production team of 20.', requirements: '• 8+ years of TV production experience, with at least 2 as Series Producer or Senior AP\n• Strong editorial track record in factual or factual entertainment\n• Experience managing production budgets of £1M+ per series\n• Excellent talent management and interview skills\n• Understanding of Ofcom regulations and broadcast compliance\n• Experience shooting in complex or sensitive environments preferred', responsibilities: '• Lead editorial development of the series from treatment to delivery\n• Manage a production team of 20, including Producers, APs, and researchers\n• Own the production budget (£2M series budget) and delivery schedule\n• Build and manage relationships with contributors, talent, and access partners\n• Oversee edit and ensure series meets ITV\'s editorial and technical standards\n• Coordinate with Legal and Compliance on clearances and Ofcom obligations', skills: ['Broadcast Production', 'Content Marketing'] },
      { title: 'Band 7 Clinical Nurse Specialist', company_domain: 'england.nhs.uk', seniority_level: 'SENIOR' as const, employment_type: 'FULL_TIME' as const, work_mode: 'ONSITE' as const, location_city: 'London', location_country: 'United Kingdom', region: 'EMEA', salary_min: 43742, salary_max: 50056, salary_currency: 'GBP', status: 'ACTIVE' as const, source: 'COMPANY_WEBSITE' as const, urgency: 'IMMEDIATE' as const, posted_date: new Date('2026-03-01'), description: 'NHS England is seeking a Band 7 Clinical Nurse Specialist (CNS) to join our Oncology team at a leading London NHS Trust. You will provide expert clinical nursing care, patient education, and multi-disciplinary support for patients undergoing cancer treatment. This is a pivotal patient-facing role supporting individuals through some of the most challenging moments of their lives.', requirements: '• Registered Nurse (Part 1 NMC Register) — active PIN required\n• Degree in Nursing (or equivalent post-registration qualification)\n• Minimum 3 years post-registration experience in an oncology or acute setting\n• Independent/supplementary prescriber qualification desirable\n• Non-medical prescribing qualification or willingness to work towards it\n• Excellent communication and emotional resilience', responsibilities: '• Act as first point of contact for a caseload of 80+ oncology patients through their treatment pathway\n• Provide specialist nursing assessments, advice, and care coordination\n• Conduct nurse-led clinics and manage symptom control independently\n• Liaise with consultants, allied health professionals, and palliative care teams\n• Deliver patient and carer education and psychological support\n• Contribute to service development, audit, and clinical governance activities', skills: ['Nursing', 'Clinical Research'] },
      { title: 'Operations Manager — Fulfilment Centre', company_domain: 'amazon.co.uk', seniority_level: 'MANAGER' as const, employment_type: 'FULL_TIME' as const, work_mode: 'ONSITE' as const, location_city: 'Coventry', location_country: 'United Kingdom', region: 'EMEA', salary_min: 55000, salary_max: 70000, salary_currency: 'GBP', status: 'ACTIVE' as const, source: 'COMPANY_WEBSITE' as const, urgency: 'HIGH' as const, posted_date: new Date('2026-03-12'), description: 'Amazon UK is looking for an Operations Manager to lead a 200-person shift at our Coventry Fulfilment Centre — one of our highest-throughput sites processing 500,000+ units per day. You will own all aspects of your shift\'s operational performance: safety, quality, productivity, and people.', requirements: '• 5+ years operations management experience in warehousing, logistics, or manufacturing\n• Strong data-driven decision making — comfortable with Excel and operational metrics\n• Experience managing teams of 100+ direct and indirect reports\n• Lean / Six Sigma Green Belt or equivalent continuous improvement experience preferred\n• Strong communication skills — you can motivate a team on the floor and present data to Senior Leadership\n• Flexibility to work rotating shifts including nights and weekends', responsibilities: '• Own safety, quality, and productivity KPIs for a 200-person shift\n• Lead daily team huddles and manage shift handovers\n• Identify and implement process improvements to drive throughput\n• Manage workforce planning, including agency headcount flex\n• Conduct root cause analysis on safety incidents, quality defects, and productivity shortfalls\n• Develop Team Leads through regular 1-1s and structured development plans', skills: ['Supply Chain Management', 'Agile'] },
      { title: 'Head of HR — UK & Ireland', company_domain: 'compass-group.co.uk', seniority_level: 'SENIOR' as const, employment_type: 'FULL_TIME' as const, work_mode: 'HYBRID' as const, location_city: 'London', location_country: 'United Kingdom', region: 'EMEA', salary_min: 85000, salary_max: 105000, salary_currency: 'GBP', status: 'ACTIVE' as const, source: 'LINKEDIN' as const, urgency: 'NORMAL' as const, posted_date: new Date('2026-02-25'), description: 'Compass Group is the world\'s largest contract catering company. We are seeking a Head of HR for our UK & Ireland business — a £1.8B revenue operation with 45,000 employees across healthcare, education, defence, and corporate catering sectors. You will partner directly with the UK CEO and Executive team to drive the people strategy for one of the most complex, geographically dispersed workforces in UK hospitality.', requirements: '• CIPD Level 7 qualified\n• 10+ years HR generalist experience, with 5+ at senior HR Business Partner or Head of HR level\n• Experience in a large, blue-collar or shift-based workforce is highly valued\n• Proven track record in talent strategy, TUPE management, and ER\n• Strong commercial acumen — you connect people strategy to business outcomes\n• Experience of working with Trade Unions preferred', responsibilities: '• Partner the UK CEO and ExCo on all people matters — org design, succession planning, talent strategy\n• Lead a team of 12 HR BPs and Advisors\n• Own the UK annual HR plan across TA, L&D, ER, Reward, and Wellbeing\n• Drive DEI strategy and reporting across a diverse 45,000-person workforce\n• Lead complex ER casework and TUPE transfers (Compass onboards 50+ new contracts per year)\n• Represent HR on the UK Operating Board and in Group HR leadership forums', skills: ['HR Management', 'Talent Acquisition', 'Compliance'] },
      { title: 'Digital Marketing Manager', company_domain: 'asos.com', seniority_level: 'MID' as const, employment_type: 'FULL_TIME' as const, work_mode: 'HYBRID' as const, location_city: 'London', location_country: 'United Kingdom', region: 'EMEA', salary_min: 50000, salary_max: 65000, salary_currency: 'GBP', status: 'ACTIVE' as const, source: 'LINKEDIN' as const, urgency: 'NORMAL' as const, posted_date: new Date('2026-03-15'), description: 'ASOS is hiring a Digital Marketing Manager to own performance and growth marketing channels for the UK market. You will manage a £15M annual paid media budget across search, social, programmatic, and affiliates, working with our agency partners and internal creative team to drive customer acquisition and retention at efficient cost.', requirements: '• 4+ years digital marketing experience, with hands-on paid media management\n• Expert in Google Ads, Meta Ads, and programmatic display buying\n• Proficient with analytics tools — GA4, Looker, and attribution modelling\n• Strong SEO understanding (technical and content)\n• Experience in e-commerce or retail preferred\n• Data-first mindset — you optimise daily based on performance data', responsibilities: '• Own and manage £15M UK paid media budget across search, social, and programmatic\n• Develop and execute seasonal campaign plans aligned with buying and marketing calendar\n• Lead performance review calls with agency partners weekly\n• Build dashboards and report on CAC, ROAS, and LTV to CMO\n• Collaborate with content and creative teams on ad copy and creative testing\n• Drive SEO improvements in partnership with the technical team', skills: ['SEO', 'PPC', 'Content Marketing'] },
      { title: 'Compliance Officer — Financial Crime', company_domain: 'revolut.com', seniority_level: 'MID' as const, employment_type: 'FULL_TIME' as const, work_mode: 'HYBRID' as const, location_city: 'London', location_country: 'United Kingdom', region: 'EMEA', salary_min: 65000, salary_max: 85000, salary_currency: 'GBP', status: 'ACTIVE' as const, source: 'LINKEDIN' as const, urgency: 'HIGH' as const, posted_date: new Date('2026-03-01'), description: 'Revolut\'s Compliance team is growing rapidly as we scale our banking operations across Europe. We are looking for a Compliance Officer specialising in Financial Crime to help us build and maintain a best-in-class AML, KYC, and sanctions compliance framework for a customer base of 45 million globally.', requirements: '• 3+ years compliance or AML experience in a regulated financial institution or fintech\n• ICA Certificate or Diploma in Compliance, AML, or Financial Crime preferred\n• Solid understanding of UK/EU AML regulations, POCA, and JMLSG guidance\n• Experience with KYC processes, transaction monitoring, and SAR filing\n• Strong analytical skills — comfortable working with large datasets\n• Experience in a fast-paced, high-growth environment preferred', responsibilities: '• Monitor and investigate transaction alerts from Revolut\'s automated TM system\n• Conduct enhanced due diligence (EDD) reviews on high-risk customers and businesses\n• File Suspicious Activity Reports (SARs) to the NCA as required\n• Maintain and update AML/KYC policies in line with regulatory changes\n• Support regulatory examinations and internal audits\n• Work closely with the product team to embed compliance controls into new features', skills: ['Compliance', 'GDPR', 'Legal Research'] },
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

    const matchPairsExtended = [
      // Emma Walsh → Head of Events at ExCeL
      { candidateIdx: 5, jobIdx: 5, overall_score: 0.94, skill_match_score: 0.97, experience_match_score: 0.93, location_match_score: 1.0, seniority_match_score: 1.0, salary_match_score: 0.95, status: 'SHORTLISTED' as const, ai_reasoning: 'Emma Walsh is an outstanding match for the Head of Events role at ExCeL London. She is literally employed there right now as Senior Events Manager — same venue, same client base, same software stack (Ungerboeck, Salesforce). Her 8 years of experience managing events up to 80,000 attendees maps perfectly to ExCeL\'s requirement for large-scale event delivery. Salary expectation (£55–70K) is squarely within the £65–80K band. The promotion from Senior Manager to Head is a natural step. The main consideration is internal dynamics — ExCeL will need to decide whether they prefer internal promotion (Emma) or external hire. If she is actively looking externally it likely signals she has been passed over or is seeking faster progression. Recommend immediate shortlisting for a first-round conversation.' },
      // Marcus Brown → Hotel General Manager at Marriott Manchester
      { candidateIdx: 6, jobIdx: 6, overall_score: 0.91, skill_match_score: 0.93, experience_match_score: 0.95, location_match_score: 0.85, seniority_match_score: 0.95, salary_match_score: 0.88, status: 'SUGGESTED' as const, ai_reasoning: 'Marcus Brown is a highly credible match for the Hotel General Manager role at Marriott Manchester. His 12 years of luxury hospitality experience entirely within Marriott brand properties is a significant advantage — he knows the brand standards, PMS systems, and culture. His current property (350 rooms, £18M revenue) is comparable in scale to Manchester (298 rooms, £22M), with the Manchester role representing a meaningful step up in revenue responsibility. The RevPAR improvement track record (+22%) and TripAdvisor uplift (4.1 → 4.7) are exactly the metrics Marriott will be assessing. Only gap is relocation from London to Manchester — Marcus indicates openness to relocation which resolves this. Salary (£65–85K) is within the advertised band. Strong recommend for a structured interview process.' },
      // Zoe Henderson → Buying Manager at ASOS
      { candidateIdx: 7, jobIdx: 7, overall_score: 0.89, skill_match_score: 0.95, experience_match_score: 0.88, location_match_score: 1.0, seniority_match_score: 0.90, salary_match_score: 0.90, status: 'CONTACTED' as const, ai_reasoning: 'Zoe Henderson is a strong match for the Buying Manager — Womenswear role at ASOS. Her 9 years of buying experience, most recently as Senior Buyer at M&S with a £45M OTB, demonstrates she can manage the commercial and range complexity at ASOS scale (£120M OTB). The move from M&S to ASOS represents a natural step from traditional retail to fashion e-commerce, which is where the market is heading — Zoe has acknowledged this in her profile. Skill match is near-perfect: OTB management, supplier negotiation, markdown strategy, global sourcing are all confirmed. Team management experience (she supervises Buyers and ABs) satisfies the 3+ direct reports requirement. Seniority is a slight stretch (Senior to Manager) but 9 years of experience supports this. Contacted — recommend scheduling a commercial capability interview.' },
      // Raj Patel → Senior CDM at AstraZeneca
      { candidateIdx: 8, jobIdx: 8, overall_score: 0.92, skill_match_score: 0.94, experience_match_score: 0.90, location_match_score: 1.0, seniority_match_score: 0.95, salary_match_score: 0.92, status: 'SHORTLISTED' as const, ai_reasoning: 'Raj Patel is an excellent match for the Senior Clinical Data Manager role at AstraZeneca Cambridge. His current role as Clinical Data Manager at AstraZeneca itself means he has full domain alignment — same therapeutic areas (oncology), same EDC platform (Medidata Rave), same regulatory environment. This is effectively an internal promotion match. Salary expectation (£55–75K) is within the advertised £60–80K band. GCP certification, MedDRA/WHODrug experience, and CDISC standards knowledge are all confirmed. The only consideration is whether AstraZeneca\'s internal promotion process is already tracking Raj — if so, a direct approach from the recruiting manager may short-circuit the external search. Recommend immediate shortlist and stakeholder conversation.' },
      // Charlotte Davies → Brand Marketing Director at ASOS
      { candidateIdx: 9, jobIdx: 10, overall_score: 0.87, skill_match_score: 0.90, experience_match_score: 0.92, location_match_score: 1.0, seniority_match_score: 1.0, salary_match_score: 0.85, status: 'SUGGESTED' as const, ai_reasoning: 'Charlotte Davies is a compelling match for the Brand Marketing Director role at ASOS. Her 14 years of brand leadership — including global campaigns at Unilever (Dove) and marketing experience at TfL — gives her breadth across FMCG and consumer services that ASOS needs as it repositions beyond pure fashion. Current seniority (Director) is a direct match. The key question mark is fashion retail experience: Charlotte\'s background is FMCG and agency-side rather than fashion e-commerce specifically. However, her Publicis Sapient retail client work partially bridges this gap. Salary expectation (£110–140K) aligns with the upper end of the range. She is currently passive, meaning approach needs to be warm and opportunity-framed rather than transactional. Recommend a confidential introductory call to assess interest before formal shortlisting.' },
      // Oliver Jenkins → Senior QS at Barratt
      { candidateIdx: 10, jobIdx: 9, overall_score: 0.90, skill_match_score: 0.93, experience_match_score: 0.88, location_match_score: 1.0, seniority_match_score: 0.95, salary_match_score: 0.93, status: 'SHORTLISTED' as const, ai_reasoning: 'Oliver Jenkins is a strong match for the Senior Quantity Surveyor role at Barratt Midlands. His 5 years of residential housebuilding QS experience at Barratt itself (same company, same division) means he already understands the processes, software, and procurement frameworks. The current project (280 units, £62M GDV) is directly comparable to the advertised role (350 homes, £78M GDV), with the latter representing a clear step up. MRICS (APC) qualification confirms professional standing. Technical skills — CostX, subcontractor management, JCT contracts — all match the requirements. Salary expectation (£45–60K) is within the £55–72K band. Strong recommend: this is a high-probability match with minimal onboarding risk.' },
      // Aisha Okafor → Head of HR at Compass Group
      { candidateIdx: 11, jobIdx: 15, overall_score: 0.88, skill_match_score: 0.91, experience_match_score: 0.85, location_match_score: 1.0, seniority_match_score: 0.92, salary_match_score: 0.90, status: 'SUGGESTED' as const, ai_reasoning: 'Aisha Okafor is a credible match for the Head of HR — UK & Ireland role at Compass Group. Her leadership of HR for 3,600 employees at ASOS demonstrates she can operate at director level in a complex, people-intensive business. CIPD Level 7 and 10 years of generalist experience satisfy the core requirements. The key gap is blue-collar / shift-based workforce experience: her ASOS background is predominantly office-based and tech-enabled. Compass\'s 45,000-strong catering workforce across healthcare, defence, and education is a very different people challenge. That said, her DEI and graduate scheme credentials show strong people-first instincts. Salary expectation (£85–110K) is within the £85–105K band. Recommend exploring her blue-collar exposure in a first interview before advancing to shortlist.' },
      // Jack Morrison → Series Producer at ITV
      { candidateIdx: 12, jobIdx: 12, overall_score: 0.93, skill_match_score: 0.96, experience_match_score: 0.92, location_match_score: 1.0, seniority_match_score: 1.0, salary_match_score: 0.90, status: 'SHORTLISTED' as const, ai_reasoning: 'Jack Morrison is an excellent match for the Series Producer — Factual Entertainment role at ITV. He is currently a Senior Broadcast Producer at ITV itself, with BAFTA-nominated credits and a track record of managing production teams up to peak viewing figures of 3.2M. His production budget experience (up to £2.5M per series) matches the £2M series budget requirement. Seniority is a direct step up: Senior Producer → Series Producer is the natural progression path in UK broadcasting. Editorial skills, talent relationships, and compliance knowledge are all confirmed. Salary expectation (£65–85K) is within the advertised range. This is an internally trackable candidate — recommend confirming with the Commissioning Editor whether Jack is already being tracked through ITV\'s internal talent programme before commencing external process.' },
    ]

    await Promise.all(
      [...matchPairs, ...matchPairsExtended].map(({ candidateIdx, jobIdx, ...scores }) => {
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
