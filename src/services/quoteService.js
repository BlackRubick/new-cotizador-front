// Minimal quoteService for frontend (development)
// - Session-scoped (in-memory) quotes cache
// - Provides createQuote, listQuotes, getById/getByFolio, sendQuoteByEmail (simulated)

// In-memory quotes cache for session-only quotes (will disappear on page reload)
let quotesCache = []

function generateFolio(prefix = 'Q', length = 6) {
  // simple folio generator: PREFIX + timestamp + random
  const ts = Date.now().toString(36).toUpperCase()
  const rnd = Math.random().toString(36).substr(2, length).toUpperCase()
  return `${prefix}${ts}${rnd}`
}

export async function createQuote(quoteData) {
  if (!quoteData.folio) quoteData.folio = generateFolio('Q')
  const now = new Date().toISOString()
  const stored = { ...quoteData, id: quoteData.id || `quote-${Date.now()}`, createdAt: now }
  // push into in-memory cache only (session-scoped)
  quotesCache.unshift(stored)
  return { success: true, data: stored }
}

export async function listQuotes() {
  return quotesCache
}

export async function getQuoteById(id) {
  return quotesCache.find(q => q.id === id) || null
}

export async function updateQuote(id, newData) {
  const idx = quotesCache.findIndex(q => q.id === id)
  if (idx === -1) return { success: false, error: 'not_found' }
  const now = new Date().toISOString()
  const updated = { ...quotesCache[idx], ...newData, id, updatedAt: now }
  quotesCache[idx] = updated
  return { success: true, data: updated }
}

export async function deleteQuote(id) {
  const idx = quotesCache.findIndex(q => q.id === id)
  if (idx === -1) return { success: false, error: 'not_found' }
  quotesCache.splice(idx, 1)
  return { success: true }
}

export async function getQuoteByFolio(folio) {
  return quotesCache.find(q => q.folio === folio) || null
}

// Simulated send via JSON endpoint (server-side would send email)
export async function sendQuoteByEmail(quoteId, emailData = {}) {
  const q = await getQuoteById(quoteId)
  if (!q) return { success: false, error: 'not_found' }
  // In a real app, call apiRequest('/quotes/' + quoteId + '/send', ...)
  console.log('[quoteService] sendQuoteByEmail simulated:', quoteId, emailData)
  return { success: true, data: { sent: true, sentAt: new Date().toISOString() } }
}

// Simulated multipart/form-data endpoint: accepts folio and FormData with pdfBuffer
export async function sendQuoteFormDataByFolio(folio, formData) {
  const q = await getQuoteByFolio(folio)
  if (!q) return { success: false, error: 'not_found' }

  // Example: read the pdfBuffer blob from formData
  try {
    const pdfBlob = formData.get('pdfBuffer')
    console.log('[quoteService] sendQuoteFormDataByFolio simulated, folio=', folio, 'pdfBlob=', pdfBlob)
    // In production, you'd POST the FormData to your API endpoint here.
    return { success: true, data: { sent: true, sentAt: new Date().toISOString() } }
  } catch (e) {
    return { success: false, error: e.message }
  }
}

export default {
  createQuote,
  listQuotes,
  getQuoteById,
  updateQuote,
  deleteQuote,
  getQuoteByFolio,
  sendQuoteByEmail,
  sendQuoteFormDataByFolio,
  generateFolio
}
