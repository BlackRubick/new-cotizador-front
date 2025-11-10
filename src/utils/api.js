// Utilidad para hacer peticiones HTTP con autenticación
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

/**
 * Obtener el token del localStorage
 */
function getToken() {
  return localStorage.getItem('auth_token');
}

/**
 * Hacer una petición HTTP autenticada
 * @param {string} endpoint - Endpoint de la API (sin /api)
 * @param {object} options - Opciones de fetch
 * @returns {Promise<any>}
 */
export async function fetchWithAuth(endpoint, options = {}) {
  const token = getToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Error en la petición' }));
    throw new Error(error.error || `Error: ${response.status}`);
  }

  return response.json();
}

/**
 * GET request
 */
export async function get(endpoint) {
  return fetchWithAuth(endpoint, { method: 'GET' });
}

/**
 * POST request
 */
export async function post(endpoint, data) {
  return fetchWithAuth(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * PUT request
 */
export async function put(endpoint, data) {
  return fetchWithAuth(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * DELETE request
 */
export async function del(endpoint) {
  return fetchWithAuth(endpoint, { method: 'DELETE' });
}

export default {
  get,
  post,
  put,
  delete: del,
  fetchWithAuth,
};
