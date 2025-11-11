import { get, post, put, del } from '../utils/api'

const STORAGE_KEY = 'app_clients'

// Mantener funciones de localStorage como fallback/caché local
function loadClientsFromCache() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch (e) {
    return []
  }
}

function saveClientsToCache(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  } catch (e) {
    console.error('Error saving to cache:', e)
  }
}

/**
 * Mapea un cliente de la API al formato esperado por el frontend
 * La API ahora devuelve: { id, name, hospital, empresaResponsable, equipos: [...] }
 */
function mapApiClientToFrontend(apiClient) {
  const metadata = apiClient.metadata || {}
  
  // Si el cliente tiene equipos, crear un cliente por cada equipo (comportamiento actual)
  if (apiClient.equipos && apiClient.equipos.length > 0) {
    return apiClient.equipos.map(equipo => ({
      id: `${apiClient.id}-${equipo.id}`,
      apiClientId: apiClient.id,
      apiEquipmentId: equipo.id,
      fechaCreacion: apiClient.createdAt,
      empresaResponsable: apiClient.empresaResponsable || '',
      dependencia: apiClient.dependencia || '',
      hospital: apiClient.hospital || apiClient.name,
      contrato: apiClient.contrato || '',
      estado: apiClient.state || '',
      ciudad: apiClient.city || '',
      codigoPostal: apiClient.zipCode || '',
      direccion: apiClient.address || '',
      equipo: equipo.equipo || '',
      marca: equipo.marca || '',
      modelo: equipo.modelo || '',
      numeroSerie: equipo.numeroSerie || '',
      fechaInstalacion: equipo.fechaInstalacion || '',
      ultimoMantenimiento: equipo.ultimoMantenimiento || '',
      estatusAbril2025: metadata.estatusAbril2025 || '',
      estatusInicio26: metadata.estatusInicio26 || '',
      encargados: []
    }))
  }
  
  // Si no tiene equipos, devolver el cliente sin equipo
  return [{
    id: `${apiClient.id}`,
    apiClientId: apiClient.id,
    fechaCreacion: apiClient.createdAt,
    empresaResponsable: apiClient.empresaResponsable || '',
    dependencia: apiClient.dependencia || '',
    hospital: apiClient.hospital || apiClient.name,
    contrato: apiClient.contrato || '',
    estado: apiClient.state || '',
    ciudad: apiClient.city || '',
    codigoPostal: apiClient.zipCode || '',
    direccion: apiClient.address || '',
    equipo: '',
    marca: '',
    modelo: '',
    numeroSerie: '',
    fechaInstalacion: '',
    ultimoMantenimiento: '',
    estatusAbril2025: metadata.estatusAbril2025 || '',
    estatusInicio26: metadata.estatusInicio26 || '',
    encargados: []
  }]
}

/**
 * Crear un cliente en la API
 */
export async function createClient(frontendData) {
  try {
    const response = await post('/clients', frontendData)
    const clients = mapApiClientToFrontend(response.data)
    
    // Actualizar caché
    const cached = loadClientsFromCache()
    clients.forEach(c => cached.unshift(c))
    saveClientsToCache(cached)
    
    return { success: true, data: clients[0] }
  } catch (error) {
    console.error('Error creando cliente:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Crear múltiples clientes en lote (importación de Excel)
 */
export async function createClientsBatch(clientsData) {
  try {
    const response = await post('/clients/batch', { clients: clientsData })
    
    // Recargar todos los clientes
    await listClients()
    
    return { 
      success: true, 
      data: response.data 
    }
  } catch (error) {
    console.error('Error creando clientes en lote:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Actualizar un cliente
 */
export async function updateClient(id, frontendData) {
  try {
    // Extraer el ID real de la API si viene en formato compuesto
    const apiClientId = frontendData.apiClientId || id.toString().split('-')[0]
    
    const response = await put(`/clients/${apiClientId}`, frontendData)
    const clients = mapApiClientToFrontend(response.data)
    
    // Actualizar caché
    const cached = loadClientsFromCache()
    const filtered = cached.filter(c => !c.id.startsWith(`${apiClientId}-`))
    clients.forEach(c => filtered.push(c))
    saveClientsToCache(filtered)
    
    return { success: true, data: clients[0] }
  } catch (error) {
    console.error('Error actualizando cliente:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Eliminar un cliente
 */
export async function deleteClient(id) {
  try {
    // Extraer el ID real de la API si viene en formato compuesto
    const apiClientId = id.toString().includes('-') ? id.toString().split('-')[0] : id
    
    await del(`/clients/${apiClientId}`)
    
    // Actualizar caché
    const cached = loadClientsFromCache()
    const filtered = cached.filter(c => !c.id.startsWith(`${apiClientId}-`) && c.id !== id)
    saveClientsToCache(filtered)
    
    return { success: true }
  } catch (error) {
    console.error('Error eliminando cliente:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Listar todos los clientes desde la API
 */
export async function listClients() {
  try {
    const response = await get('/clients')
    const clients = response.data || []
    
    // Mapear cada cliente de la API al formato del frontend
    const mappedClients = clients.flatMap(mapApiClientToFrontend)
    
    return mappedClients
  } catch (error) {
    console.error('Error al listar clientes:', error)
    throw error
  }
}

export default {
  createClient,
  createClientsBatch,
  updateClient,
  deleteClient,
  listClients
}
