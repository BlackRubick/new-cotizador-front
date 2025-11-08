import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function ProtectedRoute({ children, permission }) {
  const { user, hasPermission } = useAuth()

  if (!user) {
    return <Navigate to="/" replace />
  }

  if (permission && !hasPermission(permission)) {
    return <div className="p-8 text-center">No tienes permisos para ver esta página.</div>
  }

  return children
}
