// Service worker — handles API calls from content scripts (no CORS restrictions)

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type === 'SAVE_CANDIDATE') {
    handleSave(msg.payload).then(sendResponse)
    return true // keep channel open for async response
  }
  if (msg.type === 'GET_SETTINGS') {
    chrome.storage.sync.get(['apiUrl', 'apiKey'], sendResponse)
    return true
  }
})

async function handleSave(candidate) {
  const { apiUrl, apiKey } = await chrome.storage.sync.get(['apiUrl', 'apiKey'])

  if (!apiUrl) {
    return { ok: false, error: '⚙️ No App URL set — click the R icon in your toolbar and enter your app URL.' }
  }

  const base = apiUrl.replace(/\/$/, '')
  const url  = base + '/api/apply'

  console.log('[RecruitAI] Posting to', url)

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey ? { 'Authorization': `Bearer ${apiKey}` } : {}),
      },
      body: JSON.stringify(candidate),
    })

    let data
    try { data = await res.json() } catch { data = {} }

    if (res.status === 409) return { ok: false, error: '⚠️ Already in database — this email already exists.' }
    if (res.status === 401) return { ok: false, error: '🔑 Unauthorized — set matching API Key in the extension popup and Vercel env vars.' }
    if (!res.ok) return { ok: false, error: data.error || `Server error ${res.status}` }
    return { ok: true, id: data.id }
  } catch (err) {
    console.error('[RecruitAI] Fetch failed:', err)
    const msg = err.message || ''
    if (msg.toLowerCase().includes('failed to fetch') || msg.toLowerCase().includes('networkerror')) {
      return { ok: false, error: `❌ Can't reach ${base} — is the app deployed and the URL correct?` }
    }
    return { ok: false, error: msg || 'Network error' }
  }
}
