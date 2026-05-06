// Indeed resume profile scraper — runs on indeed.com/r/*

window.__recruitAI.source = 'INDEED'

function extractIndeed () {
  const text = sel => document.querySelector(sel)?.innerText?.trim() || ''

  const fullName    = text('[data-testid="ResumeName"], h1, .icl-u-lg-textXl') || ''
  const nameParts   = fullName.split(' ')
  const first_name  = nameParts[0] || ''
  const last_name   = nameParts.slice(1).join(' ') || ''

  const current_title = text('[data-testid="ResumeTitle"], .icl-u-lg-textLg') || ''

  const locationRaw   = text('[data-testid="ResumeLocation"], .icl-u-textColor--subdued') || ''
  const location_city = locationRaw.split(',')[0]?.trim() || ''

  const summary = text('[data-testid="ResumeSummary"], .summary') || ''

  const skillEls = document.querySelectorAll('[data-testid="ResumeSkillsSection"] li, .skills-section li')
  const skills   = [...skillEls].map(el => el.innerText?.trim()).filter(s => s && s.length < 60).slice(0, 20)

  const email = text('[data-testid="ResumeEmail"]') || ''
  const phone = text('[data-testid="ResumePhone"]') || ''

  return {
    first_name, last_name, email, phone,
    current_title, location_city, location_country: 'United Kingdom',
    region: 'Other', summary: summary.slice(0, 2000), skills,
    seniority_level: 'MID', availability_status: 'OPEN_TO_OFFERS',
    source: 'INDEED', source_profile_url: window.location.href,
  }
}

window.__recruitAI.injectTrigger(extractIndeed)
