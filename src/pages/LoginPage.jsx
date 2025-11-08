import React, { useState } from 'react'
import { Activity, Mail, Lock, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isHovered, setIsHovered] = useState(false)
  const [role, setRole] = useState('vendedor')
  const navigate = useNavigate()
  const { login } = useAuth()

  function handleSubmit(e) {
    e.preventDefault()
    // Aquí normalmente validarías y llamarías a tu API de autenticación
    // Try to find a stored user (created in UsersPage) by email and use its data if present
    try {
      const raw = localStorage.getItem('app_users')
      if (raw) {
        const users = JSON.parse(raw)
        const found = users.find(u => u.email === email)
        if (found) {
          // login using stored user record but prefer the role selected in the form
          // this lets you override a stored role (e.g., log in as 'jefe') while keeping extras
          login({ name: found.name || found.email, role: role || found.role, extra: found.extra || {} })
          navigate('/home')
          return
        }
      }
    } catch (e) {
      // ignore and fallback to default
    }

    login({ name: email || 'Usuario', role })
    navigate('/home')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-cyan-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        {/* Header with animated icon */}
        <div className="text-center">
          <div className="mx-auto h-20 w-20 flex items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-600 text-white shadow-lg transform hover:scale-110 transition-transform duration-300">
            <Activity size={40} className="animate-pulse" />
          </div>
          <h2 className="mt-6 text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Bienvenido
          </h2>
          <p className="mt-3 text-gray-600">
            Accede a tu plataforma de equipos biomédicos
          </p>
          <div className="mt-2 flex justify-center gap-1">
            <div className="h-1 w-8 bg-blue-600 rounded-full"></div>
            <div className="h-1 w-8 bg-cyan-600 rounded-full"></div>
            <div className="h-1 w-8 bg-teal-600 rounded-full"></div>
          </div>
        </div>

        {/* Form card with glassmorphism effect */}
        <div className="backdrop-blur-lg bg-white/80 p-8 rounded-3xl shadow-2xl border border-white/20 transform transition-all duration-300 hover:shadow-3xl">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Email input */}
            <div className="group">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Correo Electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  className="appearance-none block w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/50"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Password input */}
            <div className="group">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  className="appearance-none block w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/50"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>
            </div>
          <div className="grid grid-cols-2 gap-4">
            <select value={role} onChange={e => setRole(e.target.value)} className="py-3 px-3 rounded-xl border">
              <option value="vendedor">Vendedor</option>
              <option value="admin">Administrador</option>
              <option value="jefe">Jefe</option>
            </select>

            {/* Submit button */}
            <button
              type="submit"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className="group relative w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent text-base font-medium rounded-xl text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
            >
              <span>Ingresar</span>
              <ArrowRight 
                size={20} 
                className={`transform transition-transform duration-300 ${isHovered ? 'translate-x-1' : ''}`}
              />
            </button>
            </div>
          </form>

          {/* Footer info */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-center text-xs text-gray-500">
              Sistema de gestión de equipos biomédicos
            </p>
            <div className="mt-2 flex justify-center items-center gap-2 text-xs text-gray-400">
              <Activity size={14} />
              <span>Grupo Biomédico Empresarial</span>
            </div>
          </div>
        </div>


      </div>
    </div>
  )
}