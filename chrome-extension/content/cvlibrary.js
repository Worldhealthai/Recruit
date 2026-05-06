// CV Library candidate profile scraper

window.__recruitAI.source = 'IMPORTED'

function extractCVLibrary () {
  const text = sel => document.querySelector(sel)?.innerText?.trim() || ''

  const fullName     = text('h1') || text('.candidate-name') || text('.profile-name')
  const nameParts    = fullName.split(' ')
  const first_name   = nameParts[0] || ''
  const last_name    = nameParts.slice(1).join(' ') || ''

  const current_title = text('.candidate-title') || text('.current-role') || text('h2') || ''

  const locationRaw   = text('.candidate-location') || text('.location') || ''
  const location_city = locationRaw.split(',')[0]?.trim() || ''

  const summary = text('.candidate-summary') || text('.profile-summary') || text('.about-section') || ''

  const skillEls = document.querySelectorAll('.skill-tag, .skills-list li, [class*="skill"]')
  const skills   = [...skillEls].map(el => el.innerText?.trim()).filter(s => s && s.length < 60).slice(0, 20)

  return {
    first_name, last_name, current_title,
    location_city, location_country: 'United Kingdom',
    region: 'Other',
    summary: summary.slice(0, 2000),
    skills,
    seniority_level: 'MID',
    availability_status: 'OPEN_TO_OFFERS',
    source: 'IMPORTED',
    source_profile_url: window.location.href,
  }
}

window.__recruitAI.injectTrigger(extractCVLibrary)
