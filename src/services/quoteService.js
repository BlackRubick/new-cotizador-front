import { get, post, put, del } from '../utils/api'

// Mapeo de IDs de empresas del frontend a IDs de la base de datos
const companyIdMap = {
  'conduit-life': 2,
  'biosystems-hls': 3,
  'ingenieria-clinica': 4,
  'escala-biomedica': 5
}

function generateFolio(prefix = 'Q', length = 6) {
  // simple folio generator: PREFIX + timestamp + random
  const ts = Date.now().toString(36).toUpperCase()
  const rnd = Math.random().toString(36).substr(2, length).toUpperCase()
  return `${prefix}${ts}${rnd}`
}

/**
 * Crea una cotización en la API
 */
export async function createQuote(quoteData) {
  try {
    // Parsear clientId - puede venir como string compuesto "123-456" o número
    let parsedClientId = null
    if (quoteData.clientId) {
      const clientIdStr = String(quoteData.clientId)
      // Si tiene formato "123-456", tomar el primer número
      if (clientIdStr.includes('-')) {
        const parts = clientIdStr.split('-')
        parsedClientId = Number(parts[0])
      } else {
        parsedClientId = Number(clientIdStr)
      }
      // Validar que sea un número válido
      if (isNaN(parsedClientId)) {
        parsedClientId = null
      }
    }
    
    // Mapear datos del frontend al formato de la API
    const apiData = {
      sellerCompanyId: companyIdMap[quoteData.sellerCompanyId] || null,
      clientId: parsedClientId,
      sellerId: quoteData.sellerId || null,
      status: quoteData.status || 'draft',
      taxes: quoteData.taxes || 0,
      products: (quoteData.products || []).map(p => ({
        productId: typeof p.code === 'number' ? p.code : null,
        description: p.name || p.descripcion || '-',
        qty: Number(p.quantity || 1),
        unitPrice: Number(p.basePrice || 0),
        discount: Number(p.discount || 0)
      }))
    }
    
    const response = await post('/quotes', apiData)
    
    // Mapear respuesta de la API al formato del frontend
    const createdQuote = response.data
    return {
      success: true,
      data: {
        ...createdQuote,
        folio: createdQuote.folio,
        sellerCompany: quoteData.sellerCompany,
        sellerCompanyId: quoteData.sellerCompanyId,
        clientName: quoteData.clientName,
        clientContact: quoteData.clientContact,
        email: quoteData.email,
        phone: quoteData.phone,
        clientAddress: quoteData.clientAddress,
        products: quoteData.products,
        terms: quoteData.terms,
        seller: quoteData.seller,
        sellerEmail: quoteData.sellerEmail
      }
    }
  } catch (error) {
    console.error('Error al crear cotización:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Lista todas las cotizaciones
 */
export async function listQuotes() {
  try {
    const response = await get('/quotes')
    const quotes = response.data || []
    return quotes.map(mapApiQuoteToFrontend)
  } catch (error) {
    console.error('Error al listar cotizaciones:', error)
    return []
  }
}

/**
 * Mapea una cotización de la API al formato del frontend
 */
function mapApiQuoteToFrontend(apiQuote) {
  if (!apiQuote) return null
  
  return {
    ...apiQuote,
    // Mapear seller object a string
    seller: apiQuote.seller?.name || apiQuote.seller || null,
    sellerEmail: apiQuote.seller?.email || null,
    // Mapear sellerCompany object a string
    sellerCompany: apiQuote.sellerCompany?.name || null,
    // Mapear client object - priorizar hospital sobre name
    clientName: apiQuote.client?.hospital || apiQuote.client?.name || apiQuote.clientName || null,
    // Guardar también la empresa responsable si existe
    razonSocial: apiQuote.client?.empresaResponsable || apiQuote.client?.name || null,
    // Mapear items a products para compatibilidad con el frontend
    products: (apiQuote.items || []).map(item => ({
      id: item.id,
      code: item.productId,
      name: item.description,
      quantity: item.qty,
      basePrice: item.unitPrice,
      discount: item.discount
    }))
  }
}

/**
 * Obtiene una cotización por ID
 */
export async function getQuoteById(id) {
  try {
    const response = await get(`/quotes/${id}`)
    return mapApiQuoteToFrontend(response.data)
  } catch (error) {
    console.error('Error al obtener cotización:', error)
    return null
  }
}

/**
 * Actualiza una cotización existente
 */
export async function updateQuote(id, newData) {
  try {
    const apiData = {
      status: newData.status,
      // Otros campos que necesites actualizar
    }
    
    const response = await put(`/quotes/${id}`, apiData)
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Error al actualizar cotización:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Elimina una cotización
 */
export async function deleteQuote(id) {
  try {
    await del(`/quotes/${id}`)
    return { success: true }
  } catch (error) {
    console.error('Error al eliminar cotización:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Obtiene una cotización por folio
 */
export async function getQuoteByFolio(folio) {
  try {
    const quotes = await listQuotes()
    return quotes.find(q => q.folio === folio) || null
  } catch (error) {
    console.error('Error al buscar cotización por folio:', error)
    return null
  }
}

/**
 * Envía una cotización por email
 */
export async function sendQuoteByEmail(quoteId, emailData = {}) {
  try {
    const response = await post(`/quotes/${quoteId}/send-email`, {
      to: emailData.to || emailData.email,
      subject: emailData.subject || `Cotización`,
      message: emailData.message || emailData.body || ''
    })
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Error al enviar cotización por email:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Envía una cotización con PDF adjunto
 */
export async function sendQuoteFormDataByFolio(folio, formData) {
  try {
    const quote = await getQuoteByFolio(folio)
    if (!quote) return { success: false, error: 'not_found' }
    
    // Enviar el PDF usando el endpoint de email
    const response = await post(`/quotes/${quote.id}/send-email`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Error al enviar cotización con PDF:', error)
    return { success: false, error: error.message }
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
