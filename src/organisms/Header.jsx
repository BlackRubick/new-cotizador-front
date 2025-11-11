import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Home, FileText, Users, Shield, Package, LogOut, Menu, X, ChevronDown } from 'lucide-react'

export default function Header() {
  const { user, logout, hasPermission } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const isActive = (path) => {
    if (typeof window !== 'undefined') {
      return window.location.pathname === path
    }
    return false
  }

  const navItems = [
    { path: '/home', label: 'Dashboard', icon: Home, permission: 'view_home' },
    { path: '/quotes', label: 'Cotizaciones', icon: FileText, permission: 'view_quotes' },
    { path: '/products', label: 'Productos', icon: Package, permission: 'view_products' },
    { path: '/clients', label: 'Clientes', icon: Users, permission: 'view_clients' },
    { path: '/admin', label: 'Usuarios', icon: Shield, permission: 'admin_panel' },
  ]

  const getRoleBadgeColor = (role) => {
    switch(role) {
      case 'jefe': return 'bg-gradient-to-br from-blue-600 to-cyan-600'
      case 'admin': return 'bg-gradient-to-br from-purple-600 to-pink-600'
      case 'vendedor': return 'bg-gradient-to-br from-emerald-600 to-green-600'
      default: return 'bg-gradient-to-br from-gray-600 to-slate-600'
    }
  }

  const getRoleInitial = (role) => {
    switch(role) {
      case 'jefe': return 'J'
      case 'admin': return 'A'
      case 'vendedor': return 'V'
      default: return 'U'
    }
  }

  const getRoleIcon = (role) => {
    switch(role) {
      case 'jefe': return 'J'
      case 'admin': return 'A'
      case 'vendedor': return 'V'
      default: return 'U'
    }
  }

  return (
    <header className="relative bg-white/90 backdrop-blur-lg shadow-xl border-b-2 border-blue-100 sticky top-0 z-50">
      <div className="w-full px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Logo/Brand Section - LEFT */}
          <div className="flex items-center">
            <Link to="/home" className="group" aria-label="Ir al inicio">
              <h1 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent group-hover:from-cyan-600 group-hover:to-blue-600 transition-all duration-300">
                COTIZADOR
              </h1>
              <div className="flex gap-1 mt-0">
                <div className="h-1 w-6 sm:w-8 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full group-hover:w-10 sm:group-hover:w-12 transition-all duration-300"></div>
                <div className="h-1 w-6 sm:w-8 bg-gradient-to-r from-cyan-600 to-blue-400 rounded-full group-hover:w-10 sm:group-hover:w-12 transition-all duration-300"></div>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation - CENTER */}
          {user && (
            <nav aria-label="Navegación principal" className="hidden lg:flex items-center justify-center gap-2">
              {navItems.map((item) => {
                if (!hasPermission(item.permission)) return null
                const Icon = item.icon
                const active = isActive(item.path)

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    aria-label={`Ir a ${item.label}`}
                    aria-current={active ? 'page' : undefined}
                    className={`
                      flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm
                      transition-all duration-300 transform hover:scale-105
                      ${active 
                        ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-200' 
                        : 'text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 hover:text-blue-600'
                      }
                    `}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </nav>
          )}

          {/* User Section - RIGHT */}
          <div className="flex items-center gap-3 mr-0 lg:mr-0">
            {!user ? (
              <div className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-xl">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-red-600 font-medium">No autenticado</span>
              </div>
            ) : (
              <>
                {/* Desktop User Menu */}
                <div className="hidden lg:block relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    aria-haspopup="true"
                    aria-expanded={userMenuOpen}
                    aria-controls="user-menu"
                    className="flex items-center gap-3 px-4 py-2.5 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-blue-50 hover:to-cyan-50 rounded-xl border-2 border-gray-200 hover:border-blue-300 transition-all duration-300 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-xl ${getRoleBadgeColor(user.role)} flex items-center justify-center text-white font-bold shadow-lg text-lg transform hover:scale-110 transition-transform`}>
                        {getRoleInitial(user.role)}
                      </div>
                      <div className="text-left">
                        <div className="text-sm font-bold text-gray-800">{user.name}</div>
                        <div className="text-xs text-gray-600 capitalize font-medium">{user.role}</div>
                      </div>
                    </div>
                    <ChevronDown size={18} className={`text-gray-500 transition-transform duration-300 ${userMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {userMenuOpen && (
                    <>
                      {/* Overlay */}
                      <div 
                        className="fixed inset-0 z-40"
                        onClick={() => setUserMenuOpen(false)}
                      />
                      
                      <div id="user-menu" className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl border-2 border-gray-100 overflow-hidden z-60 animate-slideDown">
                        <div className="p-5 bg-gradient-to-r from-blue-50 to-cyan-50 border-b-2 border-blue-100">
                          <div className="flex items-center gap-3 mb-3">
                            <div className={`w-12 h-12 rounded-xl ${getRoleBadgeColor(user.role)} flex items-center justify-center text-white font-bold shadow-lg text-xl`}>
                              {getRoleInitial(user.role)}
                            </div>
                            <div>
                              <div className="font-bold text-gray-800">{user.name}</div>
                              <div className="text-sm text-gray-600 capitalize font-medium">{user.role}</div>
                            </div>
                          </div>
                          <div className="text-xs text-gray-600 bg-white/70 px-3 py-2 rounded-lg">
                            {user.email || 'usuario@empresa.com'}
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            logout()
                            setUserMenuOpen(false)
                          }}
                          className="w-full flex items-center gap-3 px-5 py-4 text-red-600 hover:bg-red-50 transition-colors font-semibold"
                        >
                          <LogOut size={20} />
                          <span>Cerrar sesión</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>

                {/* Mobile Menu Button */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  aria-label="Abrir menú móvil"
                  aria-expanded={mobileMenuOpen}
                  className="lg:hidden p-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-cyan-600 hover:to-blue-600 text-white rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                >
                  {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        {user && mobileMenuOpen && (
          <div className="lg:hidden mt-6 pb-4 border-t-2 border-blue-100 pt-6 animate-slideDown">
            <nav className="flex flex-col gap-2">
              {navItems.map((item) => {
                if (!hasPermission(item.permission)) return null
                const Icon = item.icon
                const active = isActive(item.path)
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`
                      flex items-center gap-3 px-5 py-4 rounded-xl font-semibold
                      transition-all duration-300 transform hover:scale-105
                      ${active 
                        ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-200' 
                        : 'text-gray-700 bg-gray-50 hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 hover:text-blue-600'
                      }
                    `}
                  >
                    <Icon size={22} />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
              
              {/* Mobile User Info & Logout */}
              <div className="mt-6 pt-6 border-t-2 border-blue-100">
                <div className="flex items-center gap-4 px-5 py-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl mb-3 border-2 border-blue-100">
                  <div className={`w-12 h-12 rounded-xl ${getRoleBadgeColor(user.role)} flex items-center justify-center text-white shadow-lg`}>
                    <span className="text-xl font-bold">{getRoleIcon(user.role)}</span>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-gray-800">{user.name}</div>
                    <div className="text-xs text-gray-600 capitalize font-medium">{user.role}</div>
                    <div className="text-xs text-gray-500 mt-1">{user.email || 'usuario@empresa.com'}</div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    logout()
                    setMobileMenuOpen(false)
                  }}
                  className="w-full flex items-center justify-center gap-3 px-5 py-4 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors font-bold border-2 border-red-200"
                >
                  <LogOut size={20} />
                  <span>Cerrar sesión</span>
                </button>
              </div>
            </nav>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </header>
  )
}