import React, { createContext, useContext, useEffect, useState } from 'react'
import * as authService from '../services/authService'

// Roles: 'jefe' (super), 'admin' (administrator), 'vendedor' (seller)
// Permissions map for roles (jefe has all permissions via wildcard)
const rolePermissions = {
  jefe: ['*'],
  admin: [
    'view_home',
    'view_about',
    'view_quotes',
    'create_quote',
    'view_clients',
    'view_products',
    'admin_panel'
  ],
  // Ajuste: vendedores NO deben ver el dashboard (view_home), pero sí deben
  // poder ver cotizaciones, clientes y productos.
  vendedor: ['view_quotes', 'create_quote', 'view_clients', 'view_products'],
}

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Cargar usuario y token del localStorage al iniciar
    try {
      const savedUser = localStorage.getItem('auth_user')
      const savedToken = localStorage.getItem('auth_token')
      
      if (savedUser && savedToken) {
        setUser(JSON.parse(savedUser))
        setToken(savedToken)
      }
    } catch (e) {
      console.error('Error al cargar usuario:', e)
    } finally {
      setLoading(false)
    }
  }, [])

  async function login(email, password) {
    try {
      setLoading(true)
      const response = await authService.login(email, password)
      
      // La API devuelve: { success: true, token, user: { id, email, name, role } }
      const { token: authToken, user: userData } = response
      
      // Guardar en estado
      setUser(userData)
      setToken(authToken)
      
      // Guardar en localStorage
      localStorage.setItem('auth_user', JSON.stringify(userData))
      localStorage.setItem('auth_token', authToken)
      
      return { success: true, user: userData }
    } catch (error) {
      console.error('Error en login:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  async function logout() {
    try {
      if (token) {
        await authService.logout(token)
      }
    } catch (error) {
      console.error('Error en logout:', error)
    } finally {
      // Limpiar estado y localStorage
      setUser(null)
      setToken(null)
      localStorage.removeItem('auth_user')
      localStorage.removeItem('auth_token')
    }
  }

  function hasPermission(permission) {
    if (!user) return false
    const perms = rolePermissions[user.role] || []
    if (perms.includes('*')) return true
    if (perms.includes(permission)) return true
    return false
  }

  // Función para obtener el token (útil para hacer peticiones a la API)
  function getToken() {
    return token
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      loading, 
      login, 
      logout, 
      hasPermission, 
      getToken 
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

export default AuthContext
