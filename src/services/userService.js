import { get, post, put, del } from '../utils/api'

/**
 * Mapea un usuario de la API al formato del frontend
 */
function mapApiUserToFrontend(apiUser) {
  return {
    id: apiUser.id,
    name: apiUser.name,
    email: apiUser.email,
    role: apiUser.role,
    extra: {
      canModifyPrices: apiUser.canModifyPrices || false,
      assignedCompanyId: apiUser.assignedCompanyId || null
    },
    createdAt: apiUser.createdAt || new Date().toISOString()
  }
}

/**
 * Mapea un usuario del frontend al formato de la API
 */
function mapFrontendUserToApi(frontendUser) {
  return {
    name: frontendUser.name,
    email: frontendUser.email,
    password: frontendUser.password,
    role: frontendUser.role,
    canModifyPrices: frontendUser.extra?.canModifyPrices || false,
    assignedCompanyId: frontendUser.extra?.assignedCompanyId || null
  }
}

/**
 * Obtiene todos los usuarios
 */
export async function listUsers() {
  try {
    const response = await get('/users')
    const users = response.data || []
    
    // Mapear cada usuario de la API al formato del frontend
    return users.map(mapApiUserToFrontend)
  } catch (error) {
    console.error('Error al listar usuarios:', error)
    throw error
  }
}

/**
 * Obtiene un usuario por ID
 */
export async function getUserById(id) {
  try {
    const response = await get(`/users/${id}`)
    return mapApiUserToFrontend(response.data)
  } catch (error) {
    console.error('Error al obtener usuario:', error)
    throw error
  }
}

/**
 * Crea un nuevo usuario
 */
export async function createUser(userData) {
  try {
    const apiData = mapFrontendUserToApi(userData)
    const response = await post('/users', apiData)
    return mapApiUserToFrontend(response.data)
  } catch (error) {
    console.error('Error al crear usuario:', error)
    throw error
  }
}

/**
 * Actualiza un usuario existente
 */
export async function updateUser(id, userData) {
  try {
    const apiData = mapFrontendUserToApi(userData)
    const response = await put(`/users/${id}`, apiData)
    return mapApiUserToFrontend(response.data)
  } catch (error) {
    console.error('Error al actualizar usuario:', error)
    throw error
  }
}

/**
 * Elimina un usuario
 */
export async function deleteUser(id) {
  try {
    await del(`/users/${id}`)
    return true
  } catch (error) {
    console.error('Error al eliminar usuario:', error)
    throw error
  }
}
