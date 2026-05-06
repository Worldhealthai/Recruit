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
    return { ok: false, error: 'No API URL set. Open the extension popup and configure it.' }
  }

  const url = apiUrl.replace(/\/$/, '') + '/api/apply'

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey ? { 'Authorization': `Bearer ${apiKey}` } : {}),
      },
      body: JSON.stringify(candidate),
    })

    const data = await res.json()

    if (res.status === 409) return { ok: false, error: 'Already in database (duplicate email).' }
    if (!res.ok) return { ok: false, error: data.error || `Server error ${res.status}` }
    return { ok: true, id: data.id }
  } catch (err) {
    return { ok: false, error: err.message || 'Network error — is the app running?' }
  }
}
