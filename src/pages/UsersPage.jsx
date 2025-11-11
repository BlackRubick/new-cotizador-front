import React, { useEffect, useState } from 'react'
import MainTemplate from '../templates/MainTemplate'
import { useAuth } from '../contexts/AuthContext'
import { Users, UserPlus, Mail, Lock, Shield, Trash2, CheckCircle, XCircle, Edit3 } from 'lucide-react'
import { confirmDialog, alertInfo, alertSuccess, alertError } from '../utils/swal'
import { listUsers, createUser, updateUser, deleteUser } from '../services/userService'

export default function UsersPage() {
  const { user } = useAuth()
  const [users, setUsers] = useState([])
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState('vendedor')
  const [canModifyPrices, setCanModifyPrices] = useState(false)
  const [assignedCompanyId, setAssignedCompanyId] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingUser, setEditingUser] = useState(null) // Usuario en edición

  const sellerCompanies = [
    { id: 'conduit-life', name: 'CONDUIT LIFE', fullName: 'Conduit Life S.A. de C.V.' },
    { id: 'biosystems-hls', name: 'BIOSYSTEMS HLS', fullName: 'Biosystems HLS S.A. de C.V.' },
    { id: 'ingenieria-clinica', name: 'INGENIERÍA CLÍNICA Y DISEÑO', fullName: 'Ingeniería Clínica y Diseño S.A. de C.V.' },
    { id: 'escala-biomedica', name: 'ESCALA BIOMÉDICA', fullName: 'Escala Biomédica S.A. de C.V.' }
  ]

  useEffect(() => {
    loadUsersFromApi()
  }, [])

  async function loadUsersFromApi() {
    try {
      const usersData = await listUsers()
      setUsers(usersData)
    } catch (error) {
      console.error('Error al cargar usuarios:', error)
      await alertError('Error al cargar usuarios')
    }
  }

  async function handleCreate(e) {
    e.preventDefault()
    if (!name) {
      await alertInfo('Nombre requerido')
      return
    }
    if (!email) {
      await alertInfo('Email requerido')
      return
    }
    if (!password) {
      await alertInfo('Contraseña requerida')
      return
    }
    // Validar que un admin no pueda crear jefes
    if (user?.role === 'admin' && role === 'jefe') {
      await alertInfo('No tienes permisos para crear un jefe')
      return
    }
    // If creating a vendedor, require assigning a company
    if (role === 'vendedor' && !assignedCompanyId) {
      await alertInfo('Debes seleccionar una empresa para el vendedor')
      return
    }
    const exists = users.find(u => u.email === email)
    if (exists) {
      await alertInfo('El usuario ya existe')
      return
    }

    try {
      const newUser = { 
        name,
        email, 
        password, 
        role, 
        extra: { 
          canModifyPrices: role === 'admin' ? canModifyPrices : false,
          assignedCompanyId: role === 'vendedor' ? (assignedCompanyId || null) : null
        }
      }
      
      const createdUser = await createUser(newUser)
      setUsers(prev => [createdUser, ...prev])
      
      setEmail('')
      setPassword('')
      setName('')
      setRole('vendedor')
      setCanModifyPrices(false)
      setAssignedCompanyId('')
      setShowForm(false)
      
      await alertSuccess('Usuario creado exitosamente')
    } catch (error) {
      console.error('Error al crear usuario:', error)
      await alertError('Error al crear usuario')
    }
  }

  async function handleDelete(id) {
    const userToDelete = users.find(u => u.id === id)
    
    // Validar que un admin no pueda eliminar a un jefe
    if (user?.role === 'admin' && userToDelete?.role === 'jefe') {
      await alertInfo('No tienes permisos para eliminar a un jefe')
      return
    }
    
    if (!(await confirmDialog('¿Eliminar usuario?'))) return
    
    try {
      await deleteUser(id)
      setUsers(prev => prev.filter(u => u.id !== id))
      await alertSuccess('Usuario eliminado')
    } catch (error) {
      console.error('Error al eliminar usuario:', error)
      await alertError('Error al eliminar usuario')
    }
  }

  async function toggleCanModify(id) {
    if (!user || user.role !== 'jefe') {
      await alertInfo('Solo el jefe puede cambiar este permiso')
      return
    }
    
    try {
      const userToUpdate = users.find(u => u.id === id)
      if (!userToUpdate) return
      
      const updatedData = {
        ...userToUpdate,
        extra: {
          ...userToUpdate.extra,
          canModifyPrices: !userToUpdate.extra?.canModifyPrices
        }
      }
      
      await updateUser(id, updatedData)
      setUsers(prev => prev.map(u => u.id === id ? { ...u, extra: { ...u.extra, canModifyPrices: !u.extra?.canModifyPrices } } : u))
      await alertSuccess('Permisos actualizados')
    } catch (error) {
      console.error('Error al actualizar permisos:', error)
      await alertError('Error al actualizar permisos')
    }
  }

  async function handleStartEdit(userToEdit) {
    // Validar que un admin no pueda editar a un jefe
    if (user?.role === 'admin' && userToEdit?.role === 'jefe') {
      await alertInfo('No tienes permisos para editar a un jefe')
      return
    }
    
    setEditingUser(userToEdit)
    setName(userToEdit.name)
    setEmail(userToEdit.email)
    setPassword('') // Dejamos vacío, solo se cambiará si el usuario ingresa una nueva
    setRole(userToEdit.role)
    setCanModifyPrices(userToEdit.extra?.canModifyPrices || false)
    setAssignedCompanyId(userToEdit.extra?.assignedCompanyId || '')
    setShowForm(true)
  }

  async function handleUpdate(e) {
    e.preventDefault()
    if (!name) {
      await alertInfo('Nombre requerido')
      return
    }
    if (!email) {
      await alertInfo('Email requerido')
      return
    }
    if (role === 'vendedor' && !assignedCompanyId) {
      await alertInfo('Debes seleccionar una empresa para el vendedor')
      return
    }

    try {
      const updatedData = { 
        name,
        email,
        role, 
        extra: { 
          canModifyPrices: role === 'admin' ? canModifyPrices : false,
          assignedCompanyId: role === 'vendedor' ? (assignedCompanyId || null) : null
        }
      }
      
      // Solo incluir password si se ingresó uno nuevo
      if (password && password.trim() !== '') {
        updatedData.password = password
      }
      
      const updated = await updateUser(editingUser.id, updatedData)
      setUsers(prev => prev.map(u => u.id === editingUser.id ? updated : u))
      
      // Limpiar formulario
      setEditingUser(null)
      setEmail('')
      setPassword('')
      setName('')
      setRole('vendedor')
      setCanModifyPrices(false)
      setAssignedCompanyId('')
      setShowForm(false)
      
      await alertSuccess('Usuario actualizado exitosamente')
    } catch (error) {
      console.error('Error al actualizar usuario:', error)
      await alertError('Error al actualizar usuario')
    }
  }

  function handleCancelEdit() {
    setEditingUser(null)
    setEmail('')
    setPassword('')
    setName('')
    setRole('vendedor')
    setCanModifyPrices(false)
    setAssignedCompanyId('')
    setShowForm(false)
  }

  const getRoleColor = (role) => {
    switch(role) {
      case 'jefe': return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'admin': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'vendedor': return 'bg-green-100 text-green-700 border-green-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  // Return the initial for the user's name (falls back to role initial)
  const getRoleIcon = (userOrRole) => {
    // If a user object is passed, try to use its name
    if (userOrRole && typeof userOrRole === 'object') {
      const n = userOrRole.name || ''
      return n ? n.charAt(0).toUpperCase() : ''
    }

    // If a role string was passed, use the first letter of the role
    if (typeof userOrRole === 'string') {
      return userOrRole.charAt(0).toUpperCase()
    }

    return ''
  }

  const stats = {
    total: users.length,
    vendedores: users.filter(u => u.role === 'vendedor').length,
    admins: users.filter(u => u.role === 'admin').length,
    jefes: users.filter(u => u.role === 'jefe').length
  }

  return (
    <MainTemplate>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl shadow-lg">
              <Users className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                Gestión de Usuarios
              </h1>
              <p className="text-gray-600">Administra el acceso y permisos del equipo</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Usuarios</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{stats.total}</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl">
                <Users className="text-blue-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Vendedores</p>
                <p className="text-3xl font-bold text-green-600 mt-1">{stats.vendedores}</p>
              </div>
              <div className="text-3xl"></div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Administradores</p>
                <p className="text-3xl font-bold text-blue-600 mt-1">{stats.admins}</p>
              </div>
              <div className="text-3xl"></div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Jefes</p>
                <p className="text-3xl font-bold text-purple-600 mt-1">{stats.jefes}</p>
              </div>
              <div className="text-3xl"></div>
            </div>
          </div>
        </div>

        {/* Create User Section */}
        <div className="mb-6">
          <button
            onClick={() => {
              if (showForm && editingUser) {
                handleCancelEdit()
              } else {
                setShowForm(!showForm)
              }
            }}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 font-medium"
          >
            <UserPlus size={20} />
            {showForm ? 'Cancelar' : 'Crear Nuevo Usuario'}
          </button>
        </div>

        {showForm && (
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/20 mb-6 transform animate-in">
            <div className="flex items-center gap-2 mb-4">
              {editingUser ? <Edit3 className="text-blue-600" size={24} /> : <UserPlus className="text-blue-600" size={24} />}
              <h2 className="text-xl font-bold text-gray-800">
                {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Users className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white/50"
                    placeholder="Nombre completo"
                    value={name}
                    onChange={e => setName(e.target.value)}
                  />
                </div>
              </div>
              {/* Email Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white/50"
                    placeholder="usuario@empresa.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña {editingUser && <span className="text-gray-500 text-xs">(dejar vacío para no cambiar)</span>}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white/50"
                    placeholder={editingUser ? "••••••••" : "Contraseña"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                </div>
              </div>

              {/* Role Select */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rol de Usuario
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Shield className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white/50 appearance-none"
                    value={role}
                    onChange={e => setRole(e.target.value)}
                  >
                    <option value="vendedor"> Vendedor</option>
                    <option value="admin"> Administrador</option>
                    <option value="jefe" disabled={user?.role === 'admin'}>
                       Jefe {user?.role === 'admin' ? '(Sin permisos)' : ''}
                    </option>
                  </select>
                </div>
              </div>

              {/* Assign Company for Vendedor */}
              {role === 'vendedor' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Empresa Asignada</label>
                  <select value={assignedCompanyId} onChange={e => setAssignedCompanyId(e.target.value)} className="w-full pl-3 pr-4 py-3 border border-gray-300 rounded-xl bg-white/50">
                    <option value="">-- Seleccionar empresa --</option>
                    {sellerCompanies.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Permissions Checkbox */}
              <div className="flex items-end">
                {role === 'admin' && (
                  <label className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-200 cursor-pointer hover:bg-blue-100 transition-colors w-full">
                    <input
                      type="checkbox"
                      className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      checked={canModifyPrices}
                      onChange={e => setCanModifyPrices(e.target.checked)}
                    />
                    <span className="text-sm font-medium text-blue-900">Permitir modificar precios</span>
                  </label>
                )}
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={editingUser ? handleUpdate : handleCreate}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 font-medium"
              >
                {editingUser ? <Edit3 size={20} /> : <UserPlus size={20} />}
                {editingUser ? 'Actualizar Usuario' : 'Crear Usuario'}
              </button>
              <button
                onClick={editingUser ? handleCancelEdit : () => setShowForm(false)}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-medium"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Users List */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-cyan-50">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Users size={24} className="text-blue-600" />
              Listado de Usuarios
            </h2>
          </div>

          <div className="p-6">
            {users.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                  <Users size={32} className="text-gray-400" />
                </div>
                <p className="text-gray-500 text-lg">No hay usuarios creados</p>
                <p className="text-gray-400 text-sm mt-2">Crea tu primer usuario para comenzar</p>
              </div>
            ) : (
              <div className="space-y-3">
                {users.map(u => (
                  <div
                    key={u.id}
                    className="group p-5 bg-gradient-to-r from-white to-gray-50 rounded-xl shadow-md hover:shadow-lg border border-gray-200 hover:border-blue-300 transition-all duration-300"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                          <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl text-2xl">
                          {getRoleIcon(u)}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <div>
                              <div className="font-semibold text-gray-800 text-lg">{u.name || u.email}</div>
                              <div className="text-sm text-gray-500">{u.email}</div>
                            </div>
                            <span className={`px-3 py-1 rounded-lg text-xs font-semibold border ${getRoleColor(u.role)}`}>
                              {u.role.toUpperCase()}
                            </span>
                            {u.extra && u.extra.assignedCompanyId ? (
                              (() => {
                                const comp = sellerCompanies.find(s => s.id === u.extra.assignedCompanyId)
                                return (
                                  <span key={u.id + '-comp'} className="flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold border border-gray-200">
                                    {comp ? comp.name : u.extra.assignedCompanyId}
                                  </span>
                                )
                              })()
                            ) : null}
                            {u.extra?.canModifyPrices && (
                              <span className="flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-semibold border border-emerald-200">
                                <Edit3 size={12} />
                                Edita precios
                              </span>
                            )}
                          </div>
                          {u.createdAt && (
                            <p className="text-xs text-gray-500 mt-1">
                              Creado: {new Date(u.createdAt).toLocaleDateString('es-MX', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {u.role === 'admin' && (
                          <button
                            onClick={() => toggleCanModify(u.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                              u.extra?.canModifyPrices
                                ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border border-emerald-300'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-300'
                            }`}
                          >
                            {u.extra?.canModifyPrices ? (
                              <>
                                <CheckCircle size={16} />
                                Edita precios
                              </>
                            ) : (
                              <>
                                <XCircle size={16} />
                                Sin edición
                              </>
                            )}
                          </button>
                        )}
                        
                        <button
                          onClick={() => handleStartEdit(u)}
                          disabled={user?.role === 'admin' && u.role === 'jefe'}
                          className={`p-2 rounded-lg transition-colors group-hover:scale-110 transform duration-200 ${
                            user?.role === 'admin' && u.role === 'jefe'
                              ? 'text-gray-400 cursor-not-allowed'
                              : 'text-blue-600 hover:bg-blue-50'
                          }`}
                          title={user?.role === 'admin' && u.role === 'jefe' ? 'No puedes editar a un jefe' : 'Editar usuario'}
                        >
                          <Edit3 size={20} />
                        </button>
                        
                        <button
                          onClick={() => handleDelete(u.id)}
                          disabled={user?.role === 'admin' && u.role === 'jefe'}
                          className={`p-2 rounded-lg transition-colors group-hover:scale-110 transform duration-200 ${
                            user?.role === 'admin' && u.role === 'jefe'
                              ? 'text-gray-400 cursor-not-allowed'
                              : 'text-red-600 hover:bg-red-50'
                          }`}
                          title={user?.role === 'admin' && u.role === 'jefe' ? 'No puedes eliminar a un jefe' : 'Eliminar usuario'}
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </MainTemplate>
  )
}