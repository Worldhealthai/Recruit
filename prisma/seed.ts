// prisma/seed.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // ─── Skills ───────────────────────────────────────────────────────────────
  const skills = await Promise.all([
    prisma.skill.upsert({ where: { name: 'TypeScript' },    update: {}, create: { name: 'TypeScript',    category: 'Engineering', subcategory: 'Languages',   aliases: ['TS'] } }),
    prisma.skill.upsert({ where: { name: 'Python' },        update: {}, create: { name: 'Python',        category: 'Engineering', subcategory: 'Languages',   aliases: ['py'] } }),
    prisma.skill.upsert({ where: { name: 'React' },         update: {}, create: { name: 'React',         category: 'Engineering', subcategory: 'Frontend',    aliases: ['ReactJS', 'React.js'] } }),
    prisma.skill.upsert({ where: { name: 'Node.js' },       update: {}, create: { name: 'Node.js',       category: 'Engineering', subcategory: 'Backend',     aliases: ['NodeJS', 'Node'] } }),
    prisma.skill.upsert({ where: { name: 'PostgreSQL' },    update: {}, create: { name: 'PostgreSQL',    category: 'Engineering', subcategory: 'Databases',   aliases: ['Postgres', 'psql'] } }),
    prisma.skill.upsert({ where: { name: 'AWS' },           update: {}, create: { name: 'AWS',           category: 'Engineering', subcategory: 'Cloud',       aliases: ['Amazon Web Services'] } }),
    prisma.skill.upsert({ where: { name: 'Docker' },        update: {}, create: { name: 'Docker',        category: 'Engineering', subcategory: 'DevOps',      aliases: ['containerisation'] } }),
    prisma.skill.upsert({ where: { name: 'Kubernetes' },    update: {}, create: { name: 'Kubernetes',    category: 'Engineering', subcategory: 'DevOps',      aliases: ['K8s'] } }),
    prisma.skill.upsert({ where: { name: 'Product Management', }, update: {}, create: { name: 'Product Management', category: 'Product', subcategory: 'Strategy', aliases: ['PM'] } }),
    prisma.skill.upsert({ where: { name: 'Data Analysis' }, update: {}, create: { name: 'Data Analysis', category: 'Data',        subcategory: 'Analytics',   aliases: ['Analytics'] } }),
    prisma.skill.upsert({ where: { name: 'Machine Learning' }, update: {}, create: { name: 'Machine Learning', category: 'Data', subcategory: 'AI/ML',    aliases: ['ML'] } }),
    prisma.skill.upsert({ where: { name: 'SQL' },           update: {}, create: { name: 'SQL',           category: 'Engineering', subcategory: 'Databases',   aliases: [] } }),
    prisma.skill.upsert({ where: { name: 'Java' },          update: {}, create: { name: 'Java',          category: 'Engineering', subcategory: 'Languages',   aliases: [] } }),
    prisma.skill.upsert({ where: { name: 'Go' },            update: {}, create: { name: 'Go',            category: 'Engineering', subcategory: 'Languages',   aliases: ['Golang'] } }),
    prisma.skill.upsert({ where: { name: 'Figma' },         update: {}, create: { name: 'Figma',         category: 'Design',      subcategory: 'UI/UX',       aliases: [] } }),
  ])

  const skillMap: Record<string, string> = {}
  skills.forEach(s => { skillMap[s.name] = s.id })

  // ─── Companies ────────────────────────────────────────────────────────────
  const companiesData = [
    {
      name: 'Monzo Bank',
      domain: 'monzo.com',
      industry: 'Fintech',
      sector: 'Financial Services',
      sub_sector: 'Digital Banking',
      company_size: 'MID_MARKET' as const,
      employee_count: 3000,
      headquarters_city: 'London',
      headquarters_country: 'United Kingdom',
      region: 'EMEA',
      tech_stack: ['Kubernetes', 'Go', 'PostgreSQL', 'Kafka'],
      culture_tags: ['remote-friendly', 'mission-driven', 'inclusive'],
      glassdoor_rating: 4.3,
      founded_year: 2015,
    },
    {
      name: 'Revolut',
      domain: 'revolut.com',
      industry: 'Fintech',
      sector: 'Financial Services',
      sub_sector: 'Payments',
      company_size: 'ENTERPRISE' as const,
      employee_count: 8000,
      headquarters_city: 'London',
      headquarters_country: 'United Kingdom',
      region: 'EMEA',
      tech_stack: ['Java', 'Kotlin', 'AWS', 'PostgreSQL'],
      culture_tags: ['fast-paced', 'high-performance', 'global'],
      glassdoor_rating: 3.8,
      founded_year: 2015,
    },
    {
      name: 'Deliveroo',
      domain: 'deliveroo.com',
      industry: 'Food Tech',
      sector: 'Technology',
      sub_sector: 'On-Demand Delivery',
      company_size: 'ENTERPRISE' as const,
      employee_count: 5000,
      headquarters_city: 'London',
      headquarters_country: 'United Kingdom',
      region: 'EMEA',
      tech_stack: ['Ruby', 'React', 'AWS', 'PostgreSQL', 'Python'],
      culture_tags: ['collaborative', 'data-driven', 'customer-first'],
      glassdoor_rating: 3.6,
      founded_year: 2013,
    },
    {
      name: 'Wise',
      domain: 'wise.com',
      industry: 'Fintech',
      sector: 'Financial Services',
      sub_sector: 'Remittances',
      company_size: 'MID_MARKET' as const,
      employee_count: 4500,
      headquarters_city: 'London',
      headquarters_country: 'United Kingdom',
      region: 'EMEA',
      tech_stack: ['Java', 'React', 'AWS', 'PostgreSQL'],
      culture_tags: ['transparent', 'customer-obsessed', 'global'],
      glassdoor_rating: 4.5,
      founded_year: 2011,
    },
    {
      name: 'Checkout.com',
      domain: 'checkout.com',
      industry: 'Fintech',
      sector: 'Financial Services',
      sub_sector: 'Payments Infrastructure',
      company_size: 'MID_MARKET' as const,
      employee_count: 1800,
      headquarters_city: 'London',
      headquarters_country: 'United Kingdom',
      region: 'EMEA',
      tech_stack: ['C#', '.NET', 'AWS', 'PostgreSQL', 'Kubernetes'],
      culture_tags: ['innovative', 'diverse', 'growth-focused'],
      glassdoor_rating: 4.1,
      founded_year: 2012,
    },
  ]

  const companies = await Promise.all(
    companiesData.map(c =>
      prisma.company.upsert({ where: { domain: c.domain }, update: {}, create: c })
    )
  )

  const [monzo, revolut, deliveroo, wise] = companies

  // ─── Departments ──────────────────────────────────────────────────────────
  const [engDeptMonzo, productDeptMonzo] = await Promise.all([
    prisma.department.upsert({
      where: { id: 'dept-eng-monzo' },
      update: {},
      create: { id: 'dept-eng-monzo', company_id: monzo.id, name: 'Engineering', head_count: 800 },
    }),
    prisma.department.upsert({
      where: { id: 'dept-product-monzo' },
      update: {},
      create: { id: 'dept-product-monzo', company_id: monzo.id, name: 'Product', head_count: 120 },
    }),
  ])

  // ─── Candidates ───────────────────────────────────────────────────────────
  const candidatesData = [
    {
      id: 'cand-001',
      first_name: 'Sarah',
      last_name: 'Chen',
      email: 'sarah.chen@example.com',
      linkedin_url: 'https://linkedin.com/in/sarah-chen',
      current_title: 'Senior Software Engineer',
      current_company_id: monzo.id,
      seniority_level: 'SENIOR' as const,
      location_city: 'London',
      location_country: 'United Kingdom',
      region: 'EMEA',
      is_remote_open: true,
      salary_current: 110000,
      salary_expectation_min: 120000,
      salary_expectation_max: 145000,
      notice_period_days: 30,
      years_experience: 7,
      availability_status: 'OPEN_TO_OFFERS' as const,
      summary: 'Senior engineer with deep expertise in distributed systems and fintech platforms. Built core payment infrastructure handling millions of daily transactions.',
      source: 'LINKEDIN' as const,
      skills: [
        { name: 'Go', proficiency: 'EXPERT' as const, years_used: 5, is_primary: true },
        { name: 'PostgreSQL', proficiency: 'ADVANCED' as const, years_used: 7 },
        { name: 'Kubernetes', proficiency: 'ADVANCED' as const, years_used: 4 },
        { name: 'AWS', proficiency: 'INTERMEDIATE' as const, years_used: 3 },
      ],
    },
    {
      id: 'cand-002',
      first_name: 'Marcus',
      last_name: 'Johnson',
      email: 'marcus.johnson@example.com',
      linkedin_url: 'https://linkedin.com/in/marcus-johnson',
      current_title: 'Staff Engineer',
      current_company_id: revolut.id,
      seniority_level: 'SENIOR' as const,
      location_city: 'London',
      location_country: 'United Kingdom',
      region: 'EMEA',
      is_remote_open: true,
      salary_current: 145000,
      salary_expectation_min: 160000,
      salary_expectation_max: 190000,
      notice_period_days: 60,
      years_experience: 12,
      availability_status: 'PASSIVE' as const,
      summary: 'Staff engineer specialising in high-throughput payment systems and Java microservices. Led migration of monolithic architecture to microservices at Revolut.',
      source: 'REFERRAL' as const,
      skills: [
        { name: 'Java', proficiency: 'EXPERT' as const, years_used: 12, is_primary: true },
        { name: 'AWS', proficiency: 'EXPERT' as const, years_used: 8 },
        { name: 'Kubernetes', proficiency: 'ADVANCED' as const, years_used: 5 },
        { name: 'PostgreSQL', proficiency: 'ADVANCED' as const, years_used: 10 },
      ],
    },
    {
      id: 'cand-003',
      first_name: 'Priya',
      last_name: 'Patel',
      email: 'priya.patel@example.com',
      linkedin_url: 'https://linkedin.com/in/priya-patel',
      current_title: 'Product Manager',
      current_company_id: deliveroo.id,
      seniority_level: 'MID' as const,
      location_city: 'London',
      location_country: 'United Kingdom',
      region: 'EMEA',
      is_remote_open: false,
      salary_current: 85000,
      salary_expectation_min: 95000,
      salary_expectation_max: 115000,
      notice_period_days: 30,
      years_experience: 5,
      availability_status: 'ACTIVELY_LOOKING' as const,
      summary: 'Product manager with a track record in consumer marketplace products and data-driven growth. Launched features used by 5M+ monthly active users.',
      source: 'LINKEDIN' as const,
      skills: [
        { name: 'Product Management', proficiency: 'ADVANCED' as const, years_used: 5, is_primary: true },
        { name: 'Data Analysis', proficiency: 'INTERMEDIATE' as const, years_used: 4 },
        { name: 'SQL', proficiency: 'INTERMEDIATE' as const, years_used: 3 },
      ],
    },
    {
      id: 'cand-004',
      first_name: 'James',
      last_name: 'O\'Brien',
      email: 'james.obrien@example.com',
      linkedin_url: 'https://linkedin.com/in/james-obrien',
      current_title: 'Machine Learning Engineer',
      current_company_id: wise.id,
      seniority_level: 'MID' as const,
      location_city: 'London',
      location_country: 'United Kingdom',
      region: 'EMEA',
      is_remote_open: true,
      salary_current: 95000,
      salary_expectation_min: 110000,
      salary_expectation_max: 130000,
      notice_period_days: 30,
      years_experience: 4,
      availability_status: 'OPEN_TO_OFFERS' as const,
      summary: 'ML engineer focused on NLP and fraud detection models. Reduced false-positive fraud rate by 40% through ensemble modelling at Wise.',
      source: 'WEBSITE' as const,
      skills: [
        { name: 'Python', proficiency: 'EXPERT' as const, years_used: 4, is_primary: true },
        { name: 'Machine Learning', proficiency: 'ADVANCED' as const, years_used: 4 },
        { name: 'SQL', proficiency: 'ADVANCED' as const, years_used: 4 },
        { name: 'AWS', proficiency: 'INTERMEDIATE' as const, years_used: 2 },
      ],
    },
    {
      id: 'cand-005',
      first_name: 'Aisha',
      last_name: 'Williams',
      email: 'aisha.williams@example.com',
      linkedin_url: 'https://linkedin.com/in/aisha-williams',
      current_title: 'Frontend Engineer',
      current_company_id: null,
      seniority_level: 'JUNIOR' as const,
      location_city: 'Manchester',
      location_country: 'United Kingdom',
      region: 'EMEA',
      is_remote_open: true,
      is_relocation_open: true,
      salary_current: 42000,
      salary_expectation_min: 50000,
      salary_expectation_max: 65000,
      notice_period_days: 14,
      years_experience: 2,
      availability_status: 'ACTIVELY_LOOKING' as const,
      summary: 'Frontend engineer passionate about accessible, performant UIs. Built component libraries and contributed to open-source React projects.',
      source: 'INDEED' as const,
      skills: [
        { name: 'React', proficiency: 'ADVANCED' as const, years_used: 2, is_primary: true },
        { name: 'TypeScript', proficiency: 'INTERMEDIATE' as const, years_used: 2 },
        { name: 'Figma', proficiency: 'INTERMEDIATE' as const, years_used: 1 },
      ],
    },
  ]

  for (const { skills: candidateSkills, ...candidateData } of candidatesData) {
    const candidate = await prisma.candidate.upsert({
      where: { id: candidateData.id },
      update: {},
      create: candidateData as any,
    })

    for (const sk of candidateSkills) {
      const skillId = skillMap[sk.name]
      if (!skillId) continue
      await prisma.candidateSkill.upsert({
        where: { candidate_id_skill_id: { candidate_id: candidate.id, skill_id: skillId } },
        update: {},
        create: {
          candidate_id: candidate.id,
          skill_id: skillId,
          proficiency: sk.proficiency,
          years_used: sk.years_used,
          is_primary: sk.is_primary ?? false,
        },
      })
    }
  }

  // ─── Jobs ─────────────────────────────────────────────────────────────────
  const jobsData = [
    {
      id: 'job-001',
      title: 'Senior Backend Engineer (Go)',
      company_id: monzo.id,
      department_id: engDeptMonzo.id,
      description: 'Join Monzo\'s core banking team to build and scale financial infrastructure used by millions. You will design and implement high-availability services, collaborate with cross-functional squads, and contribute to an engineering culture renowned across the industry.',
      requirements: '5+ years backend experience. Strong Go skills. Experience with distributed systems and microservices at scale.',
      responsibilities: 'Design and build core payment APIs. Mentor junior engineers. Drive architectural decisions within your squad.',
      seniority_level: 'SENIOR' as const,
      employment_type: 'FULL_TIME' as const,
      work_mode: 'HYBRID' as const,
      location_city: 'London',
      location_country: 'United Kingdom',
      region: 'EMEA',
      salary_min: 115000,
      salary_max: 145000,
      salary_currency: 'GBP',
      salary_period: 'ANNUAL' as const,
      equity_offered: true,
      urgency: 'HIGH' as const,
      status: 'ACTIVE' as const,
      source: 'RECRUITER_POSTED' as const,
      posted_date: new Date('2026-03-01'),
      skills: [
        { name: 'Go', importance: 'REQUIRED' as const, min_years: 3 },
        { name: 'PostgreSQL', importance: 'REQUIRED' as const, min_years: 3 },
        { name: 'Kubernetes', importance: 'PREFERRED' as const, min_years: 2 },
        { name: 'AWS', importance: 'NICE_TO_HAVE' as const },
      ],
    },
    {
      id: 'job-002',
      title: 'Staff Engineer — Payments',
      company_id: revolut.id,
      department_id: null,
      description: 'Lead the architecture of Revolut\'s next-generation payments platform. You will define technical strategy, partner with product and compliance, and mentor a team of senior engineers building systems that process billions in daily volume.',
      requirements: '10+ years engineering. Expert Java/JVM. Track record leading large engineering teams and cross-cutting initiatives.',
      responsibilities: 'Own the technical vision for payments infrastructure. Recruit and grow a team of 15+ engineers. Define coding standards and review processes.',
      seniority_level: 'SENIOR' as const,
      employment_type: 'FULL_TIME' as const,
      work_mode: 'HYBRID' as const,
      location_city: 'London',
      location_country: 'United Kingdom',
      region: 'EMEA',
      salary_min: 160000,
      salary_max: 200000,
      salary_currency: 'GBP',
      salary_period: 'ANNUAL' as const,
      equity_offered: true,
      urgency: 'IMMEDIATE' as const,
      status: 'ACTIVE' as const,
      source: 'RECRUITER_POSTED' as const,
      posted_date: new Date('2026-02-15'),
      skills: [
        { name: 'Java', importance: 'REQUIRED' as const, min_years: 8 },
        { name: 'AWS', importance: 'REQUIRED' as const, min_years: 5 },
        { name: 'Kubernetes', importance: 'REQUIRED' as const, min_years: 3 },
        { name: 'PostgreSQL', importance: 'PREFERRED' as const },
      ],
    },
    {
      id: 'job-003',
      title: 'Senior Product Manager — Growth',
      company_id: deliveroo.id,
      department_id: null,
      description: 'Drive Deliveroo\'s consumer growth through data-informed product strategy. You will own the acquisition and retention funnel, run rapid experimentation programmes, and collaborate with engineering, data science, and marketing.',
      requirements: '5+ years product management in consumer tech. Strong analytical skills and comfort with A/B testing frameworks.',
      responsibilities: 'Own the consumer growth roadmap. Run 10+ concurrent A/B experiments. Present quarterly business reviews to exec team.',
      seniority_level: 'SENIOR' as const,
      employment_type: 'FULL_TIME' as const,
      work_mode: 'HYBRID' as const,
      location_city: 'London',
      location_country: 'United Kingdom',
      region: 'EMEA',
      salary_min: 95000,
      salary_max: 120000,
      salary_currency: 'GBP',
      salary_period: 'ANNUAL' as const,
      equity_offered: true,
      urgency: 'NORMAL' as const,
      status: 'ACTIVE' as const,
      source: 'COMPANY_WEBSITE' as const,
      posted_date: new Date('2026-03-10'),
      skills: [
        { name: 'Product Management', importance: 'REQUIRED' as const, min_years: 5 },
        { name: 'Data Analysis', importance: 'REQUIRED' as const, min_years: 3 },
        { name: 'SQL', importance: 'PREFERRED' as const },
      ],
    },
    {
      id: 'job-004',
      title: 'Machine Learning Engineer — Fraud',
      company_id: wise.id,
      department_id: null,
      description: 'Build and deploy production ML systems that protect millions of Wise customers from fraud. You will iterate on real-time risk models, collaborate with data engineers to build feature pipelines, and partner with compliance on model explainability.',
      requirements: '3+ years ML engineering in production environments. Strong Python and MLOps skills. Experience with NLP or anomaly detection.',
      responsibilities: 'Develop and ship fraud detection models. Build real-time feature engineering pipelines. Maintain model monitoring dashboards.',
      seniority_level: 'MID' as const,
      employment_type: 'FULL_TIME' as const,
      work_mode: 'HYBRID' as const,
      location_city: 'London',
      location_country: 'United Kingdom',
      region: 'EMEA',
      salary_min: 100000,
      salary_max: 130000,
      salary_currency: 'GBP',
      salary_period: 'ANNUAL' as const,
      equity_offered: true,
      urgency: 'HIGH' as const,
      status: 'ACTIVE' as const,
      source: 'RECRUITER_POSTED' as const,
      posted_date: new Date('2026-03-05'),
      skills: [
        { name: 'Python', importance: 'REQUIRED' as const, min_years: 3 },
        { name: 'Machine Learning', importance: 'REQUIRED' as const, min_years: 3 },
        { name: 'SQL', importance: 'REQUIRED' as const, min_years: 2 },
        { name: 'AWS', importance: 'PREFERRED' as const },
      ],
    },
    {
      id: 'job-005',
      title: 'Frontend Engineer (React/TypeScript)',
      company_id: monzo.id,
      department_id: engDeptMonzo.id,
      description: 'Help build Monzo\'s web banking experience — one of the most-loved consumer apps in the UK. You will work on design-system components, customer-facing features, and internal tooling, always with accessibility and performance as a priority.',
      requirements: '2+ years React/TypeScript. Passion for UX and accessibility. Experience with testing libraries.',
      responsibilities: 'Build and maintain React components. Collaborate with designers. Own the web performance budget for your squad.',
      seniority_level: 'MID' as const,
      employment_type: 'FULL_TIME' as const,
      work_mode: 'HYBRID' as const,
      location_city: 'London',
      location_country: 'United Kingdom',
      region: 'EMEA',
      salary_min: 70000,
      salary_max: 95000,
      salary_currency: 'GBP',
      salary_period: 'ANNUAL' as const,
      equity_offered: true,
      urgency: 'NORMAL' as const,
      status: 'ACTIVE' as const,
      source: 'RECRUITER_POSTED' as const,
      posted_date: new Date('2026-03-15'),
      skills: [
        { name: 'React', importance: 'REQUIRED' as const, min_years: 2 },
        { name: 'TypeScript', importance: 'REQUIRED' as const, min_years: 2 },
        { name: 'Figma', importance: 'NICE_TO_HAVE' as const },
      ],
    },
  ]

  for (const { skills: jobSkills, ...jobData } of jobsData) {
    const job = await prisma.job.upsert({
      where: { id: jobData.id },
      update: {},
      create: jobData as any,
    })

    for (const sk of jobSkills) {
      const skillId = skillMap[sk.name]
      if (!skillId) continue
      await prisma.jobSkill.upsert({
        where: { job_id_skill_id: { job_id: job.id, skill_id: skillId } },
        update: {},
        create: { job_id: job.id, skill_id: skillId, importance: sk.importance, min_years: sk.min_years ?? null },
      })
    }
  }

  // ─── Matches ──────────────────────────────────────────────────────────────
  await prisma.match.upsert({
    where: { candidate_id_job_id: { candidate_id: 'cand-001', job_id: 'job-001' } },
    update: {},
    create: {
      candidate_id: 'cand-001',
      job_id: 'job-001',
      overall_score: 0.93,
      skill_match_score: 0.96,
      experience_match_score: 0.92,
      location_match_score: 1.0,
      seniority_match_score: 1.0,
      salary_match_score: 0.88,
      culture_fit_score: 0.85,
      ai_reasoning: 'Strong match. Candidate has expert-level Go experience and deep Kubernetes/PostgreSQL knowledge directly relevant to Monzo\'s stack. Salary expectations are within range.',
      status: 'SHORTLISTED' as const,
    },
  })

  await prisma.match.upsert({
    where: { candidate_id_job_id: { candidate_id: 'cand-002', job_id: 'job-002' } },
    update: {},
    create: {
      candidate_id: 'cand-002',
      job_id: 'job-002',
      overall_score: 0.91,
      skill_match_score: 0.94,
      experience_match_score: 0.97,
      location_match_score: 1.0,
      seniority_match_score: 0.9,
      salary_match_score: 0.85,
      culture_fit_score: 0.82,
      ai_reasoning: 'Excellent match for the Staff Engineer role. 12 years Java experience and proven leadership at Revolut scale. Salary expectations slightly above top of band but negotiable.',
      status: 'CONTACTED' as const,
    },
  })

  await prisma.match.upsert({
    where: { candidate_id_job_id: { candidate_id: 'cand-003', job_id: 'job-003' } },
    update: {},
    create: {
      candidate_id: 'cand-003',
      job_id: 'job-003',
      overall_score: 0.87,
      skill_match_score: 0.90,
      experience_match_score: 0.85,
      location_match_score: 1.0,
      seniority_match_score: 0.8,
      salary_match_score: 0.92,
      culture_fit_score: 0.88,
      ai_reasoning: 'Good match. Consumer marketplace background at Deliveroo is highly relevant. Seniority slightly junior for a "Senior PM" role but growth trajectory is strong.',
      status: 'SUGGESTED' as const,
    },
  })

  await prisma.match.upsert({
    where: { candidate_id_job_id: { candidate_id: 'cand-004', job_id: 'job-004' } },
    update: {},
    create: {
      candidate_id: 'cand-004',
      job_id: 'job-004',
      overall_score: 0.95,
      skill_match_score: 0.97,
      experience_match_score: 0.93,
      location_match_score: 1.0,
      seniority_match_score: 1.0,
      salary_match_score: 0.91,
      culture_fit_score: 0.93,
      ai_reasoning: 'Exceptional match. Proven fraud/ML background at Wise — literally the same role. Python expert with real production ML systems.',
      status: 'SCREENING' as const,
    },
  })

  await prisma.match.upsert({
    where: { candidate_id_job_id: { candidate_id: 'cand-005', job_id: 'job-005' } },
    update: {},
    create: {
      candidate_id: 'cand-005',
      job_id: 'job-005',
      overall_score: 0.82,
      skill_match_score: 0.88,
      experience_match_score: 0.75,
      location_match_score: 0.9,
      seniority_match_score: 0.85,
      salary_match_score: 0.95,
      culture_fit_score: 0.80,
      ai_reasoning: 'Solid match. React/TypeScript skills align well. Based in Manchester — hybrid in London may require relocation consideration (candidate is open). Salary expectation is below band, leaving room.',
      status: 'SUGGESTED' as const,
    },
  })

  // ─── Recruiter ────────────────────────────────────────────────────────────
  await prisma.recruiter.upsert({
    where: { email: 'admin@recruitai.io' },
    update: {},
    create: {
      email: 'admin@recruitai.io',
      first_name: 'Alex',
      last_name: 'Recruitment',
      company_name: 'RecruitAI',
      role: 'ADMIN' as const,
      subscription_tier: 'PROFESSIONAL' as const,
      subscription_status: 'ACTIVE' as const,
      subscription_start: new Date('2026-01-01'),
      subscription_end: new Date('2027-01-01'),
      max_searches_per_month: 500,
      max_screening_calls_per_month: 100,
      max_candidates_saved: 2000,
    },
  })

  // ─── Market Insights ──────────────────────────────────────────────────────
  await prisma.marketInsight.createMany({
    skipDuplicates: true,
    data: [
      {
        insight_type: 'SALARY_BENCHMARK',
        title: 'UK Fintech Senior Engineer Salary Benchmarks Q1 2026',
        description: 'Salary ranges for senior software engineers in UK fintech have increased by 8% YoY, driven by demand in payments and banking infrastructure roles.',
        data_json: {
          percentile_25: 100000,
          percentile_50: 125000,
          percentile_75: 155000,
          currency: 'GBP',
        },
        industry: 'Fintech',
        region: 'EMEA',
        seniority_level: 'SENIOR',
        valid_from: new Date('2026-01-01'),
        valid_until: new Date('2026-06-30'),
        source: 'Internal aggregation — 2,400 data points',
      },
      {
        insight_type: 'SKILL_DEMAND',
        title: 'Go Language Demand Surge in UK Banking Tech',
        description: 'Demand for Go engineers in UK banking and fintech has grown 34% in 12 months, driven by microservices migration projects at challenger banks.',
        data_json: {
          growth_rate_yoy: 0.34,
          top_hirers: ['Monzo', 'Starling', 'Revolut'],
          avg_salary_premium_vs_java: 0.08,
        },
        industry: 'Fintech',
        region: 'EMEA',
        valid_from: new Date('2026-01-01'),
        source: 'Job posting analysis — 8,200 postings',
      },
      {
        insight_type: 'HIRING_TREND',
        title: 'Fintech ML Hiring Accelerating Q1 2026',
        description: 'Machine learning and AI engineering roles in UK fintech increased 52% YoY in Q1 2026, with fraud detection and risk modelling as the primary use cases.',
        data_json: {
          growth_rate_yoy: 0.52,
          top_use_cases: ['fraud_detection', 'credit_risk', 'kyc_automation'],
          avg_time_to_hire_days: 42,
        },
        industry: 'Fintech',
        region: 'EMEA',
        valid_from: new Date('2026-01-01'),
        source: 'Recruiter survey — 340 respondents',
      },
    ],
  })

  // ─── Data Source ──────────────────────────────────────────────────────────
  await prisma.dataSource.upsert({
    where: { id: 'ds-linkedin-001' },
    update: {},
    create: {
      id: 'ds-linkedin-001',
      platform: 'LINKEDIN' as const,
      name: 'LinkedIn Talent Insights',
      base_url: 'https://api.linkedin.com/v2',
      sync_frequency: 'DAILY' as const,
      status: 'ACTIVE' as const,
      records_synced: 12450,
      last_sync_at: new Date('2026-03-22T03:00:00Z'),
    },
  })

  console.log('✅ Seed complete.')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
