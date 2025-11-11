import React from 'react'
import { 
  DollarSign, 
  Calendar, 
  User, 
  Layers, 
  Trash2, 
  Edit3, 
  Eye,
  FileText,
  TrendingUp,
  Clock
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import quoteService from '../services/quoteService'
import { confirmDialog, alertError } from '../utils/swal'

export default function QuoteCard({ quote }) {
  const {
    id,
    clientName,
    razonSocial,
    status = 'pendiente',
    total = 0,
    createdAt,
    seller,
    folio,
    products = []
  } = quote || {}

  const formattedTotal = Number(total || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })
  const totalWithIVA = (Number(total || 0) * 1.16).toLocaleString('es-MX', { minimumFractionDigits: 2 })
  const navigate = useNavigate()

  // Función para traducir el status al español
  const getStatusLabel = (status) => {
    const statusLower = (status || '').toLowerCase()
    
    // Aprobada/Confirmada
    if (statusLower.includes('approved') || statusLower.includes('confirm') || statusLower.includes('aprob') || statusLower.includes('acept')) {
      return 'Aprobada'
    }
    // Cancelada/Rechazada
    if (statusLower.includes('rechaz') || statusLower.includes('cancel')) {
      return 'Cancelada'
    }
    // Pendiente (por defecto)
    return 'Pendiente'
  }

  const getStatusStyle = (status) => {
    const statusLower = (status || '').toLowerCase()
    if (statusLower.includes('approved') || statusLower.includes('confirm') || statusLower.includes('aprob') || statusLower.includes('acept')) {
      return {
        bg: 'bg-emerald-100',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        dot: 'bg-emerald-500'
      }
    }
    if (statusLower.includes('rechaz') || statusLower.includes('cancel')) {
      return {
        bg: 'bg-red-100',
        text: 'text-red-700',
        border: 'border-red-200',
        dot: 'bg-red-500'
      }
    }
    return {
      bg: 'bg-amber-100',
      text: 'text-amber-700',
      border: 'border-amber-200',
      dot: 'bg-amber-500'
    }
  }

  const statusStyle = getStatusStyle(status)
  const statusLabel = getStatusLabel(status)

  async function handleDelete() {
    if (!(await confirmDialog('¿Eliminar esta cotización? Esta acción no se puede deshacer.'))) return
    const res = await quoteService.deleteQuote(id)
    if (res && res.success) {
      window.location.href = '/quotes'
    } else {
      await alertError('Error al eliminar cotización')
    }
  }

  return (
    <div className="group bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg border-2 border-white/20 hover:shadow-2xl hover:border-blue-200 transition-all duration-300 overflow-hidden">
      {/* Header con gradiente */}
      <div className="bg-gradient-to-r from-blue-50 via-cyan-50 to-blue-50 px-4 sm:px-6 py-3 sm:py-4 border-b-2 border-gray-100">
        <div className="flex items-start gap-2 sm:gap-4">
          <div className="relative flex-shrink-0">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
              <FileText size={20} className="sm:w-6 sm:h-6" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-white rounded-full flex items-center justify-center border-2 border-blue-100 shadow-sm">
              <span className="text-xs font-bold text-blue-600">{products.length || 0}</span>
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-3 mb-2">
              <h3 className="font-bold text-gray-800 text-base sm:text-lg leading-tight line-clamp-2 flex-1">
                {clientName || razonSocial || `Cotización #${id}`}
              </h3>
              
              {/* Status Badge - Ahora más compacto */}
              <div className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md sm:rounded-lg border flex-shrink-0 self-start ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
                <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full flex-shrink-0 ${statusStyle.dot} animate-pulse`}></span>
                <span className="text-xs font-semibold uppercase whitespace-nowrap">{statusLabel}</span>
              </div>
            </div>
            
            {razonSocial && clientName && razonSocial !== clientName && (
              <p className="text-xs sm:text-sm text-gray-600 truncate">{razonSocial}</p>
            )}
            
            {folio && (
              <div className="flex items-center gap-2 mt-1 sm:mt-2">
                <span className="px-2 py-0.5 sm:py-1 bg-blue-100 text-blue-700 rounded text-xs font-mono font-bold">
                  #{folio}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 sm:p-6">
        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-2 sm:gap-4 mb-4 sm:mb-5">
          <div className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg sm:rounded-xl border border-gray-200">
            <div className="p-1.5 sm:p-2 bg-white rounded-md sm:rounded-lg shadow-sm flex-shrink-0">
              <User className="text-blue-600" size={14} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-gray-500 uppercase mb-0.5 sm:mb-1">Vendedor</div>
              <div className="font-medium text-gray-800 text-xs sm:text-sm truncate">{seller || 'Sin asignar'}</div>
            </div>
          </div>

          <div className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg sm:rounded-xl border border-gray-200">
            <div className="p-1.5 sm:p-2 bg-white rounded-md sm:rounded-lg shadow-sm flex-shrink-0">
              <Calendar className="text-blue-600" size={14} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-gray-500 uppercase mb-0.5 sm:mb-1">Fecha</div>
              <div className="font-medium text-gray-800 text-xs sm:text-sm">
                {createdAt ? new Date(createdAt).toLocaleDateString('es-MX', { 
                  day: '2-digit', 
                  month: 'short', 
                  year: 'numeric' 
                }) : '—'}
              </div>
            </div>
          </div>
        </div>

        {/* Total Section */}
        <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg sm:rounded-xl p-4 sm:p-5 mb-4 sm:mb-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 sm:w-24 sm:h-24 bg-white/10 rounded-full -mr-8 sm:-mr-12 -mt-8 sm:-mt-12"></div>
          <div className="absolute bottom-0 left-0 w-12 h-12 sm:w-20 sm:h-20 bg-white/10 rounded-full -ml-6 sm:-ml-10 -mb-6 sm:-mb-10"></div>
          
          <div className="relative">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="p-1.5 sm:p-2 bg-white/20 rounded-md sm:rounded-lg backdrop-blur-sm">
                  <DollarSign className="text-white" size={16} />
                </div>
                <span className="text-xs sm:text-sm font-semibold text-white/90">Total Cotización</span>
              </div>
              <TrendingUp className="text-white/60 hidden sm:block" size={20} />
            </div>
            
            <div className="space-y-1.5 sm:space-y-2">
              <div className="flex items-baseline gap-1.5 sm:gap-2">
                <span className="text-2xl sm:text-3xl font-black text-white">${formattedTotal}</span>
                <span className="text-xs sm:text-sm text-white/70 font-medium">MXN</span>
              </div>
              
              <div className="flex items-center justify-between pt-1.5 sm:pt-2 border-t border-white/20">
                <span className="text-xs text-white/80">Con IVA (16%)</span>
                <span className="text-xs sm:text-sm font-bold text-white">${totalWithIVA}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button 
            onClick={() => navigate(`/quotes/${id}`)} 
            className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg sm:rounded-xl font-medium hover:shadow-lg transition-all transform hover:scale-105 text-xs sm:text-sm"
          >
            <Eye size={14} className="sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Ver Detalles</span>
            <span className="sm:hidden">Ver</span>
          </button>
          
          <button 
            onClick={() => navigate('/quotes/new', { state: { initial: quote } })} 
            className="flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg sm:rounded-xl font-medium hover:shadow-lg transition-all transform hover:scale-105"
            title="Editar cotización"
          >
            <Edit3 size={14} className="sm:w-4 sm:h-4" />
          </button>
          
          <button
            onClick={handleDelete}
            className="flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-lg sm:rounded-xl font-medium hover:shadow-lg transition-all transform hover:scale-105"
            title="Eliminar cotización"
          >
            <Trash2 size={14} className="sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>

      {/* Footer subtle */}
      <div className="bg-gray-50 px-4 sm:px-6 py-2 sm:py-3 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Layers size={12} />
            <span>{products.length || 0} {products.length === 1 ? 'producto' : 'productos'}</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Clock size={12} />
            <span className="truncate">ID: {id}</span>
          </div>
        </div>
      </div>
    </div>
  )
}