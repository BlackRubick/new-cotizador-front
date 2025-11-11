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
    console.log('=== createQuote called ===')
    console.log('quoteData received:', quoteData)
    console.log('products in quoteData:', quoteData.products)
    
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
      status: quoteData.status || 'pendiente',
      taxes: quoteData.taxes || 0,
      products: (quoteData.products || []).map(p => {
        console.log('Mapping product in createQuote:', p)
        return {
          productId: p.productId || null,
          description: p.name || p.descripcion || '-',
          qty: Number(p.quantity || 1),
          unitPrice: Number(p.basePrice || 0),
          discount: Number(p.discount || 0)
        }
      })
    }
    
    console.log('API Data to send:', JSON.stringify(apiData, null, 2))
    
    // Si hay datos de contacto del cliente, actualizarlos antes de crear la cotización
    if (parsedClientId && (quoteData.clientContact || quoteData.email || quoteData.phone || quoteData.clientAddress)) {
      try {
        const clientUpdateData = {}
        if (quoteData.clientContact) clientUpdateData.nombre = quoteData.clientContact
        if (quoteData.email) clientUpdateData.email = quoteData.email
        if (quoteData.phone) clientUpdateData.phone = quoteData.phone
        if (quoteData.clientAddress) clientUpdateData.address = quoteData.clientAddress
        
        console.log('Actualizando cliente con:', clientUpdateData)
        await put(`/clients/${parsedClientId}`, clientUpdateData)
      } catch (err) {
        console.warn('No se pudo actualizar el cliente:', err)
      }
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
  
  console.log('=== mapApiQuoteToFrontend ===')
  console.log('apiQuote completo:', apiQuote)
  console.log('apiQuote.clientId:', apiQuote.clientId)
  console.log('apiQuote.clientContact:', apiQuote.clientContact)
  console.log('apiQuote.clientAddress:', apiQuote.clientAddress)
  console.log('apiQuote.client:', apiQuote.client)
  
  // Helper para mapear companyId numérico a string ID del frontend
  const companyIdToString = (numericId) => {
    if (!numericId) return ''
    switch (numericId) {
      case 2: return 'conduit-life'
      case 3: return 'biosystems-hls'
      case 4: return 'ingenieria-clinica'
      case 5: return 'escala-biomedica'
      default: return ''
    }
  }
  
  const mapped = {
    ...apiQuote,
    // Mapear seller object a string
    seller: apiQuote.seller?.name || apiQuote.seller || null,
    sellerEmail: apiQuote.seller?.email || null,
    // Mapear sellerCompany object a string + preservar ID
    sellerCompany: apiQuote.sellerCompany?.name || null,
    sellerCompanyId: companyIdToString(apiQuote.sellerCompanyId),
    // Mapear client object - priorizar hospital sobre name + preservar clientId
    clientName: apiQuote.client?.hospital || apiQuote.client?.name || apiQuote.clientName || null,
    clientId: apiQuote.clientId,
    // Guardar también la empresa responsable si existe
    razonSocial: apiQuote.client?.empresaResponsable || apiQuote.client?.name || null,
    // Preservar datos de contacto del cliente - intentar desde Quote primero, luego desde Client
    clientContact: apiQuote.clientContact || apiQuote.client?.name || '',
    email: apiQuote.email || apiQuote.client?.email || '',
    phone: apiQuote.phone || apiQuote.client?.phone || '',
    clientAddress: apiQuote.clientAddress || apiQuote.client?.address || '',
    // Mapear items a products para compatibilidad con el frontend
    products: (apiQuote.items || []).map(item => ({
      id: item.id,
      code: item.product?.code || item.productId,
      name: item.description,
      quantity: item.qty,
      basePrice: item.unitPrice,
      discount: item.discount
    }))
  }
  
  console.log('=== Resultado mapeado ===')
  console.log('mapped.clientId:', mapped.clientId)
  console.log('mapped.clientContact:', mapped.clientContact)
  console.log('mapped.clientAddress:', mapped.clientAddress)
  console.log('mapped completo:', mapped)
  
  return mapped
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
    console.log('=== updateQuote called ===')
    console.log('Quote ID:', id)
    console.log('newData received:', newData)
    
    // Si solo se actualiza el status (cambio rápido desde la vista)
    if (Object.keys(newData).length === 1 && newData.status) {
      const response = await put(`/quotes/${id}`, { status: newData.status })
      const mappedData = mapApiQuoteToFrontend(response.data)
      return { success: true, data: mappedData }
    }
    
    // Actualización completa (desde el formulario de edición)
    // Parsear clientId
    let parsedClientId = null
    if (newData.clientId) {
      const clientIdStr = String(newData.clientId)
      if (clientIdStr.includes('-')) {
        const parts = clientIdStr.split('-')
        parsedClientId = Number(parts[0])
      } else {
        parsedClientId = Number(clientIdStr)
      }
      if (isNaN(parsedClientId)) parsedClientId = null
    }
    
    // Actualizar datos del cliente si hay cambios
    if (parsedClientId && (newData.clientContact || newData.email || newData.phone || newData.clientAddress)) {
      try {
        const clientUpdateData = {}
        if (newData.clientContact) clientUpdateData.nombre = newData.clientContact
        if (newData.email) clientUpdateData.email = newData.email
        if (newData.phone) clientUpdateData.phone = newData.phone
        if (newData.clientAddress) clientUpdateData.address = newData.clientAddress
        
        console.log('Actualizando cliente con:', clientUpdateData)
        await put(`/clients/${parsedClientId}`, clientUpdateData)
      } catch (err) {
        console.warn('No se pudo actualizar el cliente:', err)
      }
    }
    
    // Preparar datos de la cotización para actualizar
    const apiData = {
      sellerCompanyId: companyIdMap[newData.sellerCompanyId] || undefined,
      clientId: parsedClientId || undefined,
      sellerId: newData.sellerId || undefined,
      status: newData.status || undefined
    }
    
    // Limpiar undefined
    Object.keys(apiData).forEach(key => {
      if (apiData[key] === undefined) delete apiData[key]
    })
    
    console.log('API Data to send:', apiData)
    
    const response = await put(`/quotes/${id}`, apiData)
    // Mapear la respuesta al formato del frontend
    const mappedData = mapApiQuoteToFrontend(response.data)
    return { success: true, data: mappedData }
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
 * Envía una cotización con PDF adjunto generado en el frontend
 */
export async function sendQuoteWithPDF(quoteId, formData) {
  try {
    const token = localStorage.getItem('auth_token')
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'
    
    // Enviar el PDF usando fetch directamente (no usar post porque FormData no necesita JSON.stringify)
    const response = await fetch(`${API_URL}/quotes/${quoteId}/send-email-with-pdf`, {
      method: 'POST',
      headers: {
        'Authorization': token ? `Bearer ${token}` : ''
        // NO incluir Content-Type, el navegador lo establece automáticamente con el boundary
      },
      body: formData // FormData se envía directamente
    })
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Error en la petición' }))
      throw new Error(error.error || `Error: ${response.status}`)
    }
    
    const data = await response.json()
    return { success: true, data }
  } catch (error) {
    console.error('Error al enviar cotización con PDF:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Envía una cotización con PDF adjunto (versión legacy por folio)
 */
export async function sendQuoteFormDataByFolio(folio, formData) {
  try {
    const quote = await getQuoteByFolio(folio)
    if (!quote) return { success: false, error: 'not_found' }
    
    // Enviar el PDF usando el endpoint de email
    const response = await post(`/quotes/${quote.id}/send-email-with-pdf`, formData, {
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
  sendQuoteWithPDF,
  sendQuoteFormDataByFolio,
  generateFolio
}
