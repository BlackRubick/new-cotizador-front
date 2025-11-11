const STORAGE_KEY = 'app_clients'

function loadClients() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch (e) {
    return []
  }
}

function saveClients(clients) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(clients))
}

function mapFrontendToBackend(data) {
  // minimal mapping
  const mapped = {
    id: data.id || `C-${Date.now()}`,
    createdAt: data.createdAt || new Date().toISOString(),
    name: data.empresaResponsable || data.name || '',
    contact: data.contact || '',
    email: data.email || '',
    phone: data.phone || '',
    street: data.direccion || '',
    city: data.ciudad || '',
    state: data.estado || '',
    zipCode: data.codigoPostal || '',
    clientType: 'hospital',
    notes: {
      empresaResponsable: data.empresaResponsable,
      dependencia: data.dependencia,
      hospital: data.hospital,
      contrato: data.contrato,
      equipo: data.equipo,
      marca: data.marca,
      modelo: data.modelo,
      numeroSerie: data.numeroSerie,
      fechaInstalacion: data.fechaInstalacion,
      ultimoMantenimiento: data.ultimoMantenimiento,
      estatusAbril2025: data.estatusAbril2025,
      estatusInicio26: data.estatusInicio26,
      encargados: (data.encargados || []).filter(e => e.nombre).map(e => ({ ...e, fechaRegistro: new Date().toISOString() }))
    }
  }

  return mapped
}

function mapBackendToFrontend(b) {
  if (!b) return null
  const notes = b.notes || {}
  return {
    id: b.id,
    fechaCreacion: b.createdAt,
    empresaResponsable: notes.empresaResponsable || b.name,
    dependencia: notes.dependencia || '',
    hospital: notes.hospital || '',
    contrato: notes.contrato || '',
    estado: b.state || notes.estado || '',
    ciudad: b.city || notes.ciudad || '',
    codigoPostal: b.zipCode || notes.codigoPostal || '',
    direccion: b.street || notes.direccion || '',
    equipo: notes.equipo || '',
    marca: notes.marca || '',
    modelo: notes.modelo || '',
    numeroSerie: notes.numeroSerie || '',
    fechaInstalacion: notes.fechaInstalacion || '',
    ultimoMantenimiento: notes.ultimoMantenimiento || '',
    estatusAbril2025: notes.estatusAbril2025 || '',
    estatusInicio26: notes.estatusInicio26 || '',
    encargados: (notes.encargados || []).map(e => ({ ...e }))
  }
}

export async function createClient(frontendData) {
  // minimal server-side validation
  if (!frontendData.empresaResponsable && !frontendData.name) {
    return { success: false, error: 'empresaResponsable required' }
  }

  const all = loadClients()
  // check duplicates by empresaResponsable + numeroSerie
  const dup = all.find(c => c.empresaResponsable === frontendData.empresaResponsable && c.numeroSerie === frontendData.numeroSerie)
  const backend = mapFrontendToBackend(frontendData)

  // simulate backend id and save
  all.unshift(backend)
  saveClients(all)

  return { success: true, data: backend }
}

export async function updateClient(id, frontendData) {
  const all = loadClients()
  const index = all.findIndex(c => c.id === id)
  if (index === -1) return { success: false, error: 'not_found' }
  const backend = mapFrontendToBackend(frontendData)
  all[index] = backend
  saveClients(all)
  return { success: true, data: backend }
}

export async function deleteClient(id) {
  const all = loadClients()
  const next = all.filter(c => c.id !== id)
  saveClients(next)
  return { success: true }
}

export function listClients() {
  const all = loadClients()
  return all.map(mapBackendToFrontend)
}

export function mapBackendToFrontendPublic(b) {
  return mapBackendToFrontend(b)
}

export default {
  createClient,
  updateClient,
  deleteClient,
  listClients,
  mapBackendToFrontend: mapBackendToFrontendPublic
}
