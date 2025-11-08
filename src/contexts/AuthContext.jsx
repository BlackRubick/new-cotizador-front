import React, { createContext, useContext, useEffect, useState } from 'react'

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
    'view_products'
  ],
  vendedor: ['view_home', 'view_quotes', 'create_quote', 'view_clients'],
}

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('auth_user')
      if (raw) setUser(JSON.parse(raw))
    } catch (e) {
      // ignore
    }
  }, [])

  useEffect(() => {
    if (user) localStorage.setItem('auth_user', JSON.stringify(user))
    else localStorage.removeItem('auth_user')
  }, [user])

  function login({ name, role, extra = {} }) {
    // extra: object with flags like { canModifyPrices: true }
    const newUser = { name, role, extra }
    setUser(newUser)
    return newUser
  }

  function logout() {
    setUser(null)
  }

  function hasPermission(permission) {
    if (!user) return false
    const perms = rolePermissions[user.role] || []
    if (perms.includes('*')) return true
    if (perms.includes(permission)) return true
    // also allow explicit flags in user.extra
    if (user.extra && user.extra[permission]) return true
    return false
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

export default AuthContext
