// Servicio de autenticación que se comunica con la API
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

/**
 * Login del usuario
 * @param {string} email - Email del usuario
 * @param {string} password - Contraseña del usuario
 * @returns {Promise<{token: string, user: object}>} Token y datos del usuario
 */
export async function login(email, password) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al iniciar sesión');
  }

  const result = await response.json();
  // La API devuelve: { success: true, data: { token, user } }
  return result.data;
}

/**
 * Renovar el token de autenticación
 * @param {string} token - Token actual
 * @returns {Promise<{token: string}>} Nuevo token
 */
export async function refreshToken(token) {
  const response = await fetch(`${API_URL}/auth/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token }),
  });

  if (!response.ok) {
    throw new Error('Error al renovar el token');
  }

  const result = await response.json();
  // La API devuelve: { success: true, data: { token } }
  return result.data;
}

/**
 * Logout del usuario
 * @param {string} token - Token de autenticación
 * @returns {Promise<void>}
 */
export async function logout(token) {
  try {
    await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  } catch (error) {
    // Ignorar errores del logout en el servidor
    console.error('Error en logout:', error);
  }
}

/**
 * Verificar si el token es válido
 * @param {string} token - Token de autenticación
 * @returns {Promise<boolean>}
 */
export async function verifyToken(token) {
  try {
    const response = await fetch(`${API_URL}/auth/verify`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.ok;
  } catch (error) {
    return false;
  }
}
