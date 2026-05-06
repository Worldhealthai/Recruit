import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export const runtime = 'nodejs'
export const maxDuration = 20

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM_PROMPT = `You are an expert recruiter search assistant. Parse the user's natural-language search query into structured filter parameters for a candidate database.

Extract the following fields if present (leave out fields not mentioned):
- q: general keyword search (name, title, company)
- title: specific job title or function (e.g. "Sales Executive", "Business Development Manager")
- location: city name
- country: country name
- seniority: one or more of INTERN, JUNIOR, MID, SENIOR, LEAD, MANAGER, SENIOR_MANAGER, DIRECTOR, VP, C_SUITE
- availability: one or more of ACTIVELY_LOOKING, OPEN_TO_OFFERS, PASSIVE
- skills: comma-separated list of specific skills
- industry: industry name matching standard industries
- remote: "1" if remote mentioned
- min_exp: minimum years experience (integer)
- max_exp: maximum years experience (integer)
- min_salary: minimum salary in GBP (number, no currency symbol)
- max_salary: maximum salary in GBP (number, no currency symbol)

Job title/function mapping examples:
- "sales", "sales exec", "sales executive", "SE" → title: "Sales Executive"
- "bdm", "business development", "business dev" → title: "Business Development"
- "account manager", "AM" → title: "Account Manager"
- "software engineer", "SWE", "developer", "dev" → title: "Software Engineer"
- "marketing manager", "marketing exec" → title: "Marketing"
- "product manager", "PM" → title: "Product Manager"
- "finance analyst", "finance", "financial analyst" → title: "Finance"
- "hr manager", "people", "talent" → title: "HR"
- "data analyst", "data scientist" → title: "Data"

Seniority keywords:
- "senior", "sr", "experienced" → SENIOR
- "junior", "jr", "graduate", "entry level" → JUNIOR
- "director" → DIRECTOR
- "manager" → MANAGER
- "vp", "vice president" → VP
- "c-suite", "cxo", "ceo", "cto", "cfo", "coo" → C_SUITE
- "lead" → LEAD

Availability:
- "actively looking", "available", "open to work", "job seeker" → ACTIVELY_LOOKING
- "open to offers", "open to opportunities", "passive" → OPEN_TO_OFFERS

Respond ONLY with a valid JSON object. No explanation, no markdown. Example:
{"title":"Sales Executive","location":"London","seniority":["SENIOR","MANAGER"],"availability":["ACTIVELY_LOOKING","OPEN_TO_OFFERS"]}`

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json()
    if (!query?.trim()) return NextResponse.json({})

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      // Fallback: basic keyword parsing without AI
      return NextResponse.json(fallbackParse(query))
    }

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: query }],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text.trim() : '{}'
    const parsed = JSON.parse(text)
    return NextResponse.json(parsed)
  } catch (err) {
    console.error('ai-search error:', err)
    return NextResponse.json(fallbackParse(''))
  }
}

// Simple keyword fallback when no API key
function fallbackParse(q: string): Record<string, string> {
  const lower = q.toLowerCase()
  const result: Record<string, string> = {}

  const titleMap: [string[], string][] = [
    [['sales exec', 'sales executive'], 'Sales Executive'],
    [['bdm', 'business development'], 'Business Development'],
    [['account manager', ' am '], 'Account Manager'],
    [['software engineer', 'developer', ' dev '], 'Software Engineer'],
    [['product manager', ' pm '], 'Product Manager'],
    [['marketing manager', 'marketing exec', 'digital marketing'], 'Marketing'],
    [['finance analyst', 'financial analyst'], 'Finance Analyst'],
    [['data analyst', 'data scientist'], 'Data'],
    [['hr manager', 'people ops', 'talent acquisition'], 'HR'],
  ]
  for (const [terms, title] of titleMap) {
    if (terms.some(t => lower.includes(t))) { result.title = title; break }
  }

  const cities = ['london', 'manchester', 'birmingham', 'leeds', 'edinburgh', 'bristol', 'liverpool', 'glasgow']
  for (const city of cities) {
    if (lower.includes(city)) { result.location = city.charAt(0).toUpperCase() + city.slice(1); break }
  }

  if (lower.includes('senior') || lower.includes(' sr ')) result.seniority = 'SENIOR'
  if (lower.includes('junior') || lower.includes(' jr ')) result.seniority = 'JUNIOR'
  if (lower.includes('director')) result.seniority = 'DIRECTOR'
  if (lower.includes('remote')) result.remote = '1'

  if (lower.includes('actively looking') || lower.includes('available')) result.availability = 'ACTIVELY_LOOKING'

  if (!result.title && q.trim()) result.q = q.trim()
  return result
}
