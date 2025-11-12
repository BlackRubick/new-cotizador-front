import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function ProtectedRoute({ children, permission }) {
  const { user, hasPermission, loading } = useAuth()

  // Mostrar un loader mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-cyan-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/" replace />
  }

  if (permission && !hasPermission(permission)) {
    // Si el permiso solicitado es el dashboard y el usuario es un vendedor,
    // redirigir automáticamente a /quotes en lugar de mostrar el mensaje.
    if (permission === 'view_home' && user && user.role === 'vendedor') {
      return <Navigate to="/quotes" replace />
    }

    return <div className="p-8 text-center">No tienes permisos para ver esta página.</div>
  }

  return children
}
