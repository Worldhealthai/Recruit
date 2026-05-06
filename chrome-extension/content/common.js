// ── Shared sidebar UI injected by every content script ──────────────────────

window.__recruitAI = window.__recruitAI || {}

const R = window.__recruitAI

R.SENIORITY_OPTIONS = ['INTERN','JUNIOR','MID','SENIOR','LEAD','MANAGER','SENIOR_MANAGER','DIRECTOR','VP','C_SUITE']
R.AVAILABILITY_OPTIONS = ['ACTIVELY_LOOKING','OPEN_TO_OFFERS','PASSIVE','NOT_LOOKING']

// ── Inject sidebar ───────────────────────────────────────────────────────────
R.showPanel = function (candidate) {
  // Remove any existing panel
  document.getElementById('rai-overlay')?.remove()
  document.getElementById('rai-panel')?.remove()

  // Backdrop
  const overlay = document.createElement('div')
  overlay.id = 'rai-overlay'
  Object.assign(overlay.style, {
    position: 'fixed', inset: '0',
    background: 'rgba(0,0,0,0.45)',
    zIndex: '2147483645',
    transition: 'opacity 0.3s ease',
    opacity: '0',
  })

  // Panel — this IS the positioned element so the transform targets it directly
  const panel = document.createElement('div')
  panel.id = 'rai-panel'
  Object.assign(panel.style, {
    position: 'fixed', top: '0', right: '0',
    width: '420px', height: '100vh',
    background: '#0f172a',
    borderLeft: '1px solid rgba(255,255,255,0.1)',
    zIndex: '2147483646',
    display: 'flex', flexDirection: 'column',
    fontFamily: 'system-ui,-apple-system,sans-serif',
    transform: 'translateX(100%)',
    transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
    overflowY: 'hidden',
  })
  panel.innerHTML = buildPanelHTML(candidate)

  document.body.appendChild(overlay)
  document.body.appendChild(panel)

  // Trigger animation on next frame
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      panel.style.transform = 'translateX(0)'
      overlay.style.opacity = '1'
    })
  })

  const close = () => {
    panel.style.transform = 'translateX(100%)'
    overlay.style.opacity = '0'
    setTimeout(() => { panel.remove(); overlay.remove() }, 300)
  }

  overlay.addEventListener('click', close)
  panel.querySelector('#rai-close').addEventListener('click', close)
  panel.querySelector('#rai-save').addEventListener('click', () => saveCandidate(panel))
}

function buildPanelHTML (c) {
  const field = (label, name, value = '', type = 'text') => `
    <div style="margin-bottom:0.6rem">
      <label style="font-size:0.62rem;color:#64748b;font-weight:700;text-transform:uppercase;letter-spacing:0.07em;display:block;margin-bottom:0.25rem">${label}</label>
      <input name="${name}" type="${type}" value="${esc(value)}" style="width:100%;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:0.35rem;padding:0.4rem 0.6rem;color:#f8fafc;font-size:0.78rem;outline:none;box-sizing:border-box;font-family:inherit"/>
    </div>`

  const select = (label, name, options, value = '') => `
    <div style="margin-bottom:0.6rem">
      <label style="font-size:0.62rem;color:#64748b;font-weight:700;text-transform:uppercase;letter-spacing:0.07em;display:block;margin-bottom:0.25rem">${label}</label>
      <select name="${name}" style="width:100%;background:#1e293b;border:1px solid rgba(255,255,255,0.1);border-radius:0.35rem;padding:0.4rem 0.6rem;color:#f8fafc;font-size:0.78rem;outline:none;box-sizing:border-box;font-family:inherit">
        ${options.map(o => `<option value="${o}" ${o===value?'selected':''}>${o.replace(/_/g,' ')}</option>`).join('')}
      </select>
    </div>`

  return `
    <!-- Header -->
    <div style="padding:1.1rem 1.25rem;border-bottom:1px solid rgba(255,255,255,0.07);display:flex;justify-content:space-between;align-items:center;flex-shrink:0">
      <div style="display:flex;align-items:center;gap:0.5rem">
        <div style="width:22px;height:22px;border-radius:0.3rem;background:linear-gradient(135deg,#6366f1,#8b5cf6);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:900;font-size:0.7rem">R</div>
        <span style="font-weight:800;font-size:0.9rem;color:#f8fafc">RecruitAI</span>
        <span style="font-size:0.65rem;color:#64748b;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);border-radius:999px;padding:0.1rem 0.45rem">${esc(c.source||'')}</span>
      </div>
      <button id="rai-close" style="background:none;border:none;color:#64748b;font-size:1.3rem;cursor:pointer;line-height:1;padding:0;flex-shrink:0">×</button>
    </div>

    <!-- Scrollable form -->
    <div style="flex:1;overflow-y:auto;padding:1rem 1.25rem">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.5rem">
        ${field('First Name','first_name',c.first_name)}
        ${field('Last Name','last_name',c.last_name)}
      </div>
      ${field('Email','email',c.email,'email')}
      ${field('Phone','phone',c.phone,'tel')}
      ${field('Current Title','current_title',c.current_title)}
      ${field('Current Company','current_company_name',c.current_company_name)}
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.5rem">
        ${field('City','location_city',c.location_city)}
        ${field('Country','location_country',c.location_country||'United Kingdom')}
      </div>
      ${field('Region','region',c.region||'Greater London')}
      ${select('Seniority','seniority_level',R.SENIORITY_OPTIONS,c.seniority_level||'MID')}
      ${select('Availability','availability_status',R.AVAILABILITY_OPTIONS,c.availability_status||'OPEN_TO_OFFERS')}
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.5rem">
        ${field('Salary Min (£)','salary_expectation_min',c.salary_expectation_min||'')}
        ${field('Salary Max (£)','salary_expectation_max',c.salary_expectation_max||'')}
      </div>
      ${field('LinkedIn URL','linkedin_url',c.linkedin_url)}
      ${field('Years Experience','years_experience',c.years_experience||'')}

      <div style="margin-bottom:0.6rem">
        <label style="font-size:0.62rem;color:#64748b;font-weight:700;text-transform:uppercase;letter-spacing:0.07em;display:block;margin-bottom:0.25rem">Skills (comma separated)</label>
        <textarea name="skills_raw" rows="2" style="width:100%;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:0.35rem;padding:0.4rem 0.6rem;color:#f8fafc;font-size:0.78rem;outline:none;box-sizing:border-box;resize:vertical;font-family:inherit">${esc((c.skills||[]).join(', '))}</textarea>
      </div>

      <div style="margin-bottom:0.6rem">
        <label style="font-size:0.62rem;color:#64748b;font-weight:700;text-transform:uppercase;letter-spacing:0.07em;display:block;margin-bottom:0.25rem">Summary / About</label>
        <textarea name="summary" rows="3" style="width:100%;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:0.35rem;padding:0.4rem 0.6rem;color:#f8fafc;font-size:0.78rem;outline:none;box-sizing:border-box;resize:vertical;font-family:inherit">${esc(c.summary||'')}</textarea>
      </div>

      <div id="rai-status" style="display:none;padding:0.6rem 0.8rem;border-radius:0.4rem;font-size:0.78rem;margin-bottom:0.5rem"></div>
    </div>

    <!-- Footer -->
    <div style="padding:1rem 1.25rem;border-top:1px solid rgba(255,255,255,0.07);flex-shrink:0">
      <button id="rai-save" style="width:100%;background:linear-gradient(135deg,#6366f1,#8b5cf6);border:none;color:#fff;border-radius:0.5rem;padding:0.65rem;font-size:0.85rem;font-weight:700;cursor:pointer;box-shadow:0 4px 20px rgba(99,102,241,0.35)">
        Save to RecruitAI
      </button>
      <div style="text-align:center;margin-top:0.5rem;font-size:0.68rem;color:#334155">
        Profile auto-extracted · edit before saving
      </div>
    </div>`
}

async function saveCandidate (panel) {
  const btn = panel.querySelector('#rai-save')
  const statusEl = panel.querySelector('#rai-status')

  btn.disabled = true
  btn.textContent = '⏳ Saving…'
  btn.style.opacity = '0.75'
  btn.style.cursor = 'default'

  const get = name => (panel.querySelector(`[name="${name}"]`)?.value || '').trim()

  const candidate = {
    first_name:             get('first_name'),
    last_name:              get('last_name'),
    email:                  get('email'),
    phone:                  get('phone'),
    current_title:          get('current_title'),
    current_company_name:   get('current_company_name'),
    location_city:          get('location_city'),
    location_country:       get('location_country') || 'United Kingdom',
    region:                 get('region') || 'Other',
    seniority_level:        get('seniority_level') || 'MID',
    availability_status:    get('availability_status') || 'OPEN_TO_OFFERS',
    salary_expectation_min: get('salary_expectation_min') || null,
    salary_expectation_max: get('salary_expectation_max') || null,
    linkedin_url:           get('linkedin_url'),
    years_experience:       get('years_experience') || null,
    summary:                get('summary'),
    skills:                 get('skills_raw').split(',').map(s => s.trim()).filter(Boolean),
    source:                 window.__recruitAI.source || 'WEBSITE',
    source_profile_url:     window.location.href,
  }

  if (!candidate.first_name || !candidate.last_name) {
    showStatus(statusEl, 'error', 'First and last name are required.')
    resetBtn(btn)
    return
  }
  if (!candidate.email) {
    showStatus(statusEl, 'error', 'Email is required to avoid duplicates.')
    resetBtn(btn)
    return
  }
  if (!candidate.current_title) {
    showStatus(statusEl, 'error', 'Current title is required.')
    resetBtn(btn)
    return
  }

  let result
  try {
    result = await chrome.runtime.sendMessage({ type: 'SAVE_CANDIDATE', payload: candidate })
  } catch (err) {
    showStatus(statusEl, 'error', 'Extension error — try reloading the page.')
    resetBtn(btn)
    return
  }

  if (result?.ok) {
    showStatus(statusEl, 'success', '✓ Saved to RecruitAI!')
    btn.textContent = '✓ Saved'
    btn.style.background = 'rgba(34,197,94,0.2)'
    btn.style.border = '1px solid rgba(34,197,94,0.4)'
    btn.style.color = '#4ade80'
    btn.style.boxShadow = 'none'
    btn.style.opacity = '1'
  } else {
    showStatus(statusEl, 'error', result?.error || 'Unknown error')
    resetBtn(btn)
  }
}

function showStatus (el, type, msg) {
  el.style.display = 'block'
  el.style.background = type === 'success' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)'
  el.style.border = `1px solid ${type === 'success' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`
  el.style.color = type === 'success' ? '#4ade80' : '#f87171'
  el.textContent = msg
}

function resetBtn (btn) {
  btn.disabled = false
  btn.textContent = 'Save to RecruitAI'
  btn.style.opacity = '1'
}

function esc (str) {
  return String(str || '').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
}

// ── Floating trigger button (shown on supported pages) ──────────────────────
R.injectTrigger = function (onExtract) {
  if (document.getElementById('rai-trigger')) return

  const btn = document.createElement('button')
  btn.id = 'rai-trigger'
  btn.innerHTML = `
    <div style="width:44px;height:44px;border-radius:50%;background:linear-gradient(135deg,#6366f1,#8b5cf6);display:flex;align-items:center;justify-content:center;box-shadow:0 4px 18px rgba(99,102,241,0.55);transition:transform 0.15s ease,box-shadow 0.15s ease">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
    </div>`
  Object.assign(btn.style, {
    position: 'fixed', bottom: '24px', right: '24px', zIndex: '2147483644',
    background: 'none', border: 'none', cursor: 'pointer', padding: '0',
  })
  btn.title = 'Save to RecruitAI'
  btn.addEventListener('mouseenter', () => { btn.querySelector('div').style.transform = 'scale(1.12)'; btn.querySelector('div').style.boxShadow = '0 6px 24px rgba(99,102,241,0.7)' })
  btn.addEventListener('mouseleave', () => { btn.querySelector('div').style.transform = 'scale(1)'; btn.querySelector('div').style.boxShadow = '0 4px 18px rgba(99,102,241,0.55)' })
  btn.addEventListener('click', () => {
    try {
      const candidate = onExtract()
      R.showPanel(candidate)
    } catch (err) {
      console.error('[RecruitAI] Extract failed:', err)
    }
  })
  document.body.appendChild(btn)
}
