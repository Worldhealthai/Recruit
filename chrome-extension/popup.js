const urlInput = document.getElementById('apiUrl')
const keyInput  = document.getElementById('apiKey')
const saveBtn   = document.getElementById('save')
const statusEl  = document.getElementById('status')

// Load saved settings
chrome.storage.sync.get(['apiUrl', 'apiKey'], ({ apiUrl, apiKey }) => {
  if (apiUrl) urlInput.value = apiUrl
  if (apiKey) keyInput.value = apiKey
})

saveBtn.addEventListener('click', () => {
  let apiUrl = urlInput.value.trim().replace(/\/$/, '')
  const apiKey = keyInput.value.trim()

  if (!apiUrl) {
    showStatus('error', 'Please enter your app URL.')
    return
  }

  // Auto-add https:// if no protocol given
  if (!/^https?:\/\//i.test(apiUrl)) {
    apiUrl = 'https://' + apiUrl
    urlInput.value = apiUrl
  }

  chrome.storage.sync.set({ apiUrl, apiKey }, () => {
    showStatus('success', '✓ Settings saved — ' + apiUrl)
  })
})

function showStatus (type, msg) {
  statusEl.style.display = 'block'
  statusEl.style.background = type === 'success' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)'
  statusEl.style.border     = `1px solid ${type === 'success' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`
  statusEl.style.color      = type === 'success' ? '#4ade80' : '#f87171'
  statusEl.textContent      = msg
  setTimeout(() => { statusEl.style.display = 'none' }, 2500)
}
