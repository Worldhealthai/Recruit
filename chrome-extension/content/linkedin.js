// LinkedIn profile scraper — runs on linkedin.com/in/*

window.__recruitAI.source = 'LINKEDIN'

function extractLinkedIn () {
  const text  = sel => document.querySelector(sel)?.innerText?.trim() || ''
  const texts = sel => [...document.querySelectorAll(sel)].map(el => el.innerText?.trim()).filter(Boolean)

  // ── Name ────────────────────────────────────────────────────────────────────
  const fullName = text('h1')
  const nameParts = fullName.split(' ')
  const first_name = nameParts[0] || ''
  const last_name  = nameParts.slice(1).join(' ') || ''

  // ── Headline / title ────────────────────────────────────────────────────────
  const current_title = text('.text-body-medium.break-words') ||
                        text('[data-generated-suggestion-target] .text-body-medium') || ''

  // ── Location ────────────────────────────────────────────────────────────────
  const locationRaw = text('.text-body-small.inline.t-black--light.break-words') ||
                      text('.pv-text-details__left-panel .text-body-small') || ''
  const location_city    = locationRaw.split(',')[0]?.trim() || ''
  const location_country = locationRaw.includes('United Kingdom') || locationRaw.includes('UK') ? 'United Kingdom' : locationRaw.split(',').pop()?.trim() || 'United Kingdom'

  // ── About ───────────────────────────────────────────────────────────────────
  const summary = text('#about ~ .pvs-list__outer-container .visually-hidden') ||
                  text('.pv-about__summary-text') ||
                  text('[data-generated-suggestion-target="about"] .pvs-list__item--line-separated .visually-hidden') || ''

  // ── Current company ─────────────────────────────────────────────────────────
  // Look for first experience entry
  const expItems = document.querySelectorAll('#experience ~ .pvs-list__outer-container .pvs-list__item--line-separated, #experience ~ * .pvs-entity')
  let current_company_name = ''
  if (expItems.length > 0) {
    const firstExp = expItems[0]
    const companySpans = firstExp.querySelectorAll('.t-14.t-normal')
    current_company_name = companySpans[0]?.innerText?.split('·')[0]?.trim() || ''
  }
  // Fallback: extract from headline if contains "at Company"
  if (!current_company_name && current_title.includes(' at ')) {
    current_company_name = current_title.split(' at ').pop()?.trim() || ''
  }

  // ── Experience ─────────────────────────────────────────────────────────────
  const experiences = []
  expItems.forEach(item => {
    const spans = [...item.querySelectorAll('span[aria-hidden="true"]')]
    if (spans.length >= 2) {
      const title   = spans[0]?.innerText?.trim()
      const company = spans[1]?.innerText?.split('·')[0]?.trim()
      const dates   = spans.find(s => s.innerText.match(/\d{4}/))?.innerText?.trim() || ''
      if (title && company) {
        const isCurrent = dates.toLowerCase().includes('present')
        const yearMatch = dates.match(/(\w+\s+\d{4})\s*[-–]\s*(\w+\s+\d{4}|Present)/i)
        experiences.push({
          title, company_name: company,
          start_date: yearMatch ? new Date(yearMatch[1]).toISOString() : new Date().toISOString(),
          is_current: isCurrent,
          end_date:   (!isCurrent && yearMatch) ? new Date(yearMatch[2]).toISOString() : undefined,
        })
      }
    }
  })

  // ── Skills ─────────────────────────────────────────────────────────────────
  const skillEls = document.querySelectorAll('#skills ~ .pvs-list__outer-container .pvs-list__item--line-separated span[aria-hidden="true"]')
  const skills = [...skillEls].map(el => el.innerText?.trim()).filter(s => s && s.length < 60 && !s.match(/^\d+/)).slice(0, 20)

  // ── Seniority guess from title ──────────────────────────────────────────────
  const titleLower = current_title.toLowerCase()
  let seniority_level = 'MID'
  if (/\bvp\b|vice president/.test(titleLower))           seniority_level = 'VP'
  else if (/\bdirector\b/.test(titleLower))               seniority_level = 'DIRECTOR'
  else if (/\bhead of\b|c-suite|chief/.test(titleLower))  seniority_level = 'C_SUITE'
  else if (/\bsenior manager\b/.test(titleLower))         seniority_level = 'SENIOR_MANAGER'
  else if (/\bmanager\b/.test(titleLower))                seniority_level = 'MANAGER'
  else if (/\blead\b/.test(titleLower))                   seniority_level = 'SENIOR'
  else if (/\bsenior\b|sr\./.test(titleLower))            seniority_level = 'SENIOR'
  else if (/\bjunior\b|jr\./.test(titleLower))            seniority_level = 'JUNIOR'
  else if (/\bintern\b/.test(titleLower))                 seniority_level = 'INTERN'

  // ── Profile URL ─────────────────────────────────────────────────────────────
  const linkedin_url = window.location.href.split('?')[0]

  return {
    first_name, last_name, current_title,
    current_company_name, location_city, location_country,
    region: location_country === 'United Kingdom' ? guessRegion(location_city) : 'Other',
    summary: summary.slice(0, 2000),
    skills, experiences,
    linkedin_url,
    seniority_level,
    availability_status: 'OPEN_TO_OFFERS',
    source: 'LINKEDIN',
    source_profile_url: linkedin_url,
  }
}

function guessRegion (city) {
  const map = {
    'London': 'Greater London', 'Manchester': 'North West', 'Birmingham': 'West Midlands',
    'Leeds': 'Yorkshire and the Humber', 'Glasgow': 'Scotland', 'Edinburgh': 'Scotland',
    'Bristol': 'South West', 'Cardiff': 'Wales', 'Liverpool': 'North West',
    'Newcastle': 'North East', 'Sheffield': 'Yorkshire and the Humber',
    'Nottingham': 'East Midlands', 'Leicester': 'East Midlands',
  }
  for (const [k, v] of Object.entries(map)) {
    if (city?.toLowerCase().includes(k.toLowerCase())) return v
  }
  return 'Other'
}

// ── Init: inject trigger and handle LinkedIn SPA navigation ─────────────────
function init () {
  if (!window.location.pathname.startsWith('/in/')) return
  window.__recruitAI.injectTrigger(extractLinkedIn)
}

// LinkedIn is a SPA — re-init on navigation
init()
let lastUrl = location.href
new MutationObserver(() => {
  if (location.href !== lastUrl) {
    lastUrl = location.href
    document.getElementById('rai-trigger')?.remove()
    document.getElementById('rai-panel')?.remove()
    setTimeout(init, 1500) // wait for LinkedIn to render
  }
}).observe(document, { subtree: true, childList: true })
