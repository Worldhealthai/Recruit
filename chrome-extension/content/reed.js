// Reed.co.uk candidate profile scraper

window.__recruitAI.source = 'IMPORTED'

function extractReed () {
  const text = sel => document.querySelector(sel)?.innerText?.trim() || ''

  const fullName    = text('h1, .candidate-name') || ''
  const nameParts   = fullName.split(' ')
  const first_name  = nameParts[0] || ''
  const last_name   = nameParts.slice(1).join(' ') || ''

  const current_title  = text('.job-title, .current-position, h2') || ''
  const location_city  = text('.location, .candidate-location')?.split(',')[0]?.trim() || ''
  const summary        = text('.personal-summary, .profile-summary, .about') || ''

  const skillEls = document.querySelectorAll('.skills li, .skill-tag, [class*="skill"]')
  const skills   = [...skillEls].map(el => el.innerText?.trim()).filter(s => s && s.length < 60).slice(0, 20)

  return {
    first_name, last_name, current_title,
    location_city, location_country: 'United Kingdom',
    region: 'Other', summary: summary.slice(0, 2000), skills,
    seniority_level: 'MID', availability_status: 'OPEN_TO_OFFERS',
    source: 'IMPORTED', source_profile_url: window.location.href,
  }
}

window.__recruitAI.injectTrigger(extractReed)
