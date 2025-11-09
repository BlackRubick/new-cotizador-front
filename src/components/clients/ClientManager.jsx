import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { confirmDialog, alertInfo, alertSuccess } from '../../utils/swal'
import ClientForm from './ClientForm'
import clientService from '../../services/clientService'
import { 
  Building2, 
  Upload, 
  UserPlus, 
  Edit3, 
  Trash2, 
  MapPin, 
  Calendar,
  FileText,
  Package,
  AlertCircle,
  CheckCircle2,
  Search,
  Filter,
  X,
  Wrench,
  Hash,
  Tag,
  User,
  Phone,
  Mail,
  Briefcase
} from 'lucide-react'

export default function ClientManager() {
  const [clients, setClients] = useState([])
  const [editingEquipments, setEditingEquipments] = useState({})
  const [searchQuery, setSearchQuery] = useState('')
  const [filterEstado, setFilterEstado] = useState('')
  const [importing, setImporting] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    setClients(clientService.listClients())
  }, [])

  function handleEdit(client) {
    navigate(`/clients/${client.id}/edit`)
  }

  async function handleDelete(id) {
    if (!(await confirmDialog('¿Está seguro de eliminar este cliente?'))) return
    await clientService.deleteClient(id)
    setClients(clientService.listClients())
  }

  async function handleImportExcel(file) {
    if (!file) return
    const ext = file.name.split('.').pop().toLowerCase()
    if (!['xlsx','xls'].includes(ext)) {
      await alertInfo('El archivo debe ser .xlsx o .xls')
      return
    }

    setImporting(true)
    try {
      const { read, utils } = await import('xlsx')
      const data = await file.arrayBuffer()
      const workbook = read(data)
      const sheet = workbook.Sheets[workbook.SheetNames[0]]
      const rows = utils.sheet_to_json(sheet, { header: 1 })
      if (!rows || rows.length === 0) {
        await alertInfo('No hay filas en el archivo')
        setImporting(false)
        return
      }

      const mapped = []
      for (let i = 1; i < rows.length; i++) {
        const r = rows[i]
        if (!r) continue
        const [empresaResponsable, dependencia, hospital, estado, ciudad, codigoPostal, direccion, contrato, equipo, marca, modelo, numeroSerie, fechaInstalacion, ultimoMantenimiento, estatusAbril2025, estatusInicio26] = r
        if (!empresaResponsable || !dependencia || !hospital || !estado || !ciudad || !codigoPostal || !direccion || !equipo || !marca || !modelo || !numeroSerie) continue
        mapped.push({ empresaResponsable, dependencia, hospital, estado, ciudad, codigoPostal: String(codigoPostal), direccion, contrato, equipo, marca, modelo, numeroSerie, fechaInstalacion, ultimoMantenimiento, estatusAbril2025, estatusInicio26 })
      }

      if (mapped.length === 0) {
        await alertInfo('No se encontraron filas válidas para importar')
        setImporting(false)
        return
      }

      if (!(await confirmDialog(`¿Importar ${mapped.length} clientes?`))) {
        setImporting(false)
        return
      }

      let success = 0
      let fails = 0
      for (const c of mapped) {
        const res = await clientService.createClient(c)
        if (res.success) success++
        else fails++
        await new Promise(r=>setTimeout(r,500))
      }

      await alertSuccess(`Importación finalizada.\nÉxitos: ${success}\nErrores: ${fails}`)
      setClients(clientService.listClients())
    } catch (error) {
      await alertInfo('Error al procesar el archivo: ' + error.message)
    } finally {
      setImporting(false)
    }
  }

  const filteredClients = clients.filter(c => {
    const matchesSearch = !searchQuery || 
      c.empresaResponsable?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.hospital?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.ciudad?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.equipo?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = !filterEstado || c.estado === filterEstado
    return matchesSearch && matchesFilter
  })

  function buildGroups(listClients) {
    const groupsMap = {}
    listClients.forEach(c => {
      const key = (c.hospital || c.empresaResponsable || '').toString().trim().toLowerCase() || `id-${c.id}`
      if (!groupsMap[key]) {
        groupsMap[key] = {
          key,
          hospital: c.hospital || c.empresaResponsable || c.name || '',
          dependencias: new Set(),
          empresas: new Set(),
          equipos: [],
          encargados: [],
          clientIds: [],
          sample: c
        }
      }
      const g = groupsMap[key]
      if (!Array.isArray(g.encargados)) g.encargados = []
      if (c.dependencia) g.dependencias.add(c.dependencia)
      if (c.empresaResponsable) g.empresas.add(c.empresaResponsable)
      if (c.equipo || c.marca || c.modelo || c.numeroSerie) {
        g.equipos.push({
          nombre: c.equipo || '',
          marca: c.marca || '',
          modelo: c.modelo || '',
          numeroSerie: c.numeroSerie || '',
          fechaInstalacion: c.fechaInstalacion || '',
          ultimoMantenimiento: c.ultimoMantenimiento || '',
          _clientId: c.id
        })
      }
      if (Array.isArray(c.encargados) && c.encargados.length > 0) {
        c.encargados.forEach(enc => {
          g.encargados.push({ ...(enc || {}), _clientId: c.id })
        })
      }
      g.clientIds.push(c.id)
    })

    const groups = Object.values(groupsMap).map(g => {
      try {
        const unique = []
        const seen = new Set()
        const list = Array.isArray(g.encargados) ? g.encargados : []
        list.forEach(enc => {
          const name = String(enc?.nombre || '').trim().toLowerCase()
          const email = String(enc?.email || '').trim().toLowerCase()
          const phone = String(enc?.telefono || '').trim()
          const keyEnc = enc && enc.id ? `id-${enc.id}` : `${name}|${email}|${phone}`
          if (!seen.has(keyEnc)) {
            seen.add(keyEnc)
            unique.push(enc)
          }
        })
        return {
          ...g,
          dependencias: Array.from(g.dependencias || []),
          empresas: Array.from(g.empresas || []),
          encargados: unique
        }
      } catch (err) {
        console.error('[ClientManager] error processing group', g && g.key, err)
        return {
          ...g,
          dependencias: Array.from(g.dependencias || []),
          empresas: Array.from(g.empresas || []),
          encargados: []
        }
      }
    })
    return groups
  }

  const groups = buildGroups(filteredClients)

  const [openGroup, setOpenGroup] = useState(null)

  async function handleStartEditEquipment(eq) {
    const key = eq._clientId || `${eq.nombre}-${Math.random()}`
    setEditingEquipments(prev => ({ ...prev, [key]: { ...eq } }))
  }

  function handleCancelEditEquipment(eq) {
    const key = eq._clientId || `${eq.nombre}-${Math.random()}`
    setEditingEquipments(prev => {
      const next = { ...prev }
      delete next[key]
      return next
    })
  }

  async function handleSaveEquipment(eq) {
    const key = eq._clientId
    const edited = editingEquipments[key]
    if (!edited) return
    const original = clients.find(c => c.id === key)
    if (!original) {
      await alertInfo('No se encontró el cliente origen del equipo')
      return
    }
    const payload = {
      ...original,
      equipo: edited.nombre,
      marca: edited.marca,
      modelo: edited.modelo,
      numeroSerie: edited.numeroSerie,
      fechaInstalacion: edited.fechaInstalacion,
      ultimoMantenimiento: edited.ultimoMantenimiento
    }
    const res = await clientService.updateClient(original.id, payload)
    if (res && res.success) {
      const nextClients = clientService.listClients()
      setClients(nextClients)
      const newGroups = buildGroups(nextClients.filter(c => {
        const matchesSearch = !searchQuery || 
          c.empresaResponsable?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.hospital?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.ciudad?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.equipo?.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesFilter = !filterEstado || c.estado === filterEstado
        return matchesSearch && matchesFilter
      }))
      const sameGroup = newGroups.find(g => g.key === (openGroup && openGroup.key))
      setOpenGroup(sameGroup || null)
      setEditingEquipments(prev => {
        const next = { ...prev }
        delete next[key]
        return next
      })
      await alertSuccess('Equipo actualizado')
    } else {
      await alertInfo('No fue posible actualizar el equipo')
    }
  }

  const estados = [...new Set(clients.map(c => c.estado).filter(Boolean))]

  const getStatusBadge = (client) => {
    if (client.estatusAbril2025) {
      return {
        text: client.estatusAbril2025,
        color: client.estatusAbril2025.toLowerCase().includes('activo') ? 'emerald' : 'gray'
      }
    }
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-gradient-to-br from-med-primary to-med-primary-500 rounded-2xl shadow-lg">
              <Building2 className="text-white" size={32} />
            </div>
            <div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-med-primary to-med-primary-500 bg-clip-text text-transparent">
                Gestión de Clientes
              </h2>
              <p className="text-gray-600 mt-1">
                {filteredClients.length} {filteredClients.length === 1 ? 'cliente registrado' : 'clientes registrados'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className={`
              relative flex items-center gap-2 px-4 py-3 rounded-xl font-medium text-sm
              transition-all duration-300 cursor-pointer
              ${importing 
                ? 'bg-gray-300 cursor-not-allowed' 
                : 'bg-med-primary text-white hover:bg-med-primary-500 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
              }
            `}>
              <input 
                type="file" 
                accept=".xlsx,.xls" 
                onChange={e=>handleImportExcel(e.target.files?.[0])} 
                className="hidden"
                disabled={importing}
              />
              <Upload size={20} />
              <span>{importing ? 'Importando...' : 'Importar Excel'}</span>
            </label>

            <button 
              onClick={()=> navigate('/clients/new')} 
              className="flex items-center gap-2 px-4 py-3 bg-med-primary text-white rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 font-medium"
            >
              <UserPlus size={20} />
              <span>Nuevo Cliente</span>
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="text-gray-400" size={20} />
            </div>
            <input
              type="text"
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white/80 backdrop-blur-sm shadow-md"
              placeholder="Buscar por empresa, hospital, ciudad, equipo..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            )}
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Filter className="text-gray-400" size={20} />
          </div>
          <select
            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white/80 backdrop-blur-sm shadow-md appearance-none"
            value={filterEstado}
            onChange={e => setFilterEstado(e.target.value)}
          >
            <option value="">Todos los estados</option>
            {estados.map(estado => (
              <option key={estado} value={estado}>{estado}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Clients Grid */}
      {filteredClients.length === 0 ? (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-12 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
            <Building2 size={40} className="text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            {searchQuery || filterEstado ? 'No se encontraron clientes' : 'No hay clientes registrados'}
          </h3>
          <p className="text-gray-500">
            {searchQuery || filterEstado 
              ? 'Intenta ajustar los filtros de búsqueda'
              : 'Comienza agregando tu primer cliente'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {groups.map(g => {
            const statusBadge = null
            return (
              <div 
                key={g.key} 
                className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 hover:shadow-2xl transition-all duration-300 overflow-hidden"
              >
                {/* Header del Card */}
                <div className="p-6 bg-gradient-to-r from-med-bg to-med-bg-100 border-b border-gray-200">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-med-bg-100 rounded-lg">
                          <Building2 className="text-med-primary" size={20} />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-800 text-lg leading-tight">
                            {g.hospital}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">{g.dependencias && g.dependencias[0]}</p>
                          <p className="text-sm text-gray-500 mt-1">Empresa: {g.empresas && g.empresas[0]}</p>
                        </div>
                      </div>
                    </div>
                    
                    {statusBadge && (
                      <span className={`
                        flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold
                        bg-${statusBadge.color}-100 text-${statusBadge.color}-700 border border-${statusBadge.color}-200
                      `}>
                        {statusBadge.color === 'emerald' ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                        {statusBadge.text}
                      </span>
                    )}

                    {/* Botón eliminar rápido para el cliente representativo */}
                    <button
                      onClick={() => handleDelete(g.sample.id)}
                      title="Eliminar cliente representativo"
                      className="ml-3 p-2 bg-white/60 hover:bg-red-50 rounded-full text-red-600 hover:text-red-700 transition-colors border border-transparent hover:border-red-100"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                {/* Body del Card */}
                <div className="p-6">
                  {/* Ubicación */}
                  <div className="mb-4">
                    <div className="flex items-start gap-3 mb-2">
                      <MapPin className="text-gray-400 mt-1 flex-shrink-0" size={18} />
                      <div>
                        <p className="font-semibold text-gray-700">{g.hospital}</p>
                        <p className="text-sm text-gray-600">
                          {g.sample?.ciudad}, {g.sample?.estado} · CP {g.sample?.codigoPostal}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">{g.sample?.direccion}</p>
                      </div>
                    </div>
                  </div>

                  {/* Equipos summary */}
                  <div className="mb-4 p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Package className="text-gray-600 mt-1 flex-shrink-0" size={18} />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-700 text-sm">Equipos ({g.equipos.length})</p>
                        <ul className="text-sm text-gray-600 mt-2 space-y-2">
                          {g.equipos.slice(0,3).map((eq, i) => (
                            <li key={i} className="">
                              <div className="font-medium">{eq.nombre || '(sin nombre)'}</div>
                              <div className="text-xs text-gray-500">{eq.marca} · {eq.modelo} · S: {eq.numeroSerie}</div>
                            </li>
                          ))}
                          {g.equipos.length > 3 && <li className="text-xs text-gray-500">+{g.equipos.length - 3} más...</li>}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Footer con acciones */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/clients/${g.sample.id}/edit`)}
                          className="flex items-center gap-1 px-3 py-2 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors text-sm font-medium"
                        >
                          <Edit3 size={14} />
                          <span>Editar</span>
                        </button>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => setOpenGroup(g)} 
                            className="flex items-center gap-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                          >
                            <FileText size={14} />
                            <span>Ver detalles</span>
                          </button>
                        </div>
                      </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
      
      {/* MODAL MEJORADO */}
      {openGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-5xl bg-white rounded-2xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col animate-slideUp">
            {/* Header del Modal */}
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-6 text-white">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Building2 size={32} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-2">{openGroup.hospital}</h3>
                    <div className="space-y-1 text-blue-100 text-sm">
                      <p className="flex items-center gap-2">
                        <span className="font-semibold">Dependencias:</span> 
                        {openGroup.dependencias.join(', ') || '-'}
                      </p>
                      <p className="flex items-center gap-2">
                        <span className="font-semibold">Empresas:</span> 
                        {openGroup.empresas.join(', ') || '-'}
                      </p>
                      <p className="flex items-center gap-2">
                        <MapPin size={14} className="inline" />
                        {openGroup.sample?.ciudad}, {openGroup.sample?.estado}
                      </p>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setOpenGroup(null)} 
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Body del Modal - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-br from-slate-50 to-blue-50">
              {/* Header de sección */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Package className="text-blue-600" size={24} />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-800">Inventario de Equipos</h4>
                    <p className="text-sm text-gray-600">Total de {openGroup.equipos.length} equipos registrados</p>
                  </div>
                </div>
              </div>

              {/* Grid de Equipos */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {openGroup.equipos.map((eq, i) => (
                  <div 
                    key={i} 
                    className="bg-white rounded-xl border-2 border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 overflow-hidden"
                  >
                    {/* Header de la tarjeta de equipo */}
                    <div className="bg-gradient-to-r from-med-bg to-med-bg-100 px-4 py-3 border-b border-gray-200">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="p-2 bg-med-bg-100 rounded-lg">
                            <Wrench className="text-med-primary" size={18} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="font-bold text-gray-800 text-base truncate">
                              {eq.nombre || '(Sin nombre)'}
                            </h5>
                            <p className="text-xs text-gray-500 mt-1">Equipo #{i + 1}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Contenido de la tarjeta */}
                    <div className="p-4 space-y-3">
                      {editingEquipments[eq._clientId] ? (
                        // Edit form
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <input
                              className="w-full p-2 border-2 border-gray-200 rounded-lg"
                              value={editingEquipments[eq._clientId].nombre || ''}
                              onChange={e => setEditingEquipments(prev => ({ ...prev, [eq._clientId]: { ...prev[eq._clientId], nombre: e.target.value } }))}
                              placeholder="Nombre del equipo"
                            />
                            <input
                              className="w-full p-2 border-2 border-gray-200 rounded-lg"
                              value={editingEquipments[eq._clientId].marca || ''}
                              onChange={e => setEditingEquipments(prev => ({ ...prev, [eq._clientId]: { ...prev[eq._clientId], marca: e.target.value } }))}
                              placeholder="Marca"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <input
                              className="w-full p-2 border-2 border-gray-200 rounded-lg"
                              value={editingEquipments[eq._clientId].modelo || ''}
                              onChange={e => setEditingEquipments(prev => ({ ...prev, [eq._clientId]: { ...prev[eq._clientId], modelo: e.target.value } }))}
                              placeholder="Modelo"
                            />
                            <input
                              className="w-full p-2 border-2 border-gray-200 rounded-lg font-mono"
                              value={editingEquipments[eq._clientId].numeroSerie || ''}
                              onChange={e => setEditingEquipments(prev => ({ ...prev, [eq._clientId]: { ...prev[eq._clientId], numeroSerie: e.target.value } }))}
                              placeholder="Número de Serie"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <input
                              className="w-full p-2 border-2 border-gray-200 rounded-lg"
                              value={editingEquipments[eq._clientId].fechaInstalacion || ''}
                              onChange={e => setEditingEquipments(prev => ({ ...prev, [eq._clientId]: { ...prev[eq._clientId], fechaInstalacion: e.target.value } }))}
                              placeholder="Fecha de Instalación"
                            />
                            <input
                              className="w-full p-2 border-2 border-gray-200 rounded-lg"
                              value={editingEquipments[eq._clientId].ultimoMantenimiento || ''}
                              onChange={e => setEditingEquipments(prev => ({ ...prev, [eq._clientId]: { ...prev[eq._clientId], ultimoMantenimiento: e.target.value } }))}
                              placeholder="Último Mantenimiento"
                            />
                          </div>

                          <div className="flex gap-2 justify-end">
                            <button onClick={() => handleCancelEditEquipment(eq)} className="px-3 py-2 bg-gray-100 rounded-lg">Cancelar</button>
                            <button onClick={() => handleSaveEquipment(eq)} className="px-3 py-2 bg-emerald-600 text-white rounded-lg">Guardar</button>
                          </div>
                        </div>
                      ) : (
                        // Read-only view with Edit action
                        <>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-gray-50 rounded-lg p-3">
                              <div className="flex items-center gap-2 mb-1">
                                <Tag size={14} className="text-med-primary" />
                                <span className="text-xs font-semibold text-gray-500 uppercase">Marca</span>
                              </div>
                              <p className="text-sm font-bold text-gray-800 truncate">{eq.marca || 'N/A'}</p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-3">
                              <div className="flex items-center gap-2 mb-1">
                                <Tag size={14} className="text-med-primary" />
                                <span className="text-xs font-semibold text-gray-500 uppercase">Modelo</span>
                              </div>
                              <p className="text-sm font-bold text-gray-800 truncate">{eq.modelo || 'N/A'}</p>
                            </div>
                          </div>

                          <div className="bg-gradient-to-r from-med-bg to-med-bg-100 rounded-lg p-3 border border-med-bg-100">
                            <div className="flex items-center gap-2 mb-1">
                              <Hash size={14} className="text-med-primary" />
                              <span className="text-xs font-semibold text-gray-600 uppercase">Número de Serie</span>
                            </div>
                            <p className="text-sm font-mono font-bold text-med-slate-700">{eq.numeroSerie || 'Sin número de serie'}</p>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-200">
                              <div className="flex items-center gap-2 mb-1">
                                <Calendar size={12} className="text-emerald-600" />
                                <span className="text-xs font-semibold text-emerald-700 uppercase">Instalación</span>
                              </div>
                              <p className="text-xs font-medium text-emerald-800">{eq.fechaInstalacion || 'No registrada'}</p>
                            </div>
                            <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
                              <div className="flex items-center gap-2 mb-1">
                                <Wrench size={12} className="text-amber-600" />
                                <span className="text-xs font-semibold text-amber-700 uppercase">Último Mant.</span>
                              </div>
                              <p className="text-xs font-medium text-amber-800">{eq.ultimoMantenimiento || 'No registrado'}</p>
                            </div>
                          </div>

                          <div className="flex justify-end mt-2">
                            <button onClick={() => handleStartEditEquipment(eq)} className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg">Editar</button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Encargados del grupo */}
              <div className="mt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-cyan-100 rounded-lg">
                    <User className="text-cyan-700" size={20} />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-800">Encargados ({openGroup.encargados?.length || 0})</h4>
                    <p className="text-sm text-gray-600">Contactos asociados al grupo</p>
                  </div>
                </div>

                {openGroup.encargados && openGroup.encargados.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {openGroup.encargados.map((enc, idx) => (
                      <div key={enc.id || idx} className="p-3 bg-white rounded-xl border-2 border-gray-200">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <User className="text-gray-400" size={16} />
                              <div className="font-semibold text-gray-800 truncate">{enc.nombre}</div>
                            </div>
                            <div className="text-sm text-gray-600">
                              {enc.cargo && (<div className="flex items-center gap-2"><Briefcase size={14} className="text-gray-400" /> <span>{enc.cargo}</span></div>)}
                              <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                                {enc.telefono && (<div className="flex items-center gap-1"><Phone size={14} className="text-gray-400" /> <span>{enc.telefono}</span></div>)}
                                {enc.email && (<div className="flex items-center gap-1"><Mail size={14} className="text-gray-400" /> <span className="truncate">{enc.email}</span></div>)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                    <p className="text-gray-600">No hay encargados agregados para este grupo</p>
                  </div>
                )}
              </div>

              {/* Mensaje si no hay equipos */}
              {openGroup.equipos.length === 0 && (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                    <Package size={32} className="text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium">No hay equipos registrados</p>
                </div>
              )}
            </div>

            {/* Footer del Modal */}
            <div className="bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                <span className="font-semibold">{openGroup.equipos.length}</span> equipos en total
              </div>
              <button 
                onClick={() => setOpenGroup(null)} 
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all transform hover:scale-105"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(20px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}